/**
 * BismiLlah Ar-Rahman Ar-Roheem
 * Quran API Service — alquran.cloud
 */

interface AyahData {
    text: string
    arabicText: string
    surahNumber: number
    surahName: string
    surahNameArabic: string
    ayahNumber: number
    numberInSurah: number
    juz: number
    reference: string
    translation?: string
}

interface SurahInfo {
    number: number
    name: string
    englishName: string
    englishNameTranslation: string
    numberOfAyahs: number
    revelationType: string
}

const QURAN_API = 'https://api.alquran.cloud/v1'

// Get a specific ayah with Arabic + English
export async function getAyah(surah: number, ayah: number): Promise<AyahData> {
    const [araRes, engRes] = await Promise.allSettled([
        fetch(`${QURAN_API}/ayah/${surah}:${ayah}`),
        fetch(`${QURAN_API}/ayah/${surah}:${ayah}/en.sahih`),
    ])

    const araData = araRes.status === 'fulfilled' && araRes.value.ok
        ? await araRes.value.json()
        : null
    const engData = engRes.status === 'fulfilled' && engRes.value.ok
        ? await engRes.value.json()
        : null

    if (!araData && !engData) {
        throw new Error(`Ayah not found: ${surah}:${ayah}`)
    }

    const arAyah = araData?.data
    const enAyah = engData?.data

    return {
        arabicText: arAyah?.text || '',
        text: enAyah?.text || '',
        surahNumber: arAyah?.surah?.number || surah,
        surahName: arAyah?.surah?.englishName || enAyah?.surah?.englishName || '',
        surahNameArabic: arAyah?.surah?.name || '',
        ayahNumber: arAyah?.number || enAyah?.number || 0,
        numberInSurah: arAyah?.numberInSurah || ayah,
        juz: arAyah?.juz || enAyah?.juz || 0,
        reference: `Surah ${arAyah?.surah?.englishName || surah}, Ayah ${ayah}`,
    }
}

// Get random ayah
export async function getRandomAyah(): Promise<AyahData> {
    // Total ayahs in Quran = 6236
    // Pick randomly from well-known surahs for better content
    const popularSurahs = [
        { surah: 2, ayahs: 286 },   // Al-Baqarah
        { surah: 3, ayahs: 200 },   // Aal-Imran
        { surah: 4, ayahs: 176 },   // An-Nisa
        { surah: 5, ayahs: 120 },   // Al-Ma'idah
        { surah: 6, ayahs: 165 },   // Al-An'am
        { surah: 7, ayahs: 206 },   // Al-A'raf
        { surah: 10, ayahs: 109 },  // Yunus
        { surah: 11, ayahs: 123 },  // Hud
        { surah: 12, ayahs: 111 },  // Yusuf
        { surah: 13, ayahs: 43 },   // Ar-Ra'd
        { surah: 14, ayahs: 52 },   // Ibrahim
        { surah: 16, ayahs: 128 },  // An-Nahl
        { surah: 17, ayahs: 111 },  // Al-Isra
        { surah: 18, ayahs: 110 },  // Al-Kahf
        { surah: 19, ayahs: 98 },   // Maryam
        { surah: 20, ayahs: 135 },  // Taha
        { surah: 21, ayahs: 112 },  // Al-Anbiya
        { surah: 23, ayahs: 118 },  // Al-Mu'minun
        { surah: 24, ayahs: 64 },   // An-Nur
        { surah: 25, ayahs: 77 },   // Al-Furqan
        { surah: 28, ayahs: 88 },   // Al-Qasas
        { surah: 29, ayahs: 69 },   // Al-Ankabut
        { surah: 30, ayahs: 60 },   // Ar-Rum
        { surah: 31, ayahs: 34 },   // Luqman
        { surah: 33, ayahs: 73 },   // Al-Ahzab
        { surah: 35, ayahs: 45 },   // Fatir
        { surah: 36, ayahs: 83 },   // Ya-Sin
        { surah: 39, ayahs: 75 },   // Az-Zumar
        { surah: 40, ayahs: 85 },   // Ghafir
        { surah: 41, ayahs: 54 },   // Fussilat
        { surah: 42, ayahs: 53 },   // Ash-Shura
        { surah: 49, ayahs: 18 },   // Al-Hujurat
        { surah: 51, ayahs: 60 },   // Adh-Dhariyat
        { surah: 55, ayahs: 78 },   // Ar-Rahman
        { surah: 56, ayahs: 96 },   // Al-Waqi'ah
        { surah: 57, ayahs: 29 },   // Al-Hadid
        { surah: 59, ayahs: 24 },   // Al-Hashr
        { surah: 67, ayahs: 30 },   // Al-Mulk
        { surah: 73, ayahs: 20 },   // Al-Muzzammil
        { surah: 87, ayahs: 19 },   // Al-A'la
        { surah: 91, ayahs: 15 },   // Ash-Shams
        { surah: 93, ayahs: 11 },   // Ad-Duha
        { surah: 94, ayahs: 8 },    // Ash-Sharh
        { surah: 112, ayahs: 4 },   // Al-Ikhlas
        { surah: 113, ayahs: 5 },   // Al-Falaq
        { surah: 114, ayahs: 6 },   // An-Nas
    ]

    const pick = popularSurahs[Math.floor(Math.random() * popularSurahs.length)]
    const ayahNum = Math.floor(Math.random() * pick.ayahs) + 1

    return await getAyah(pick.surah, ayahNum)
}

// Get all surahs metadata
export async function getSurahs(): Promise<SurahInfo[]> {
    const res = await fetch(`${QURAN_API}/surah`)
    if (!res.ok) throw new Error('Failed to fetch surahs')
    const data = await res.json()
    return data.data
}

// Get a full surah with translation
export async function getSurah(number: number): Promise<{ info: SurahInfo; ayahs: AyahData[] }> {
    const [araRes, engRes] = await Promise.allSettled([
        fetch(`${QURAN_API}/surah/${number}`),
        fetch(`${QURAN_API}/surah/${number}/en.sahih`),
    ])

    const araData = araRes.status === 'fulfilled' && araRes.value.ok ? await araRes.value.json() : null
    const engData = engRes.status === 'fulfilled' && engRes.value.ok ? await engRes.value.json() : null

    if (!araData && !engData) throw new Error(`Surah not found: ${number}`)

    const source = araData || engData
    const info: SurahInfo = {
        number: source.data.number,
        name: source.data.name,
        englishName: source.data.englishName,
        englishNameTranslation: source.data.englishNameTranslation,
        numberOfAyahs: source.data.numberOfAyahs,
        revelationType: source.data.revelationType,
    }

    const araAyahs = araData?.data?.ayahs || []
    const engAyahs = engData?.data?.ayahs || []

    const ayahs: AyahData[] = araAyahs.map((a: any, i: number) => ({
        arabicText: a.text || '',
        text: engAyahs[i]?.text || '',
        surahNumber: number,
        surahName: info.englishName,
        surahNameArabic: info.name,
        ayahNumber: a.number,
        numberInSurah: a.numberInSurah,
        juz: a.juz,
        reference: `Surah ${info.englishName}, Ayah ${a.numberInSurah}`,
    }))

    return { info, ayahs }
}

// Generate quran.com link
export function getQuranComLink(surah: number, ayah: number): string {
    return `https://quran.com/${surah}/${ayah}`
}
