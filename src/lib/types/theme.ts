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

export type FontTheme = {
  name: string
  fontDisplay: string
  fontText: string
  tags?: string[]
}

export type ColorTheme = {
  id: string
  name: string
  surfaceColor: string
  brandColor: string
  accentColor: string
  textColor: string
  mutedColor: string
  scope: string
  tags?: string[]
}

export type ThemePreset = {
  id: string
  name: string
  description: string
  fontTheme: string
  colorTheme: string
  tags: string[]
}

export const fontThemes: FontTheme[] = [
  {
    name: "DEFAULT",
    fontDisplay: "Inter",
    fontText: "Inter",
    tags: ["modern", "minimal"]
  },
  {
    name: "MONACO",
    fontDisplay: "DM Serif Display",
    fontText: "DM Sans",
    tags: ["elegant", "fine-dining"]
  },
  {
    name: "PORTLAND",
    fontDisplay: "Quicksand",
    fontText: "Quicksand",
    tags: ["modern", "coffee", "brunch"]
  },
  {
    name: "BERLIN",
    fontDisplay: "Work Sans",
    fontText: "Merriweather",
    tags: ["modern", "bistro"]
  },
  {
    name: "AMSTERDAM",
    fontDisplay: "Playfair Display",
    fontText: "Lato",
    tags: ["elegant", "fine-dining"]
  },
  {
    name: "GAZA",
    fontDisplay: "Yeseva One",
    fontText: "Josefin Sans",
    tags: ["bold", "bar"]
  },
  {
    name: "OSLO",
    fontDisplay: "Raleway",
    fontText: "Libre Baskerville",
    tags: ["classic", "elegant", "seafood"]
  },
  {
    name: "ROMA",
    fontDisplay: "Cinzel",
    fontText: "Fauna One",
    tags: ["classic", "italian", "fine-dining"]
  },
  {
    name: "PARIS",
    fontDisplay: "Poiret One",
    fontText: "Montserrat",
    tags: ["elegant", "fine-dining"]
  },
  {
    name: "KIEV",
    fontDisplay: "Montserrat",
    fontText: "Open Sans",
    tags: ["modern", "minimal"]
  },
  {
    name: "TUCSON",
    fontDisplay: "Outfit",
    fontText: "Outfit",
    tags: ["modern", "minimal", "casual"]
  },
  {
    name: "CHICAGO",
    fontDisplay: "Oswald",
    fontText: "Merriweather",
    tags: ["bold", "bbq", "steakhouse"]
  },
  {
    name: "ORLANDO",
    fontDisplay: "Bubblegum Sans",
    fontText: "Open Sans",
    tags: ["playful", "ice-cream"]
  },
  {
    name: "MADRID",
    fontDisplay: "Bungee",
    fontText: "Outfit",
    tags: ["bold", "playful", "fast-food", "pizzeria"]
  },
  {
    name: "FLORENCIA",
    fontDisplay: "Caveat",
    fontText: "Lato",
    tags: ["handwritten", "bakery", "brunch"]
  },
  {
    name: "LISBOA",
    fontDisplay: "Pacifico",
    fontText: "Quicksand",
    tags: ["playful", "tropical", "bar"]
  },
  {
    name: "MILAN",
    fontDisplay: "Orelega One",
    fontText: "Merriweather",
    tags: ["elegant", "italian", "fine-dining"]
  },
  {
    name: "ALAMO",
    fontDisplay: "Rye",
    fontText: "Lora",
    tags: ["rustic", "bbq", "steakhouse"]
  },
  {
    name: "SACRAMENTO",
    fontDisplay: "Dancing Script",
    fontText: "Playfair Display",
    tags: ["elegant", "bakery", "brunch"]
  },
  {
    name: "MICHIGAN",
    fontDisplay: "Arvo",
    fontText: "Montserrat",
    tags: ["bold", "modern", "bistro"]
  },
  {
    name: "GOTHAM",
    fontDisplay: "Satisfy",
    fontText: "Open Sans",
    tags: ["handwritten", "coffee", "casual"]
  },
  {
    name: "AUSTIN",
    fontDisplay: "Unica One",
    fontText: "Crimson Text",
    tags: ["modern", "minimal", "wine"]
  },
  {
    name: "SEATTLE",
    fontDisplay: "Mulish",
    fontText: "Space Mono",
    tags: ["modern", "minimal"]
  },
  {
    name: "OAKLAND",
    fontDisplay: "Teko",
    fontText: "Montserrat",
    tags: ["bold", "fast-food", "modern"]
  },
  {
    name: "ATLANTICO",
    fontDisplay: "Goldman",
    fontText: "Source Sans 3",
    tags: ["bold", "modern", "bar"]
  },
  {
    name: "NOMADA",
    fontDisplay: "Unbounded",
    fontText: "Space Grotesk",
    tags: ["modern", "bold", "trendy"]
  },
  {
    name: "BOSQUE",
    fontDisplay: "Cormorant Garamond",
    fontText: "Spectral",
    tags: ["elegant", "classic", "vegan"]
  },
  {
    name: "LUMEN",
    fontDisplay: "Kaushan Script",
    fontText: "Manrope",
    tags: ["handwritten", "playful", "bakery"]
  },
  {
    name: "COSTA",
    fontDisplay: "Rufina",
    fontText: "Cabin",
    tags: ["classic", "seafood", "tropical"]
  },
  {
    name: "DESIERTO",
    fontDisplay: "Alegreya SC",
    fontText: "IBM Plex Sans",
    tags: ["bold", "mexican", "rustic"]
  },
  {
    name: "VERANO",
    fontDisplay: "Bebas Neue",
    fontText: "Assistant",
    tags: ["bold", "fast-food", "modern"]
  },
  {
    name: "POLAR",
    fontDisplay: "Righteous",
    fontText: "Fira Sans",
    tags: ["bold", "modern", "playful"]
  },
  {
    name: "ALDEA",
    fontDisplay: "Aleo",
    fontText: "Poppins",
    tags: ["warm", "brunch", "bakery", "coffee"]
  },
  {
    name: "LAGO",
    fontDisplay: "Koulen",
    fontText: "Noto Sans",
    tags: ["bold", "asian", "modern"]
  },
  {
    name: "RIO",
    fontDisplay: "Julius Sans One",
    fontText: "Krub",
    tags: ["elegant", "minimal", "modern"]
  },
  {
    name: "VIENNA",
    fontDisplay: "Abril Fatface",
    fontText: "Lora",
    tags: ["elegant", "fine-dining", "wine"]
  },
  {
    name: "ROCKET",
    fontDisplay: "Fredoka",
    fontText: "Nunito",
    tags: ["playful", "ice-cream", "fast-food"]
  },
  {
    name: "SOHO",
    fontDisplay: "Syne",
    fontText: "DM Sans",
    tags: ["modern", "bar", "trendy"]
  },
  {
    name: "NAPA",
    fontDisplay: "Playfair Display SC",
    fontText: "Source Serif 4",
    tags: ["elegant", "wine", "fine-dining"]
  },
  {
    name: "OAXACA",
    fontDisplay: "Archivo Black",
    fontText: "Source Sans 3",
    tags: ["bold", "mexican", "taqueria"]
  },
  {
    name: "LYON",
    fontDisplay: "Fraunces",
    fontText: "Commissioner",
    tags: ["elegant", "bistro"]
  },
  {
    name: "TOKIO",
    fontDisplay: "Noto Serif Display",
    fontText: "Plus Jakarta Sans",
    tags: ["elegant", "asian", "modern"]
  },
  {
    name: "MEMPHIS",
    fontDisplay: "Alfa Slab One",
    fontText: "Bitter",
    tags: ["bold", "bbq", "rustic"]
  }
]

