// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  trailingComma: "none",
  arrowParens: "avoid",
  tabWidth: 2,
  useTabs: false,
  semi: false,
  plugins: [
    "prettier-plugin-tailwindcss",
    "@ianvs/prettier-plugin-sort-imports"
  ],
  importOrder: [
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^@/styles/(.*)$",
    "^[./]"
  ],
  importOrderBuiltinModulesToTop: true,
  importOrderCaseInsensitive: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderMergeDuplicateImports: true,
  importOrderCombineTypeAndValueImports: true,
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}
