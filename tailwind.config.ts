import containerQueries from "@tailwindcss/container-queries"
import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"
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
            darkMode: ["class"],
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
        gray: colors.neutral,
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))"
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
        },
        "slide-down": {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "slide-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" }
        },
        rainbow: {
          "0%": {
            "background-position": "0%"
          },
          "100%": {
            "background-position": "200%"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shimmer: "shimmer 8s infinite",
        "slide-down": "slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        "slide-up": "slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1)",
        rainbow: "rainbow var(--speed, 2s) infinite linear"
      },
      gridTemplateColumns: {
        // Add your custom value here
        "300": "repeat(auto-fill, 300px)"
      }
    }
  },
  plugins: [tailwindcssAnimate, typography, containerQueries, glassPlugin]
} satisfies Config

export default config
