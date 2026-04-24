# Host-Based Subdomain Routing Deployment

This project supports public menu URLs in the form `https://slug.biztro.co`.

The application layer already supports host-based subdomains through the Next.js proxy in `src/proxy.ts` and the public menu route in `src/app/[subdomain]/page.tsx`. The production setup described here keeps `slug.biztro.co` visible in the browser while serving the same content as `biztro.co/[slug]`.

## Architecture

- `biztro.co` remains on Vercel as the main marketing and application domain.
- Cloudflare remains the authoritative DNS provider for `biztro.co`.
- Cloudflare terminates TLS for `*.biztro.co`.
- A Cloudflare Worker proxies wildcard subdomain requests to the Vercel production deployment URL (`https://biztro.vercel.app`).
- The Worker rewrites:
  - `https://slug.biztro.co/` -> upstream `https://biztro.vercel.app/slug`
  - `https://slug.biztro.co/foo` -> upstream `https://biztro.vercel.app/slug/foo`
- The browser keeps showing `https://slug.biztro.co/...` because this is a reverse proxy, not a redirect.

## Why This Setup Exists

Vercel wildcard domains require the nameservers method for certificate issuance. Because `biztro.co` DNS is managed in Cloudflare, Vercel cannot complete the wildcard ACME challenge for `*.biztro.co` in this setup.

Instead of moving the entire zone to Vercel, Biztro uses Cloudflare for wildcard DNS + TLS and proxies wildcard traffic to Vercel.

## Application Prerequisites

These files are part of the host-based routing support:

- `src/proxy.ts`
  - Detects `*.biztro.co` requests and rewrites them to `/${subdomain}`.
  - Keeps reserved hosts such as `preview` and `www` out of tenant routing.
- `src/app/[subdomain]/page.tsx`
  - Serves the published menu for a tenant slug.
- `src/lib/utils.ts`
  - `getPublishedMenuUrl()` generates `https://slug.biztro.co` in production.
- `src/components/menu-editor/menu-publish.tsx`
  - Uses the published subdomain URL for links, copy actions, and QR generation.

## Cloudflare DNS Configuration

Create or update the wildcard DNS record:

- Type: `CNAME`
- Name: `*`
- Target: `biztro.vercel.app`
- Proxy status: `Proxied`
- TTL: `Auto`

Keep the apex web record for `biztro.co` aligned with the Vercel project configuration.
If the root domain is served by Vercel, verify the apex record in Vercel's Domains UI and make sure the Cloudflare apex DNS target matches what Vercel expects for that project.

Do not assume the wildcard record is enough to keep the root domain healthy.
The wildcard `*` record covers tenant subdomains, but `biztro.co` itself still depends on the explicit apex DNS record.

Keep explicit DNS records for non-tenant hosts that should not resolve through tenant routing. Current reserved hosts in infrastructure are:

- `www`
- `preview`
- `images`
- `static`
- `mail`
- `pm-bounces`
- `send`

If a host should bypass tenant routing, it must have either:

- an explicit DNS record in Cloudflare, and/or
- an entry in the Worker `RESERVED_SUBDOMAINS` set.

### CAA records

Avoid a restrictive CAA policy unless you intend to maintain it actively.

If you add a `CAA` record, it must allow the certificate authorities that Cloudflare may use for Universal SSL issuance and renewal.
A single manual record such as only `letsencrypt.org` can block certificate issuance when Cloudflare uses a different partner CA.

If there is no strict compliance requirement for CAA, it is safer to omit custom CAA records entirely.

## Cloudflare SSL/TLS Configuration

Set Cloudflare SSL mode to:

- `Full (strict)`

This allows Cloudflare to terminate the wildcard certificate for `*.biztro.co` while still validating the Vercel origin certificate.

### Edge certificate check

On the Cloudflare `SSL/TLS` -> `Edge Certificates` page, verify that there is an active primary certificate for `*.biztro.co, biztro.co`.

Important:

- `Backup` certificates are fallback certificates, not the normal active certificate used in routine traffic.
- The page should also show the primary `Universal` certificate or another active primary certificate covering `biztro.co` and `*.biztro.co`.
- If you only see `Backup` certificates, treat that as a misconfiguration or incomplete issuance and re-check Universal SSL.

## Vercel Configuration

For this Cloudflare Worker approach:

- Keep `biztro.co` configured in Vercel.
- Keep fixed subdomains such as `preview.biztro.co` configured in Vercel as needed.
- Do not rely on `*.biztro.co` inside Vercel for production wildcard traffic.
- The Worker should proxy to the Vercel deployment hostname:
  - `https://biztro.vercel.app`

Using `biztro.vercel.app` as the upstream avoids routing loops and avoids depending on Vercel wildcard certificate issuance.

## Cloudflare Worker

Deploy the following Worker and bind it to the route `*.biztro.co/*`.

