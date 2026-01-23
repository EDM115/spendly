import type { Language } from "./shared/types/main"

export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "nuxt-svgo",
    "vuetify-nuxt-module",
  ],
  ssr: true,
  devtools: {
    enabled: false,
    timeline: { enabled: false },
  },
  app: {
    pageTransition: {
      name: "page", mode: "out-in",
    },
  },
  css: ["~/assets/styles/main.scss"],
  sourcemap: {
    client: true,
    server: true,
  },
  devServer: {
    port: 8888,
  },
  future: { typescriptBundlerResolution: true },
  experimental: {
    asyncContext: true,
    browserDevtoolsTiming: true,
    buildCache: true,
    clientFallback: true,
    clientNodeCompat: true,
    crossOriginPrefetch: true,
    defaults: { nuxtLink: {
      prefetch: true,
      prefetchOn: {
        interaction: true, visibility: false,
      },
    } },
    entryImportMap: true,
    extractAsyncDataHandlers: true,
    inlineRouteRules: true,
    normalizeComponentNames: true,
    parseErrorData: true,
    sharedPrerenderData: true,
    typedPages: true,
    typescriptPlugin: true,
    viewTransition: true,
    viteEnvironmentApi: true,
  },
  compatibilityDate: "2025-10-15",
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    esbuild: { options: { target: "esnext" } },
    minify: true,
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 2000,
      cssMinify: "lightningcss",
    },
    clearScreen: false,
    css: {
      preprocessorMaxWorkers: true,
    },
  },
  typescript: {
    tsConfig: { compilerOptions: {
      allowArbitraryExtensions: true,
      disableSizeLimit: true,
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      incremental: true,
      noErrorTruncation: true,
      preserveWatchOutput: true,
      removeComments: true,
    } },
    typeCheck: false,
  },
  eslint: { config: {
    autoInit: false,
    standalone: false,
  } },
  fonts: {
    devtools: true,
    families: [
      {
        name: "Inter",
        src: "/fonts/Inter/InterVariable.woff2",
        weight: "100 900",
        style: "normal",
        preload: true,
      },
      {
        name: "Inter",
        src: "/fonts/Inter/InterVariable-Italic.woff2",
        weight: "100 900",
        style: "italic",
        preload: true,
      },
      {
        name: "Fira Code",
        src: "/fonts/Fira_Code/FiraCode-VF.woff2",
        weight: "300 700",
        style: "normal",
        preload: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito/Nunito-VariableFont_wght.ttf",
        weight: "200 1000",
        style: "normal",
        preload: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf",
        weight: "200 1000",
        style: "italic",
        preload: true,
      },
      {
        name: "Twemoji Country Flags",
        src: "/fonts/TwemojiCountryFlags.woff2",
        weight: "400",
        style: "normal",
        preload: true,
      },
    ],
    processCSSVariables: true,
  },
  i18n: {
    baseUrl: "/",
    // oxlint-disable-next-line no-unsafe-type-assertion
    defaultLocale: process.env.DEFAULT_UI_LANG as Language | undefined,
    detectBrowserLanguage: {
      // oxlint-disable-next-line no-unsafe-type-assertion
      fallbackLocale: process.env.DEFAULT_UI_LANG as Language | undefined,
      useCookie: false,
    },
    experimental: { typedOptionsAndMessages: "all" },
    locales: [
      {
        code: "en", name: "English", language: "en-US",
      },
      {
        code: "fr", name: "Français", language: "fr-FR",
      },
    ],
    strategy: "no_prefix",
  },
  image: { quality: 100 },
  svgo: {
    autoImportPath: "./public/images",
    defaultImport: "component",
    dts: true,
    svgoConfig: { multipass: true },
  },
  vuetify: {
    moduleOptions: {
      prefixComposables: true,
      ssrClientHints: {
        reloadOnFirstRequest: true,
        viewportSize: true,
        prefersColorScheme: true,
        prefersColorSchemeOptions: { cookieName: "theme" },
      },
    },
    vuetifyOptions: {
      directives: true,
      labComponents: true,
      locale: {
        fallback: "en",
        locale: "fr",
      },
      localeMessages: [ "en", "fr" ],
      theme: {
        defaultTheme: "dark",
        themes: {
          dark: {
            colors: {
              accent: "#FACC15",
              background: "#051e11",
              error: "#ef4444",
              info: "#3b82f6",
              primary: "#4ADE80",
              secondary: "#2DD4BF",
              success: "#22c55e",
              text: "#f0fdf4",
              warning: "#f59e0b",
            },
            dark: true,
          },
          light: {
            colors: {
              accent: "#ca8a04",
              background: "#faf5ff",
              error: "#dc2626",
              info: "#2563eb",
              primary: "#9A25FA",
              secondary: "#CB2FF7",
              success: "#16a34a",
              text: "#2e1065",
              warning: "#ea580c",
            },
            dark: false,
          },
        },
        variations: {
          colors: [ "accent", "background", "error", "info", "primary", "secondary", "success", "text", "warning" ],
          lighten: 5,
          darken: 5,
        },
      },
    },
  },
})
