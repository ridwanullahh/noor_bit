/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/content/daily — Get daily Quran ayah + Hadith combo
 */
export default defineEventHandler(async () => {
    // Use the day of year as seed for consistent daily content
    const now = new Date()
    const dayOfYear = Math.floor(
        (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    )

    try {
        const [hadith, ayah] = await Promise.allSettled([
            getRandomHadith(),
            getRandomAyah(),
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
