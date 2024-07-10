import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"
import { fontFamily } from "tailwindcss/defaultTheme"
import type { PluginCreator } from "tailwindcss/types/config"

const glassPlugin: PluginCreator = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      glass: (value, { modifier }) => {
        const extendedBy = modifier || "6rem"
        const cutoff = `calc(100% - ${extendedBy})`

        return {
          "&::after": {
            content: "''",
            position: "absolute",
            inset: "0",
            // Extend backdrop surface to the bottom
            bottom: `calc(-1 * ${extendedBy})`,
            // Mask out the part falling outside the nav
            "-webkit-mask-image": `linear-gradient(to bottom, black 0, black ${cutoff}, transparent ${cutoff})`,
            "backdrop-filter": `blur(${value || "1rem"})`
          }
        }
      }
    },
    {
      values: {
        ...theme("spacing"),
        DEFAULT: theme("spacing.4")
      },
      modifiers: theme("spacing")
    }
  )
}

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    fontFamily: {
      display: ["var(--font-sora)"],
      sans: ["var(--font-inter)", ...fontFamily.sans]
    },

    transparent: "transparent",
    current: "currentColor",
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        gray: colors.neutral
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%"
          }
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0"
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shimmer: "shimmer 8s infinite"
      },
      gridTemplateColumns: {
        // Add your custom value here
        "300": "repeat(auto-fill, 300px)"
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
    glassPlugin
  ]
} satisfies Config

export default config
