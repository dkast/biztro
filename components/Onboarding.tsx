import React, { useState } from "react"
import Link from "next/link"
import * as Accordion from "@radix-ui/react-accordion"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CollectionIcon,
  InformationCircleIcon,
  TemplateIcon
} from "@heroicons/react/outline"
import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"

import Button from "@/components/Button"
import useSite from "@/hooks/useSite"
import useItems from "@/hooks/useItems"
import classNames from "@/lib/classnames"
import Loader from "@/components/Loader"

const accordion = {
  open: {
    opacity: 1,
    height: "var(--radix-accordion-content-height)",
    y: 0,
    transition: {
      height: {
        duration: 0.2
      },
      default: {
        ease: "easeOut",
        duration: 0.2,
        delay: 0.1
      }
    }
  },
  closed: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      height: {
        duration: 0.5
      },
      default: {
        ease: "easeIn",
        duration: 0.2
      }
    }
  }
}

const Onboarding = () => {
  const [value, setValue] = useState(null)

  const { data: session } = useSession()
  const sessionId = session?.user?.id
  const { site, error } = useSite(sessionId)
  const { data, isLoading } = useItems(site?.id)

  const isSiteLoading = typeof site === "undefined" && !error

  if (isLoading && isSiteLoading) {
    return <Loader />
  }

  return (
    <div className="">
      <Accordion.Root
        type="single"
        className="divide-y rounded-xl border border-gray-100 bg-white shadow"
        collapsible
        onValueChange={selectedValue => setValue(selectedValue)}
      >
        <AccordionItem
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <InformationCircleIcon className="m-auto h-6 w-6 text-blue-700" />
            </div>
          }
          title="Agrega la información sobre tu negocio"
          value="item-1"
          selectedValue={value}
          disabled={site !== null}
        >
          <div>
            <p className="pb-4 text-gray-600">
              Inicia capturando la información básica sobre tu negocio
            </p>
            <Link href="/app/settings">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRightIcon />}
              >
                Ir a Ajustes
              </Button>
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <CollectionIcon className="m-auto h-6 w-6 text-purple-700" />
            </div>
          }
          title="Crea tu primer Producto"
          value="item-2"
          selectedValue={value}
          disabled={data?.items?.length > 0}
        >
          <div>
            <p className="pb-4 text-gray-600">
              Ingresa tus productos y empieza a construir tu Menú
            </p>
            <Link href="/app/items">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRightIcon />}
              >
                Ir a Productos
              </Button>
            </Link>
          </div>
        </AccordionItem>
        <AccordionItem
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
              <TemplateIcon className="m-auto h-6 w-6 text-amber-700" />
            </div>
          }
          title="Personaliza tu Menú"
          value="item-3"
          selectedValue={value}
          disabled={site?.published}
        >
          <div>
            <p className="pb-4 text-gray-600">
              Personaliza y publica tu Menú para compartirlo con tus clientes
            </p>
            <Link href="/app/site-editor">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRightIcon />}
              >
                Crea tu Menú
              </Button>
            </Link>
          </div>
        </AccordionItem>
      </Accordion.Root>
    </div>
  )
}

interface AccordionItemProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  value: string
  selectedValue: string
  disabled?: boolean
}

const AccordionItem = ({
  icon,
  title,
  children,
  value,
  selectedValue,
  disabled = false
}: AccordionItemProps) => {
  const isShowing = value === selectedValue

  return (
    <Accordion.Item value={value} className="p-4" disabled={disabled}>
      <Accordion.Trigger asChild>
        <button
          className={classNames(
            disabled ? "" : "cursor-pointer",
            "group flex w-full items-center justify-between"
          )}
          type="button"
        >
          <div className="flex items-center gap-4">
            {!disabled ? (
              icon
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <CheckIcon className="m-auto h-6 w-6 text-green-700" />
              </div>
            )}
            <h2 className="text-lg">{title}</h2>
          </div>
          <div>
            <ChevronDownIcon className="h-radix-accordion h-4 w-4 transform text-gray-500 group-radix-state-open:rotate-180" />
          </div>
        </button>
      </Accordion.Trigger>
      <Accordion.Content forceMount asChild>
        <AnimatePresence>
          {isShowing && !disabled && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={accordion}
              className="pl-14"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Accordion.Content>
    </Accordion.Item>
  )
}

export default Onboarding
