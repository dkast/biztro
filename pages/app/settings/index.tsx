import { CameraIcon } from "@heroicons/react/outline"
import { UploadIcon } from "@heroicons/react/solid"
import type { Site } from "@prisma/client"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import useSWR, { mutate } from "swr"

import BlurImage from "@/components/BlurImage"
import Button from "@/components/Button"
// import Loader from "@/components/Loader"
import CloudinaryUploadWidget from "@/components/Cloudinary"
import Input from "@/components/Input"
import InputAddon from "@/components/InputAddon"
import Layout from "@/components/layouts/Layout"
import SettingsLayout from "@/components/layouts/SettingsLayout"
import TextArea from "@/components/TextArea"

import useWarnChanges from "@/hooks/useWarnChanges"

import fetcher from "@/lib/fetcher"
import saveImage from "@/lib/save-image"
import { HttpMethod, ImageInfo, NextPageWithAuthAndLayout } from "@/lib/types"

interface IFormValues {
  name: string
  subdomain: string
  description: string
  logo: string
  image: string
  phone: string
}

const SettingsGeneral: NextPageWithAuthAndLayout = () => {
  // hooks
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError
  } = useForm<IFormValues>()

  const [submitted, setSubmitted] = useState(false)
  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { data: site } = useSWR<Site>(sessionId && "/api/site", fetcher)

  const [logoImage, setLogoImage] = useState<ImageInfo>(null)
  const [bannerImage, setBannerImage] = useState<ImageInfo>(null)
  const [isImageDirty, setIsImageDirty] = useState<boolean>(false)

  useEffect(() => {
    setLogoImage({
      imageURL: site?.logo,
      imageBlurhash: null
    })
    setBannerImage({
      imageURL: site?.image,
      imageBlurhash: site?.imageBlurhash
    })
    reset({
      name: site?.name,
      subdomain: site?.subdomain,
      description: site?.description,
      phone: site?.phone
    })
  }, [site, reset])

  // actions
  async function onSubmit(data: IFormValues) {
    setSubmitted(true)
    if (site?.id) {
      await updateSite(data)
    } else {
      await createSite(data)
    }
    setSubmitted(false)
    mutate("/api/site")
  }

  async function createSite(data: IFormValues): Promise<void> {
    const res = await fetch("/api/site", {
      method: HttpMethod.POST,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: sessionId,
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        phone: data.phone,
        logo: logoImage.imageURL,
        image: bannerImage.imageURL,
        imageBlurhash: bannerImage.imageBlurhash
      })
    })

    if (res.ok) {
      toast.success("Información actualizada")
      setIsImageDirty(false)
    } else {
      if (res.status === 409) {
        setError("subdomain", { message: "URL para sitio ya existe" })
      } else {
        toast.error("Algo salió mal")
      }
    }
  }

  async function updateSite(data: IFormValues): Promise<void> {
    const res = await fetch("/api/site", {
      method: HttpMethod.PUT,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: site.id,
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        phone: data.phone,
        logo: logoImage.imageURL,
        image: bannerImage.imageURL,
        imageBlurhash: bannerImage.imageBlurhash
      })
    })

    if (res.ok) {
      toast.success("Información actualizada")
      setIsImageDirty(false)
    } else {
      if (res.status === 409) {
        setError("subdomain", { message: "URL ya existe." })
      } else {
        toast.error("Algo salió mal")
      }
    }
  }

  useWarnChanges(
    isImageDirty || isDirty,
    "Tiene cambios sin guardar - ¿Está seguro de salir de esta página?"
  )

  // if (isValidating) {
  //   return <Loader />
  // }

  return (
    <form
      className="space-y-8 divide-y divide-gray-200"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Negocio
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Información pública sobre tu negcio
            </p>
          </div>

          <div className="mt-6 space-y-6 sm:mt-5 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Nombre
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <Input
                  name="name"
                  {...register("name", { required: true })}
                  invalid={errors.name ? true : undefined}
                ></Input>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="subdomain"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                URL
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <InputAddon
                  name="subdomain"
                  type="text"
                  addon="https://biztro.app/"
                  {...register("subdomain", {
                    pattern: /^[a-z0-9](-?[a-z0-9])*$/i,
                    required: true
                  })}
                  invalid={errors.subdomain ? true : undefined}
                  placeholder="mi-menu"
                ></InputAddon>
                <p className="mt-2 text-sm text-gray-500">
                  Solo se permiten números, letras y guiones.
                </p>
                <span className="mt-2 text-sm text-red-500">
                  {errors.subdomain?.message}
                </span>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Información
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <TextArea
                  name="description"
                  {...register("description", { required: true })}
                  invalid={errors.description ? true : undefined}
                ></TextArea>
                <p className="mt-2 text-sm text-gray-500">
                  Dirección del negocio, información, etc.
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Teléfono
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <Input
                  type="tel"
                  name="phone"
                  {...register("phone", {
                    pattern: /[0-9]{3}-[0-9]{3}-[0-9]{4}/i
                  })}
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  placeholder="123-456-7890"
                  invalid={errors.phone ? true : undefined}
                ></Input>
                <p className="mt-2 text-sm text-gray-500">
                  Formato: 123-456-7890
                </p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="photo"
                className="block text-sm font-medium text-gray-700"
              >
                Logo
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <div className="flex items-center">
                  {logoImage?.imageURL ? (
                    <div className="h-[100px] w-[100px] rounded-full border border-gray-100 shadow">
                      <Image
                        src={logoImage.imageURL}
                        alt="logo"
                        width={100}
                        height={100}
                        className="rounded-full"
                      ></Image>
                    </div>
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {<CameraIcon className="h-8 w-8 text-gray-400" />}
                    </span>
                  )}
                  <CloudinaryUploadWidget
                    callback={e => {
                      saveImage(e, logoImage, setLogoImage)
                      setIsImageDirty(true)
                    }}
                  >
                    {({ open }) => (
                      <div className="ml-5">
                        <Button variant="secondary" onClick={open} size="sm">
                          Subir
                        </Button>
                      </div>
                    )}
                  </CloudinaryUploadWidget>
                </div>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Banner
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                {bannerImage?.imageURL ? (
                  <div className="relative">
                    <CloudinaryUploadWidget
                      callback={e => {
                        saveImage(e, bannerImage, setBannerImage)
                        setIsImageDirty(true)
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={open}
                          className="absolute z-10 flex h-full w-full flex-col items-center justify-center rounded-md bg-gray-100 opacity-0 transition-all duration-200 ease-linear hover:opacity-80"
                        >
                          <UploadIcon className="h-14 w-14" />
                          <p>Subir otra imagen</p>
                        </button>
                      )}
                    </CloudinaryUploadWidget>
                    <BlurImage
                      alt="Banner"
                      blurDataURL={bannerImage.imageBlurhash ?? undefined}
                      className="rounded-md"
                      height={200}
                      layout="responsive"
                      objectFit="cover"
                      placeholder="blur"
                      src={bannerImage.imageURL}
                      width={600}
                    />
                  </div>
                ) : (
                  <CloudinaryUploadWidget
                    callback={e => {
                      saveImage(e, bannerImage, setBannerImage)
                      setIsImageDirty(true)
                    }}
                  >
                    {({ open }) => (
                      <div className="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
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
                            PNG o JPG hasta 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </CloudinaryUploadWidget>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-2">
          {/* <Button type="button" variant="secondary" size="sm">
              Cancelar
            </Button> */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={submitted}
          >
            Guardar
          </Button>
        </div>
      </div>
    </form>
  )
}

SettingsGeneral.auth = true
SettingsGeneral.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Layout>
      <SettingsLayout>{page}</SettingsLayout>
    </Layout>
  )
}

export default SettingsGeneral
