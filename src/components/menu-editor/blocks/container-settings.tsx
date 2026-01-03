import { useRef, useState } from "react"
import toast from "react-hot-toast"
import { useNode } from "@craftjs/core"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ImageUp } from "lucide-react"
import { useParams } from "next/navigation"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { UpgradeDialog } from "@/components/dashboard/upgrade-dialog"
import type { ContainerBlockProps } from "@/components/menu-editor/blocks/container-block"
import SideSection from "@/components/menu-editor/side-section"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Separator } from "@/components/ui/separator"
import { getUploadedBackgrounds } from "@/server/actions/media/queries"
import { useIsMobile } from "@/hooks/use-mobile"
import { BgImages, ImageType } from "@/lib/types"
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
  // Check if src is already a full URL (uploaded image) or a relative path (predefined)
  const isFullUrl = src.startsWith("http") || src.startsWith("//")
  const bgUrl = isFullUrl ? src : `/bg/${src}`

  return (
    <button
      onClick={onClick}
      className={cn(
        `group relative aspect-video w-full overflow-hidden rounded-lg border-2
        transition-all hover:border-indigo-500`,
        active ? "border-indigo-500" : "border-transparent"
      )}
    >
      <div
        className="absolute inset-0 bg-gray-100 bg-cover bg-center
          dark:bg-gray-900"
        style={{
          backgroundImage: src === "none" ? "none" : `url(${bgUrl})`
        }}
      />
      <div
        className="absolute inset-0 bg-black/50 p-2 opacity-0 transition-opacity
          group-hover:opacity-100"
      >
        <p className="text-xs text-white">{name}</p>
      </div>
    </button>
  )
}

function BackgroundSelector({
  onClose,
  uploadedBackgrounds
}: {
  onClose: () => void
  uploadedBackgrounds: Awaited<ReturnType<typeof getUploadedBackgrounds>>
}) {
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
      {uploadedBackgrounds.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="mb-2 text-sm font-medium">Mis imágenes</h4>
            <div className="grid grid-cols-3 gap-2">
              {uploadedBackgrounds.map(bg => (
                <BackgroundPreview
                  key={bg.storageKey}
                  src={bg.url}
                  name="Subida"
                  active={
                    backgroundImage === bg.url ||
                    backgroundImage === bg.storageKey
                  }
                  onClick={() => handleSelect(bg.url)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ContainerSettings() {
  const [open, setOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const { backgroundImage } = useNode(node => ({
    backgroundImage: node.data.props.backgroundImage
  }))

  const {
    actions: { setProp }
  } = useNode()

  const params = useParams()
  const menuId = params?.id ?? params?.menuId

  const [showUpgrade, setShowUpgrade] = useState(false)

  const { data: uploadedBackgrounds = [], refetch: refetchUploaded } = useQuery(
    {
      queryKey: ["uploaded-backgrounds"],
      queryFn: () => getUploadedBackgrounds()
    }
  )

  const uploadToastShownRef = useRef(false)

  const handleUploadSuccess = async () => {
    // Prevent duplicate notifications if handler is invoked more than once
    if (uploadToastShownRef.current) return
    uploadToastShownRef.current = true

    setUploadOpen(false)
    await queryClient.invalidateQueries({ queryKey: ["uploaded-backgrounds"] })
    const refreshed = await refetchUploaded()
    const latest = refreshed.data?.[0]
    if (latest?.url) {
      setProp(
        (props: ContainerBlockProps) => (props.backgroundImage = latest.url)
      )
    }
    toast.success("Imagen subida exitosamente")

    // Reset the guard after a short delay so future uploads can notify again
    setTimeout(() => {
      uploadToastShownRef.current = false
    }, 3000)
  }

  const triggerButton = (() => {
    const isUploaded = uploadedBackgrounds.find(
      bg => bg.storageKey === backgroundImage || bg.url === backgroundImage
    )

    let label = "Seleccionar fondo"
    if (backgroundImage === "none") {
      label = "Sólido"
    } else if (patterns.find(p => p.image === backgroundImage)) {
      label = patterns.find(p => p.image === backgroundImage)?.name ?? "Patrón"
    } else if (BgImages.find(img => img.image === backgroundImage)) {
      label =
        BgImages.find(img => img.image === backgroundImage)?.name ?? "Imagen"
    } else if (isUploaded) {
      label = "Imagen subida"
    }

    return (
      <Button
        variant="outline"
        className="w-full justify-start text-left"
        size="sm"
      >
        {label}
      </Button>
    )
  })()

  return (
    <SideSection title="Sitio">
      <div className="grid grid-cols-3 items-center gap-2">
        <dt>
          <Label size="xs">Fondo</Label>
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
                  <BackgroundSelector
                    onClose={() => setOpen(false)}
                    uploadedBackgrounds={uploadedBackgrounds}
                  />
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
                <div
                  className="custom-scrollbar max-h-[calc(90vh-8rem)]
                    overflow-y-auto px-6 pb-6"
                >
                  <BackgroundSelector
                    onClose={() => setOpen(false)}
                    uploadedBackgrounds={uploadedBackgrounds}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </dd>
      </div>
      <div className="col-span-3">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="w-full">
              <ImageUp className="mr-2 size-4" />
              Subir imagen de fondo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Subir imagen de fondo</DialogTitle>
              <DialogDescription>
                Sube una imagen personalizada para usar como fondo de tu menú.
                Tamaño máximo: 1920px, 3MB.
              </DialogDescription>
            </DialogHeader>
            <FileUploader
              organizationId={""}
              imageType={ImageType.MENU_BACKGROUND}
              objectId={menuId as string}
              limitDimension={1920}
              maxFileSize={3 * 1024 * 1024}
              onUploadSuccess={handleUploadSuccess}
              onUpgradeRequired={() => {
                setUploadOpen(false)
                setShowUpgrade(true)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <UpgradeDialog
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="Función Pro"
        description="Subir imágen de fondo está disponible en el plan Pro. Actualiza para desbloquear esta función."
      />
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
