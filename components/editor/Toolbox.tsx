import React from "react"
import { useSession } from "next-auth/react"
import { HeadingIcon } from "@radix-ui/react-icons"
import { useEditor } from "@craftjs/core"

import useItems from "@/hooks/useItems"
import Loader from "@/components/Loader"
import useSite from "@/hooks/useSite"
import ToolboxPanel from "@/components/editor/ToolboxPanel"
import ToolboxItem from "@/components/editor/ToolboxItem"
import ToolboxComponent from "@/components/editor/ToolboxComponent"
import Text from "@/components/selectors/Text"
import MenuItem from "@/components/selectors/MenuItem"
import ToolbarScroll from "@/components/editor/ToolbarScroll"

const Toolbox = (): JSX.Element => {
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site } = useSite(sessionId)
  const { data, isLoading } = useItems(site?.id)
  const { connectors } = useEditor()

  if (isLoading) {
    return <Loader />
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
