import { ArrowSmRightIcon } from "@heroicons/react/outline"
import { yupResolver } from "@hookform/resolvers/yup"
import { motion } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import * as yup from "yup"

import Button from "@/components/Button"
import Input from "@/components/Input"

import { HttpMethod } from "@/lib/types"

interface IFormInputs {
  email: string
}

const schema = yup
  .object({
    email: yup
      .string()
      .email("Correo no es válido")
      .required("Campo es requerido")
  })
  .required()

const Invite = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  })

  const [submitted, setSubmitted] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function onSubmit(data: IFormInputs) {
    setSubmitted(true)
    const res = await fetch("/api/invite", {
      method: HttpMethod.POST,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (res.ok) {
      setEmailSent(true)
    } else {
      toast.error("No se pudo enviar la invitación")
    }
    setSubmitted(false)
  }

  return (
    <>
      <Head>
        <title>Biztro - Bienvenido</title>
      </Head>
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex flex-col gap-4">
              <Image
                className="h-12 w-12"
                src="/logo-bistro.svg"
                alt="Biztro"
                width={64}
                height={64}
              />
              {emailSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold leading-9 text-gray-900">
                      Tú solicitud ha sido enviada
                    </h2>
                    <p className="mt-2 text-lg text-gray-500">
                      Gracias por considerarnos! tu solicitud será procesada en
                      un periodo de 24 horas.
                    </p>
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      href="/"
                      className="font-semibold text-violet-500 hover:text-violet-700"
                      legacyBehavior
                    >
                      Volver al inicio
                      <ArrowSmRightIcon className="inline h-6 w-6" />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div>
                  <h2 className="text-3xl font-semibold leading-9 text-gray-900">
                    Crea tú menú en minutos
                  </h2>
                  <p className="mt-2 text-lg text-gray-500">
                    Estamos en fase beta, durante este periodo el servicio no
                    tiene ningún costo. Solicita tu acceso.
                  </p>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mt-8">
                      <Input
                        name="email"
                        type="text"
                        {...register("email")}
                        placeholder="Escribe tu cuenta de correo"
                        invalid={errors.email ? true : false}
                      ></Input>
                      <span className="mt-2 text-sm text-red-500">
                        {errors.email?.message}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-4">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={submitted}
                      >
                        Solictar acceso
                      </Button>
                      <div>
                        <span className="mr-1 text-gray-500">
                          ¿Ya tienes una cuenta?
                        </span>
                        <Link
                          href="/app/dashboard"
                          className="text-violet-500 hover:text-violet-700"
                        >
                          Inicia sesión
                        </Link>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          {/* https://images.unsplash.com/photo-1507914372368-b2b085b925a1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1980&q=80 */}
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1529514027228-b808875f9d37?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1980&q=80"
            alt="Imagen restaurant"
            layout="fill"
          />
        </div>
      </div>
    </>
  )
}

export default Invite