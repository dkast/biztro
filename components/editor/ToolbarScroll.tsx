import React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

const ToolbarScroll = ({ children }) => {
  return (
    <ScrollAreaPrimitive.Root
      className="relative flex min-h-0 w-full flex-1 flex-col flex-nowrap overflow-hidden"
      type="hover"
    >
      <ScrollAreaPrimitive.Viewport className="absolute inset-0">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation="vertical"
        className="flex w-[10px] touch-none select-none bg-gray-200 p-0.5 transition-colors hover:bg-gray-300"
      >
        <ScrollAreaPrimitive.Thumb className="relative w-[8px] flex-1 rounded-full bg-gray-400" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        orientation="horizontal"
        className="flex h-[10px] w-[10px] touch-none select-none flex-col bg-gray-200 p-0.5 transition-colors hover:bg-gray-400"
      >
        <ScrollAreaPrimitive.Thumb
          className="before:content-[' '] relative w-[8px] flex-1 rounded-full bg-gray-400 before:absolute before:top-1/2 
        before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2"
        />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
      <ScrollAreaPrimitive.Corner className="bg-gray-200" />
    </ScrollAreaPrimitive.Root>
  )
}

export default ToolbarScroll
