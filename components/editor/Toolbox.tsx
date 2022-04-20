import React from "react"
import { useSession } from "next-auth/react"
import { TextIcon } from "@radix-ui/react-icons"
import { useEditor } from "@craftjs/core"

import useItems from "@/hooks/useItems"
import Loader from "@/components/Loader"
import useSite from "@/hooks/useSite"
import ToolboxPanel from "@/components/editor/ToolboxPanel"
import MenuItem from "@/components/editor/MenuItem"
import MenuComponent from "@/components/editor/MenuComponent"
import Text from "@/components/selectors/Text"

const Toolbox = (): JSX.Element => {
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
      <ToolboxPanel title="Productos">
        {data &&
          data.items.map(item => (
            <MenuItem key={item.id} item={item}></MenuItem>
          ))}
      </ToolboxPanel>
      <ToolboxPanel title="Elementos">
        <div
          ref={ref =>
            connectors.create(
              ref,
              <Text text="Hola mundo" fontSize="12" textAlign="left"></Text>
            )
          }
        >
          <MenuComponent
            title="Encabezado"
            icon={<TextIcon className="text-blue-500" />}
          />
        </div>
      </ToolboxPanel>
    </div>
  )
}

export default Toolbox
