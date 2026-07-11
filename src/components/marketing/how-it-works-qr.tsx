"use client"

import { FunkyShadow } from "funky-shadow"
import { CornerRightUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import QRimage from "../../../public/qr-example.png"

const exampleUrl = "https://la-bella-italia.biztro.co"

export function HowItWorksQr() {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-3
        overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, oklch(71.4% 0.014 41.2 / 0.25), transparent 70%)"
        }}
      />
      <Link
        href={exampleUrl}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        className="z-10"
      >
        <FunkyShadow
          width={300}
          height={300}
          offsetX={7}
          offsetY={7}
          preset="forest"
          opacity={0.3}
          radius={16}
        >
          <Image
            src={QRimage}
            alt="Código QR de ejemplo"
            style={{ clipPath: "inset(0 round 20px)", display: "block" }}
            width={300}
          />
        </FunkyShadow>
      </Link>
      <span
        className="z-10 mt-4 flex items-center gap-2 text-sm text-taupe-700
          dark:text-taupe-300"
      >
        Escanea o{" "}
        <Link
          href={exampleUrl}
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          className="inline-flex items-center gap-1 text-taupe-600 underline
            underline-offset-2 hover:text-taupe-500 dark:text-taupe-400"
        >
          abre el ejemplo
          <CornerRightUp className="size-3" />
        </Link>
      </span>
    </div>
  )
}
