import {
  ArrowSmRightIcon,
  AtSymbolIcon,
  BadgeCheckIcon,
  BanIcon,
  ChevronDownIcon,
  CollectionIcon,
  CurrencyDollarIcon,
  QrcodeIcon
} from "@heroicons/react/outline"
import { ChevronRightIcon } from "@heroicons/react/solid"
import * as Accordion from "@radix-ui/react-accordion"
import { motion } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { QRCode } from "react-qrcode-logo"

// import Spline from "@splinetool/react-spline"
// import { BrowserView, MobileView } from "react-device-detect"

import Footer from "@/components/blog/Footer"
import MainMenu from "@/components/blog/MainMenu"

import type { NextPageWithAuthAndLayout } from "@/lib/types"

const FAQ = [
  {
    question: "¿Qué es un menú QR?",
    answer: `Un menú QR es un menú de restaurante que puede ser leído directamente en 
      el teléfono móvil del cliente, escanenando el código QR.`
  },
  {
    question: "¿Como funcionan los menú QR para los restaurantes?",
    answer: `El restaurante publica el menú en línea y crea un código QR que pueden poner en su negocio. 
      Los clientes simplemente escanean el código QR con su teléfono móvil y el menú les es mostrado
      en su navegador.`
  },
  {
    question: "¿Como creo un código QR para el menú de mi restaurante?",
    answer: `Primero se necesita publicar el menú de tu restaurante online, entonces puedes generar un código QR convirtiendo 
      la liga hacia tu menú en un código QR. Con Biztro puedes crear tu menú digital online, descargar tu código QR y
      utilizarlo en tu material impreso.`
  },
  {
    question: "¿Puedo actualizar el menú sin reimprimir el código QR?",
    answer: `Si, la ventaja de un menú digital es que puedes editarlo en cualquier momento sin necesidad de reimprimir 
      o actualizar una imagen o PDF de tu menú.`
  },
  {
    question: "¿Como escaneo un código QR para mi menú?",
    answer: `En tu dispositivo con Android o iOS puedes simplemente abrir la aplicación de la cámara y escanear tu código QR. 
      Después de esto, el menú se desplegará en tu navegador, como lo hace una página web normal. No necesitas 
      descargar una aplicación para leer el código QR de tu menú.`
  }
]

