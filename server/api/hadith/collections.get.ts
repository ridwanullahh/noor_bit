/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * GET /api/hadith/collections — List all hadith collections
 */
export default defineEventHandler(() => {
    return getCollections()
})
