"use client"

import { useRouter } from "next/navigation"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { useMobile } from "@/lib/use-mobile"
import { cn } from "@/lib/utils"

export default function Panel({
  title,
  description,
  children,
  className
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  const isMobile = useMobile()
  return (
    <>
      {isMobile ? (
        <Drawer
          open={true}
          onOpenChange={open => (!open ? router.back() : null)}
          modal
        >
          <DrawerContent
            className={cn(
              className,
              "h-[96%] gap-y-2 shadow focus:outline-none"
            )}
            onInteractOutside={event => event.preventDefault()}
          >
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
            {children}
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet
          defaultOpen
          onOpenChange={open => (!open ? router.back() : null)}
          modal
        >
          <SheetContent
            className={className}
            onInteractOutside={event => event.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            {children}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
