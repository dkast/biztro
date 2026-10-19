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

## Local and Preview Testing

Tenant subdomains are only used in production. The publish workflow uses a
path-based public URL in every other environment, which follows the same
application rewrite as the production hostname:

- Local: `http://localhost:3000/menu/<slug>`
- Preview, including `preview.biztro.co`:
  `https://<preview-host>/menu/<slug>`

For example, use `https://preview.biztro.co/menu/my-menu` to exercise the
published page after publishing in staging. Do not use
`/menu-internal/<slug>` directly; that path is intentionally limited to
proxy-generated rewrites.

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

Configure the [scanner protection](#scanner-traffic-and-the-workers-daily-limit)
below as well. The path guard in this code protects the upstream, but does not
save Worker invocations.

```js
const ORIGIN = "https://biztro.vercel.app"
const ROOT_DOMAIN = "biztro.co"

const SCANNER_PATHS =
  /^\/(?:\.env(?:[./]|$)|@fs(?:\/|$)|__vite|api\/(?:proc\/self\/environ|console\/api_server)(?:\/|$)|userfiles(?:\/|$))/i

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

    if (SCANNER_PATHS.test(incomingUrl.pathname)) {
      return new Response("Not Found", { status: 404 })
    }

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

## Scanner Traffic and the Workers Daily Limit

### Block before the Worker, not only inside it

The Workers Free plan allows **100,000 requests per day across the account**,
resetting at **00:00 UTC**. A request that reaches the Worker's `fetch` handler
still counts when the handler immediately returns `404` or `429`. Blocking paths
or calling a rate limiter inside the Worker reduces CPU work and upstream
subrequests, **not incoming Worker invocations**.

For this deployment, use a **zone WAF custom rule** to block scanner requests
before they invoke the Worker. The production hostnames are already in the
Cloudflare-managed `biztro.co` zone; this is not a `workers.dev`-only deployment.
WAF custom rules are available on the Free zone plan (up to five rules). The
expression below uses no paid-plan regular expression operator.

The reported `.env`, Vite, and process-environment probes are consistent with
automated vulnerability scanning. An IP belonging to Google Cloud/AS396982 does
not establish that Google operates the scanner: it could be a cloud customer.
Do not block all of Google Cloud or all `34.x` addresses based on that alone.

### 1. Add a zone WAF custom rule

In Cloudflare, open `biztro.co` -> `Security` -> `Security rules` -> create a
`Custom rule` (older dashboard: `Security` -> `WAF` -> `Custom rules`).
Name it `Block scanner paths`, select `Edit expression`, and paste:

```text
(
  http.host eq "biztro.co"
  or ends_with(http.host, ".biztro.co")
)
and
(
  lower(http.request.uri.path) eq "/.env"
  or starts_with(lower(http.request.uri.path), "/.env.")
  or starts_with(lower(http.request.uri.path), "/.env/")
  or lower(http.request.uri.path) eq "/@fs"
  or starts_with(lower(http.request.uri.path), "/@fs/")
  or starts_with(lower(http.request.uri.path), "/__vite")
  or lower(http.request.uri.path) eq "/api/proc/self/environ"
  or starts_with(lower(http.request.uri.path), "/api/proc/self/environ/")
  or lower(http.request.uri.path) eq "/api/console/api_server"
  or starts_with(lower(http.request.uri.path), "/api/console/api_server/")
  or lower(http.request.uri.path) eq "/userfiles"
  or starts_with(lower(http.request.uri.path), "/userfiles/")
)
```

Set the action to **Block** and deploy it before any broad custom rule that skips
security checks. A WAF block normally returns `403`, not the Worker's `404`.
This rule intentionally also protects the apex and reserved subdomains from
these probes. It does not block normal `/api/`, `/_next/`, static asset, or menu
paths. The Worker guard covers the same path families if a request reaches it;
keep both lists aligned when adding scanner signatures.

### 2. Disable unused public Worker URLs

Zone WAF rules do not protect the Worker's direct `workers.dev` URL. Since this
proxy is intended to be reached through `*.biztro.co/*`, disable that unused
entry point:

1. `Workers & Pages` -> `biztro-subdomain-proxy` -> `Settings` -> `Domains & Routes`.
2. Disable the `workers.dev` route.
3. Separately disable public version/preview URLs if enabled and not needed.
   Disabling `workers.dev` alone does not disable explicitly enabled version URLs.
4. Keep the production route `*.biztro.co/*` attached.

If this Worker is later managed with Wrangler, persist these settings in its
configuration so a deployment does not re-enable them:

```jsonc
{
  "workers_dev": false,
  "preview_urls": false
}
```

These keys are configuration additions, not a complete Wrangler deployment file.
There is no Wrangler deployment configuration in this repository; the Worker
above is maintained through the dashboard.

### 3. Rate limit only where needed

If scanning continues on other paths, use a **zone WAF rate limiting rule** with
request-side matching to reject excess traffic before the Worker, subject to
the zone plan's available fields, periods, and actions. Scope it using observed
abusive traffic and measure normal menu traffic before choosing a threshold.
Exact offending IPs can be blocked temporarily with a separate custom rule,
but IP-only blocks need maintenance as scanners rotate addresses.

The Worker Rate Limiting API (`env.MY_RATE_LIMITER.limit()`) is optional upstream
protection, not a fix for the daily invocation cap. Its limits are per key per
Cloudflare location, eventually consistent, and applied only after the Worker
starts. A `60` requests / `60` seconds per-IP limit would not normally reject an
IP sending `40` requests/minute; five different IPs do not share one counter.
Do not impose that limit on all menu requests without testing: assets and
visitors sharing a restaurant's public IP can exhaust it together.

### 4. Recover and verify

- Adding a rule does not restore an already exhausted daily allowance. Wait for
  the midnight UTC reset, or evaluate a Workers Paid upgrade for immediate
  capacity. Review pricing before upgrading.
- Do not switch this proxy to **fail open** as a quota workaround: bypassing it
  removes the tenant-path rewrite and can serve the wrong content or fail at
  the origin. Check the route's failure mode deliberately.
- After deploying the WAF rule, request `/.env`, `/.env.local`, `/@fs/.env`,
  `/api/proc/self/environ`, `/api/console/api_server`, `/userfiles/`, and
  `/__vite_rsc_findSourceMapURL` on a real tenant hostname, including an
  uppercase path and a query string. Expect a WAF block and a matching event in
  `Security` -> `Events`, not an invocation of this Worker.
- Correlate those requests with Worker logs/metrics; a `403` alone does not prove
  the WAF blocked the request before the Worker. Check that scanner traffic
  appears in security events while Worker invocation volume drops.
- Confirm disabled `workers.dev` and public version/preview URLs no longer
  execute the Worker.
- Re-run the normal routing and asset checks below. Monitor request usage
  across the account, since other Workers share the Free daily allowance.

References:

- [Workers limits and daily quota](https://developers.cloudflare.com/workers/platform/limits/#daily-requests)
- [WAF custom rules and Free-plan availability](https://developers.cloudflare.com/waf/custom-rules/)
- [WAF rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Worker Rate Limiting API and locality](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Disable workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/#disabling-workersdev)
- [Version URL configuration](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/)

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

After binding the route, complete the
[scanner protection steps](#scanner-traffic-and-the-workers-daily-limit):
deploy the zone WAF rule and disable unused public Worker URLs.

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
