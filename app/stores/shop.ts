import { defineStore } from 'pinia'
import type { CoffeeItem } from '~~/server/utils/db'

interface CurrencyConfig {
    code: string
    symbol: string
    rateFromUSD: number
}

const CURRENCIES: CurrencyConfig[] = [
    { code: 'USD', symbol: '$', rateFromUSD: 1.0 },
    { code: 'EUR', symbol: '€', rateFromUSD: 0.92 },
    { code: 'GBP', symbol: '£', rateFromUSD: 0.79 },
    { code: 'JPY', symbol: '¥', rateFromUSD: 154.0 },
    { code: 'CAD', symbol: 'CA$', rateFromUSD: 1.39 }
]

export interface Customer {
    id: number
    currency: CurrencyConfig
    budget: number
}

export const useShopStore = defineStore('shop', {
    state: () => ({
        menu: [] as CoffeeItem[],
        cart: {} as Record<string, number>,
        customerCounter: 0,
        currentCustomer: null as Customer | null,
        statusMessage: ''
    }),

    getters: {
        // Convert USD menu price to current customer's currency
        localizedMenu: (state) => {
            const rate = state.currentCustomer?.currency.rateFromUSD ?? 1
            return state.menu.map(item => ({
                ...item,
                localPrice: Number((item.priceUSD * rate).toFixed(state.currentCustomer?.currency.code === 'JPY' ? 0 : 2))
            }))
        },

        // Calculate cart total in customer's currency
        cartTotal(): number {
            const decimals = this.currentCustomer?.currency.code === 'JPY' ? 0 : 2
            const total = this.localizedMenu.reduce((sum, item) => {
                const qty = this.cart[item.id] || 0
                return sum + item.localPrice * qty
            }, 0)
            return Number(total.toFixed(decimals))
        },

        remainingBudget(): number {
            if (!this.currentCustomer) return 0
            const decimals = this.currentCustomer.currency.code === 'JPY' ? 0 : 2
            return Number((this.currentCustomer.budget - this.cartTotal).toFixed(decimals))
        }
    },

    actions: {
        async fetchMenu() {
            this.menu = await $fetch<CoffeeItem[]>('/api/menu')
        },

        // Spawn a single customer with a random currency and random budget ($2 to $25 USD equivalent)
        nextCustomer(reason = '') {
            this.customerCounter++
            this.cart = {}
            const currency = CURRENCIES[Math.floor(Math.random() * CURRENCIES.length)]
            const usdBaseBudget = Math.random() * 23 + 2 // Between $2.00 and $25.00 USD
            const decimals = currency.code === 'JPY' ? 0 : 2
            const budget = Number((usdBaseBudget * currency.rateFromUSD).toFixed(decimals))

            this.currentCustomer = {
                id: this.customerCounter,
                currency,
                budget
            }
            this.statusMessage = reason
                ? `${reason} Customer #${this.customerCounter} has entered the shop.`
                : `Customer #${this.customerCounter} has entered the shop.`
        },

        // Client-side state validation prevents overselling or exceeding budget
        addToCart(itemId: string) {
            if (!this.currentCustomer) return
            const item = this.localizedMenu.find(i => i.id === itemId)
            if (!item) return

            const currentQtyInCart = this.cart[itemId] || 0

            if (currentQtyInCart >= item.stock) {
                this.statusMessage = `Cannot add more ${item.name}: only ${item.stock} in stock.`
                return
            }

            if (item.localPrice > this.remainingBudget) {
                this.statusMessage = `Insufficient budget for ${item.name}.`
                return
            }

            this.cart[itemId] = currentQtyInCart + 1
            this.statusMessage = ''
        },

        removeFromCart(itemId: string) {
            if (!this.cart[itemId]) return
            if (this.cart[itemId] === 1) {
                delete this.cart[itemId]
            } else {
                this.cart[itemId]--
            }
            this.statusMessage = ''
        },

        leaveWithoutBuying() {
            const prevId = this.currentCustomer?.id
            this.nextCustomer(`Customer #${prevId} browsed and left without buying.`)
        },

        async checkout() {
            if (Object.keys(this.cart).length === 0) return

            try {
                const res = await $fetch<{ success: boolean; menu: CoffeeItem[] }>('/api/order', {
                    method: 'POST',
                    body: { cart: this.cart }
                })
                this.menu = res.menu
                const prevId = this.currentCustomer?.id
                this.nextCustomer(`Customer #${prevId} completed their order!`)
            } catch (err: any) {
                this.statusMessage = err?.data?.statusMessage || 'Checkout failed.'
                await this.fetchMenu()
            }
        }
    }
})