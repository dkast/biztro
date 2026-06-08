const MENU_TEXT_LOCALE = "es-MX"

const MENU_LOWERCASE_WORDS = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "e",
  "el",
  "en",
  "la",
  "las",
  "los",
  "o",
  "para",
  "por",
  "sin",
  "u",
  "un",
  "una",
  "unas",
  "unos",
  "y"
])

const MENU_UPPERCASE_TOKENS = new Set([
  "bbq",
  "ipa",
  "mx",
  "mxn",
  "qr",
  "usa",
  "usd",
  "wifi",
  "xl",
  "xxl",
  "xxxl"
])

const MENU_LOWERCASE_TOKENS = new Set([
  "cl",
  "cm",
  "g",
  "gr",
  "kg",
  "l",
  "lt",
  "lts",
  "ml",
  "mm",
  "oz",
  "pz",
  "pza",
  "pzas"
])

function capitalizeMenuWord(value: string) {
  const [firstCharacter = "", ...rest] = value

  return `${firstCharacter.toLocaleUpperCase(MENU_TEXT_LOCALE)}${rest.join("")}`
}

export function collapseMenuTextWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function shouldNormalizeMenuLabelCasing(value: string) {
  const normalizedValue = collapseMenuTextWhitespace(value)
  const letters = normalizedValue.match(/\p{L}/gu) ?? []

  if (letters.length === 0) {
    return false
  }

  const lowercaseLetters = normalizedValue.match(/\p{Ll}/gu) ?? []
  const uppercaseLetters = normalizedValue.match(/\p{Lu}/gu) ?? []

  return (
    lowercaseLetters.length === 0 &&
    uppercaseLetters.length >= Math.max(1, Math.ceil(letters.length * 0.6))
  )
}

function normalizeMenuLabelWord(word: string, wordIndex: number) {
  const lowercasedWord = word.toLocaleLowerCase(MENU_TEXT_LOCALE)

  if (MENU_UPPERCASE_TOKENS.has(lowercasedWord)) {
    return lowercasedWord.toLocaleUpperCase(MENU_TEXT_LOCALE)
  }

  if (MENU_LOWERCASE_TOKENS.has(lowercasedWord) || /^\d/.test(lowercasedWord)) {
    return lowercasedWord
  }

  if (wordIndex > 0 && MENU_LOWERCASE_WORDS.has(lowercasedWord)) {
    return lowercasedWord
  }

  if (lowercasedWord.startsWith("mc") && lowercasedWord.length > 2) {
    return `Mc${capitalizeMenuWord(lowercasedWord.slice(2))}`
  }

  if (lowercasedWord.includes("'")) {
    return lowercasedWord
      .split("'")
      .map(segment => capitalizeMenuWord(segment))
      .join("'")
  }

  return capitalizeMenuWord(lowercasedWord)
}

export function normalizeMenuLabelCasing(value: string) {
  const normalizedValue = collapseMenuTextWhitespace(value)

  if (!shouldNormalizeMenuLabelCasing(normalizedValue)) {
    return normalizedValue
  }

  let wordIndex = 0

  return normalizedValue
    .split(/(\s+|[-/()&,.:]+)/)
    .map(token => {
      if (!token || !/\p{L}/u.test(token)) {
        return token
      }

      const normalizedToken = normalizeMenuLabelWord(token, wordIndex)
      wordIndex += 1
      return normalizedToken
    })
    .join("")
}

export function normalizeMenuDescriptionText(value: string) {
  const normalizedValue = collapseMenuTextWhitespace(value)

  if (!shouldNormalizeMenuLabelCasing(normalizedValue)) {
    return normalizedValue
  }

  return capitalizeMenuWord(normalizedValue.toLocaleLowerCase(MENU_TEXT_LOCALE))
}
