<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-pattern"></div>
      </div>
      <div class="container">
        <div class="hero-content animate-fade-up">
          <span class="badge badge-accent" style="margin-bottom:1rem">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          <h1 class="hero-title">
            Daily Light from the<br>
            <span class="text-gradient">Qur'an & Sunnah</span>
          </h1>
          <p class="hero-subtitle">
            NoorBit auto-shares authentic Ayaat and Hadith to your social platforms,
            spreading the light of Islam — every 15 minutes.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/collections" class="btn btn-primary btn-lg">
              📚 Browse Collections
            </NuxtLink>
            <NuxtLink to="/subscribe" class="btn btn-outline btn-lg">
              📬 Subscribe
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Daily Content Section -->
    <section class="section daily-section">
      <div class="container container-sm">
        <div class="text-center" style="margin-bottom:2rem">
          <span class="badge badge-primary">✦ Today's Light ✦</span>
          <h2 style="margin-top:0.75rem">Daily Qur'an & Hadith</h2>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner" style="margin:2rem auto"></div>
          <p class="text-muted text-center">Fetching today's light...</p>
        </div>

        <div v-else class="daily-cards">
          <!-- Quran Ayah -->
          <ContentCard
            v-if="dailyAyah"
            type="quran"
            :text="dailyAyah.text"
            :arabic-text="dailyAyah.arabicText"
            :reference="dailyAyah.reference"
            :source-link="dailyAyah.sourceLink"
            @share="openShare('quran', dailyAyah)"
            @image="openImage('quran', dailyAyah)"
            class="animate-fade-up delay-1"
          />

          <div class="divider-ornament" style="margin:1.5rem 0">
            <span class="ornament-star">✦ ✦ ✦</span>
          </div>

          <!-- Hadith -->
          <ContentCard
            v-if="dailyHadith"
            type="hadith"
            :text="dailyHadith.text"
            :arabic-text="dailyHadith.arabicText"
            :reference="dailyHadith.reference"
            :source-link="dailyHadith.sourceLink"
            :grade="dailyHadith.grade"
            @share="openShare('hadith', dailyHadith)"
            @image="openImage('hadith', dailyHadith)"
            class="animate-fade-up delay-2"
          />
        </div>

        <div class="text-center" style="margin-top:1.5rem">
          <button class="btn btn-outline" @click="refreshDaily" :disabled="loading">
            🔄 Get New Content
          </button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section features-section">
      <div class="container">
        <div class="text-center" style="margin-bottom:2.5rem">
          <h2>How <span class="text-gradient">NoorBit</span> Works</h2>
          <p class="text-secondary" style="margin-top:0.5rem;max-width:560px;margin-left:auto;margin-right:auto">
            Simple yet powerful. Configure once, share light forever.
          </p>
        </div>

        <div class="grid grid-3">
          <div class="card card-glow animate-fade-up delay-1">
            <div class="feature-icon">⚙️</div>
            <h3 class="feature-title">Configure Platforms</h3>
            <p class="text-secondary text-sm">
              Connect your social platform handles — Twitter, Telegram, Facebook, WhatsApp channels & more.
            </p>
          </div>

          <div class="card card-glow animate-fade-up delay-2">
            <div class="feature-icon">⏱️</div>
            <h3 class="feature-title">Set Interval</h3>
            <p class="text-secondary text-sm">
              Choose how often to post — every 15 minutes, 30 mins, hourly, or custom. NoorBit handles the rest.
            </p>
          </div>

          <div class="card card-glow animate-fade-up delay-3">
            <div class="feature-icon">🚀</div>
            <h3 class="feature-title">Auto-Share</h3>
            <p class="text-secondary text-sm">
              Qur'an Ayaat & authentic Hadith are auto-posted with Arabic, translation, source links & beautiful images.
            </p>
          </div>

          <div class="card card-glow animate-fade-up delay-1">
            <div class="feature-icon">🖼️</div>
            <h3 class="feature-title">Smart Images</h3>
            <p class="text-secondary text-sm">
              For character-limited platforms, content becomes beautiful shareable images with Islamic geometric designs.
            </p>
          </div>

          <div class="card card-glow animate-fade-up delay-2">
            <div class="feature-icon">🔗</div>
            <h3 class="feature-title">Auto Hyperlinks</h3>
            <p class="text-secondary text-sm">
              Every post includes dynamic links to sunnah.com & quran.com so readers can explore the full source.
            </p>
          </div>

          <div class="card card-glow animate-fade-up delay-3">
            <div class="feature-icon">📬</div>
            <h3 class="feature-title">User Subscriptions</h3>
            <p class="text-secondary text-sm">
              Users can subscribe to receive daily Qur'an & Hadith directly in their inbox or preferred platform.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Collections Preview -->
    <section class="section" style="background:var(--color-bg-alt)">
      <div class="container">
        <div class="text-center" style="margin-bottom:2rem">
          <h2>Hadith Collections</h2>
          <p class="text-secondary" style="margin-top:0.5rem">10 authentic collections, 40,000+ hadiths</p>
        </div>

        <div class="grid grid-4">
          <NuxtLink
            v-for="coll in collections"
            :key="coll.id"
            :to="`/collections/${coll.id}`"
            class="collection-card card card-glow"
          >
            <span class="tag tag-hadith" style="margin-bottom:0.5rem">{{ coll.count.toLocaleString() }} hadiths</span>
            <h4>{{ coll.name }}</h4>
            <p class="text-arabic" style="font-size:1.1rem;margin-top:0.25rem">{{ coll.arabicName }}</p>
          </NuxtLink>
        </div>

        <div class="text-center" style="margin-top:1.5rem">
          <NuxtLink to="/collections" class="btn btn-primary">
            View All Collections →
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section">
      <div class="container container-sm text-center">
        <h2 style="margin-bottom:0.5rem">Start Sharing <span class="text-gradient">Noor</span> Today</h2>
        <p class="text-secondary" style="margin-bottom:1.5rem;max-width:420px;margin-left:auto;margin-right:auto">
          Set up your platforms and let NoorBit spread the light of the Qur'an and Sunnah automatically.
        </p>
        <div class="flex items-center justify-center gap-md" style="flex-wrap:wrap">
          <NuxtLink to="/dashboard" class="btn btn-primary btn-lg">⚙️ Go to Dashboard</NuxtLink>
          <NuxtLink to="/subscribe" class="btn btn-accent btn-lg">📬 Subscribe</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Share Modal -->
    <ShareModal
      :show="shareModalOpen"
      :type="shareData.type"
      :text="shareData.text"
      :arabic-text="shareData.arabicText"
      :reference="shareData.reference"
      :source-link="shareData.sourceLink"
      @close="shareModalOpen = false"
    />

    <!-- Image Generator -->
    <ImageGenerator
      :show="imageModalOpen"
      :type="imageData.type"
      :text="imageData.text"
      :arabic-text="imageData.arabicText"
      :reference="imageData.reference"
      :source-link="imageData.sourceLink"
      @close="imageModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'NoorBit — Qur\'an & Hadith Daily Light',
  description: 'Auto-sharing Qur\'an Ayaat and authentic Hadith to social platforms. Receive daily light from the Qur\'an and Sunnah.',
})

