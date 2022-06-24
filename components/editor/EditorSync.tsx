import lz from "lzutf8"
import toast from "react-hot-toast"
import React, { useEffect } from "react"
import { useRecoilState } from "recoil"
import { useEditor } from "@craftjs/core"
import { useSession } from "next-auth/react"
import { InformationCircleIcon } from "@heroicons/react/solid"

import Alert from "@/components/Alert"
import useSite from "@/hooks/useSite"
import useItems from "@/hooks/useItems"
import { syncReqState } from "@/lib/store"
import difference from "@/lib/difference"

import type { Site } from "@prisma/client"

const EditorSync = () => {
  // Hooks
  const { actions } = useEditor()
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { site } = useSite(sessionId)
  const { data } = useItems(site?.id)

  // Atoms
  const [synReq, setSyncReq] = useRecoilState(syncReqState)

  // Check sync status
  useEffect(() => {
    if (site && data?.items?.length > 0) {
      // Get Menu Items and check if update is necessary
      const serial = lz.decompress(lz.decodeBase64(site?.serialData))
      const items = []
      let siteItem: Site
      const objectData = JSON.parse(serial)
      for (const property in objectData) {
        const component = objectData[property]
        if (component?.type?.resolvedName === "MenuItem") {
          items.push(component?.props?.item)
        }

        if (component?.type?.resolvedName === "MenuBanner") {
          siteItem = component?.props?.site
        }
      }

      const equalItems: boolean = items.every(item => {
        const dbItem = data.items.filter(dbItem => dbItem.id === item.id)
        return dbItem[0].updatedAt === item.updatedAt
      })

      let equalSite = true
      const diff = difference(siteItem, site)
      // Check changed properties, exclude serialData and updatedAt
      Object.getOwnPropertyNames(diff).forEach(propName => {
        if (propName !== "serialData" && propName !== "updatedAt") {
          equalSite = false
        }
      })

      setSyncReq(!equalItems || !equalSite)
    }
  }, [data, site, setSyncReq])

  // Update site state
  function syncSite(): void {
    // const toastId = toast.loading("Sincronizando...")

    // Update items
    const serial = lz.decompress(lz.decodeBase64(site?.serialData))
    const objectData = JSON.parse(serial)
    for (const property in objectData) {
      const item = objectData[property]
      if (item?.type?.resolvedName === "MenuItem") {
        const dbItem = data.items.filter(
          dbItem => dbItem.id === item?.props?.item?.id
        )
        if (dbItem[0]) {
          actions.setProp(property, props => {
            props.item = dbItem[0]
          })
        }
      }

      if (item?.type?.resolvedName === "MenuBanner") {
        actions.setProp(property, props => {
          props.site = site
        })
      }
    }

    toast.success("Información actualizada")
    setSyncReq(false)
  }

  return (
    <>
      {synReq ? (
        <div className="-mt-4 px-4 pb-4">
          <Alert
            icon={
              <InformationCircleIcon className="h-5 w-5" aria-hidden="true" />
            }
            message="Alguna información ha sido actualizada, sincroniza tus cambios con el menú."
            action={
              <button
                type="button"
                className="rounded-full bg-blue-400 py-1 px-2 text-sm font-semibold text-white hover:bg-blue-600 active:scale-95"
                onClick={() => syncSite()}
              >
                Sincronizar
              </button>
            }
          />
        </div>
      ) : null}
    </>
  )
}

export default EditorSync
