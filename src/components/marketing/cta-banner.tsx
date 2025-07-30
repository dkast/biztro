import Image from "next/image"

import Waitlist from "@/components/marketing/waitlist"

export default function CTABanner() {
  return (
    <div
      id="cta-banner"
      className="flex w-full flex-col justify-center pb-16 lg:pb-32"
    >
      <div className="mx-auto w-full max-w-5xl px-4 lg:max-w-6xl">
        <div className="flex flex-col items-center justify-center rounded-xl bg-linear-to-br from-violet-500 via-orange-500 to-red-500 p-8 shadow-xl shadow-orange-500/30 xl:p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg shadow-orange-700/50">
            <Image
              src="/logo-bistro.svg"
              alt="Logo"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <p className="mt-4 mb-1 text-lg text-orange-200">
            ¿Listo para mejorar tu servicio con un menú digital?
          </p>
          <h3 className="mb-4 text-center text-3xl text-white">
            Haz tu menú online con Biztro
          </h3>
          <span className="mb-4 text-orange-200">
            Únete a nuestra lista de espera
          </span>
          <Waitlist />
        </div>
      </div>
    </div>
  )
}
