import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"
import { fontFamily } from "tailwindcss/defaultTheme"

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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
} satisfies Config

export default config
