// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/icon',
  ],

  app: {
    head: {
      title: 'NoorBit — Qur\'an & Hadith Daily Light',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'en' },
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap',
        },
      ],
      meta: [
        { name: 'description', content: 'NoorBit auto-shares Qur\'an Ayaat and authentic Hadith to social platforms. Receive daily light from the Qur\'an and Sunnah.' },
        { name: 'theme-color', content: '#064e3b' },
        { property: 'og:title', content: 'NoorBit — Qur\'an & Hadith Daily Light' },
        { property: 'og:description', content: 'Auto-sharing Qur\'an Ayaat and authentic Hadith to social platforms at configurable intervals.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': { cors: true },
  },
})
