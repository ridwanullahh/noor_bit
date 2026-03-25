/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/hadith/random — Fetch a random hadith
 */
export default defineEventHandler(async () => {
    try {
        const hadith = await getRandomHadith()
        const link = getSunnahLink(hadith.collection, Number(hadith.hadithNumber))
        return { ...hadith, sourceLink: link }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
