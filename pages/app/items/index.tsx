import { useMemo, useState } from "react"
import Head from "next/head"
import toast from "react-hot-toast"
import { mutate } from "swr"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/outline"

import Table from "@/components/Table"
import useItems from "@/hooks/useItems"
import Button from "@/components/Button"
import Loader from "@/components/Loader"
import ItemForm from "@/components/ItemForm"
import SidePanel from "@/components/SidePanel"
import PageHeader from "@/components/PageHeader"
import EmptyState from "@/components/EmptyState"
import Layout from "@/components/layouts/Layout"

import { HttpMethod, NextPageWithAuthAndLayout } from "@/lib/types"
import useSite from "@/hooks/useSite"

const Items: NextPageWithAuthAndLayout = () => {
  const columns = useMemo(
    () => [
      {
        Header: "Producto",
        accessor: "title",
        Cell: ({ row }) => {
          if (row.original?.image) {
            return (
              <div className="flex items-center gap-4 pl-2">
                <Image
                  src={row.original.image}
                  alt="Imagen Producto"
                  width={40}
                  height={32}
                  className="rounded-md"
                ></Image>
                <span>{row.original?.title}</span>
              </div>
            )
          } else {
            return (
              <div className="flex items-center gap-4 pl-2">
                <div className="hidden h-8 w-10 rounded-md bg-gray-100 sm:visible"></div>
                <span>{row.original?.title}</span>
              </div>
            )
          }
        }
      },
      {
        Header: "Descripcion",
        accessor: "description"
      },
      {
        Header: "Precio",
        accessor: "price"
      },
      {
        Header: "Extras",
        accessor: "extras"
      }
    ],
    []
  )

  const [open, setOpen] = useState(false)
  const [itemId, setItemId] = useState(null)
  const { data: session } = useSession()
  const sessionId = session?.user?.id

  const { site, error } = useSite(sessionId)
  const { data, isLoading } = useItems(site?.id)

  async function onCreateItem(siteId: string) {
    try {
      const res = await fetch(`/api/item?siteId=${siteId}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (res.ok) {
        const data = await res.json()
        setItemId(data.itemId)
        setOpen(true)
        mutate(`/api/item?siteId=${site?.id}`)
      } else {
        toast.error("Algo salió mal")
      }
    } catch (error) {
      console.error(error)
      toast.error("Algo salió mal")
    }
  }

  function openSidePanelItem(itemId: string) {
    setOpen(true)
    setItemId(itemId)
  }

  const isSiteLoading = typeof site === "undefined" && !error

  if (isLoading && isSiteLoading) {
    return <Loader />
  }

  if (!isSiteLoading && !site) {
    return (
      <EmptyState
        header="No hay información del sitio"
        description="Agrega la información básica de tu sitio."
        imageURL="/placeholder-store.svg"
        primaryAction={
          <Link href="/app/settings/general">
            <Button variant="primary" size="sm" rightIcon={<ArrowRightIcon />}>
              Ir a Ajustes
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <Head>
        <title>Bistro - Productos</title>
      </Head>
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <PageHeader title={"Productos"}></PageHeader>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {data?.items?.length > 0 ? (
            <Table
              columns={columns}
              data={data.items}
              getRowProps={row => ({
                onClick: () => openSidePanelItem(row.original.id)
              })}
              toolbar={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusIcon />}
                  onClick={() => onCreateItem(site.id)}
                >
                  Crear Producto
                </Button>
              }
            ></Table>
          ) : (
            <EmptyState
              header="No hay Productos"
              description="Inicia creando un nuevo Producto"
              imageURL="/placeholder-items.svg"
              primaryAction={
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusIcon />}
                  onClick={() => onCreateItem(site.id)}
                >
                  Crear Producto
                </Button>
              }
            />
          )}
          <SidePanel open={open} setOpen={setOpen} title="Modificar Producto">
            <ItemForm itemId={itemId} />
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
