import React, { useEffect } from "react"
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
import { HttpMethod } from "@/lib/types"

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

  useEffect(() => {
    reset({
      title: item?.title,
      description: item?.description,
      extras: item?.extras,
      price: item?.price
    })
  }, [item, reset])

  async function onSubmit(data: IFormValues) {
    updateItem(data)
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
        price: data.price
      })
    })

    if (res.ok) {
      toast.success("Producto actualizado")
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
      <div className="flex-1 space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
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
              register={register}
              required
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
              register={register}
              required
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
              register={register}
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
              register={register}
              invalid={errors.extras ? true : undefined}
            ></Input>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex justify-end space-x-3">
          {/* <Button
            type="button"
            variant="secondary"
            // onClick={() => setOpen(false)}
          >
            Cancelar
          </Button> */}
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ItemForm
