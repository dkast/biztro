import * as Toolbar from "@radix-ui/react-toolbar"
import Image from "next/image"
import Link from "next/link"

import classNames from "@/lib/classnames"

interface MainMenuProps {
  variant: string
}

const MainMenu = ({ variant }: MainMenuProps): JSX.Element => {
  return (
    <div className="mt-2 flex w-full max-w-6xl items-center py-2 px-4 lg:px-2 xl:px-0">
      <Toolbar.Root className="flex w-full items-center">
        <Toolbar.Button asChild>
          <Link href="/">
            <Image src="/logo-bistro.svg" alt="Logo" width={40} height={40} />
          </Link>
        </Toolbar.Button>
        <Toolbar.Button asChild>
          <Link
            href="/app/dashboard"
            className={classNames(
              "ml-auto rounded-lg border px-3 py-2 text-sm transition",
              variant === "dark"
                ? "border-violet-600 bg-violet-500/10  text-violet-300 hover:bg-violet-500/30"
                : "border-gray-300 text-violet-500 hover:bg-violet-50"
            )}
          >
            Iniciar sesión
          </Link>
        </Toolbar.Button>
      </Toolbar.Root>
    </div>
  )
}

export default MainMenu