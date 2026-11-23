import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShopStore } from '~/stores/shop'

describe('useShopStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.restoreAllMocks()
    })

    it('spawns a single customer with a valid currency and positive budget', () => {
        const store = useShopStore()
        store.nextCustomer()

        expect(store.customerCounter).toBe(1)
        expect(store.currentCustomer).not.toBeNull()
        expect(store.currentCustomer!.budget).toBeGreaterThan(0)
        expect(store.cart).toEqual({})
    })

    it('localizes menu prices accurately including zero-decimal JPY', () => {
        const store = useShopStore()
        store.menu = [
            { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.5, stock: 5 }
        ]
        store.currentCustomer = {
            id: 1,
            currency: { code: 'JPY', symbol: '¥', rateFromUSD: 154.0 },
            budget: 2000
        }

        expect(store.localizedMenu[0].localPrice).toBe(539)
    })

    it('prevents overselling beyond available stock on the client', () => {
        const store = useShopStore()
        store.menu = [
            { id: '1', name: 'Pour Over', description: 'V60', priceUSD: 5.0, stock: 2 }
        ]
        store.currentCustomer = {
            id: 1,
            currency: { code: 'USD', symbol: '$', rateFromUSD: 1.0 },
            budget: 50
        }

        store.addToCart('1')
        store.addToCart('1')
        store.addToCart('1') // Exceeds stock of 2

        expect(store.cart['1']).toBe(2)
        expect(store.statusMessage).toContain('only 2 in stock')
    })

    it('prevents adding items that exceed remaining customer budget', () => {
        const store = useShopStore()
        store.menu = [
            { id: '1', name: 'Cortado', description: 'Oat', priceUSD: 4.5, stock: 10 }
        ]
        store.currentCustomer = {
            id: 1,
            currency: { code: 'USD', symbol: '$', rateFromUSD: 1.0 },
            budget: 6.0
        }

        store.addToCart('1') // Remaining: $1.50
        store.addToCart('1') // Blocked: $4.50 > $1.50

        expect(store.cart['1']).toBe(1)
        expect(store.remainingBudget).toBe(1.5)
        expect(store.statusMessage).toContain('Insufficient budget')
    })

    it('advances to the next customer when leaving without buying', () => {
        const store = useShopStore()
        store.menu = [
            { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.0, stock: 5 }
        ]
        store.nextCustomer()
        store.addToCart('1')

        store.leaveWithoutBuying()

        expect(store.customerCounter).toBe(2)
        expect(store.currentCustomer!.id).toBe(2)
        expect(store.cart).toEqual({})
        expect(store.statusMessage).toContain('Customer #1 browsed and left without buying')
    })

    it('submits checkout, updates inventory from response, and advances customer', async () => {
        const store = useShopStore()
        store.menu = [
            { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.0, stock: 5 }
        ]
        store.currentCustomer = {
            id: 1,
            currency: { code: 'USD', symbol: '$', rateFromUSD: 1.0 },
            budget: 10
        }
        store.customerCounter = 1
        store.addToCart('1')

        const updatedMenu = [
            { id: '1', name: 'Espresso', description: 'Shot', priceUSD: 3.0, stock: 4 }
        ]
        vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ success: true, menu: updatedMenu }))

        await store.checkout()

        expect(store.menu[0].stock).toBe(4)
        expect(store.customerCounter).toBe(2)
        expect(store.cart).toEqual({})
    })
})