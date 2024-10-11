import { Sparkles, Upload, Zap } from "lucide-react"

import Features from "@/components/flare-ui/features-horizontal"
import TitleSection from "@/components/marketing/title-section"

const data = [
  {
    id: 1,
    title: "1. Configura tu negocio",
    content:
      "Agregar la información del negocio, configura tus horarios de atención y redes sociales. Nuestro sistema se encargará de todo lo demás.",
    image: "/configuration.png",
    icon: <Upload className="text-primary h-6 w-6" />
  },
  {
    id: 2,
    title: "2. Captura tus productos",
    content:
      "Captura tus productos, agrega una breve descripción, precio y estarás listo para crear tu menú.",
    image: "/products.png",
    icon: <Zap className="text-primary h-6 w-6" />
  },
  {
    id: 3,
    title: "3. Publica tu menú",
    content:
      "Personaliza tu menú con el editor web, publicalo y comparte el enlace con tus clientes. ¡Así de fácil!",
    image: "/editor.png",
    icon: <Sparkles className="text-primary h-6 w-6" />
  }
]

export default function Component() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-6 sm:py-32 sm:pb-28 lg:max-w-7xl lg:px-8">
      <TitleSection
        eyebrow="Cómo funciona"
        title="Solo 3 pasos para iniciar"
        className="mb-16"
      />
      <Features collapseDelay={8000} data={data} linePosition="bottom" />
    </section>
  )
}
