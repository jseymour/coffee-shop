export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const config = useRuntimeConfig(event)

    if (!config.adminPassword) {
        throw createError({
            statusCode: 500,
            statusMessage: 'NUXT_ADMIN_PASSWORD is not configured on the server'
        })
    }

    if (body.password === config.adminPassword) {
        setCookie(event, 'admin_session', 'authenticated', {
            httpOnly: false,
            maxAge: 60 * 60 * 4,
            path: '/'
        })
        return { authenticated: true }
    }

    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
})