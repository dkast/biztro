import Image from "next/image"

import Waitlist from "@/components/marketing/waitlist"

export default function CTABanner() {
  return (
    <div
      id="cta-banner"
      className="flex w-full flex-col justify-center pb-16 lg:pb-32"
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        <div
          className="smooth-shadow-ring-xl smooth-ring-neutral-50/30 relative
            isolate flex flex-col items-center justify-center overflow-clip
            rounded-xl bg-taupe-950 p-8 shadow-orange-400 xl:p-16"
        >
          {/* Golden-hour gradient: cream bloom over warm ink */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: `linear-gradient(
                to bottom,
                var(--color-taupe-200) 0%,
                oklch(80% 0.14 62) 20%,
                oklch(64.6% 0.222 41.116) 36%,
                oklch(45% 0.13 45) 54%,
                var(--color-taupe-950) 86%,
                var(--color-taupe-950) 100%
              )`
            }}
          />
          {/* Print grain */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]
              mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`
            }}
          />
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
          <p className="mt-4 mb-1 hidden text-lg text-taupe-300 sm:block">
            ¿Quieres lanzar tu menú digital de manera rápida y sencilla?
          </p>
          <h3 className="font-display mb-4 text-center text-3xl text-white">
            Solicita acceso anticipado a Biztro
          </h3>
          <Waitlist />
        </div>
      </div>
    </div>
  )
}
