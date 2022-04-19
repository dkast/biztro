import React from "react"
import { useSession } from "next-auth/react"
import { TextIcon } from "@radix-ui/react-icons"
import { useEditor } from "@craftjs/core"

import useItems from "@/hooks/useItems"
import Loader from "@/components/Loader"
import useSite from "@/hooks/useSite"
import EditorToolboxPanel from "@/components/editor/EditorToolboxPanel"
import EditorMenuItem from "@/components/editor//EditorMenuItem"
import EditorMenuComponent from "@/components/editor//EditorMenuComponent"
import Text from "@/components/user/Text"

const EditorToolbox = (): JSX.Element => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site } = useSite(sessionId)
  const { data, isLoading } = useItems(site?.id)
  const { connectors, query } = useEditor()

  if (isLoading) {
    return <Loader />
  }

  return (
    <div>
      <EditorToolboxPanel title="Productos">
        {data &&
          data.items.map(item => (
            <EditorMenuItem key={item.id} item={item}></EditorMenuItem>
          ))}
      </EditorToolboxPanel>
      <EditorToolboxPanel title="Elementos">
        <div
          ref={ref => connectors.create(ref, <Text text="Hola mundo"></Text>)}
        >
          <EditorMenuComponent
            title="Encabezado"
            icon={<TextIcon className="text-blue-500" />}
          />
        </div>
      </EditorToolboxPanel>
    </div>
  )
}

export default EditorToolbox
