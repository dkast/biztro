import React, { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"

import fetcher from "@/lib/fetcher"
import Input from "@/components/Input"
import Button from "@/components/Button"
import TextArea from "@/components/TextArea"
import Loader from "@/components/Loader"

import type { Item, Site } from "@prisma/client"
import { HttpMethod, ImageInfo } from "@/lib/types"
import CloudinaryUploadWidget from "./Cloudinary"
import saveImage from "@/lib/save-image"
import { UploadIcon } from "@heroicons/react/solid"
import BlurImage from "@/components/BlurImage"
import ConfirmDialog from "@/components/ConfirmDialog"

interface IFormValues {
  title: string
  description: string
  extras: string
  price: number
}

interface ItemFormProps {
  itemId: string
}

const ItemForm = ({ itemId }: ItemFormProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IFormValues>()
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { data: site } = useSWR<Site>(sessionId && "/api/site", fetcher)
  const { data: item, error } = useSWR<Item>(
    itemId && `/api/item?itemId=${itemId}`,
    fetcher
  )

  const [image, setImage] = useState<ImageInfo>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    reset({
      title: item?.title,
      description: item?.description,
      extras: item?.extras,
      price: item?.price
    })

    setImage({
      imageURL: item?.image,
      imageBlurhash: item?.imageBlurhash
    })
  }, [item, reset])

  async function onSubmit(data: IFormValues) {
    setSubmitted(true)
    await updateItem(data)
    setSubmitted(false)
  }

  async function updateItem(data: IFormValues): Promise<void> {
    const res = await fetch("/api/item", {
      method: HttpMethod.PUT,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: item.id,
        title: data.title,
        description: data.description,
        extras: data.extras,
        price: data.price,
        image: image.imageURL,
        imageBlurhash: image.imageBlurhash
      })
    })

    if (res.ok) {
      toast.success("Producto actualizado")
      mutate(`/api/item?siteId=${site?.id}`)
    } else {
      toast.error("Algo salió mal")
    }
  }

  async function onDeleteItem() {
    await deleteItem(item.id)
  }

  async function deleteItem(itemId: string): Promise<void> {
    const res = await fetch(`/api/item?itemId=${itemId}`, {
      method: HttpMethod.DELETE
    })

    if (res.ok) {
      toast.success("Producto eliminado")
      mutate(`/api/item?siteId=${site?.id}`)
    } else {
      toast.error("Algo salió mal")
    }
  }

  if (!item && !error) {
    return <Loader />
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
      {/* Divider container */}
      <div className="flex-1 space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-100 sm:py-0">
        {/* Item name */}
        <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Nombre
          </label>
          <div className="sm:col-span-2">
            <Input
              name="title"
              placeholder="Nombre del producto"
              {...register("title", { required: true })}
              invalid={errors.title ? true : undefined}
            ></Input>
          </div>
        </div>

        {/* Item name */}
        <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Descripcion
          </label>
          <div className="sm:col-span-2">
            <TextArea
              name="description"
              {...register("description", { required: true })}
              invalid={errors.description ? true : undefined}
            ></TextArea>
          </div>
        </div>

        {/* Price */}
        <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Precio
          </label>
          <div className="sm:col-span-2">
            <Input
              name="price"
              placeholder="0.00"
              step="0.01"
              {...register("price", { required: true })}
              invalid={errors.price ? true : undefined}
              type="number"
            ></Input>
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Extras
          </label>
          <div className="sm:col-span-2">
            <Input
              name="extras"
              placeholder="Extras"
              {...register("extras")}
              invalid={errors.extras ? true : undefined}
            ></Input>
          </div>
        </div>

        {/* Image */}
        <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
          <label
            htmlFor="cover-photo"
            className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
          >
            Imagen
          </label>
          <div className="mt-1 sm:col-span-2 sm:mt-0">
            {image?.imageURL ? (
              <div className="relative">
                <CloudinaryUploadWidget
                  callback={e => saveImage(e, image, setImage)}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={open}
                      className="absolute z-10 flex h-[300px] w-[300px] flex-col items-center justify-center rounded-lg bg-gray-100 opacity-0 transition-all duration-200 ease-linear hover:opacity-80"
                    >
                      <UploadIcon className="h-14 w-14" />
                      <p>Subir otra imagen</p>
                    </button>
                  )}
                </CloudinaryUploadWidget>
                <BlurImage
                  alt="Banner"
                  blurDataURL={image.imageBlurhash ?? undefined}
                  className="rounded-lg"
                  height={300}
                  layout="fixed"
                  objectFit="cover"
                  placeholder="blur"
                  src={image.imageURL}
                  width={300}
                />
              </div>
            ) : (
              <CloudinaryUploadWidget
                callback={e => saveImage(e, image, setImage)}
              >
                {({ open }) => (
                  <div className="flex w-[300px] justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                          <span onClick={open}>Subir una imagen</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG o JPG hasta 5MB
                      </p>
                    </div>
                  </div>
                )}
              </CloudinaryUploadWidget>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpenDialog(true)}
          >
            Eliminar
          </Button>
          <Button type="submit" variant="primary" isLoading={submitted}>
            Guardar
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Eliminar Producto"}
        onConfirm={onDeleteItem}
      >
        ¿Esta seguro de eliminar este Producto? Esta acción no se puede
        deshacer.
      </ConfirmDialog>
    </form>
  )
}

export default ItemForm
