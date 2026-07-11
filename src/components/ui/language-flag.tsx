import type { SupportedLocaleCode } from "@/lib/types/translations"
import { cn } from "@/lib/utils"

type LanguageFlagProps = {
  locale: SupportedLocaleCode | string
  className?: string
}

function FlagFrame({
  children,
  className,
  label
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <span
      aria-label={label}
      className={cn(
        "relative inline-flex h-4 w-4 overflow-hidden rounded-lg shadow-xs",
        className
      )}
      role="img"
    >
      <svg
        aria-hidden="true"
        className="relative z-0 h-full w-full"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-lg
          inset-ring inset-ring-white/10"
      />
    </span>
  )
}

export function LanguageFlag({ locale, className }: LanguageFlagProps) {
  switch (locale) {
    case "en":
      return (
        <FlagFrame className={className} label="Bandera de Estados Unidos">
          <g clipPath="url(#US_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#F0F0F0"
            />
            <path
              d="M11.477 12H24a12.01 12.01 0 0 0-.413-3.13H11.478V12Zm0-6.262h10.761a12.064 12.064 0 0 0-2.769-3.13h-7.992v3.13ZM12 24c2.824 0 5.42-.976 7.47-2.609H4.53A11.948 11.948 0 0 0 12 24ZM1.761 18.26h20.477a11.93 11.93 0 0 0 1.348-3.13H.413c.3 1.116.758 2.167 1.348 3.13Z"
              fill="#D80027"
            />
            <path
              d="M5.559 1.874h1.093l-1.017.739.389 1.196-1.018-.74-1.017.74.336-1.033c-.896.746-1.68 1.62-2.328 2.594h.35l-.647.47c-.1.168-.197.34-.29.513l.31.951-.578-.419C1 7.19.868 7.5.75 7.817l.34 1.048h1.258l-1.017.74.388 1.195-1.017-.739-.61.443C.033 10.994 0 11.494 0 12h12V0C9.63 0 7.42.688 5.559 1.874Zm.465 8.926-1.018-.739-1.017.739.389-1.196-1.017-.739h1.257l.388-1.195.389 1.195h1.257l-1.017.74.389 1.195Zm-.389-4.691.389 1.195-1.018-.739-1.017.74.389-1.196-1.017-.74h1.257l.388-1.195.389 1.196h1.257l-1.017.739Zm4.693 4.691-1.017-.739-1.017.739.388-1.196-1.017-.739h1.257l.389-1.195.388 1.195h1.258l-1.018.74.389 1.195Zm-.389-4.691.389 1.195-1.017-.739-1.017.74.388-1.196-1.017-.74h1.257l.389-1.195.388 1.196h1.258l-1.018.739Zm0-3.496.389 1.196-1.017-.74-1.017.74.388-1.196-1.017-.739h1.257L9.311.678l.388 1.196h1.258l-1.018.739Z"
              fill="#0052B4"
            />
          </g>
          <defs>
            <clipPath id="US_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "fr":
      return (
        <FlagFrame className={className} label="Bandera de frances">
          <g clipPath="url(#FR_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#F0F0F0"
            />
            <path
              d="M24 12c0-5.16-3.257-9.558-7.826-11.254v22.508C20.744 21.558 24 17.159 24 12Z"
              fill="#D80027"
            />
            <path
              d="M0 12c0 5.16 3.257 9.559 7.826 11.254V.747C3.256 2.443 0 6.841 0 12.001Z"
              fill="#0052B4"
            />
          </g>
          <defs>
            <clipPath id="FR_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "de":
      return (
        <FlagFrame className={className} label="Bandera de aleman">
          <g clipPath="url(#DE_svg__a)">
            <path
              d="M.746 16.175C2.442 20.745 6.84 24 12 24c5.16 0 9.558-3.257 11.253-7.826L12 15.132.746 16.175Z"
              fill="#FFDA44"
            />
            <path
              d="M12 0C6.84 0 2.442 3.258.746 7.828L12 8.87l11.253-1.043C21.558 3.257 17.16 0 12 0Z"
              fill="#000"
            />
            <path
              d="M.746 7.826A11.974 11.974 0 0 0 0 12c0 1.467.264 2.873.746 4.174h22.508c.482-1.3.746-2.707.746-4.174 0-1.468-.264-2.874-.746-4.174H.746Z"
              fill="#D80027"
            />
          </g>
          <defs>
            <clipPath id="DE_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "pt":
      return (
        <FlagFrame className={className} label="Bandera de portugues">
          <g clipPath="url(#PT_svg__a)">
            <path
              d="M0 12c0 5.16 3.256 9.559 7.826 11.254L8.87 12.001 7.826.747C3.256 2.443 0 6.841 0 12.001Z"
              fill="#6DA544"
            />
            <path
              d="M24 12c0-6.627-5.372-12-12-12-1.468 0-2.874.264-4.174.746v22.508c1.3.482 2.706.746 4.174.746 6.628 0 12-5.373 12-12Z"
              fill="#D80027"
            />
            <path
              d="M7.826 16.174a4.174 4.174 0 1 0 0-8.347 4.174 4.174 0 0 0 0 8.347Z"
              fill="#FFDA44"
            />
            <path
              d="M5.478 9.913v2.608a2.348 2.348 0 0 0 4.695 0V9.913H5.478Z"
              fill="#D80027"
            />
            <path
              d="M7.827 13.304a.784.784 0 0 1-.783-.783v-1.043h1.565v1.043a.784.784 0 0 1-.782.783Z"
              fill="#F0F0F0"
            />
          </g>
          <defs>
            <clipPath id="PT_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "it":
      return (
        <FlagFrame className={className} label="Bandera de italiano">
          <g clipPath="url(#IT_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#F0F0F0"
            />
            <path
              d="M24 12c0-5.16-3.257-9.558-7.826-11.254v22.508C20.744 21.558 24 17.159 24 12Z"
              fill="#CE2B37"
            />
            <path
              d="M0 12c0 5.16 3.257 9.559 7.826 11.254V.747C3.256 2.443 0 6.841 0 12.001Z"
              fill="#009246"
            />
          </g>
          <defs>
            <clipPath id="IT_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "ja":
      return (
        <FlagFrame className={className} label="Bandera de japones">
          <g clipPath="url(#JP_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#F0F0F0"
            />
            <path
              d="M12 17.218a5.217 5.217 0 1 0 0-10.435 5.217 5.217 0 0 0 0 10.435Z"
              fill="#D80027"
            />
          </g>
          <defs>
            <clipPath id="JP_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    case "zh":
      return (
        <FlagFrame className={className} label="Bandera de chino">
          <g clipPath="url(#CN_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#D80027"
            />
            <path
              d="m6.567 7.301 1.036 3.188h3.352l-2.71 1.973 1.036 3.188-2.714-1.969-2.714 1.969 1.04-3.188L2.18 10.49h3.35L6.567 7.3Zm7.659 11.284-.792-.975-1.172.454.68-1.054-.793-.98 1.215.323.684-1.054.066 1.256 1.218.323-1.176.45.07 1.257Zm1.576-2.86.375-1.2-1.027-.726 1.257-.019.37-1.2.408 1.19 1.256-.013-1.008.75.403 1.19-1.026-.726-1.008.754Zm2.124-6.918-.553 1.13.9.876-1.243-.178-.553 1.125-.215-1.238-1.247-.178 1.115-.586-.215-1.242.9.877 1.11-.586ZM14.26 5.385l-.095 1.252 1.168.473-1.224.3-.089 1.256-.66-1.068-1.224.3.81-.961-.665-1.064 1.167.473.811-.961Z"
              fill="#FFDA44"
            />
          </g>
          <defs>
            <clipPath id="CN_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </FlagFrame>
      )
    default:
      return (
        <FlagFrame className={className} label={`Idioma ${locale}`}>
          <rect width="24" height="16" fill="#3F3F46" />
          <rect width="24" height="5.333" y="0" fill="#52525B" />
          <rect width="24" height="5.333" y="10.667" fill="#27272A" />
        </FlagFrame>
      )
  }
}
