/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/quran/random — Fetch a random Quran ayah
 */
export default defineEventHandler(async () => {
    try {
        const ayah = await getRandomAyah()
        const link = getQuranComLink(ayah.surahNumber, ayah.numberInSurah)
        return { ...ayah, sourceLink: link }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
