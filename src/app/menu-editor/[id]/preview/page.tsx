import { ChevronLeft } from "lucide-react"
import lz from "lzutf8"
import Link from "next/link"
import { notFound } from "next/navigation"

import Header from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import ResolveEditor from "@/app/[subdomain]/resolve-editor"
import { getMenuById } from "@/server/actions/menu/queries"

export default async function PreviewPage({
  params
}: {
  params: { id: string }
}) {
  const siteMenu = await getMenuById(params.id)

  if (!params.id || !siteMenu) {
    return notFound()
  }

  let json
  if (siteMenu.serialData) {
    json = lz.decompress(lz.decodeBase64(siteMenu.serialData))
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800">
      <Header>
        <div className="mx-10 grid grow grid-cols-3 items-center">
          <Link href={`/menu-editor/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="size-5" />
              Regresar
            </Button>
          </Link>
          <span className="mx-auto text-sm">{siteMenu.name}</span>
        </div>
      </Header>
      <div className="mt-16">
        <ResolveEditor json={json} />
      </div>
    </div>
  )
}
