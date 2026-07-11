import { XIcon } from "lucide-react"
import lz from "lzutf8"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next/types"

import { Button } from "@/components/ui/button"
import { getMenuById } from "@/server/actions/menu/queries"
import { PreviewToggle } from "@/app/menu-editor/[id]/preview/preview-toggle"

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
      <div className="flex min-h-dvh">
        <PreviewToggle json={json} />
      </div>
      <div className="fixed inset-x-0 bottom-4 text-center">
        <div
          className="mx-auto flex w-fit items-center gap-1 rounded-full
            bg-amber-400/80 py-1 pr-1 pl-3 text-sm text-amber-950 shadow-md
            inset-ring inset-ring-amber-300/50 backdrop-blur-lg"
        >
          Vista previa
          <Link href={`/menu-editor/${params.id}`} prefetch={false}>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <XIcon />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
