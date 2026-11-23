import {getMenu, saveMenu} from "#server/utils/db.ts";

export default defineEventHandler(async (event) => {
    const { cart } = await readBody<{ cart: Record<string, number> }>(event)
    const menu = await getMenu()

    // Final server-side guard against race conditions
    for (const [itemId, qty] of Object.entries(cart)) {
        const item = menu.find(m => m.id === itemId)
        if (!item || item.stock < qty) {
            throw createError({
                statusCode: 409,
                statusMessage: `Insufficient inventory for ${item?.name || 'item'}`
            })
        }
    }

    // Deduct stock
    for (const [itemId, qty] of Object.entries(cart)) {
        const item = menu.find(m => m.id === itemId)
        if (item) {
            item.stock -= qty
        }
    }

    await saveMenu(menu)
    return { success: true, menu }
})