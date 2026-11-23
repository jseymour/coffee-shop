import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import adminMiddleware from '~/middleware/admin'

const { useCookieMock, navigateToMock } = vi.hoisted(() => ({
    useCookieMock: vi.fn(),
    navigateToMock: vi.fn()
}))

mockNuxtImport('useCookie', () => useCookieMock)
mockNuxtImport('navigateTo', () => navigateToMock)

describe('admin route middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('redirects unauthenticated customers to /login', () => {
        useCookieMock.mockReturnValue({ value: null })

        adminMiddleware({} as any, {} as any)

        expect(navigateToMock).toHaveBeenCalledWith('/login')
    })

    it('allows access when admin_session cookie is authenticated', () => {
        useCookieMock.mockReturnValue({ value: 'authenticated' })

        const result = adminMiddleware({} as any, {} as any)

        expect(navigateToMock).not.toHaveBeenCalled()
        expect(result).toBeUndefined()
    })
})