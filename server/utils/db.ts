export interface CoffeeItem {
    id: string
    name: string
    description: string
    priceUSD: number // Base price stored in USD
    stock: number
}

const DEFAULT_MENU: CoffeeItem[] = [
    { id: '1', name: 'Espresso', description: 'Double shot rich extraction', priceUSD: 3.50, stock: 10 },
    { id: '2', name: 'Oat Milk Cortado', description: 'Equal parts espresso and steamed oat milk', priceUSD: 4.75, stock: 5 },
    { id: '3', name: 'Pour Over', description: 'Single-origin Ethiopian V60', priceUSD: 5.50, stock: 3 },
    { id: '4', name: 'Cold Brew', description: '18-hour steeped concentrate', priceUSD: 4.50, stock: 0 }
]

export async function getMenu(): Promise<CoffeeItem[]> {
    const storage = useStorage('data')
    let menu = await storage.getItem<CoffeeItem[]>('coffee-menu')
    if (!menu) {
        menu = DEFAULT_MENU
        await storage.setItem('coffee-menu', menu)
    }
    return menu
}

export async function saveMenu(menu: CoffeeItem[]): Promise<void> {
    const storage = useStorage('data')
    await storage.setItem('coffee-menu', menu)
}