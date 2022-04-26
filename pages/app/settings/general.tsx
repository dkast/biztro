import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import Image from "next/image"

import Layout from "@/components/layouts/Layout"
import SettingsLayout from "@/components/layouts/SettingsLayout"
import Input from "@/components/Input"
import TextArea from "@/components/TextArea"
import Button from "@/components/Button"
import fetcher from "@/lib/fetcher"
import Loader from "@/components/Loader"
import CloudinaryUploadWidget from "@/components/Cloudinary"
import saveImage from "@/lib/save-image"
import BlurImage from "@/components/BlurImage"
import { UploadIcon } from "@heroicons/react/solid"

import type { Site } from "@prisma/client"
import { HttpMethod, ImageInfo, NextPageWithAuthAndLayout } from "@/lib/types"

interface IFormValues {
  name: string
  description: string
  logo: string
  image: string
  phone: string
}

const SettingsGeneral: NextPageWithAuthAndLayout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IFormValues>()

  const [submitted, setSubmitted] = useState(false)
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const [logoImage, setLogoImage] = useState<ImageInfo>(null)
  const [bannerImage, setBannerImage] = useState<ImageInfo>(null)

  const { data: site, error } = useSWR<Site>(sessionId && "/api/site", fetcher)

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
      description: site?.description,
      phone: site?.phone
    })
  }, [site, reset])

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
        description: data.description,
        phone: data.phone
      })
    })

    if (res.ok) {
      toast.success("Información actualizada")
    } else {
      toast.error("Algo salió mal")
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
        description: data.description,
        phone: data.phone,
        logo: logoImage.imageURL,
        image: bannerImage.imageURL,
        imageBlurhash: bannerImage.imageBlurhash
      })
    })

    if (res.ok) {
      toast.success("Información actualizada")
    } else {
      toast.error("Algo salió mal")
    }
  }

  if (!site && !error) {
    return <Loader />
  }

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
                    register={register}
                    required
                    invalid={errors.name ? true : undefined}
                  ></Input>
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
                    register={register}
                    required
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
                    register={register}
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
                      <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                    )}
                    <CloudinaryUploadWidget
                      callback={e => saveImage(e, logoImage, setLogoImage)}
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
                        callback={e =>
                          saveImage(e, bannerImage, setBannerImage)
                        }
                      >
                        {({ open }) => (
                          <button
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
                      callback={e => saveImage(e, bannerImage, setBannerImage)}
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
