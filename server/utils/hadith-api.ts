/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * Hadith API Service — Multi-API fallback
 */

interface HadithData {
    text: string
    arabicText?: string
    collection: string
    collectionName: string
    hadithNumber: number | string
    bookNumber?: number | string
    chapterName?: string
    reference?: string
    grade?: string
}

interface HadithSection {
    hapitre?: string
    name?: string
    hadiths: Array<{
        hadithnumber: number
        text: string
        grades?: Array<{ name: string; grade: string }>
    }>
}

interface HadithEdition {
    metadata: {
        name: string
        book: string
        language: string
        direction: string
    }
    hadiths: Array<{
        hadithnumber: number
        text: string
        grades?: Array<{ name: string; grade: string }>
    }>
}

// Collection metadata
const COLLECTIONS = [
    { id: 'bukhari', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', count: 7563 },
    { id: 'muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', count: 7453 },
    { id: 'abudawud', name: 'Sunan Abu Dawud', arabicName: 'سنن أبو داود', count: 5274 },
    { id: 'tirmidhi', name: 'Jami at-Tirmidhi', arabicName: 'جامع الترمذي', count: 3956 },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', count: 4341 },
    { id: 'nasai', name: 'Sunan an-Nasa\'i', arabicName: 'سنن النسائي', count: 5758 },
    { id: 'malik', name: 'Muwatta Malik', arabicName: 'موطأ مالك', count: 1858 },
    { id: 'nawawi', name: '40 Hadith Nawawi', arabicName: 'الأربعون النووية', count: 42 },
    { id: 'qudsi', name: '40 Hadith Qudsi', arabicName: 'الأحاديث القدسية', count: 40 },
    { id: 'dehlawi', name: '40 Hadith Shah Waliullah', arabicName: 'أربعون حديث الدهلوي', count: 40 },
]

// API endpoints with fallback
const API_ENDPOINTS = {
    primary: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1',
    fallback: 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1',
    secondary: 'https://hadithapi.pages.dev/api',
}

// Helper: fetch with fallback
async function fetchWithFallback(path: string): Promise<any> {
    // Try primary CDN
    try {
        const res = await fetch(`${API_ENDPOINTS.primary}${path}`)
        if (res.ok) return await res.json()
    } catch (e) { /* try fallback */ }

    // Try GitHub raw fallback
    try {
        const res = await fetch(`${API_ENDPOINTS.fallback}${path}`)
        if (res.ok) return await res.json()
    } catch (e) { /* try secondary */ }

    throw new Error(`Failed to fetch hadith data: ${path}`)
}

// Get all collections
export function getCollections() {
    return COLLECTIONS
}

// Get hadith from a specific collection by number
export async function getHadithByNumber(collection: string, number: number): Promise<HadithData> {
    // Fetch English + Arabic in parallel
    const [engData, araData] = await Promise.allSettled([
        fetchWithFallback(`/editions/eng-${collection}/${number}.json`),
        fetchWithFallback(`/editions/ara-${collection}/${number}.json`),
    ])

    const engHadith = engData.status === 'fulfilled' ? engData.value : null
    const araHadith = araData.status === 'fulfilled' ? araData.value : null

    if (!engHadith && !araHadith) {
        throw new Error(`Hadith not found: ${collection} #${number}`)
    }

    const collMeta = COLLECTIONS.find(c => c.id === collection)

    return {
        text: engHadith?.hadiths?.[0]?.text || engHadith?.text || '',
        arabicText: araHadith?.hadiths?.[0]?.text || araHadith?.text || '',
        collection: collection,
        collectionName: collMeta?.name || collection,
        hadithNumber: number,
        grade: engHadith?.hadiths?.[0]?.grades?.[0]?.grade || '',
        reference: `${collMeta?.name || collection} ${number}`,
    }
}

// Get random hadith
export async function getRandomHadith(): Promise<HadithData> {
    // Pick a random collection and random number
    const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)]
    const number = Math.floor(Math.random() * collection.count) + 1

    try {
        return await getHadithByNumber(collection.id, number)
    } catch {
        // Fallback: try secondary API
        try {
            const collections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'ibnmajah']
            const coll = collections[Math.floor(Math.random() * collections.length)]
            const num = Math.floor(Math.random() * 100) + 1
            const res = await fetch(`${API_ENDPOINTS.secondary}/${coll}/${num}`)
            if (res.ok) {
                const data = await res.json()
                return {
                    text: data.hadith_english || data.text || '',
                    arabicText: data.hadith_arabic || data.hadith || '',
                    collection: coll,
                    collectionName: COLLECTIONS.find(c => c.id === coll)?.name || coll,
                    hadithNumber: num,
                    reference: `${COLLECTIONS.find(c => c.id === coll)?.name || coll} ${num}`,
                }
            }
        } catch { /* final attempt */ }

        // Final fallback: Nawawi (small collection, high reliability)
        const nawNum = Math.floor(Math.random() * 42) + 1
        return await getHadithByNumber('nawawi', nawNum)
    }
}

// Get a batch of hadiths from a collection
export async function getCollectionHadiths(collection: string, limit = 20, offset = 0): Promise<{ hadiths: HadithData[]; total: number }> {
    const collMeta = COLLECTIONS.find(c => c.id === collection)
    if (!collMeta) throw new Error(`Unknown collection: ${collection}`)

    const data = await fetchWithFallback(`/editions/eng-${collection}.min.json`)

    const hadiths: HadithData[] = []
    const allHadiths = data.hadiths || []
    const sliced = allHadiths.slice(offset, offset + limit)

    for (const h of sliced) {
        hadiths.push({
            text: h.text || '',
            collection: collection,
            collectionName: collMeta.name,
            hadithNumber: h.hadithnumber,
            reference: `${collMeta.name} ${h.hadithnumber}`,
            grade: h.grades?.[0]?.grade || '',
        })
    }

    return { hadiths, total: allHadiths.length }
}

// Generate sunnah.com link for a hadith
export function getSunnahLink(collection: string, number: number): string {
    const sunnahMap: Record<string, string> = {
        bukhari: 'bukhari',
        muslim: 'muslim',
        abudawud: 'abudawud',
        tirmidhi: 'tirmidhi',
        ibnmajah: 'ibnmajah',
        nasai: 'nasai',
        malik: 'malik',
        nawawi: 'nawawi40',
        qudsi: 'qudsi40',
    }
    const key = sunnahMap[collection] || collection
    return `https://sunnah.com/${key}/${number}`
}
