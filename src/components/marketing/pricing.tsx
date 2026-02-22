"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { TextMorph } from "torph/react"

import TitleSection from "@/components/marketing/title-section"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const marketingTiers = [
  {
    name: "Gratis",
    id: "tier-free",
    href: "#cta-banner",
    priceMonthly: "$0",
    priceYearly: "$0",
    description:
      "El plan gratuito te permite comenzar a publicar tu menú en línea sin costo.",
    features: [
      "10 productos",
      "Un menú por negocio",
      "Temas personalizados",
      "Descargar código QR"
    ],
    featured: false,
    cta: "Inicia ahora"
  },
  {
    name: "Pro",
    id: "tier-pro",
    href: "#cta-banner",
    priceMonthly: "$149",
    priceYearly: "$1,490",
    description: "Desbloquea todas las características de Biztro.",
    features: [
      "Productos ilimitados",
      "Menús ilimitados",
      "Temas personalizados",
      "Código QR personalizado",
      "Analítica de visitas (próximamente)",
      "Promociones y ofertas (próximamente)",
      "Soporte por correo electrónico"
    ],
    featured: true,
    cta: "Prueba gratis por 30 días"
  }
]

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  )
  const isYearly = billingPeriod === "yearly"

  return (
    <section
      id="pricing"
      className="relative isolate px-6 py-24 sm:py-32 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden
          px-36 blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
          }}
          className="mx-auto aspect-1155/678 w-[72.1875rem] bg-linear-to-tr
            from-[#fef08a] to-[#fed7aa] opacity-30"
        />
      </div>
      <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
        <TitleSection
          eyebrow="Precios"
          title="Escoge el plan correcto para ti"
        />
      </div>
      <div className="mx-auto mt-8 flex items-center justify-center">
        <Tabs
          defaultValue="monthly"
          value={billingPeriod}
          onValueChange={value =>
            setBillingPeriod(value as "monthly" | "yearly")
          }
          className="w-fit"
        >
          <TabsList
            className="grid w-full grid-cols-2 rounded-full bg-orange-100/60
              dark:bg-orange-900/20"
          >
            <TabsTrigger
              value="monthly"
              className="rounded-full data-[state=active]:bg-orange-500
                data-[state=active]:text-white"
            >
              Mensual
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="rounded-full data-[state=active]:bg-orange-500
                data-[state=active]:text-white"
            >
              Anual{" "}
              <span
                className="ml-1 text-orange-600 in-focus:text-white
                  dark:text-orange-400"
              >
                (−20%)
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <p
        className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8
          text-pretty text-orange-950/70 dark:text-orange-100/70"
      >
        Inicia con el plan gratuito, o desbloquea productos ilimitados y
        características con el plan Pro.
      </p>
      <div
        className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6
          sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2"
      >
        {marketingTiers.map((tier, tierIdx) => (
          <div
            key={tier.id}
            className={cn(
              tier.featured
                ? "relative bg-orange-950 shadow-2xl/30 dark:bg-orange-900"
                : `bg-white/60 ring-orange-200 sm:mx-8 lg:mx-0
                  dark:bg-gray-900/60 dark:ring-orange-900/30`,
              tier.featured
                ? ""
                : tierIdx === 0
                  ? `rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none
                    lg:rounded-bl-3xl`
                  : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
              "rounded-3xl p-8 ring-1 sm:p-10"
            )}
          >
            <h3
              id={tier.id}
              className={cn(
                tier.featured
                  ? "text-orange-400"
                  : "text-orange-950 dark:text-orange-50",
                "text-base leading-7 font-semibold"
              )}
            >
              {tier.name}
            </h3>
            <div className="mt-4 flex items-baseline gap-x-2">
              <span
                className={cn(
                  tier.featured
                    ? "text-white"
                    : "text-orange-950 dark:text-orange-50",
                  "text-5xl font-bold tracking-tight"
                )}
              >
                <TextMorph>
                  {isYearly ? tier.priceYearly : tier.priceMonthly}
                </TextMorph>
              </span>
              <span
                className={cn(
                  tier.featured
                    ? "text-orange-400"
                    : "text-orange-950/60 dark:text-orange-100/60",
                  "text-base"
                )}
              >
                <TextMorph>{isYearly ? "MXN/año" : "MXN/mes"}</TextMorph>
              </span>
            </div>
            <div
              className={cn(
                tier.featured
                  ? "text-orange-100/80"
                  : "text-orange-950/80 dark:text-orange-100/80",
                "mt-6 text-base leading-7"
              )}
            >
              {tier.description}
            </div>
            <ul
              className={cn(
                tier.featured
                  ? "text-orange-100/80"
                  : "text-orange-950/80 dark:text-orange-100/80",
                "mt-8 space-y-3 text-sm leading-6 sm:mt-10"
              )}
            >
              {tier.features.map(feature => (
                <li key={feature} className="flex gap-x-3">
                  <Check
                    aria-hidden="true"
                    className={cn(
                      tier.featured
                        ? "text-orange-400"
                        : "text-orange-600 dark:text-orange-400",
                      "h-6 w-5 flex-none"
                    )}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.href}
              aria-describedby={tier.id}
              className={cn(
                tier.featured
                  ? `bg-orange-500 text-white shadow-xs hover:bg-orange-400
                    focus-visible:outline-orange-500`
                  : `text-orange-600 ring-1 ring-orange-200 ring-inset
                    hover:ring-orange-300 focus-visible:outline-orange-600
                    dark:text-orange-400 dark:ring-orange-900/50
                    dark:hover:ring-orange-900`,
                `mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm
                font-semibold focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-2 sm:mt-10`
              )}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