export const colorThemes: ColorTheme[] = [
  {
    id: "DEFAULT",
    name: "Default",
    surfaceColor: "#ffffff",
    brandColor: "#131313",
    accentColor: "#424242",
    textColor: "#131313",
    mutedColor: "#636363",
    scope: "GLOBAL",
    tags: ["neutral", "light", "minimal"]
  },
  {
    id: "TERRA_LIGHT",
    name: "Terra",
    surfaceColor: "#fff8f6",
    brandColor: "#231917",
    accentColor: "#8f4c38",
    textColor: "#231917",
    mutedColor: "#6f5600",
    scope: "GLOBAL",
    tags: ["warm", "light", "earthy", "rustic"]
  },
  {
    id: "TERRA_DARK",
    name: "Terra oscuro",
    surfaceColor: "#271d1b",
    brandColor: "#f1dfda",
    accentColor: "#ffb5a0",
    textColor: "#f1dfda",
    mutedColor: "#f5e1a7",
    scope: "GLOBAL",
    tags: ["warm", "dark", "earthy", "rustic"]
  },
  {
    id: "FLORA_LIGHT",
    name: "Flora",
    surfaceColor: "#f9faef",
    brandColor: "#1a1c16",
    accentColor: "#4c662b",
    textColor: "#1a1c16",
    mutedColor: "#006c65",
    scope: "GLOBAL",
    tags: ["cool", "light", "natural", "vegan"]
  },
  {
    id: "FLORA_DARK",
    name: "Flora oscuro",
    surfaceColor: "#1e201a",
    brandColor: "#e2e3d8",
    accentColor: "#b1d18a",
    textColor: "#e2e3d8",
    mutedColor: "#bcece7",
    scope: "GLOBAL",
    tags: ["cool", "dark", "natural"]
  },
  {
    id: "AZURE_LIGHT",
    name: "Azure",
    surfaceColor: "#f9f9ff",
    brandColor: "#191c20",
    accentColor: "#415f91",
    textColor: "#191c20",
    mutedColor: "#6a327a",
    scope: "GLOBAL",
    tags: ["cool", "light", "elegant", "seafood"]
  },
  {
    id: "AZURE_DARK",
    name: "Azure oscuro",
    surfaceColor: "#1d2024",
    brandColor: "#dedee4",
    accentColor: "#aac7ff",
    textColor: "#dedee4",
    mutedColor: "#fad8fd",
    scope: "GLOBAL",
    tags: ["cool", "dark", "elegant"]
  },
  {
    id: "HELIOS_LIGHT",
    name: "Helios",
    surfaceColor: "#fff9ee",
    brandColor: "#1e1b13",
    accentColor: "#6d5e0f",
    textColor: "#1e1b13",
    mutedColor: "#365944",
    scope: "GLOBAL",
    tags: ["warm", "light", "golden", "brunch"]
  },
  {
    id: "HELIOS_DARK",
    name: "Helios oscuro",
    surfaceColor: "#222017",
    brandColor: "#e8e2d4",
    accentColor: "#dbc66e",
    textColor: "#e8e2d4",
    mutedColor: "#bce3c6",
    scope: "GLOBAL",
    tags: ["warm", "dark", "golden"]
  },
  {
    id: "FUEGO_LIGHT",
    name: "Fuego",
    surfaceColor: "#fffaf5",
    brandColor: "#1a0a00",
    accentColor: "#ff6b00",
    textColor: "#1a0a00",
    mutedColor: "#994d1a",
    scope: "GLOBAL",
    tags: ["warm", "light", "vibrant", "taqueria"]
  },
  {
    id: "FUEGO_DARK",
    name: "Fuego oscuro",
    surfaceColor: "#0d0906",
    brandColor: "#fff5eb",
    accentColor: "#ff8c00",
    textColor: "#fff5eb",
    mutedColor: "#ffb366",
    scope: "GLOBAL",
    tags: ["warm", "dark", "vibrant"]
  },
  {
    id: "CARMESI_LIGHT",
    name: "Carmesí",
    surfaceColor: "#fff5f5",
    brandColor: "#2d0a0a",
    accentColor: "#dc2626",
    textColor: "#2d0a0a",
    mutedColor: "#991b1b",
    scope: "GLOBAL",
    tags: ["warm", "light", "vibrant", "bold"]
  },
  {
    id: "CARMESI_DARK",
    name: "Carmesi oscuro",
    surfaceColor: "#1a0505",
    brandColor: "#fef2f2",
    accentColor: "#ef4444",
    textColor: "#fef2f2",
    mutedColor: "#fca5a5",
    scope: "GLOBAL",
    tags: ["warm", "dark", "vibrant"]
  },
  {
    id: "OCEANO_LIGHT",
    name: "Océano",
    surfaceColor: "#f0fdfa",
    brandColor: "#042f2e",
    accentColor: "#0d9488",
    textColor: "#042f2e",
    mutedColor: "#115e59",
    scope: "GLOBAL",
    tags: ["cool", "light", "fresh", "seafood"]
  },
  {
    id: "OCEANO_DARK",
    name: "Oceano oscuro",
    surfaceColor: "#021716",
    brandColor: "#f0fdfa",
    accentColor: "#2dd4bf",
    textColor: "#f0fdfa",
    mutedColor: "#5eead4",
    scope: "GLOBAL",
    tags: ["cool", "dark", "fresh"]
  },
  {
    id: "NEON_LIGHT",
    name: "Neon",
    surfaceColor: "#fafafa",
    brandColor: "#0a0a0a",
    accentColor: "#a855f7",
    textColor: "#0a0a0a",
    mutedColor: "#7c3aed",
    scope: "GLOBAL",
    tags: ["cool", "light", "vibrant", "modern"]
  },
  {
    id: "NEON_DARK",
    name: "Neon oscuro",
    surfaceColor: "#09090b",
    brandColor: "#fafafa",
    accentColor: "#c084fc",
    textColor: "#fafafa",
    mutedColor: "#e879f9",
    scope: "GLOBAL",
    tags: ["cool", "dark", "vibrant", "bar"]
  },
  {
    id: "ESMERALDA_LIGHT",
    name: "Esmeralda",
    surfaceColor: "#ecfdf5",
    brandColor: "#022c22",
    accentColor: "#059669",
    textColor: "#022c22",
    mutedColor: "#047857",
    scope: "GLOBAL",
    tags: ["cool", "light", "fresh", "natural"]
  },
  {
    id: "ESMERALDA_DARK",
    name: "Esmeralda oscuro",
    surfaceColor: "#021a14",
    brandColor: "#ecfdf5",
    accentColor: "#34d399",
    textColor: "#ecfdf5",
    mutedColor: "#6ee7b7",
    scope: "GLOBAL",
    tags: ["cool", "dark", "fresh"]
  },
  {
    id: "MOSTAZA_LIGHT",
    name: "Mostaza",
    surfaceColor: "#fefce8",
    brandColor: "#1c1a00",
    accentColor: "#ca8a04",
    textColor: "#1c1a00",
    mutedColor: "#a16207",
    scope: "GLOBAL",
    tags: ["warm", "light", "golden", "mexican"]
  },
  {
    id: "MOSTAZA_DARK",
    name: "Mostaza oscuro",
    surfaceColor: "#0f0e00",
    brandColor: "#fefce8",
    accentColor: "#facc15",
    textColor: "#fefce8",
    mutedColor: "#fde047",
    scope: "GLOBAL",
    tags: ["warm", "dark", "golden"]
  },
  {
    id: "RUBI_LIGHT",
    name: "Rubí",
    surfaceColor: "#fff1f2",
    brandColor: "#1f0506",
    accentColor: "#e11d48",
    textColor: "#1f0506",
    mutedColor: "#be123c",
    scope: "GLOBAL",
    tags: ["warm", "light", "vibrant", "wine"]
  },
  {
    id: "RUBI_DARK",
    name: "Rubi oscuro",
    surfaceColor: "#120304",
    brandColor: "#fff1f2",
    accentColor: "#fb7185",
    textColor: "#fff1f2",
    mutedColor: "#fda4af",
    scope: "GLOBAL",
    tags: ["warm", "dark", "vibrant"]
  },
  {
    id: "COBALTO_LIGHT",
    name: "Cobalto",
    surfaceColor: "#eff6ff",
    brandColor: "#0c1929",
    accentColor: "#2563eb",
    textColor: "#0c1929",
    mutedColor: "#1d4ed8",
    scope: "GLOBAL",
    tags: ["cool", "light", "modern", "clean"]
  },
  {
    id: "COBALTO_DARK",
    name: "Cobalto oscuro",
    surfaceColor: "#030712",
    brandColor: "#f8fafc",
    accentColor: "#3b82f6",
    textColor: "#f8fafc",
    mutedColor: "#60a5fa",
    scope: "GLOBAL",
    tags: ["cool", "dark", "modern"]
  },
  {
    id: "CITRICO_LIGHT",
    name: "Cítrico",
    surfaceColor: "#fefffe",
    brandColor: "#132a00",
    accentColor: "#65a30d",
    textColor: "#132a00",
    mutedColor: "#4d7c0f",
    scope: "GLOBAL",
    tags: ["cool", "light", "fresh", "vibrant"]
  },
  {
    id: "CITRICO_DARK",
    name: "Citrico oscuro",
    surfaceColor: "#0a1500",
    brandColor: "#f7fee7",
    accentColor: "#84cc16",
    textColor: "#f7fee7",
    mutedColor: "#a3e635",
    scope: "GLOBAL",
    tags: ["cool", "dark", "fresh"]
  },
  {
    id: "MAGENTA_LIGHT",
    name: "Magenta",
    surfaceColor: "#fdf4ff",
    brandColor: "#270033",
    accentColor: "#d946ef",
    textColor: "#270033",
    mutedColor: "#a21caf",
    scope: "GLOBAL",
    tags: ["warm", "light", "playful", "vibrant"]
  },
  {
    id: "MAGENTA_DARK",
    name: "Magenta oscuro",
    surfaceColor: "#120016",
    brandColor: "#fdf4ff",
    accentColor: "#e879f9",
    textColor: "#fdf4ff",
    mutedColor: "#f0abfc",
    scope: "GLOBAL",
    tags: ["warm", "dark", "playful"]
  },
  {
    id: "CACAO_LIGHT",
    name: "Cacao",
    surfaceColor: "#fdf8f3",
    brandColor: "#2c1810",
    accentColor: "#8b5a3c",
    textColor: "#2c1810",
    mutedColor: "#6b4c3b",
    scope: "GLOBAL",
    tags: ["warm", "light", "earthy", "coffee"]
  },
  {
    id: "CACAO_DARK",
    name: "Cacao oscuro",
    surfaceColor: "#1a110c",
    brandColor: "#f0e4d8",
    accentColor: "#c68b59",
    textColor: "#f0e4d8",
    mutedColor: "#d4a574",
    scope: "GLOBAL",
    tags: ["warm", "dark", "earthy", "coffee"]
  },
  {
    id: "NOIR_LIGHT",
    name: "Noir",
    surfaceColor: "#fafaf8",
    brandColor: "#0a0a0a",
    accentColor: "#b8860b",
    textColor: "#0a0a0a",
    mutedColor: "#6b6b6b",
    scope: "GLOBAL",
    tags: ["neutral", "light", "luxury", "elegant"]
  },
  {
    id: "NOIR_DARK",
    name: "Noir oscuro",
    surfaceColor: "#0a0a0a",
    brandColor: "#f5f5f0",
    accentColor: "#d4a843",
    textColor: "#f5f5f0",
    mutedColor: "#c9b458",
    scope: "GLOBAL",
    tags: ["neutral", "dark", "luxury", "elegant"]
  },
  {
    id: "PASTEL_LIGHT",
    name: "Pastel",
    surfaceColor: "#fef7f5",
    brandColor: "#3d2020",
    accentColor: "#d4848a",
    textColor: "#3d2020",
    mutedColor: "#a66e72",
    scope: "GLOBAL",
    tags: ["warm", "light", "soft", "bakery"]
  },
  {
    id: "PASTEL_DARK",
    name: "Pastel oscuro",
    surfaceColor: "#1f1216",
    brandColor: "#f5e0e4",
    accentColor: "#e8a0a8",
    textColor: "#f5e0e4",
    mutedColor: "#d4b0b8",
    scope: "GLOBAL",
    tags: ["warm", "dark", "soft"]
  },
  {
    id: "CARBON_LIGHT",
    name: "Carbon",
    surfaceColor: "#f7f5f2",
    brandColor: "#1c1917",
    accentColor: "#c2710c",
    textColor: "#1c1917",
    mutedColor: "#78716c",
    scope: "GLOBAL",
    tags: ["warm", "light", "industrial", "modern"]
  },
  {
    id: "CARBON_DARK",
    name: "Carbon oscuro",
    surfaceColor: "#131210",
    brandColor: "#f5f2ed",
    accentColor: "#e09422",
    textColor: "#f5f2ed",
    mutedColor: "#d4a86a",
    scope: "GLOBAL",
    tags: ["warm", "dark", "industrial"]
  },
  {
    id: "OLIVA_LIGHT",
    name: "Oliva",
    surfaceColor: "#f8f6f0",
    brandColor: "#1a2118",
    accentColor: "#5c7a3a",
    textColor: "#1a2118",
    mutedColor: "#7a8a5c",
    scope: "GLOBAL",
    tags: ["warm", "light", "natural", "earthy"]
  },
  {
    id: "OLIVA_DARK",
    name: "Oliva oscuro",
    surfaceColor: "#141a12",
    brandColor: "#ede8dc",
    accentColor: "#9ab060",
    textColor: "#ede8dc",
    mutedColor: "#b8c488",
    scope: "GLOBAL",
    tags: ["warm", "dark", "natural"]
  }
]

