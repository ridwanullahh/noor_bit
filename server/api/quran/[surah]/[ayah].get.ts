/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/quran/:surah/:ayah — Fetch specific ayah
 */
export default defineEventHandler(async (event) => {
    const surah = Number(getRouterParam(event, 'surah'))
    const ayah = Number(getRouterParam(event, 'ayah'))

    if (isNaN(surah) || isNaN(ayah)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid surah or ayah number' })
    }

    try {
        const data = await getAyah(surah, ayah)
        const link = getQuranComLink(surah, ayah)
        return { ...data, sourceLink: link }
    } catch (error: any) {
        throw createError({ statusCode: 404, statusMessage: error.message })
    }
})
