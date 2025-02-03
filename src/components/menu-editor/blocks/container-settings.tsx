import { useState } from "react"
import { useNode } from "@craftjs/core"

import type { ContainerBlockProps } from "@/components/menu-editor/blocks/container-block"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { BgImages } from "@/lib/types"
import { cn } from "@/lib/utils"

function BackgroundPreview({
  src,
  name,
  active,
  onClick
}: {
  src: string
  name: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-lg border-2 transition-all hover:border-indigo-500",
        active ? "border-primary" : "border-muted"
      )}
    >
      <div
        className="absolute inset-0 bg-gray-100 bg-cover bg-center dark:bg-gray-900"
        style={{
          backgroundImage: src.endsWith(".svg")
            ? `url(/bg/${src})`
            : `url(/bg/${src})`
        }}
      />
      <div className="absolute inset-0 bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="text-xs text-white">{name}</p>
      </div>
    </button>
  )
}

function BackgroundSelector({ onClose }: { onClose: () => void }) {
  const {
    actions: { setProp },
    backgroundImage
  } = useNode(node => ({
    backgroundImage: node.data.props.backgroundImage
  }))

  const handleSelect = (value: string) => {
    setProp((props: ContainerBlockProps) => (props.backgroundImage = value))
    onClose()
  }

  return (
    <div className="grid gap-4">
      <div>
        <h4 className="mb-2 text-sm font-medium">Patrones</h4>
        <div className="grid grid-cols-3 gap-2">
          {patterns.map(pattern => (
            <BackgroundPreview
              key={pattern.image}
              src={pattern.image}
              name={pattern.name}
              active={backgroundImage === pattern.image}
              onClick={() => handleSelect(pattern.image)}
            />
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-medium">Imágenes</h4>
        <div className="grid grid-cols-3 gap-2">
          {BgImages.map(image => (
            <BackgroundPreview
              key={image.image}
              src={image.image}
              name={image.name}
              active={backgroundImage === image.image}
              onClick={() => handleSelect(image.image)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ContainerSettings() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const { backgroundImage } = useNode(node => ({
    backgroundImage: node.data.props.backgroundImage
  }))

  const triggerButton = (
    <Button
      variant="outline"
      className="w-full justify-start text-left"
      size="sm"
    >
      {backgroundImage === "none"
        ? "Sólido"
        : patterns.find(p => p.image === backgroundImage)?.name ||
          BgImages.find(img => img.image === backgroundImage)?.name ||
          "Seleccionar fondo"}
    </Button>
  )

  return (
    <SideSection title="Sitio">
      <div className="grid grid-cols-3 items-center gap-2">
        <dt>
          <Label size="sm">Fondo</Label>
        </dt>
        <dd className="col-span-2">
          {isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader className="px-6 py-4">
                  <DrawerTitle>Seleccionar fondo</DrawerTitle>
                </DrawerHeader>
                <div className="custom-scrollbar overflow-y-auto px-6 pb-6">
                  <BackgroundSelector onClose={() => setOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>{triggerButton}</DialogTrigger>
              <DialogContent className="max-h-[90vh] sm:max-w-[625px]">
                <DialogHeader className="px-6 py-4">
                  <DialogTitle>Seleccionar fondo</DialogTitle>
                </DialogHeader>
                <div className="custom-scrollbar max-h-[calc(90vh-8rem)] overflow-y-auto px-6 pb-6">
                  <BackgroundSelector onClose={() => setOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </dd>
      </div>
    </SideSection>
  )
}

const patterns = [
  { name: "Sólido", image: "none" },
  { name: "Textura", image: "noise.svg" },
  { name: "Terreno", image: "topography.svg" },
  { name: "Snacks", image: "food.svg" },
  { name: "Nubes", image: "clouds.svg" },
  { name: "Hojas", image: "leaf.svg" }
]
