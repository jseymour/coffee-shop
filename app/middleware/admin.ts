export default defineNuxtRouteMiddleware(() => {
    const adminCookie = useCookie('admin_session')
    if (adminCookie.value !== 'authenticated') {
        return navigateTo('/login')
    }
})