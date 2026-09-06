import { Suspense } from "react"
import type { Metadata } from "next"
import { connection } from "next/server"

import Panel from "@/components/dashboard/page-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { ItemFormContent } from "@/app/dashboard/menu-items/[action]/[id]/item-form-content"

export const metadata: Metadata = {
  title: "Producto"
}

export default function ItemPage(props: {
  params: Promise<{ action: string; id: string }>
}) {
  return (
    <Panel className="rounded-lg sm:m-2 sm:h-[95%]">
      <div className="h-full overflow-x-auto">
        <div className="group is-dialog max-w-6xl px-4 py-2 sm:mx-auto sm:px-6">
          <Suspense fallback={<LoadingItemSkeleton />}>
            <DynamicItemForm params={props.params} />
          </Suspense>
        </div>
      </div>
    </Panel>
  )
}

async function DynamicItemForm({
  params
}: {
  params: Promise<{ action: string; id: string }>
}) {
  const { action, id } = await params
  await connection()

  return <ItemFormContent action={action} id={id} />
}

function LoadingItemSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  )
}
