import Image from "next/image"
import { useSession } from "next-auth/react"

import Layout from "@/components/layouts/Layout"
import SettingsLayout from "@/components/layouts/SettingsLayout"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const SettingsProfile: NextPageWithAuthAndLayout = () => {
  const { data: session } = useSession()

  return (
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Perfil
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Ajustes de tu perfil
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6 sm:mt-5 sm:space-y-5">
          {/* Photo */}
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
            <label
              htmlFor="photo"
              className="hidden text-sm font-medium text-gray-700 sm:mt-px sm:block sm:pt-2"
            >
              Foto
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              {session.user?.image ? (
                <Image
                  className="inline-block h-16 w-16 rounded-full"
                  src={session.user?.image}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  width={64}
                  height={64}
                />
              ) : (
                <span className="inline-block h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                  <svg
                    className="h-full w-full text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              )}
            </div>
          </div>
          {/* Name */}
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Nombre
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <span className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                {session.user?.name}
              </span>
            </div>
          </div>
          {/* Email */}
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-100 sm:pt-5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Correo electrónico
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <span className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                {session.user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

SettingsProfile.auth = true
SettingsProfile.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Layout>
      <SettingsLayout>{page}</SettingsLayout>
    </Layout>
  )
}

export default SettingsProfile