const BENEFITS = [
  {
    title: "Comparte en tus Redes Sociales",
    icon: (
      <AtSymbolIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description: `Diseñado especialmente para dispositivos móviles, puedes compartir la liga a tu menú en tus redes sociales.`,
    soon: false
  },
  {
    title: "Menú actualizado",
    icon: (
      <BadgeCheckIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description: `A diferencia de una imagen o un PDF, puedes hacer cambios a tú menú en minutos. 
      Mantén tu menú siempre actualizado.`,
    soon: false
  },
  {
    title: "Sin contratos",
    icon: (
      <BanIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description: `Puedes usar el servicio el tiempo que lo necesites y cancelar en cualquier momento, sin restricciones 
      o penalizaciones.`,
    soon: false
  },
  {
    title: "Ofertas y Promociones",
    icon: (
      <CurrencyDollarIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description:
      "Muestra las promociones directamente en tú menú de forma dinámica y atractiva.",
    soon: true
  },
  {
    title: "Multiples menús",
    icon: (
      <CollectionIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description:
      "Crea diferentes menús, prueba otro estilo o menú de temporada.",
    soon: true
  },
  {
    title: "Personaliza tu código QR",
    icon: (
      <QrcodeIcon className="h-12 w-12 rounded-full bg-purple-200 p-2 text-purple-700" />
    ),
    description:
      "Agrega tu logo, personaliza sus colores y adapta tu código QR para reflejar mejor la imágen de tu negocio.",
    soon: true
  }
]

const text = {
  initial: {
    opacity: 0,
    y: 50
  },
  view: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1
    }
  }
}

const Home: NextPageWithAuthAndLayout = () => {
  return (
    <>
      <Head>
        <title>Biztro</title>
      </Head>
      <div className="flex h-screen flex-col items-center overflow-y-auto overflow-x-hidden">
        <div className="flex w-full flex-col items-center bg-violet-900">
          <HomeMessage />
          <MainMenu variant="dark" />
          <HomeHero />
        </div>
        {/* Main */}
        <div className="flex w-full flex-col justify-center gap-8 bg-gradient-to-br from-gray-100 to-red-100 py-12 px-4 md:gap-24 md:px-12 lg:p-16">
          {/* QR */}
          <HomeSection>
            <HomeSectionText eyebrow="Acceso por QR" title="Obtén tu Código QR">
              Crea tu menú y permite a tus clientes consultarlo rápidamente
              utilizando simplementa la cámara en su télefono móvil.
              Personalízalo añadiedo tu logo.
            </HomeSectionText>
            <div className="relative flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 100, rotate: "0deg" }}
                whileInView={{ opacity: 1, y: 0, rotate: "6deg" }}
                viewport={{
                  once: true,
                  amount: "some"
                }}
                className="left-1/5 absolute bottom-0 h-full w-2/3 -rotate-6 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-700/50 md:bottom-1/4 md:h-1/2"
              ></motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{
                  once: true,
                  amount: "all"
                }}
                transition={{ duration: 0.7 }}
                className="z-10 rounded-xl bg-white p-2 shadow-xl"
              >
                <QRCode
                  value="https://biztro.co/menu"
                  logoImage="/logo-bistro.svg"
                  removeQrCodeBehindLogo
                  ecLevel="Q"
                  fgColor="#312e81"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{
                  once: true,
                  amount: "all",
                  margin: "-200px"
                }}
                className="absolute top-0 left-1/2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-400 px-3 py-1 text-yellow-900 shadow-lg md:top-1/4"
              >
                <span>https://biztro.co/menu</span>
                <ChevronRightIcon className="h-4 w-4 text-current" />
              </motion.div>
            </div>
          </HomeSection>
          {/* Customize */}
          <HomeSection>
            <div className="col-start-1 flex flex-col justify-center md:col-start-2">
              <HomeSectionText
                eyebrow="Personalizacion"
                title="Diseño flexible"
              >
                Inicia con una plantilla moderna, modifícala a tu gusto para
                crear algo original, justo como tú negocio.
              </HomeSectionText>
            </div>
            <div className="md:order-first">
              <div className="relative h-[300px] overflow-hidden rounded-lg bg-gradient-to-b from-orange-300 to-red-500 shadow-lg shadow-red-700/50 md:h-[400px]">
                <div className="absolute inset-x-0 bottom-[-6px] flex items-end justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{
                      once: true,
                      amount: "some"
                    }}
                    transition={{ duration: 0.7 }}
                  >
                    <Image
                      src="/menu-back.png"
                      width={400}
                      height={300}
                      alt="Imagen del Editor"
                      priority
                    />
                  </motion.div>
                </div>
                <div className="absolute inset-x-0 bottom-[-6px] flex items-end justify-center">
                  <motion.div
                    initial={{ y: 30, scale: 0.95 }}
                    whileInView={{ y: 0, scale: 1 }}
                    viewport={{
                      once: true,
                      amount: "some"
                    }}
                    transition={{ duration: 0.7 }}
                  >
                    <Image
                      src="/menu-front.png"
                      width={400}
                      height={300}
                      alt="Imagen del Editor"
                      priority
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </HomeSection>
          {/* Online */}
          <HomeSection>
            <HomeSectionText eyebrow="Online" title="No requiere instalación">
              Tu menú esta disponible para todos, no se requiere instalar alguna
              app, puede verse desde tú teléfono, tablet o escritorio.
            </HomeSectionText>
            <div className="relative flex items-center">
              <motion.div
                initial={{ opacity: 0, x: 100, rotate: "6deg" }}
                whileInView={{ opacity: 1, x: 0, rotate: "-3deg" }}
                viewport={{
                  once: true,
                  amount: "all"
                }}
                className="absolute left-9 bottom-0 h-full w-2/3 -rotate-3 rounded-lg bg-emerald-300/25 md:bottom-1/4 md:h-1/2"
              ></motion.div>
              <div className="z-10 m-auto flex w-2/3 justify-center rounded-lg bg-gradient-to-b from-emerald-200 to-emerald-300 px-4 py-4 shadow-lg shadow-emerald-500/50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{
                    once: true,
                    amount: "all"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/devices.svg"
                    alt="Icono de dispositivos"
                    width={150}
                    height={150}
                    priority
                  ></Image>
                </motion.div>
              </div>
            </div>
          </HomeSection>
          {/* Editor */}
          <HomeSection>
            <div className="col-start-1 flex flex-col justify-center p-4 md:col-start-2">
              <HomeSectionText
                eyebrow="Editor Web"
                title="Haz cambios al instante"
              >
                Con una interfaz de arrastrar y soltar, es fácil realizar
                cambios a tu menú, no requieres habilidades técnicas y los
                resultados se pueden ver al instante.
              </HomeSectionText>
            </div>
            <div className="md:order-first">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  once: true,
                  amount: "some"
                }}
                transition={{ duration: 0.7 }}
                className="flex items-end justify-start overflow-hidden rounded-lg bg-gradient-to-b from-teal-200 to-cyan-300 shadow-lg shadow-cyan-600/50 md:h-[400px]"
              >
                <Image
                  src="/editor.png"
                  width={400}
                  height={300}
                  alt="Imagen del Editor"
                  priority
                />
              </motion.div>
            </div>
          </HomeSection>
        </div>
        <HomeBenefit />
        <HomeFaq />
        <HomeBanner />
        <Footer />
      </div>
    </>
  )
}