```js
const ORIGIN = "https://biztro.vercel.app"
const ROOT_DOMAIN = "biztro.co"

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "preview",
  "images",
  "static",
  "mail",
  "pm-bounces",
  "send"
])

const BYPASS_PREFIXES = ["/_next/", "/api/", "/ingest", "/monitoring"]
const BYPASS_EXACT = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/browserconfig.xml",
  "/site.webmanifest",
  "/sitemap.xml"
])

const STATIC_FILE_PATTERN =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|webmanifest|json|woff2?|ttf|eot)$/i

function getSlug(hostname) {
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null

  const slug = hostname.slice(0, -`.${ROOT_DOMAIN}`.length)

  if (!slug) return null
  if (slug.includes(".")) return null
  if (RESERVED_SUBDOMAINS.has(slug)) return null

  return slug
}

function shouldBypassPath(pathname) {
  if (BYPASS_EXACT.has(pathname)) return true
  if (BYPASS_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true
  if (STATIC_FILE_PATTERN.test(pathname)) return true
  return false
}

function toTenantPath(slug, pathname) {
  return pathname === "/" ? `/${slug}` : `/${slug}${pathname}`
}

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url)
    const slug = getSlug(incomingUrl.hostname)

    if (!slug) {
      return fetch(request)
    }

    const upstreamUrl = new URL(ORIGIN)
    upstreamUrl.pathname = shouldBypassPath(incomingUrl.pathname)
      ? incomingUrl.pathname
      : toTenantPath(slug, incomingUrl.pathname)
    upstreamUrl.search = incomingUrl.search

    const headers = new Headers(request.headers)
    headers.set("x-original-host", incomingUrl.hostname)
    headers.set("x-forwarded-host", incomingUrl.hostname)
    headers.set("x-tenant-slug", slug)

    const upstreamRequest = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : request.body,
      redirect: "manual"
    })

    return fetch(upstreamRequest)
  }
}
```

## Worker Route

Attach the Worker to the following Cloudflare route:

- `*.biztro.co/*`

The wildcard DNS record must be proxied, otherwise the Worker route will never run.

## Exact Cloudflare Dashboard Click Path

### DNS record

1. Cloudflare dashboard
2. `Websites`
3. `biztro.co`
4. `DNS`
5. `Records`
6. Edit or create the wildcard record `*`
7. Set target to `biztro.vercel.app`
8. Set `Proxy status` to `Proxied`
9. Save

### Worker

1. Cloudflare dashboard
2. `Workers & Pages`
3. `Create application`
4. `Workers`
5. Choose a minimal starter such as `Hello World` or `Start from scratch`
6. Name the Worker `biztro-subdomain-proxy`
7. `Deploy`
8. Open the Worker
9. `Edit code`
10. Replace the default code with the Worker above
11. `Save and deploy`

### Route binding

1. Inside `biztro-subdomain-proxy`
2. `Settings`
3. `Domains & Routes`
4. `Add`
5. `Route`
6. Zone: `biztro.co`
7. Route pattern: `*.biztro.co/*`
8. `Add route`

### SSL mode

1. Cloudflare dashboard
2. `Websites`
3. `biztro.co`
4. `SSL/TLS`
5. `Overview`
6. Set mode to `Full (strict)`

## Validation Checklist

After deploying the Worker and DNS changes, validate the following:

- `https://biztro.co` loads normally.
- `https://preview.biztro.co` still loads the preview deployment.
- `https://slug.biztro.co/` loads the tenant page for `slug`.
- `https://slug.biztro.co/some-path` resolves through the same tenant.
- Static assets still load correctly.
- QR codes and publish links use `https://slug.biztro.co`.
- Cloudflare `Edge Certificates` shows an active primary certificate, not only `Backup` rows.
- The apex DNS record for `biztro.co` matches the current Vercel domain configuration.

## Known Failure Modes

### Tenant root goes to the landing page

Cause:

- The Worker bypasses `/` and forwards `https://slug.biztro.co/` to `https://biztro.vercel.app/`.

Fix:

- Do not include `/` in `BYPASS_EXACT`.

Bad:

```js
const BYPASS_EXACT = new Set(["/", "/favicon.ico"])
```

Good:

```js
const BYPASS_EXACT = new Set(["/favicon.ico"])
```

### Reserved hosts break or route to tenant content

Cause:

- The host is missing from the Worker `RESERVED_SUBDOMAINS` set.

Fix:

- Add the host to the Worker reserved set.
- Ensure the host has an explicit DNS record if it should resolve separately.

### Worker route does not run

Cause:

- The wildcard DNS record is `DNS only` instead of `Proxied`.

Fix:

- Turn on the orange-cloud proxy for the wildcard record.

### Edge certificates page only shows backup certificates

Cause:

- Cloudflare backup certificates exist, but the primary Universal certificate is missing, pending, or not deployed.

Fix:

- Confirm `Universal SSL` is enabled.
- Verify that Cloudflare shows an active primary certificate for `biztro.co` and `*.biztro.co`.
- If needed, retry issuance by toggling Universal SSL off and back on after confirming DNS and validation records are correct.

### Certificate renewal fails after adding a manual CAA record

Cause:

- The CAA record only authorizes one CA, while Cloudflare is attempting issuance with a different partner CA.

Fix:

- Remove the restrictive CAA record, or expand it to allow the CAs Cloudflare may use for Universal SSL.

### Root domain fails while wildcard subdomains are configured correctly

Cause:

- The apex `biztro.co` DNS record points to the wrong origin, even though the wildcard `*` record is correct.

Fix:

- Check the Vercel Domains configuration for `biztro.co`.
- Update the explicit apex DNS record in Cloudflare to match Vercel's expected target for the project.

### Wildcard works in Cloudflare but fails in Vercel

Cause:

- Vercel wildcard domains require nameserver-based verification.

Fix:

- Either move nameservers to Vercel, or keep the Cloudflare Worker architecture described in this document.

## Operational Notes

- Keep the infrastructure reserved-subdomain list aligned with the app-level reserved list in `src/proxy.ts`.
- If new static asset paths are introduced, update the Worker bypass rules accordingly.
- If Biztro ever moves the full DNS zone to Vercel, this Cloudflare Worker setup can be retired in favor of direct wildcard routing through Vercel.
