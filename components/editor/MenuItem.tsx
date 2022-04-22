import React from "react"
import { Item } from "@prisma/client"
import { ButtonIcon } from "@radix-ui/react-icons"

interface MenuItemProps {
  item: Item
}

const MenuItem = ({ item }: MenuItemProps): JSX.Element => {
  return (
    <div className="mb-1 flex cursor-move items-center gap-2 truncate rounded-lg p-2 text-sm transition-transform hover:scale-105 hover:bg-blue-500 hover:text-white">
      <ButtonIcon className="text-current"></ButtonIcon>
      <span>{item.title}</span>
    </div>
  )
}

export default MenuItem