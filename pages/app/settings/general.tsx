import { SubmitHandler, useForm } from "react-hook-form"

import Layout from "@/components/Layout"
import SettingsLayout from "@/components/SettingsLayout"
import Input from "@/components/Input"
import TextArea from "@/components/TextArea"
import Button from "@/components/Button"
import { NextPageWithAuthAndLayout } from "@/lib/types"

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
    formState: { errors }
  } = useForm<IFormValues>()

  const onSubmit: SubmitHandler<IFormValues> = data => {
    alert(JSON.stringify(data))
  }

  return (
    <>
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
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
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
                    invalid={errors.name ? true : false}
                  ></Input>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Descripcion
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <TextArea
                    name="description"
                    register={register}
                    required
                    invalid={errors.description ? true : false}
                  ></TextArea>
                  <p className="mt-2 text-sm text-gray-500">
                    Escribe una descripción sobre tu negocio.
                  </p>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="photo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Photo
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
                  <div className="flex items-center">
                    <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                >
                  Cover photo
                </label>
                <div className="mt-1 sm:col-span-2 sm:mt-0">
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
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar
            </Button>
          </div>
        </div>
      </form>
    </>
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