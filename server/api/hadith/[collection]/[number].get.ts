/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/hadith/:collection/:number — Fetch specific hadith
 */
export default defineEventHandler(async (event) => {
    const collection = getRouterParam(event, 'collection')
    const number = Number(getRouterParam(event, 'number'))

    if (!collection || isNaN(number)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid collection or number' })
    }

    try {
        const hadith = await getHadithByNumber(collection, number)
        const link = getSunnahLink(collection, number)
        return { ...hadith, sourceLink: link }
    } catch (error: any) {
        throw createError({ statusCode: 404, statusMessage: error.message })
    }
})
