export enum FrameSize {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP"
}

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 30, 36]

export const enum ThemeType {
  FONT = "FONT",
  COLOR = "COLOR"
}

export const enum ThemeScope {
  GLOBAL = "GLOBAL",
  USER = "USER"
}

export const fontThemes = [
  {
    name: "DEFAULT",
    fontDisplay: "Inter",
    fontText: "Inter"
  },
  {
    name: "MONACO",
    fontDisplay: "DM Serif Display",
    fontText: "DM Sans"
  },
  {
    name: "PORTLAND",
    fontDisplay: "Quicksand",
    fontText: "Quicksand"
  },
  {
    name: "BERLIN",
    fontDisplay: "Work Sans",
    fontText: "Merriweather"
  },
  {
    name: "AMSTERDAM",
    fontDisplay: "Playfair Display",
    fontText: "Lato"
  },
  {
    name: "GAZA",
    fontDisplay: "Yeseva One",
    fontText: "Josefin Sans"
  },
  {
    name: "OSLO",
    fontDisplay: "Raleway",
    fontText: "Libre Baskerville"
  },
  {
    name: "ROMA",
    fontDisplay: "Cinzel",
    fontText: "Fauna One"
  },
  {
    name: "PARIS",
    fontDisplay: "Poiret One",
    fontText: "Montserrat"
  },
  {
    name: "KIEV",
    fontDisplay: "Montserrat",
    fontText: "Open Sans"
  },
  {
    name: "TUCSON",
    fontDisplay: "Outfit",
    fontText: "Outfit"
  },
  {
    name: "CHICAGO",
    fontDisplay: "Oswald",
    fontText: "Merriweather"
  },
  {
    name: "ORLANDO",
    fontDisplay: "Bubblegum Sans",
    fontText: "Open Sans"
  },
  {
    name: "MADRID",
    fontDisplay: "Bungee",
    fontText: "Outfit"
  },
  {
    name: "FLORENCIA",
    fontDisplay: "Caveat",
    fontText: "Lato"
  },
  {
    name: "LISBOA",
    fontDisplay: "Pacifico",
    fontText: "Quicksand"
  },
  {
    name: "MILAN",
    fontDisplay: "Orelega One",
    fontText: "Merriweather"
  },
  {
    name: "ALAMO",
    fontDisplay: "Rye",
    fontText: "Lora"
  },
  {
    name: "SACRAMENTO",
    fontDisplay: "Sacramento",
    fontText: "Playfair Display"
  },
  {
    name: "MICHIGAN",
    fontDisplay: "Arvo",
    fontText: "Montserrat"
  },
  {
    name: "GOTHAM",
    fontDisplay: "Satisfy",
    fontText: "Open Sans"
  },
  {
    name: "AUSTIN",
    fontDisplay: "Unica One",
    fontText: "Crimson Text"
  },
  {
    name: "SEATTLE",
    fontDisplay: "Mulish",
    fontText: "Space Mono"
  },
  {
    name: "OAKLAND",
    fontDisplay: "Teko",
    fontText: "Montserrat"
  },
  {
    name: "ATLANTICO",
    fontDisplay: "Goldman",
    fontText: "Source Sans 3"
  },
  {
    name: "NOMADA",
    fontDisplay: "Unbounded",
    fontText: "Space Grotesk"
  },
  {
    name: "BOSQUE",
    fontDisplay: "Cormorant Garamond",
    fontText: "Spectral"
  },
  {
    name: "LUMEN",
    fontDisplay: "Great Vibes",
    fontText: "Manrope"
  },
  {
    name: "COSTA",
    fontDisplay: "Rufina",
    fontText: "Cabin"
  },
  {
    name: "DESIERTO",
    fontDisplay: "Alegreya SC",
    fontText: "IBM Plex Sans"
  },
  {
    name: "VERANO",
    fontDisplay: "Bebas Neue",
    fontText: "Assistant"
  },
  {
    name: "POLAR",
    fontDisplay: "Righteous",
    fontText: "Fira Sans"
  },
  {
    name: "ALDEA",
    fontDisplay: "Aleo",
    fontText: "Poppins"
  },
  {
    name: "LAGO",
    fontDisplay: "Koulen",
    fontText: "Noto Sans"
  },
  {
    name: "RIO",
    fontDisplay: "Julius Sans One",
    fontText: "Krub"
  }
]

