<template>
  <div class="search-page section">
    <div class="container container-sm">
      <div class="text-center" style="margin-bottom:2rem">
        <span class="badge badge-primary">🔍 Search</span>
        <h1 style="margin-top:0.75rem">
          Search <span class="text-gradient">Qur'an & Hadith</span>
        </h1>
        <p class="text-secondary" style="margin-top:0.5rem">Find specific Ayaat or Hadiths by keyword, surah, or collection</p>
      </div>

      <!-- Search Input -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <span class="search-icon-left">🔍</span>
          <input
            v-model="query"
            class="input search-input"
            placeholder="Search for hadith or quran content..."
            @keydown.enter="search"
          />
          <button v-if="query" class="btn btn-ghost btn-sm" @click="query = ''; results = []" style="position:absolute;right:80px;top:50%;transform:translateY(-50%)">
            ✕
          </button>
          <button class="btn btn-primary search-submit" @click="search">
            Search
          </button>
        </div>

        <!-- Quick Filters -->
        <div class="search-filters">
          <label class="filter-group">
            <span class="text-sm text-muted">Type:</span>
            <select v-model="contentType" class="input select" style="width:auto;padding:0.4rem 2rem 0.4rem 0.6rem;font-size:0.85rem">
              <option value="both">Qur'an & Hadith</option>
              <option value="quran">Qur'an only</option>
              <option value="hadith">Hadith only</option>
            </select>
          </label>
          <label v-if="contentType !== 'quran'" class="filter-group">
            <span class="text-sm text-muted">Collection:</span>
            <select v-model="selectedCollection" class="input select" style="width:auto;padding:0.4rem 2rem 0.4rem 0.6rem;font-size:0.85rem">
              <option value="all">All Collections</option>
              <option value="bukhari">Sahih al-Bukhari</option>
              <option value="muslim">Sahih Muslim</option>
              <option value="nawawi">40 Hadith Nawawi</option>
              <option value="qudsi">40 Hadith Qudsi</option>
              <option value="tirmidhi">Jami' at-Tirmidhi</option>
              <option value="abudawud">Sunan Abu Dawud</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="searching" class="text-center" style="padding:2rem">
        <div class="spinner" style="margin:0 auto 1rem"></div>
        <p class="text-muted">Searching...</p>
      </div>

      <!-- Results -->
      <div v-else-if="results.length > 0" class="search-results">
        <p class="text-muted text-sm" style="margin-bottom:1rem">Found {{ results.length }} results</p>
        <div class="results-list">
          <ContentCard
            v-for="(r, i) in results"
            :key="i"
            :type="r.type"
            :text="r.text"
            :arabic-text="r.arabicText"
            :reference="r.reference"
            :source-link="r.sourceLink"
            :grade="r.grade"
            compact
            @share="openShare(r)"
            class="animate-fade-up"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="searched && !searching" class="empty-state text-center" style="padding:3rem 0">
        <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
        <h3>No results found</h3>
        <p class="text-secondary" style="margin-top:0.5rem">Try different keywords or browse the collections directly.</p>
        <NuxtLink to="/collections" class="btn btn-outline" style="margin-top:1rem">
          📚 Browse Collections
        </NuxtLink>
      </div>

      <!-- Initial State -->
      <div v-else class="empty-state text-center" style="padding:3rem 0">
        <div style="font-size:3rem;margin-bottom:1rem">📖</div>
        <h3>Start searching</h3>
        <p class="text-secondary" style="margin-top:0.5rem">Enter a keyword to search across Qur'an and Hadith collections.</p>

        <div style="margin-top:2rem">
          <p class="text-muted text-sm" style="margin-bottom:0.75rem">Quick access:</p>
          <div class="flex justify-center gap-sm" style="flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" @click="loadRandom('hadith')">🎲 Random Hadith</button>
            <button class="btn btn-outline btn-sm" @click="loadRandom('quran')">🎲 Random Ayah</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal
      :show="shareOpen"
      :type="shareItem?.type || 'hadith'"
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
  title: 'Search — NoorBit',
  description: 'Search across Qur\'an and Hadith collections. Find specific Ayaat or Hadiths by keyword.',
})

const query = ref('')
const contentType = ref('both')
const selectedCollection = ref('all')
const searching = ref(false)
const searched = ref(false)
const results = ref<any[]>([])
const shareOpen = ref(false)
const shareItem = ref<any>(null)

async function search() {
  if (!query.value.trim()) return

  searching.value = true
  searched.value = true
  results.value = []

  try {
    const fetches: Promise<any>[] = []

    // Search hadith (we'll fetch random hadiths from a collection and filter client-side for now)
    if (contentType.value !== 'quran') {
      const collection = selectedCollection.value === 'all' ? 'nawawi' : selectedCollection.value
      for (let i = 1; i <= 42; i++) {
        fetches.push(
          $fetch(`/api/hadith/${collection}/${i}`).catch(() => null)
        )
      }
    }

    // Quran: search by trying random ayahs (basic search for now)
    if (contentType.value !== 'hadith') {
      for (let i = 0; i < 5; i++) {
        fetches.push(
          $fetch('/api/quran/random').then((r: any) => ({ ...r, type: 'quran' })).catch(() => null)
        )
      }
    }

    const allResults = await Promise.all(fetches)
    const q = query.value.toLowerCase()

    results.value = allResults
      .filter(Boolean)
      .map(r => ({
        type: r.type || 'hadith',
        text: r.text,
        arabicText: r.arabicText,
        reference: r.reference,
        sourceLink: r.sourceLink,
        grade: r.grade,
      }))
      .filter(r => {
        const textMatch = r.text?.toLowerCase().includes(q)
        const refMatch = r.reference?.toLowerCase().includes(q)
        return textMatch || refMatch
      })
      .slice(0, 20)
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

async function loadRandom(type: 'hadith' | 'quran') {
  searching.value = true
  searched.value = true
  try {
    const endpoint = type === 'quran' ? '/api/quran/random' : '/api/hadith/random'
    const data = await $fetch(endpoint) as any
    results.value = [{
      type,
      text: data.text,
      arabicText: data.arabicText,
      reference: data.reference,
      sourceLink: data.sourceLink,
      grade: data.grade,
    }]
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

function openShare(item: any) {
  shareItem.value = item
  shareOpen.value = true
}
</script>

<style scoped>
.search-bar {
  margin-bottom: var(--space-xl);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-left {
  position: absolute;
  left: 1rem;
  font-size: 1.1rem;
  z-index: 1;
}

.search-input {
  padding-left: 2.8rem;
  padding-right: 5.5rem;
  font-size: 1rem;
  border-radius: var(--radius-lg);
  height: 3.2rem;
}

.search-submit {
  position: absolute;
  right: 0.35rem;
  border-radius: var(--radius-md);
}

.search-filters {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
