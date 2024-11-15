import { ChevronLeft, ScanEye } from "lucide-react"
import lz from "lzutf8"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next/types"

import { Button } from "@/components/ui/button"
import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { getMenuById } from "@/server/actions/menu/queries"

export const metadata: Metadata = {
  title: "Vista previa",
  description: "Vista previa de un menú"
}

export default async function PreviewPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const siteMenu = await getMenuById(params.id)

  if (!params.id || !siteMenu) {
    return notFound()
  }

  let json
  if (siteMenu.serialData) {
    json = lz.decompress(lz.decodeBase64(siteMenu.serialData))
  }

  return (
    <div className="relative bg-gray-50 dark:bg-gray-800">
      <div className="fixed left-2 top-2 z-50">
        <Link href={`/menu-editor/${params.id}`}>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="size-4" />
          </Button>
        </Link>
      </div>
      <div className="flex min-h-dvh">
        <ResolveEditor json={json} />
      </div>
      <div className="fixed inset-x-0 bottom-3 text-center">
        <span className="rounded-full bg-amber-400 px-3 py-1 text-sm text-amber-950">
          <ScanEye className="mr-1 inline-block size-4 align-text-bottom" />
          Vista previa
        </span>
      </div>
    </div>
  )
}
