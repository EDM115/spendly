import type { Language } from "./shared/types/main"

export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vite-pwa/nuxt",
    "@vueuse/nuxt",
    "nuxt-svgo",
    "vuetify-nuxt-module",
  ],
  ssr: true,
  devtools: {
    enabled: true,
    timeline: { enabled: true },
  },
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },
  css: ["~/assets/styles/main.scss"],
  runtimeConfig: {
    "public": {
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
      disabledFeatures: process.env.DISABLED_FEATURES || "",
    },
  },
  sourcemap: {
    client: false,
    server: false,
  },
  devServer: {
    port: 8888,
  },
  future: { typescriptBundlerResolution: true },
  experimental: {
    asyncContext: true,
    buildCache: true,
    checkOutdatedBuildInterval: 1000 * 60 * 60,
    clientFallback: true,
    clientNodeCompat: true,
    crossOriginPrefetch: true,
    defaults: {
      nuxtLink: {
        prefetch: true,
        prefetchOn: {
          interaction: true,
          visibility: false,
        },
      },
    },
    entryImportMap: true,
    extractAsyncDataHandlers: true,
    inlineRouteRules: true,
    normalizeComponentNames: true,
    normalizePageNames: true,
    parseErrorData: true,
    sharedPrerenderData: true,
    typedPages: true,
    typescriptPlugin: true,
    viewTransition: true,
    viteEnvironmentApi: false,
  },
  compatibilityDate: "2026-04-01",
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    minify: true,
    routeRules: {
      "/": {
        headers: {
          "cache-control": "no-cache, no-store, must-revalidate",
        },
      },
      "/manifest.webmanifest": {
        headers: {
          "cache-control": "no-cache, no-store, must-revalidate",
        },
      },
      "/sw.js": {
        headers: {
          "cache-control": "no-cache, no-store, must-revalidate",
        },
      },
    },
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 2500,
      cssMinify: "lightningcss",
      minify: "oxc",
      rolldownOptions: {
        experimental: {
          lazyBarrel: true,
          nativeMagicString: true,
          resolveNewUrlToAsset: true,
        },
        output: {
          comments: false,
          minify: true,
        },
      },
    },
    clearScreen: false,
    optimizeDeps: {
      include: [
        "better-auth/client/plugins",
        "better-auth/vue",
        "canvas-to-svg",
        "chart.js",
        "country-flag-emoji-polyfill",
        "jspdf",
        "vue-chartjs",
        "vue-cloudflare-turnstile",
      ],
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        allowArbitraryExtensions: true,
        disableSizeLimit: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        incremental: true,
        noErrorTruncation: true,
        preserveWatchOutput: true,
        removeComments: true,
      },
    },
    typeCheck: false,
  },
  eslint: {
    config: {
      autoInit: false,
      standalone: false,
    },
  },
  fonts: {
    devtools: true,
    families: [
      {
        name: "Inter",
        src: "/fonts/Inter/InterVariable.woff2",
        weights: ["100 900"],
        style: "normal",
        preload: true,
        global: true,
      },
      {
        name: "Inter",
        src: "/fonts/Inter/InterVariable-Italic.woff2",
        weights: ["100 900"],
        style: "italic",
        preload: true,
        global: true,
      },
      {
        name: "Fira Code",
        src: "/fonts/FiraCode-VF.woff2",
        weights: ["300 700"],
        style: "normal",
        preload: true,
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito/Nunito-VariableFont_wght.woff2",
        weights: ["200 1000"],
        style: "normal",
        preload: true,
        global: true,
      },
      {
        name: "Nunito",
        src: "/fonts/Nunito/Nunito-Italic-VariableFont_wght.woff2",
        weights: ["200 1000"],
        style: "italic",
        preload: true,
        global: true,
      },
      {
        name: "Twemoji Country Flags",
        src: "/fonts/TwemojiCountryFlags.woff2",
        weight: 400,
        style: "normal",
        preload: true,
      },
    ],
    processCSSVariables: true,
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
      npm: false,
    },
  },
  i18n: {
    baseUrl: "/",
    // oxlint-disable-next-line no-unsafe-type-assertion
    defaultLocale: process.env.DEFAULT_UI_LANG as Language | undefined,
    detectBrowserLanguage: {
      cookieKey: "i18n",
      // oxlint-disable-next-line no-unsafe-type-assertion
      fallbackLocale: process.env.DEFAULT_UI_LANG as Language | undefined,
      useCookie: true,
    },
    experimental: { typedOptionsAndMessages: "all" },
    locales: [
      {
        code: "en",
        name: "English",
        language: "en-US",
      },
      {
        code: "fr",
        name: "Français",
        language: "fr-FR",
      },
    ],
    strategy: "no_prefix",
  },
  image: { quality: 100 },
  pwa: {
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    includeAssets: [ "images/logo.webp", "images/logo_alt.webp" ],
    injectRegister: "script-defer",
    manifest: {
      name: "Spendly",
      short_name: "Spendly",
      description: "Simple, powerful, and free budget tracking for everyone",
      theme_color: "#051e11",
      background_color: "#051e11",
      display: "standalone",
      start_url: "/",
      scope: "/",
      lang: "en",
      icons: [
        {
          src: "images/pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "images/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "images/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "images/maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    pwaAssets: {
      image: "public/images/logo.webp",
    },
    registerType: "prompt",
    workbox: {
      globPatterns: ["**/*.{ico,png,svg,webp,woff2,ttf,txt}"],
      navigateFallback: undefined,
      navigateFallbackDenylist: [/^\/api\//],
    },
  },
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
          colors: [
            "accent",
            "background",
            "error",
            "info",
            "primary",
            "secondary",
            "success",
            "text",
            "warning",
          ],
          lighten: 5,
          darken: 5,
        },
      },
    },
  },
})
