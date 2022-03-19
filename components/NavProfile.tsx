import React from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"

interface BistroUser {
  email: string
  uid: string
  username: string
  imageURL?: string
}

export const NavProfile = () => {
  const { data: session, status } = useSession()
  console.dir(session)

  if (status === "loading") {
    return null
  }

  return (
    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
      <a
        className="flex-shrink-0 w-full group block cursor-pointer"
        onClick={() => {
          signOut()
        }}
      >
        <div className="flex items-center">
          <div>
            {session.user?.image ? (
              <Image
                className="inline-block h-9 w-9 rounded-full"
                src={session.user?.image}
                alt="Avatar"
                referrerPolicy="no-referrer"
                width={36}
                height={36}
              />
            ) : (
              <span className="inline-block h-9 w-9 rounded-full overflow-hidden bg-gray-200">
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
          <div className="ml-3">
            <p className="text-sm leading-5 font-medium text-gray-700 group-hover:text-gray-900">
              {session.user?.name}
            </p>
            <p className="text-xs leading-4 font-medium text-gray-500 group-hover:text-gray-700 transition ease-in-out duration-150">
              Salir
            </p>
          </div>
        </div>
      </a>
    </div>
  )
}
