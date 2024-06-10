import { Paintbrush } from "lucide-react"
import type { Metadata } from "next"

import { BentoCard, BentoGrid } from "@/components/marketing/bento-grid"
import EditorPreview from "@/components/marketing/editor-preview"
import Hero from "@/components/marketing/hero"
import Navbar from "@/components/marketing/nav-bar"

export const metadata: Metadata = {
  title: "Biztro | Crea tu menú digital en minutos"
}

export default function Page() {
  return (
    <div className="relative dark:bg-black">
      <Navbar />
      <Hero />
      <EditorPreview />
      <Features />
    </div>
  )
}

function Features() {
  return (
    <>
      <section className="xl:max-w-nonetext-center max-w-2xl md:mx-auto md:text-center">
        <h2 className="text-balance font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
          Publica tú menú en Internet, fácil y rápido
        </h2>
        <p className="mt-6 text-balance text-lg tracking-tight text-gray-400">
          Sin necesidad de conocimientos técnicos, crear tu menú utilizando una
          interfaz intuitiva y amigable, solo necesitas tu navegador web
        </p>
      </section>
      <section className="container mt-16">
        <BentoGrid className="min-h-[400px] lg:grid-rows-3">
          {features.map(feature => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </>
  )
}

const features = [
  {
    Icon: Paintbrush,
    name: "Diseño personalizado",
    description:
      "Inicia con una plantilla moderna, modifícala a tu gusto para crear algo original que se ajuste a tú negocio.",
    href: undefined,
    cta: "Ver más",
    background: (
      <img
        src="menu-front.png"
        alt="Diseño"
        className="absolute inset-0 w-full transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_5%,#000_95%)] group-hover:scale-110"
      />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3"
  }
  // {
  //   Icon: FolderSearch,
  //   name: "Historial y búsqueda",
  //   description:
  //     "Busca y filtra tus inspecciones por diferentes criterios. Toda tu información se almacena de forma segura en la nube.",
  //   href: undefined,
  //   cta: "Ver más",
  //   background: (
  //     <img
  //       src="query.png"
  //       alt="Search"
  //       className="absolute right-0 top-[-136px] w-[300px] transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_60%)] group-hover:translate-x-10 sm:top-[-132px]"
  //     />
  //   ),
  //   className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4"
  // },
  // {
  //   Icon: LinkIcon,
  //   name: "Comparte y colabora",
  //   description:
  //     "Genera reportes en PDF y enlaces que puedes compartir dentro o fuera de tu organización.",
  //   href: undefined,
  //   cta: "Ver más",
  //   background: (
  //     <div className="absolute inset-0 top-32 flex items-start justify-center transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_20%,#000_80%)] group-hover:-translate-y-10 group-hover:scale-105">
  //       <Button
  //         size="lg"
  //         variant="outline"
  //         className="gap-x-3 rounded-full shadow-lg sm:hidden"
  //       >
  //         <Share className="size-4" />
  //         Compartir
  //       </Button>
  //     </div>
  //   ),
  //   className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2"
  // },
  // {
  //   Icon: FileBarChart,
  //   name: "Informes y Analítica",
  //   description:
  //     "Obtén información relevante sobre tus inspecciones. Descubre tendencias y áreas de oportunidad.",
  //   href: undefined,
  //   cta: "Ver más",
  //   background: (
  //     <ChartDemo className="absolute left-10 top-5 w-[300px] origin-top translate-x-0 transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10"></ChartDemo>
  //   ),
  //   className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-3"
  // },
  // {
  //   Icon: CloudCog,
  //   name: "Implementación rápida",
  //   description:
  //     "Sin instalaciones, accesible desde cualquier sitio en tu navegador.",
  //   href: undefined,
  //   cta: "Ver más",
  //   background: (
  //     <Globe className="-top-20 h-[600px] w-[600px] transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105 sm:left-10" />
  //   ),
  //   className: "lg:col-start-3 lg:col-end-3 lg:row-start-3 lg:row-end-4"
  // }
]
