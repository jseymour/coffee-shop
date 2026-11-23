import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as db from '~~/server/utils/db'
import authHandler from '~~/server/api/auth.post'
import menuPostHandler from '~~/server/api/menu.post'
import orderPostHandler from '~~/server/api/order.post'

// Stub Nitro/H3 auto-imported globals
const readBodyMock = vi.fn()
const getCookieMock = vi.fn()
const setCookieMock = vi.fn()
const useRuntimeConfigMock = vi.fn()

vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('readBody', readBodyMock)
vi.stubGlobal('getCookie', getCookieMock)
vi.stubGlobal('setCookie', setCookieMock)
vi.stubGlobal('useRuntimeConfig', useRuntimeConfigMock)
vi.stubGlobal('createError', (err: any) => {
    const error = new Error(err.statusMessage) as any
    error.statusCode = err.statusCode
    error.statusMessage = err.statusMessage
    return error
})

describe('Nitro Server API Handlers', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('POST /api/auth', () => {
        it('sets admin_session cookie when password matches NUXT_ADMIN_PASSWORD', async () => {
            useRuntimeConfigMock.mockReturnValue({ adminPassword: 'secret-pass' })
            readBodyMock.mockResolvedValue({ password: 'secret-pass' })

            const res = await authHandler({} as any)

            expect(res).toEqual({ authenticated: true })
            expect(setCookieMock).toHaveBeenCalledWith(
                expect.anything(),
                'admin_session',
                'authenticated',
                expect.objectContaining({ path: '/' })
            )
        })

        it('throws 401 when password is invalid', async () => {
            useRuntimeConfigMock.mockReturnValue({ adminPassword: 'secret-pass' })
            readBodyMock.mockResolvedValue({ password: 'wrong' })

            await expect(authHandler({} as any)).rejects.toMatchObject({ statusCode: 401 })
        })
    })

    describe('POST /api/menu', () => {
        it('blocks non-admin requests with 403', async () => {
            getCookieMock.mockReturnValue(undefined)

            await expect(menuPostHandler({} as any)).rejects.toMatchObject({ statusCode: 403 })
        })

        it('updates item price and stock when authenticated as admin', async () => {
            getCookieMock.mockReturnValue('authenticated')
            const mockMenu = [
                { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.5, stock: 10 }
            ]
            vi.spyOn(db, 'getMenu').mockResolvedValue(mockMenu)
            const saveSpy = vi.spyOn(db, 'saveMenu').mockResolvedValue()

            readBodyMock.mockResolvedValue({
                action: 'update',
                id: '1',
                name: 'Espresso',
                description: 'Double Shot',
                priceUSD: 4.25,
                stock: 15
            })

            const result = await menuPostHandler({} as any)

            expect(result[0].priceUSD).toBe(4.25)
            expect(result[0].stock).toBe(15)
            expect(saveSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('POST /api/order', () => {
        it('deducts purchased quantities from server inventory', async () => {
            const mockMenu = [
                { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.5, stock: 5 }
            ]
            vi.spyOn(db, 'getMenu').mockResolvedValue(mockMenu)
            const saveSpy = vi.spyOn(db, 'saveMenu').mockResolvedValue()
            readBodyMock.mockResolvedValue({ cart: { '1': 2 } })

            const res = await orderPostHandler({} as any)

            expect(res.success).toBe(true)
            expect(res.menu[0].stock).toBe(3)
            expect(saveSpy).toHaveBeenCalledTimes(1)
        })

        it('rejects order with 409 Conflict if requested quantity exceeds stock', async () => {
            const mockMenu = [
                { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.5, stock: 1 }
            ]
            vi.spyOn(db, 'getMenu').mockResolvedValue(mockMenu)
            const saveSpy = vi.spyOn(db, 'saveMenu').mockResolvedValue()
            readBodyMock.mockResolvedValue({ cart: { '1': 3 } })

            await expect(orderPostHandler({} as any)).rejects.toMatchObject({ statusCode: 409 })
            expect(saveSpy).not.toHaveBeenCalled()
        })
    })
})