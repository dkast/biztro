import Image from "next/image"

import Waitlist from "@/components/marketing/waitlist"

export default function CTABanner() {
  return (
    <div
      id="cta-banner"
      className="flex w-full flex-col justify-center pb-16 lg:pb-32"
    >
      <div className="mx-auto w-full max-w-5xl px-4 lg:max-w-6xl">
        <div
          className="flex flex-col items-center justify-center rounded-xl
            bg-linear-to-br from-taupe-800 via-taupe-900 to-taupe-950 p-8
            shadow-xl shadow-taupe-900/40 xl:p-16"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl
              bg-taupe-100 shadow-lg shadow-taupe-950/20"
          >
            <Image
              src="/logo-bistro.svg"
              alt="Logo de Biztro"
              width={40}
              height={40}
              unoptimized
            />
          </div>
          <p className="mt-4 mb-1 text-lg text-taupe-300">
            ¿Quieres lanzar tu menú digital de manera rápida y sencilla?
          </p>
          <h3 className="font-display mb-4 text-center text-3xl text-white">
            Solicita acceso anticipado a Biztro
          </h3>
          <span className="mb-4 text-taupe-300">
            Déjanos tu correo y te avisaremos cuando abramos nuevos accesos a la
            beta
          </span>
          <Waitlist />
        </div>
      </div>
    </div>
  )
}
