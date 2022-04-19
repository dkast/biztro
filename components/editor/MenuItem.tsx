import React from "react"
import { Item } from "@prisma/client"
import { ButtonIcon } from "@radix-ui/react-icons"

interface MenuItemProps {
  item: Item
}

const MenuItem = ({ item }: MenuItemProps): JSX.Element => {
  return (
    <div className="mb-1 flex items-center gap-2 truncate rounded border p-2 text-sm shadow-sm">
      <ButtonIcon className="text-blue-500"></ButtonIcon>
      <span>{item.title}</span>
    </div>
  )
}

export default MenuItem
