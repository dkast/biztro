import useItems from "@/hooks/useItems"
import useSite from "@/hooks/useSite"
import { useEditor } from "@craftjs/core"
import { HeadingIcon } from "@radix-ui/react-icons"
import { useSession } from "next-auth/react"
import React from "react"

import ToolbarScroll from "@/components/editor/ToolbarScroll"
import ToolboxComponent from "@/components/editor/ToolboxComponent"
import ToolboxItem from "@/components/editor/ToolboxItem"
import ToolboxPanel from "@/components/editor/ToolboxPanel"
import Loader from "@/components/Loader"
import MenuItem from "@/components/selectors/MenuItem"
import Text from "@/components/selectors/Text"

const Toolbox = (): JSX.Element => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site } = useSite(sessionId)
  const { data, isLoading } = useItems(site?.id)
  const { connectors } = useEditor()

  if (isLoading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    )
  }

  return (
    <ToolbarScroll>
      <ToolboxPanel title="Productos">
        {data &&
          data.items.map(item => (
            <div
              key={item.id}
              ref={ref => connectors.create(ref, <MenuItem item={item} />)}
            >
              <ToolboxItem item={item}></ToolboxItem>
            </div>
          ))}
      </ToolboxPanel>
      <ToolboxPanel title="Elementos">
        <div
          ref={ref =>
            connectors.create(
              ref,
              <Text text="Encabezado" fontSize="20"></Text>
            )
          }
        >
          <ToolboxComponent
            title="Encabezado"
            icon={<HeadingIcon className="text-current" />}
          />
        </div>
      </ToolboxPanel>
    </ToolbarScroll>
  )
}

export default Toolbox
