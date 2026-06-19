/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/content/daily — Get daily Quran ayah + Hadith combo (deterministic per day)
 */
export default defineEventHandler(async () => {
    const now = new Date()
    const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    )
    const yearSeed = now.getFullYear() * 1000 + dayOfYear

    try {
        const [hadith, ayah] = await Promise.allSettled([
            getSeededRandomHadith(yearSeed),
            getSeededRandomAyah(yearSeed),
        ])

        return {
            date: now.toISOString().split('T')[0],
            dayOfYear,
            hadith: hadith.status === 'fulfilled'
                ? { ...hadith.value, sourceLink: getSunnahLink(hadith.value.collection, Number(hadith.value.hadithNumber)) }
                : null,
            ayah: ayah.status === 'fulfilled'
                ? { ...ayah.value, sourceLink: getQuranComLink(ayah.value.surahNumber, ayah.value.numberInSurah) }
                : null,
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