export const themePresets: ThemePreset[] = [
  {
    id: "fine-dining",
    name: "Alta Cocina",
    description: "Elegante y refinado para restaurantes de alta cocina",
    fontTheme: "AMSTERDAM",
    colorTheme: "NOIR_LIGHT",
    tags: ["fine-dining", "elegant"]
  },
  {
    id: "coffee-shop",
    name: "Cafetería",
    description: "Cálido y acogedor para cafeterías y coffee shops",
    fontTheme: "ALDEA",
    colorTheme: "CACAO_LIGHT",
    tags: ["coffee", "bakery", "warm"]
  },
  {
    id: "taqueria",
    name: "Taquería",
    description: "Vibrante y audaz para taquerías y antojitos",
    fontTheme: "OAXACA",
    colorTheme: "FUEGO_LIGHT",
    tags: ["taqueria", "mexican", "bold"]
  },
  {
    id: "bbq",
    name: "Parrilla",
    description: "Rústico e industrial para asadores y BBQ",
    fontTheme: "CHICAGO",
    colorTheme: "CARBON_LIGHT",
    tags: ["bbq", "steakhouse", "rustic"]
  },
  {
    id: "bakery",
    name: "Panadería",
    description: "Suave y artesanal para panaderías y pastelerías",
    fontTheme: "FLORENCIA",
    colorTheme: "PASTEL_LIGHT",
    tags: ["bakery", "brunch", "soft"]
  },
  {
    id: "seafood",
    name: "Mariscos",
    description: "Fresco y costero para restaurantes de mariscos",
    fontTheme: "OSLO",
    colorTheme: "OCEANO_LIGHT",
    tags: ["seafood", "fresh", "cool"]
  },
  {
    id: "vegan",
    name: "Orgánico",
    description: "Natural y fresco para restaurantes veganos y orgánicos",
    fontTheme: "BOSQUE",
    colorTheme: "FLORA_LIGHT",
    tags: ["vegan", "natural", "fresh"]
  },
  {
    id: "fast-food",
    name: "Comida Rápida",
    description: "Llamativo y directo para comida rápida",
    fontTheme: "VERANO",
    colorTheme: "CARMESI_LIGHT",
    tags: ["fast-food", "bold", "vibrant"]
  },
  {
    id: "italian",
    name: "Italiano",
    description: "Clásico y cálido para trattorias y restaurantes italianos",
    fontTheme: "ROMA",
    colorTheme: "TERRA_LIGHT",
    tags: ["italian", "classic", "warm"]
  },
  {
    id: "asian",
    name: "Asiático",
    description: "Moderno y sofisticado para restaurantes asiáticos",
    fontTheme: "TOKIO",
    colorTheme: "NOIR_DARK",
    tags: ["asian", "modern", "elegant"]
  },
  {
    id: "bar",
    name: "Bar & Lounge",
    description: "Oscuro y vibrante para bares y lounges",
    fontTheme: "SOHO",
    colorTheme: "NEON_DARK",
    tags: ["bar", "trendy", "dark"]
  },
  {
    id: "brunch",
    name: "Brunch",
    description: "Luminoso y acogedor para brunch y desayunos",
    fontTheme: "SACRAMENTO",
    colorTheme: "HELIOS_LIGHT",
    tags: ["brunch", "warm", "golden"]
  },
  {
    id: "pizzeria",
    name: "Pizzería",
    description: "Divertido y enérgico para pizzerías",
    fontTheme: "MADRID",
    colorTheme: "FUEGO_LIGHT",
    tags: ["pizzeria", "playful", "bold"]
  },
  {
    id: "bistro",
    name: "Bistró",
    description: "Elegante y natural para bistrós franceses",
    fontTheme: "LYON",
    colorTheme: "OLIVA_LIGHT",
    tags: ["bistro", "elegant", "natural"]
  },
  {
    id: "ice-cream",
    name: "Heladería",
    description: "Divertido y colorido para heladerías",
    fontTheme: "ROCKET",
    colorTheme: "MAGENTA_LIGHT",
    tags: ["ice-cream", "playful", "vibrant"]
  },
  {
    id: "steakhouse",
    name: "Steakhouse",
    description: "Oscuro y robusto para steakhouses",
    fontTheme: "ALAMO",
    colorTheme: "CARBON_DARK",
    tags: ["steakhouse", "rustic", "dark"]
  },
  {
    id: "wine-bar",
    name: "Vinoteca",
    description: "Sofisticado y cálido para vinotecas y enotecas",
    fontTheme: "NAPA",
    colorTheme: "RUBI_LIGHT",
    tags: ["wine", "elegant", "warm"]
  },
  {
    id: "modern",
    name: "Moderno",
    description: "Limpio y contemporáneo para restaurantes de autor",
    fontTheme: "NOMADA",
    colorTheme: "COBALTO_LIGHT",
    tags: ["modern", "trendy", "clean"]
  },
  {
    id: "mexican",
    name: "Mexicano",
    description: "Tradicional y cálido para cocina mexicana gourmet",
    fontTheme: "DESIERTO",
    colorTheme: "MOSTAZA_LIGHT",
    tags: ["mexican", "rustic", "warm"]
  },
  {
    id: "tropical",
    name: "Tropical",
    description: "Fresco y vibrante para restaurantes de playa y tropicales",
    fontTheme: "COSTA",
    colorTheme: "ESMERALDA_LIGHT",
    tags: ["tropical", "fresh", "seafood"]
  }
]
