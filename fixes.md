# AI Fix Prompts for Vercel Doctor Issues

**Generated:** 2026-04-02T05:58:18.689Z

> Copy any section below and paste it into Cursor, Claude, Windsurf, or other AI coding tools.

---

## Disable default prefetch

- **File:** `src/components/menu-editor/toolbox-panel.tsx:246`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```
Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/components/menu-editor/toolbox-panel.tsx:246:13
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**
```

// Before:

<Link href='/page'>Page</Link>

// After:

<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/app/dashboard/menu-items/translations/translations-manager.tsx:348`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/app/dashboard/menu-items/translations/translations-manager.tsx:348:13
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/components/menu-editor/menu-items-data-grid.tsx:680`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/components/menu-editor/menu-items-data-grid.tsx:680:23
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/app/dashboard/menu-items/menu-import/menu-import-form.tsx:570`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/app/dashboard/menu-items/menu-import/menu-import-form.tsx:570:17
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/components/menu-editor/blocks/navigator-block.tsx:270`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/components/menu-editor/blocks/navigator-block.tsx:270:21
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/components/menu-editor/blocks/navigator-block.tsx:317`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/components/menu-editor/blocks/navigator-block.tsx:317:21
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/components/dashboard/unsaved-changes-provider.tsx:239`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/components/dashboard/unsaved-changes-provider.tsx:239:5
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/app/dashboard/menu-items/item-import.tsx:367`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/app/dashboard/menu-items/item-import.tsx:367:19
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Disable default prefetch

- **File:** `src/app/dashboard/settings/organization-delete.tsx:103`
- **Rule:** `vercel-doctor/nextjs-link-prefetch-default`
- **Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** nextjs-link-prefetch-default
**File:** src/app/dashboard/settings/organization-delete.tsx:103:23
**Severity:** warning
**Issue:** Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links

**Fix Strategy:**
Disable prefetch for non-critical links to reduce function invocations

**Example:**

```
// Before:
<Link href='/page'>Page</Link>

// After:
<Link href='/page' prefetch={false}>Page</Link>
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/editor.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (1.50MB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/editor.png:0:0
**Severity:** warning
**Issue:** Large static asset (1.50MB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/handheld-menu.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (1.50MB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/handheld-menu.png:0:0
**Severity:** warning
**Issue:** Large static asset (1.50MB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/editor-light.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (1.45MB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/editor-light.png:0:0
**Severity:** warning
**Issue:** Large static asset (1.45MB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/editor-dark.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (1.44MB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/editor-dark.png:0:0
**Severity:** warning
**Issue:** Large static asset (1.44MB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/iphone-hero.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (996.38KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/iphone-hero.png:0:0
**Severity:** warning
**Issue:** Large static asset (996.38KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-pizza-2.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (797.45KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-pizza-2.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (797.45KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-parrilla-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (792.23KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-parrilla-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (792.23KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-pizza-3.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (747.49KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-pizza-3.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (747.49KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-pizza-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (532.50KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-pizza-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (532.50KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-top-mariscos-2.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (483.85KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-top-mariscos-2.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (483.85KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/products.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (424.43KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/products.png:0:0
**Severity:** warning
**Issue:** Large static asset (424.43KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-bottom-burger-2.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (416.79KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-bottom-burger-2.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (416.79KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-tacos-3.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (342.87KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-tacos-3.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (342.87KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-top-tomates-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (342.37KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-top-tomates-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (342.37KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/configuration.png`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (317.89KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/configuration.png:0:0
**Severity:** warning
**Issue:** Large static asset (317.89KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/Inter-SemiBold.ttf`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (308.81KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/Inter-SemiBold.ttf:0:0
**Severity:** warning
**Issue:** Large static asset (308.81KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-top-tacos-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (295.96KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-top-tacos-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (295.96KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-top-bakery-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (274.52KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-top-bakery-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (274.52KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-top-tacos-2.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (257.63KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-top-tacos-2.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (257.63KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Move assets to external CDN

- **File:** `public/bg/bg-center-molcajete-1.jpg`
- **Rule:** `vercel-doctor/vercel-large-static-asset`
- **Issue:** Large static asset (242.00KB) is served from the app repository — this can consume Vercel bandwidth quickly

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-large-static-asset
**File:** public/bg/bg-center-molcajete-1.jpg:0:0
**Severity:** warning
**Issue:** Large static asset (242.00KB) is served from the app repository — this can consume Vercel bandwidth quickly

**Fix Strategy:**
Move large static assets to external storage to reduce bandwidth costs

**Example:**

```
// Before:
// Large files in /public folder

// After:
// Upload to R2/S3 and serve via CDN
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Restrict remotePatterns pathname

- **File:** `next.config.mjs:31`
- **Rule:** `vercel-doctor/vercel-image-remote-pattern-too-broad`
- **Issue:** next.config image remotePatterns is too broad — unrestricted remote image paths can drive unexpected optimization usage

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-image-remote-pattern-too-broad
**File:** next.config.mjs:31:0
**Severity:** warning
**Issue:** next.config image remotePatterns is too broad — unrestricted remote image paths can drive unexpected optimization usage

**Fix Strategy:**
Use specific path patterns instead of broad wildcards to prevent abuse

**Example:**

```
// Before:
{ hostname: 'cdn.example.com', pathname: '/**' }

// After:
{ hostname: 'cdn.example.com', pathname: '/images/**' }
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Add Cache-Control headers

- **File:** `src/app/api/file/route.ts:298`
- **Rule:** `vercel-doctor/vercel-missing-cache-policy`
- **Issue:** GET route handler has no explicit cache policy — responses may miss CDN caching opportunities

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-missing-cache-policy
**File:** src/app/api/file/route.ts:298:0
**Severity:** warning
**Issue:** GET route handler has no explicit cache policy — responses may miss CDN caching opportunities

**Fix Strategy:**
Add explicit cache headers to enable CDN caching for API responses

**Example:**

```
// Before:
return Response.json(data)

// After:
return Response.json(data, { headers: { 'Cache-Control': 's-maxage=3600' } })
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

## Evaluate Fluid Compute

- **File:** `src/app/api/auth/[...all]/route.ts`
- **Rule:** `vercel-doctor/vercel-consider-fluid-compute`
- **Issue:** Detected 4 server/API routes — evaluate Fluid Compute for better concurrency and lower execution overhead on long-running handlers

### Prompt

```

Fix this Vercel optimization issue:

**Rule:** vercel-consider-fluid-compute
**File:** src/app/api/auth/[...all]/route.ts:0:0
**Severity:** warning
**Issue:** Detected 4 server/API routes — evaluate Fluid Compute for better concurrency and lower execution overhead on long-running handlers

**Fix Strategy:**
Consider Fluid Compute for workloads with variable latency or bursty traffic

**Example:**

```
// Before:
// Standard Node.js runtime

// After:
// Enable Fluid Compute in project settings for variable latency workloads
```

Instructions:

1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected

```

---

```
