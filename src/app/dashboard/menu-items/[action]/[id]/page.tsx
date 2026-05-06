import type { Metadata } from "next"

import { ItemFormContent } from "@/app/dashboard/menu-items/[action]/[id]/item-form-content"

export async function generateMetadata(props: {
  params: Promise<{ action: string; id: string }>
}): Promise<Metadata> {
  const params = await props.params
  const title = `${params.action === "new" ? "Crear" : "Editar"} Producto`
  return {
    title
  }
}

export default async function ItemPage(props: {
  params: Promise<{ action: string; id: string }>
}) {
  const params = await props.params

  return (
    <div
      className="mx-auto w-full max-w-6xl grow px-4 py-6 sm:px-6 sm:py-8
        lg:px-8"
    >
      <ItemFormContent action={params.action} id={params.id} />
    </div>
  )
}
