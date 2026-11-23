// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-11-01',
    modules: ['@pinia/nuxt'],
    runtimeConfig: {
        adminPassword: ''
    }
})
