import { useMemo, useState } from "react"
import Head from "next/head"
import { useForm } from "react-hook-form"

import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import Table from "@/components/Table"
import Button from "@/components/Button"
import { PlusIcon } from "@heroicons/react/outline"
import SidePanel from "@/components/SidePanel"
import Input from "@/components/Input"
import TextArea from "@/components/TextArea"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

interface IFormValues {
  name: string
  description: string
  logo: string
  image: string
  phone: string
}

const Items: NextPageWithAuthAndLayout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IFormValues>()

  function onSubmit(data: IFormValues) {
    alert(JSON.stringify(data))
  }

  const [open, setOpen] = useState(false)
  const data = []
  const columns = useMemo(
    () => [
      {
        Header: "Item",
        accesor: "name"
      },
      {
        Header: "Descripcion",
        accesor: "description"
      },
      {
        Header: "Precio",
        accesor: "price"
      }
    ],
    []
  )
  return (
    <>
      <Head>
        <title>Bistro - Items</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Items"}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <Table
            columns={columns}
            data={data}
            toolbar={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusIcon />}
                onClick={() => setOpen(true)}
              >
                Crear Item
              </Button>
            }
          ></Table>
          <SidePanel open={open} setOpen={setOpen} title="Item">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full flex-col"
            >
              {/* Divider container */}
              <div className="flex-1 space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                {/* Item name */}
                <div className="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    Nombre
                  </label>
                  <div className="sm:col-span-2">
                    <Input
                      name="name"
                      register={register}
                      required
                      invalid={errors.name ? true : undefined}
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
              </div>

              {/* Action buttons */}
              <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </SidePanel>
        </div>
      </div>
    </>
  )
}

Items.auth = true
Items.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>
}

export default Items
