<template>
  <div class="collections-page section">
    <div class="container">
      <div class="text-center" style="margin-bottom:2.5rem">
        <span class="badge badge-primary">📚 Library</span>
        <h1 style="margin-top:0.75rem">
          <span class="text-gradient">Hadith Collections</span>
        </h1>
        <p class="text-secondary" style="margin-top:0.5rem;max-width:500px;margin-left:auto;margin-right:auto">
          Browse 10 authentic collections with over 40,000 hadiths in Arabic and English.
        </p>
      </div>

      <!-- Collections Grid -->
      <div class="grid grid-2">
        <NuxtLink
          v-for="coll in collections"
          :key="coll.id"
          :to="`/collections/${coll.id}`"
          class="collection-item card card-glow animate-fade-up"
        >
          <div class="coll-header">
            <span class="tag tag-hadith">{{ coll.count.toLocaleString() }} hadiths</span>
          </div>
          <h3 class="coll-name">{{ coll.name }}</h3>
          <p class="text-arabic" style="font-size:1.3rem;margin:0.5rem 0">{{ coll.arabicName }}</p>
          <p class="text-muted text-sm">{{ coll.description }}</p>
          <div class="coll-link">
            <span class="text-sm" style="color:var(--color-primary-light)">Browse collection →</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Quran Section -->
      <div class="text-center" style="margin-top:3rem;margin-bottom:2rem">
        <span class="badge badge-primary">📖 Al-Qur'an Al-Kareem</span>
        <h2 style="margin-top:0.75rem">
          <span class="text-gradient">The Glorious Qur'an</span>
        </h2>
        <p class="text-secondary" style="margin-top:0.5rem">114 Surahs — Browse and share Ayaat</p>
      </div>

      <div class="quran-info card card-accent">
        <div class="flex items-center gap-lg" style="flex-wrap:wrap">
          <div style="flex:1;min-width:250px">
            <h3>Explore the Qur'an</h3>
            <p class="text-secondary text-sm" style="margin-top:0.5rem">
              Search for specific Ayaat or get random inspirational verses. Each Ayah includes Arabic text,
              English translation (Sahih International), and a direct link to quran.com.
            </p>
            <div class="flex gap-sm" style="margin-top:1rem;flex-wrap:wrap">
              <button class="btn btn-primary btn-sm" @click="getRandomAyah">
                🎲 Random Ayah
              </button>
              <NuxtLink to="/search" class="btn btn-outline btn-sm">
                🔍 Search
              </NuxtLink>
            </div>
          </div>
          <div class="quran-stats text-center" style="min-width:120px">
            <div class="stat-number text-gradient" style="font-size:2.5rem;font-weight:800">114</div>
            <div class="text-muted text-sm">Surahs</div>
            <div class="stat-number text-gradient" style="font-size:1.5rem;font-weight:700;margin-top:0.5rem">6,236</div>
            <div class="text-muted text-sm">Ayaat</div>
          </div>
        </div>
      </div>

      <!-- Random Ayah Display -->
      <Transition name="page">
        <div v-if="randomAyah" style="margin-top:1.5rem">
          <ContentCard
            type="quran"
            :text="randomAyah.text"
            :arabic-text="randomAyah.arabicText"
            :reference="randomAyah.reference"
            :source-link="randomAyah.sourceLink"
            @share="openShare(randomAyah)"
          />
        </div>
      </Transition>
    </div>

    <!-- Share Modal -->
    <ShareModal
      :show="shareOpen"
      type="quran"
      :text="shareItem?.text || ''"
      :arabic-text="shareItem?.arabicText || ''"
      :reference="shareItem?.reference || ''"
      :source-link="shareItem?.sourceLink || ''"
      @close="shareOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Collections — NoorBit',
  description: 'Browse 10 authentic Hadith collections and the Glorious Qur\'an. Over 40,000 hadiths available.',
})

const collections = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', count: 7563, description: 'The most authentic collection of Hadith, compiled by Imam al-Bukhari.' },
  { id: 'muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', count: 7453, description: 'The second most authentic collection, compiled by Imam Muslim ibn al-Hajjaj.' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', arabicName: 'سنن أبو داود', count: 5274, description: 'A major Sunan collection focusing on legal hadiths, by Imam Abu Dawud.' },
  { id: 'tirmidhi', name: "Jami' at-Tirmidhi", arabicName: 'جامع الترمذي', count: 3956, description: 'Known for grading each hadith, compiled by Imam at-Tirmidhi.' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', count: 4341, description: 'One of the six major collections, compiled by Imam Ibn Majah.' },
  { id: 'nasai', name: "Sunan an-Nasa'i", arabicName: 'سنن النسائي', count: 5758, description: 'Known for its strict criteria, compiled by Imam an-Nasa\'i.' },
  { id: 'malik', name: 'Muwatta Malik', arabicName: 'موطأ مالك', count: 1858, description: 'The earliest written collection, by Imam Malik ibn Anas.' },
  { id: 'nawawi', name: '40 Hadith Nawawi', arabicName: 'الأربعون النووية', count: 42, description: 'Essential hadiths covering the fundamentals of Islam, by Imam an-Nawawi.' },
  { id: 'qudsi', name: '40 Hadith Qudsi', arabicName: 'الأحاديث القدسية', count: 40, description: 'Sacred hadiths where the Prophet ﷺ narrates from Allah.' },
  { id: 'dehlawi', name: '40 Hadith Shah Waliullah', arabicName: 'أربعون حديث الدهلوي', count: 40, description: 'Selected by the great scholar Shah Waliullah ad-Dehlawi.' },
]

const randomAyah = ref<any>(null)
const shareOpen = ref(false)
const shareItem = ref<any>(null)

async function getRandomAyah() {
  try {
    randomAyah.value = await $fetch('/api/quran/random')
  } catch (e) {
    console.error(e)
  }
}

function openShare(item: any) {
  shareItem.value = item
  shareOpen.value = true
}
</script>

<style scoped>
.collection-item {
  text-decoration: none;
  color: var(--color-text);
}

.collection-item:hover .coll-link {
  transform: translateX(4px);
}

.coll-name {
  font-size: 1.15rem;
}

.coll-link {
  margin-top: var(--space-md);
  transition: transform var(--transition-fast);
}
</style>
