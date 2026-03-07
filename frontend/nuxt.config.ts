// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080',
      github: 'https://github.com/LiquidCats/scrum-poker-web',
    },
  },

  googleFonts: {
    families: {
      'Space Mono': [400, 700],
      'Outfit': [300, 400, 500, 600, 700, 800],
    },
    display: 'swap',
  },

  app: {
    head: {
      title: 'Scrum Poker',
      meta: [
        { name: 'description', content: 'Real-time Scrum Poker for agile teams' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2024-01-01',
})