const HomeHero = (): JSX.Element => {
  return (
    <div className="mb-16 w-full max-w-6xl px-4 lg:px-2 xl:px-0">
      <div className="relative min-h-[600px]">
        {/* Disabled, we're not ready yet for 3D mainstream */}
        {/* <BrowserView>
          <Spline
            className="absolute top-0 right-0 translate-x-60 scale-125 md:scale-100 lg:translate-x-0"
            scene="https://prod.spline.design/45sQS3DmiIWkyCeK/scene.splinecode"
          />
        </BrowserView> */}
        {/* <MobileView> */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 right-0 translate-x-16 translate-y-32 scale-125 sm:translate-y-0 md:scale-100"
        >
          <Image
            src="/biztro-hero.png"
            alt="Imagen aplicación"
            width={800}
            height={600}
          />
        </motion.div>
        {/* </MobileView> */}
        <div className="absolute top-0 left-0 mt-8 w-full sm:mt-32 sm:w-1/2">
          <h1 className="font-display text-4xl tracking-tight text-white md:text-5xl lg:text-6xl">
            Tu menú digital en minutos
          </h1>
          <h2 className="py-6 text-xl text-orange-100 md:py-8 md:text-2xl lg:text-xl lg:leading-6">
            Crea tu menú digital y QR, compartelo con tus clientes.
          </h2>
          <div className="mt-52 flex flex-col justify-center gap-4 md:m-0 md:flex-row">
            <Link
              href="/invite"
              className="flex items-center rounded-lg bg-gradient-to-tl from-red-500 to-orange-500 px-4 py-3 text-orange-100 shadow-sm shadow-orange-500/50 transition hover:scale-[98%] hover:bg-orange-600"
            >
              Crea tu menú
              <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
            </Link>
            <Link
              href="/menu"
              className="rounded-lg border border-orange-500 bg-orange-500/25 px-4 py-3 text-orange-100 backdrop-blur-md transition hover:scale-[98%] hover:bg-orange-500"
            >
              Ver un Ejemplo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const HomeBanner = (): JSX.Element => {
  return (
    <div className="flex w-full flex-col justify-center py-16">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-2 xl:px-0">
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-orange-500 to-red-500 p-8 shadow-xl xl:p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg shadow-orange-700/50">
            <Image src="/logo-bistro.svg" alt="Logo" width={40} height={40} />
          </div>
          <p className="mt-4 mb-1 text-lg text-orange-200">
            Inicia con una cuenta gratis
          </p>
          <h3 className="mb-12 text-center text-3xl text-white">
            Crea tu menú en Biztro hoy
          </h3>
          <Link
            href="/invite"
            className="flex items-center rounded-lg bg-white px-4 py-3 text-orange-500 shadow-md shadow-orange-700/50 transition hover:scale-[98%] hover:bg-gray-50"
          >
            Solicita Acceso
            <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
          </Link>
        </div>
      </div>
    </div>
  )
}

const HomeFaq = (): JSX.Element => {
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl px-4 sm:w-[80ch] md:mt-16 lg:px-2 xl:px-0">
      <small className="text-md mb-1 font-semibold uppercase tracking-widest text-orange-600">
        FAQ
      </small>
      <h3 className="font-display text-3xl md:text-4xl">
        Preguntas más frecuentes
      </h3>
      <Accordion.Root type="multiple" className="my-6 divide-y">
        {FAQ.map((item, index) => {
          return (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          )
        })}
      </Accordion.Root>
      <div>
        <p className="text-center text-lg font-semibold">
          ¿Tienes alguna otra duda?{" "}
          <a
            href="mailto:hola@biztro.co"
            className="text-purple-600 hover:text-purple-500"
          >
            Contáctanos.
          </a>
        </p>
      </div>
    </div>
  )
}

const FaqItem = ({ question, answer }): JSX.Element => {
  return (
    <Accordion.Item value={question} className="py-4">
      <Accordion.Trigger asChild>
        <button
          type="button"
          className="group flex w-full items-center justify-between"
        >
          <span className="text-left text-lg font-semibold">{question}</span>
          <div>
            <ChevronDownIcon className="h-radix-accordion h-4 w-4 transform text-gray-500 group-radix-state-open:rotate-180" />
          </div>
        </button>
      </Accordion.Trigger>
      <Accordion.Content asChild>
        <span className="block py-4 px-2 text-gray-600">{answer}</span>
      </Accordion.Content>
    </Accordion.Item>
  )
}

const HomeSection = ({ children }): JSX.Element => {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-12 px-2 md:grid-cols-2 lg:px-0">
      {children}
    </section>
  )
}

const HomeSectionText = ({ eyebrow, title, children }): JSX.Element => {
  return (
    <motion.div
      variants={text}
      initial="initial"
      whileInView="view"
      viewport={{
        once: true,
        amount: "some"
      }}
      className="flex flex-col justify-center p-4 md:h-[400px]"
    >
      <small className="text-md mb-1 font-semibold uppercase tracking-widest text-orange-600">
        {eyebrow}
      </small>
      <h3 className="font-display text-3xl text-gray-900 md:text-4xl">
        {title}
      </h3>
      <p className="mt-4 text-lg text-orange-900">{children}</p>
    </motion.div>
  )
}

const HomeBenefit = (): JSX.Element => {
  return (
    <div className="mx-auto my-12 w-full max-w-6xl px-4 lg:px-2 xl:px-0">
      <small className="text-md mb-1 font-semibold uppercase tracking-widest text-orange-600">
        Porque Biztro
      </small>
      <h3 className="font-display text-3xl text-gray-900 md:text-4xl">
        Obtén los beneficions de tú menu en digital
      </h3>
      <div className="mt-12 grid gap-y-8 gap-x-4 sm:grid-cols-2 md:grid-cols-3">
        {BENEFITS.map((item, index) => {
          return (
            <BenefitItem
              key={index}
              title={item.title}
              icon={item.icon}
              description={item.description}
              soon={item.soon}
            />
          )
        })}
      </div>
    </div>
  )
}

const BenefitItem = ({ icon, title, description, soon }): JSX.Element => {
  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2">{icon}</div>
      <p className="text-lg font-semibold text-orange-600">
        {title}
        {soon && (
          <span className="ml-3 rounded-full bg-purple-100 py-1 px-2 text-xs uppercase tracking-wide text-purple-400">
            Pronto
          </span>
        )}
      </p>
      <span className="text-gray-600">{description}</span>
    </div>
  )
}

const HomeMessage = (): JSX.Element => {
  return (
    <div className="flex h-10 w-full bg-gradient-to-r from-violet-500 via-red-500 to-amber-500">
      <Link
        href="/blog/beta"
        className="text-xm mx-auto flex items-center text-white md:text-sm"
      >
        Estamos en Beta
        <ArrowSmRightIcon className="ml-2 h-6 w-6 text-current" />
      </Link>
    </div>
  )
}

Home.auth = false

export default Home