export const colorThemes = [
  {
    id: "DEFAULT",
    name: "Default",
    surfaceColor: "#ffffff",
    brandColor: "#131313",
    accentColor: "#424242",
    textColor: "#131313",
    mutedColor: "#636363",
    scope: "GLOBAL"
  },
  {
    id: "TERRA_LIGHT",
    name: "Terra",
    surfaceColor: "#fff8f6",
    brandColor: "#231917",
    accentColor: "#8f4c38",
    textColor: "#231917",
    mutedColor: "#6f5600",
    scope: "GLOBAL"
  },
  {
    id: "TERRA_DARK",
    name: "Terra oscuro",
    surfaceColor: "#271d1b",
    brandColor: "#f1dfda",
    accentColor: "#ffb5a0",
    textColor: "#f1dfda",
    mutedColor: "#f5e1a7",
    scope: "GLOBAL"
  },
  {
    id: "FLORA_LIGHT",
    name: "Flora",
    surfaceColor: "#f9faef",
    brandColor: "#1a1c16",
    accentColor: "#4c662b",
    textColor: "#1a1c16",
    mutedColor: "#006c65",
    scope: "GLOBAL"
  },
  {
    id: "FLORA_DARK",
    name: "Flora oscuro",
    surfaceColor: "#1e201a",
    brandColor: "#e2e3d8",
    accentColor: "#b1d18a",
    textColor: "#e2e3d8",
    mutedColor: "#bcece7",
    scope: "GLOBAL"
  },
  {
    id: "AZURE_LIGHT",
    name: "Azure",
    surfaceColor: "#f9f9ff",
    brandColor: "#191c20",
    accentColor: "#415f91",
    textColor: "#191c20",
    mutedColor: "#6a327a",
    scope: "GLOBAL"
  },
  {
    id: "AZURE_DARK",
    name: "Azure oscuro",
    surfaceColor: "#1d2024",
    brandColor: "#dedee4",
    accentColor: "#aac7ff",
    textColor: "#dedee4",
    mutedColor: "#fad8fd",
    scope: "GLOBAL"
  },
  {
    id: "HELIOS_LIGHT",
    name: "Helios",
    surfaceColor: "#fff9ee",
    brandColor: "#1e1b13",
    accentColor: "#6d5e0f",
    textColor: "#1e1b13",
    mutedColor: "#365944",
    scope: "GLOBAL"
  },
  {
    id: "HELIOS_DARK",
    name: "Helios oscuro",
    surfaceColor: "#222017",
    brandColor: "#e8e2d4",
    accentColor: "#dbc66e",
    textColor: "#e8e2d4",
    mutedColor: "#bce3c6",
    scope: "GLOBAL"
  },
  {
    id: "FUEGO_LIGHT",
    name: "Fuego",
    surfaceColor: "#fffaf5",
    brandColor: "#1a0a00",
    accentColor: "#ff6b00",
    textColor: "#1a0a00",
    mutedColor: "#994d1a",
    scope: "GLOBAL"
  },
  {
    id: "FUEGO_DARK",
    name: "Fuego oscuro",
    surfaceColor: "#0d0906",
    brandColor: "#fff5eb",
    accentColor: "#ff8c00",
    textColor: "#fff5eb",
    mutedColor: "#ffb366",
    scope: "GLOBAL"
  },
  {
    id: "CARMESI_LIGHT",
    name: "Carmesí",
    surfaceColor: "#fff5f5",
    brandColor: "#2d0a0a",
    accentColor: "#dc2626",
    textColor: "#2d0a0a",
    mutedColor: "#991b1b",
    scope: "GLOBAL"
  },
  {
    id: "CARMESI_DARK",
    name: "Carmesi oscuro",
    surfaceColor: "#1a0505",
    brandColor: "#fef2f2",
    accentColor: "#ef4444",
    textColor: "#fef2f2",
    mutedColor: "#fca5a5",
    scope: "GLOBAL"
  },
  {
    id: "OCEANO_LIGHT",
    name: "Océano",
    surfaceColor: "#f0fdfa",
    brandColor: "#042f2e",
    accentColor: "#0d9488",
    textColor: "#042f2e",
    mutedColor: "#115e59",
    scope: "GLOBAL"
  },
  {
    id: "OCEANO_DARK",
    name: "Oceano oscuro",
    surfaceColor: "#021716",
    brandColor: "#f0fdfa",
    accentColor: "#2dd4bf",
    textColor: "#f0fdfa",
    mutedColor: "#5eead4",
    scope: "GLOBAL"
  },
  {
    id: "NEON_LIGHT",
    name: "Neon",
    surfaceColor: "#fafafa",
    brandColor: "#0a0a0a",
    accentColor: "#a855f7",
    textColor: "#0a0a0a",
    mutedColor: "#7c3aed",
    scope: "GLOBAL"
  },
  {
    id: "NEON_DARK",
    name: "Neon oscuro",
    surfaceColor: "#09090b",
    brandColor: "#fafafa",
    accentColor: "#c084fc",
    textColor: "#fafafa",
    mutedColor: "#e879f9",
    scope: "GLOBAL"
  },
  {
    id: "ESMERALDA_LIGHT",
    name: "Esmeralda",
    surfaceColor: "#ecfdf5",
    brandColor: "#022c22",
    accentColor: "#059669",
    textColor: "#022c22",
    mutedColor: "#047857",
    scope: "GLOBAL"
  },
  {
    id: "ESMERALDA_DARK",
    name: "Esmeralda oscuro",
    surfaceColor: "#021a14",
    brandColor: "#ecfdf5",
    accentColor: "#34d399",
    textColor: "#ecfdf5",
    mutedColor: "#6ee7b7",
    scope: "GLOBAL"
  },
  {
    id: "MOSTAZA_LIGHT",
    name: "Mostaza",
    surfaceColor: "#fefce8",
    brandColor: "#1c1a00",
    accentColor: "#ca8a04",
    textColor: "#1c1a00",
    mutedColor: "#a16207",
    scope: "GLOBAL"
  },
  {
    id: "MOSTAZA_DARK",
    name: "Mostaza oscuro",
    surfaceColor: "#0f0e00",
    brandColor: "#fefce8",
    accentColor: "#facc15",
    textColor: "#fefce8",
    mutedColor: "#fde047",
    scope: "GLOBAL"
  },
  {
    id: "RUBI_LIGHT",
    name: "Rubí",
    surfaceColor: "#fff1f2",
    brandColor: "#1f0506",
    accentColor: "#e11d48",
    textColor: "#1f0506",
    mutedColor: "#be123c",
    scope: "GLOBAL"
  },
  {
    id: "RUBI_DARK",
    name: "Rubi oscuro",
    surfaceColor: "#120304",
    brandColor: "#fff1f2",
    accentColor: "#fb7185",
    textColor: "#fff1f2",
    mutedColor: "#fda4af",
    scope: "GLOBAL"
  },
  {
    id: "COBALTO_LIGHT",
    name: "Cobalto",
    surfaceColor: "#eff6ff",
    brandColor: "#0c1929",
    accentColor: "#2563eb",
    textColor: "#0c1929",
    mutedColor: "#1d4ed8",
    scope: "GLOBAL"
  },
  {
    id: "COBALTO_DARK",
    name: "Cobalto oscuro",
    surfaceColor: "#030712",
    brandColor: "#f8fafc",
    accentColor: "#3b82f6",
    textColor: "#f8fafc",
    mutedColor: "#60a5fa",
    scope: "GLOBAL"
  },
  {
    id: "CITRICO_LIGHT",
    name: "Cítrico",
    surfaceColor: "#fefffe",
    brandColor: "#132a00",
    accentColor: "#65a30d",
    textColor: "#132a00",
    mutedColor: "#4d7c0f",
    scope: "GLOBAL"
  },
  {
    id: "CITRICO_DARK",
    name: "Citrico oscuro",
    surfaceColor: "#0a1500",
    brandColor: "#f7fee7",
    accentColor: "#84cc16",
    textColor: "#f7fee7",
    mutedColor: "#a3e635",
    scope: "GLOBAL"
  },
  {
    id: "MAGENTA_LIGHT",
    name: "Magenta",
    surfaceColor: "#fdf4ff",
    brandColor: "#270033",
    accentColor: "#d946ef",
    textColor: "#270033",
    mutedColor: "#a21caf",
    scope: "GLOBAL"
  },
  {
    id: "MAGENTA_DARK",
    name: "Magenta oscuro",
    surfaceColor: "#120016",
    brandColor: "#fdf4ff",
    accentColor: "#e879f9",
    textColor: "#fdf4ff",
    mutedColor: "#f0abfc",
    scope: "GLOBAL"
  }
]
