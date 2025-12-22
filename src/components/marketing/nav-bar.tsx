"use client"

import React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Navbar({
  children,
  showLinks = false
}: {
  children?: React.ReactNode
  showLinks?: boolean
}) {
  // Use Framer Motion's scroll tracking to derive animation values
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 64], [0, 1], { clamp: true })
  const boxShadow = useTransform(
    scrollY,
    [0, 64],
    ["none", "0 6px 20px rgba(2,6,23,0.08)"],
    { clamp: true }
  )

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 flex h-16 bg-transparent"
      style={{ boxShadow }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/50 backdrop-blur-sm dark:bg-black/5"
        style={{ opacity }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <div className="absolute inset-0 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-row items-center gap-2">
          <Image src="/logo-bistro.svg" alt="Logo" width={32} height={32} />
          <span className="font-medium">Biztro</span>
        </Link>
        {showLinks && (
          <nav className="hidden space-x-6 text-sm md:flex">
            <Link
              href="#how-it-works"
              className="text-gray-800 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              Cómo Funciona
            </Link>
            <Link
              href="#benefits"
              className="text-gray-800 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              Beneficios
            </Link>
            <Link
              href="#pricing"
              className="text-gray-800 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-400"
            >
              Precios
            </Link>
          </nav>
        )}
        {children}
        <Link href="/dashboard">
          <Button
            variant="default"
            size="xs"
            className="rounded-full px-3 shadow-xs"
          >
            Acceder a mi cuenta
          </Button>
        </Link>
      </div>
    </motion.header>
  )
}
