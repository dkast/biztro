import { Suspense } from "react"
import { rgbaToHex, type RgbaColor } from "@uiw/react-color"
import lz from "lzutf8"
import type { Metadata, ResolvingMetadata } from "next"
import { cacheLife, cacheTag } from "next/cache"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

// import GradientBlur from "@/components/flare-ui/gradient-blur"
import { getActiveMenuByOrganizationSlug } from "@/server/actions/menu/queries"
import {
  getAllActiveOrganizations,
  getOrganizationBySlug
} from "@/server/actions/organization/queries"
import PublicMenuTracker from "@/app/[subdomain]/public-menu-tracker"
import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { SubscriptionStatus } from "@/lib/types"

// Add generateStaticParams to pre-render specific paths
export async function generateStaticParams() {
  const organizations = await getAllActiveOrganizations()
  return organizations.map(({ slug }) => ({
    slug
  }))
}

export async function generateMetadata(
  props: {
    params: Promise<{ subdomain: string }>
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  const org = await getOrganizationBySlug(params.subdomain)

  if (
    org &&
    (org.status === SubscriptionStatus.ACTIVE ||
      org.status === SubscriptionStatus.TRIALING ||
      org.status === SubscriptionStatus.SPONSORED)
  ) {
    const description =
      org.description && org.description.length > 0
        ? org.description
        : (await parent).description
    return {
      title: org.name,
      description
    }
  } else {
    return {
      title: "No encontrado"
    }
  }
}

// export async function generateViewport(props: {
//   params: Promise<{ subdomain: string }>
// }): Promise<Viewport> {
//   "use cache: private"

//   const params = await props.params
//   cacheTag("viewport-" + params.subdomain)
//   cacheLife("hours")
//   const siteMenu = await getActiveMenuByOrganizationSlug(params.subdomain)

//   if (!params.subdomain || !siteMenu) {
//     return {
//       themeColor: "#000000"
//     }
//   }

//   let json
//   if (siteMenu.serialData) {
//     json = lz.decompress(lz.decodeBase64(siteMenu.serialData))
//   }

//   let backgroundColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 }

//   // Search container style (color)
//   const data = JSON.parse(json)
//   const keys = Object.keys(data)
//   keys.forEach(el => {
//     const node = data[el]
//     const { displayName } = node
//     if (displayName === "Sitio") {
//       backgroundColor = data[el]?.props?.backgroundColor
//     }
//   })

//   if (backgroundColor) {
//     return {
//       themeColor: rgbaToHex(backgroundColor)
//     }
//   } else {
//     return {
//       themeColor: "#000000"
//     }
//   }
// }

export default async function SitePage(props: {
  params: Promise<{ subdomain: string }>
}) {
  "use cache"

  const params = await props.params
  const siteMenu = await getActiveMenuByOrganizationSlug(params.subdomain)
  cacheTag(`subdomain-${params.subdomain}`)
  cacheLife("hours")

  if (!params.subdomain || !siteMenu) {
    return notFound()
  }

  const snapshot = siteMenu.publishedData ?? siteMenu.serialData
  if (!snapshot) {
    return notFound()
  }

  const json = lz.decompress(lz.decodeBase64(snapshot))
  if (!json) {
    return notFound()
  }

  const parsed = JSON.parse(json) as Record<string, unknown>
  if (!isRecord(parsed)) {
    return notFound()
  }

  const { nodes: sanitizedNodes, changed } = sanitizeCraftNodes(parsed)
  const serializedNodes = changed ? JSON.stringify(sanitizedNodes) : json

  let backgroundColor: RgbaColor = { r: 255, g: 255, b: 255, a: 1 }
  let textColor: RgbaColor = { r: 0, g: 0, b: 0, a: 1 }

  // Search container style (color)
  const data = sanitizedNodes
  const keys = Object.keys(data)
  keys.forEach(el => {
    const node = data[el]
    if (!isRecord(node)) return
    const displayName = node.displayName as string | undefined
    const props = isRecord(node.props) ? node.props : undefined
    if (displayName === "Sitio") {
      backgroundColor = props?.backgroundColor as RgbaColor
    }
    if (displayName === "Cabecera") {
      textColor = props?.color as RgbaColor
    }
  })

  return (
    <>
      <Suspense fallback={null}>
        <PublicMenuTracker
          organizationId={siteMenu.organizationId}
          menuId={siteMenu.id}
          slug={params.subdomain}
        />
      </Suspense>
      <style>{`body { background-color: ${rgbaToHex(backgroundColor)} }`}</style>
      <div
        style={{
          backgroundColor: `${rgbaToHex(backgroundColor)}`
        }}
        className="relative flex min-h-screen flex-col"
      >
        <div className="flex grow">
          <ResolveEditor json={serializedNodes} />
        </div>
        <div
          className="fixed inset-x-0 bottom-0 flex items-center justify-between
            gap-x-4 p-2 text-xs"
          style={{
            color: `${rgbaToHex(textColor)}`
          }}
        >
          <div className="z-20 rounded-full px-3 py-1 backdrop-blur-md">
            Últ. actualiazión:{" "}
            {siteMenu.publishedAt
              ? new Intl.DateTimeFormat("es-MX", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }).format(new Date(siteMenu.publishedAt))
              : ""}
          </div>
          <Link href="https://biztro.co" target="_blank" className="z-20">
            <div
              className="flex items-center justify-center gap-x-2 rounded-full
                bg-black/50 px-3 py-1"
            >
              <Image
                src="/safari-pinned-tab.svg"
                alt="Logo"
                width={12}
                height={12}
                className="opacity-90 invert"
                unoptimized
              />
              <span className="text-xs text-gray-100">
                <em className="hidden not-italic sm:inline">Powered by </em>
                Biztro
              </span>
            </div>
          </Link>
          {/* <GradientBlur className="inset-0 md:hidden" /> */}
        </div>
      </div>
    </>
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sanitizeCraftNodes(nodes: Record<string, unknown>) {
  let changed = false
  const next: Record<string, unknown> = { ...nodes }

  for (const [nodeId, value] of Object.entries(nodes)) {
    if (!isRecord(value)) continue
    const node = value as Record<string, unknown>
    const props = node.props
    if (!isRecord(props)) {
      next[nodeId] = {
        ...node,
        props: {}
      }
      changed = true
    }
  }

  return { nodes: next, changed }
}
