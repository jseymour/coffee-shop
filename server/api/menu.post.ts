import {getMenu} from "#server/utils/db.ts";

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'admin_session')
    if (session !== 'authenticated') {
        throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })
    }

    const body = await readBody(event)
    const menu = await getMenu()

    if (body.action === 'add') {
        menu.push({
            id: Date.now().toString(),
            name: body.name,
            description: body.description,
            priceUSD: Number(body.priceUSD),
            stock: Number(body.stock)
        })
    } else if (body.action === 'update') {
        const index = menu.findIndex(item => item.id === body.id)
        if (index !== -1) {
            menu[index] = {
                ...menu[index],
                name: body.name,
                description: body.description,
                priceUSD: Number(body.priceUSD),
                stock: Math.max(0, Number(body.stock))
            }
        }
    } else if (body.action === 'delete') {
        const filtered = menu.filter(item => item.id !== body.id)
        await saveMenu(filtered)
        return filtered
    }

    await saveMenu(menu)
    return menu
})