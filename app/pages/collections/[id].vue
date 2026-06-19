<template>
  <div class="collection-detail section">
    <div class="container container-sm">
      <!-- Header -->
      <div class="text-center" style="margin-bottom:2rem">
        <NuxtLink to="/collections" class="btn btn-ghost btn-sm" style="margin-bottom:0.75rem">
          ← Back to Collections
        </NuxtLink>
        <span class="tag tag-hadith">{{ collectionMeta?.count?.toLocaleString() }} hadiths</span>
        <h1 style="margin-top:0.5rem">{{ collectionMeta?.name }}</h1>
        <p class="text-arabic" style="font-size:1.5rem;text-align:center;direction:rtl">{{ collectionMeta?.arabicName }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center" style="padding:3rem 0">
        <div class="spinner" style="margin:0 auto 1rem"></div>
        <p class="text-muted">Loading hadiths...</p>
      </div>

      <!-- Hadiths List -->
      <div v-else>
        <div class="hadiths-list">
          <ContentCard
            v-for="h in hadiths"
            :key="h.hadithNumber"
            type="hadith"
            :text="h.text"
            :arabic-text="h.arabicText"
            :reference="h.reference"
            :source-link="h.sourceLink"
            :grade="h.grade"
            compact
            @share="openShare(h)"
            @image="openImage(h)"
            class="animate-fade-up"
          />
        </div>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination">
          <button
            class="btn btn-outline btn-sm"
            :disabled="page === 0"
            @click="page--; fetchHadiths()"
          >
            ← Previous
          </button>
          <span class="text-muted text-sm">
            Page {{ page + 1 }} of {{ Math.ceil(total / pageSize) }}
          </span>
          <button
            class="btn btn-outline btn-sm"
            :disabled="(page + 1) * pageSize >= total"
            @click="page++; fetchHadiths()"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal
      :show="shareOpen"
      type="hadith"
      :text="shareItem?.text || ''"
      :arabic-text="shareItem?.arabicText || ''"
      :reference="shareItem?.reference || ''"
      :source-link="shareItem?.sourceLink || ''"
      @close="shareOpen = false"
    />

    <!-- Image Generator -->
    <ImageGenerator
      :show="imageOpen"
      type="hadith"
      :text="imageItem?.text || ''"
      :arabic-text="imageItem?.arabicText || ''"
      :reference="imageItem?.reference || ''"
      :source-link="imageItem?.sourceLink || ''"
      @close="imageOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const collId = route.params.id as string

const COLLECTIONS_MAP: Record<string, { name: string; arabicName: string; count: number }> = {
  bukhari: { name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', count: 7563 },
  muslim: { name: 'Sahih Muslim', arabicName: 'صحيح مسلم', count: 7453 },
  abudawud: { name: 'Sunan Abu Dawud', arabicName: 'سنن أبو داود', count: 5274 },
  tirmidhi: { name: "Jami' at-Tirmidhi", arabicName: 'جامع الترمذي', count: 3956 },
  ibnmajah: { name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', count: 4341 },
  nasai: { name: "Sunan an-Nasa'i", arabicName: 'سنن النسائي', count: 5758 },
  malik: { name: 'Muwatta Malik', arabicName: 'موطأ مالك', count: 1858 },
  nawawi: { name: '40 Hadith Nawawi', arabicName: 'الأربعون النووية', count: 42 },
  qudsi: { name: '40 Hadith Qudsi', arabicName: 'الأحاديث القدسية', count: 40 },
  dehlawi: { name: '40 Hadith Shah Waliullah', arabicName: 'أربعون حديث الدهلوي', count: 40 },
}

const collectionMeta = computed(() => COLLECTIONS_MAP[collId])

useSeoMeta({
  title: `${collectionMeta.value?.name || collId} — NoorBit`,
  description: `Browse hadiths from ${collectionMeta.value?.name || collId}`,
})

const loading = ref(true)
const hadiths = ref<any[]>([])
const total = ref(0)
const page = ref(0)
const pageSize = 20
const shareOpen = ref(false)
const shareItem = ref<any>(null)
const imageOpen = ref(false)
const imageItem = ref<any>(null)

async function fetchHadiths() {
  loading.value = true
  try {
    // Fetch individual hadiths since the collection endpoint returns all
    const promises = []
    const start = page.value * pageSize + 1
    const end = Math.min(start + pageSize - 1, collectionMeta.value?.count || pageSize)

    for (let i = start; i <= end; i++) {
      promises.push(
        $fetch(`/api/hadith/${collId}/${i}`).catch(() => null)
      )
    }

    const results = await Promise.all(promises)
    hadiths.value = results.filter(Boolean)
    total.value = collectionMeta.value?.count || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openShare(item: any) {
  shareItem.value = item
  shareOpen.value = true
}

function openImage(item: any) {
  imageItem.value = { ...item, type: 'hadith' }
  imageOpen.value = true
}

onMounted(fetchHadiths)
</script>

<style scoped>
.hadiths-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-top: var(--space-2xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}
</style>
