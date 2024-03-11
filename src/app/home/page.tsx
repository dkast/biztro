import type { Metadata } from "next"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Biztro | Crea tu menú digital en minutos"
}

export default function Page() {
  return (
    <div>
      <span>Hola mundo</span>
      <Button variant="outline">Pruebas</Button>
    </div>
  )
}
