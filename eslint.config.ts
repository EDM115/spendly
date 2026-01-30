import { withNuxt } from "./.nuxt/eslint.config.mjs"

import stylistic from "@stylistic/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
// @ts-expect-error no types declarations
import drizzle from "eslint-plugin-drizzle"
import pluginVue from "eslint-plugin-vue"
import globals from "globals"
import vueParser from "vue-eslint-parser"

export default withNuxt(
  { ignores: [ "**/.nuxt/", "**/.output/", "**/dist/", "**/node_modules/" ] },
  ...pluginVue.configs["flat/recommended"],
  // @ts-expect-error ESLint Stylistic plugin type mismatch
  {
    files: ["**/*.{js,ts,vue}"],
    linterOptions: { reportUnusedDisableDirectives: false },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
        parser: tsParser,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@stylistic": stylistic,
      drizzle,
    },
    rules: {
      ...drizzle.configs.recommended.rules,
      "nuxt/nuxt-config-keys-order": "warn",
      "vue/multi-word-component-names": "off",
      "vue/no-mutating-props": "off",
    },
  },
)