const loading = ref(true)
const dailyHadith = ref<any>(null)
const dailyAyah = ref<any>(null)
const shareModalOpen = ref(false)
const imageModalOpen = ref(false)
const shareData = ref({ type: 'hadith' as 'hadith' | 'quran', text: '', arabicText: '', reference: '', sourceLink: '' })
const imageData = ref({ type: 'hadith' as 'hadith' | 'quran', text: '', arabicText: '', reference: '', sourceLink: '' })

const collections = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', count: 7563 },
  { id: 'muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', count: 7453 },
  { id: 'abudawud', name: 'Sunan Abu Dawud', arabicName: 'سنن أبو داود', count: 5274 },
  { id: 'tirmidhi', name: "Jami' at-Tirmidhi", arabicName: 'جامع الترمذي', count: 3956 },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', count: 4341 },
  { id: 'nasai', name: "Sunan an-Nasa'i", arabicName: 'سنن النسائي', count: 5758 },
  { id: 'nawawi', name: '40 Hadith Nawawi', arabicName: 'الأربعون النووية', count: 42 },
  { id: 'qudsi', name: '40 Hadith Qudsi', arabicName: 'الأحاديث القدسية', count: 40 },
]

async function fetchDaily() {
  loading.value = true
  try {
    const data = await $fetch('/api/content/daily')
    dailyHadith.value = data.hadith
    dailyAyah.value = data.ayah
  } catch (e) {
    console.error('Failed to fetch daily content:', e)
  } finally {
    loading.value = false
  }
}

async function refreshDaily() {
  // Force a new random fetch
  loading.value = true
  try {
    const [hadith, ayah] = await Promise.allSettled([
      $fetch('/api/hadith/random'),
      $fetch('/api/quran/random'),
    ])
    if (hadith.status === 'fulfilled') dailyHadith.value = hadith.value
    if (ayah.status === 'fulfilled') dailyAyah.value = ayah.value
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openShare(type: 'hadith' | 'quran', data: any) {
  shareData.value = {
    type,
    text: data.text || '',
    arabicText: data.arabicText || '',
    reference: data.reference || '',
    sourceLink: data.sourceLink || '',
  }
  shareModalOpen.value = true
}

function openImage(type: 'hadith' | 'quran', data: any) {
  imageData.value = {
    type,
    text: data.text || '',
    arabicText: data.arabicText || '',
    reference: data.reference || '',
    sourceLink: data.sourceLink || '',
  }
  imageModalOpen.value = true
}

onMounted(fetchDaily)
</script>

<style scoped>
/* Hero */
.hero {
  position: relative;
  padding: var(--space-4xl) 0;
  overflow: hidden;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, #065f46 100%);
  z-index: 0;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.07;
  background-image:
    radial-gradient(circle at 25% 25%, var(--color-accent) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, var(--color-accent) 1px, transparent 1px);
  background-size: 50px 50px;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
}

.hero-title {
  color: #fff;
  font-size: clamp(2.2rem, 5.5vw, 3.8rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1rem;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  max-width: 520px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.hero .btn-outline {
  border-color: rgba(255,255,255,0.3);
  color: #fff;
}

.hero .btn-outline:hover {
  border-color: #fff;
  background: rgba(255,255,255,0.1);
}

/* Daily Section */
.daily-section {
  background: var(--color-bg);
}

/* Features */
.features-section {
  background: var(--color-bg);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
}

.feature-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

/* Collections */
.collection-card {
  text-decoration: none;
  color: var(--color-text);
}

.collection-card h4 {
  font-size: 0.95rem;
}

/* CTA */
.cta-section {
  background: linear-gradient(135deg, var(--color-bg-alt), var(--color-surface));
}

.loading-state {
  padding: var(--space-2xl) 0;
}
</style>
