import React from "react"
import { Item } from "@prisma/client"
import { ButtonIcon } from "@radix-ui/react-icons"

interface MenuItemProps {
  item: Item
}

const ToolboxItem = ({ item }: MenuItemProps): JSX.Element => {
  return (
    <div className="group mb-1 flex cursor-move items-center gap-2 truncate rounded-lg p-2 text-sm transition-transform hover:scale-[1.01] hover:bg-zinc-800 hover:text-white">
      <ButtonIcon className="text-gray-500 group-hover:text-white"></ButtonIcon>
      <span>{item.title}</span>
    </div>
  )
}

export default ToolboxItem
