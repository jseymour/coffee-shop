import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '@': fileURLToPath(new URL('./app', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
            '@@': fileURLToPath(new URL('./', import.meta.url))
        }
    },
    test: {
        environment: 'nuxt',
        globals: true
    }
})