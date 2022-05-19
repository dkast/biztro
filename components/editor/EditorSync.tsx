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
    if (site && data) {
      // Get Menu Items and check if update is necessary
      const serial = lz.decompress(lz.decodeBase64(site?.serialData))
      const items = []
      const objectData = JSON.parse(serial)
      for (const property in objectData) {
        const item = objectData[property]
        if (item?.type?.resolvedName === "MenuItem") {
          items.push(item?.props?.item)
        }
      }

      const result: boolean = items.every(item => {
        const dbItem = data.items.filter(dbItem => dbItem.id === item.id)
        return dbItem[0].updatedAt === item.updatedAt
      })

      setSyncReq(!result)
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
            message="Algunos productos han sido actualizados, sincronice sus cambios con el menú."
            action={
              <button
                type="button"
                className="rounded-md py-1 px-2 text-sm font-semibold text-white hover:bg-blue-400"
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
