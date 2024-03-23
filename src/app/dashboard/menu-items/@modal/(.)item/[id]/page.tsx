import Panel from "@/components/dashboard/page-panel"

export default function ItemPage() {
  return (
    <Panel className="rounded-lg sm:m-2 sm:h-[95%]">
      <div className="overflow-x-auto">
        <div className="px-4 pb-4 pt-4 sm:px-0 sm:pb-0">
          <h1 className="text-2xl font-bold">Producto</h1>
          <p className="text-gray-500">Detalles del producto</p>
        </div>
      </div>
    </Panel>
  )
}
