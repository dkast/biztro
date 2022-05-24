import React from "react"
import Link from "next/link"
import * as Accordion from "@radix-ui/react-accordion"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  InformationCircleIcon
} from "@heroicons/react/outline"

import Button from "@/components/Button"

const Onboarding = () => {
  return (
    <div className="">
      <Accordion.Root
        type="single"
        className="rounded-lg border bg-white p-4 shadow"
        defaultValue="item-1"
        collapsible
      >
        <Accordion.Item value="item-1">
          <Accordion.Trigger asChild>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <InformationCircleIcon className="m-auto h-6 w-6 text-blue-700" />
                </div>
                <h2 className="text-lg">
                  Captura la información sobre tu negocio
                </h2>
              </div>
              <div>
                <ChevronDownIcon className="h-4 w-4 transform text-gray-500 radix-state-closed:rotate-180" />
              </div>
            </div>
          </Accordion.Trigger>
          <Accordion.Content className="py-2 pl-14 text-gray-600">
            <div className="">
              <p className="pb-4">
                Inicia capturando la información básica sobre tu negocio
              </p>
              <Link href="/app/settings/general">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRightIcon />}
                >
                  Ir a Ajustes
                </Button>
              </Link>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  )
}

export default Onboarding
