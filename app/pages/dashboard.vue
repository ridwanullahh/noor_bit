<template>
  <div class="dashboard-page section">
    <div class="container">
      <div style="margin-bottom:2rem">
        <span class="badge badge-accent">⚙️ Admin</span>
        <h1 style="margin-top:0.5rem">
          <span class="text-gradient">Dashboard</span>
        </h1>
        <p class="text-secondary">Configure auto-posting, manage platforms, and monitor sharing activity.</p>
      </div>

      <div class="dashboard-grid">
        <!-- Scheduler Config -->
        <div class="card">
          <h3 style="margin-bottom:1rem;font-size:1.1rem">⏱️ Auto-Post Scheduler</h3>

          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Status</label>
            <div class="flex items-center gap-sm">
              <button
                class="toggle-btn"
                :class="{ active: scheduler.enabled }"
                @click="scheduler.enabled = !scheduler.enabled"
              >
                <span class="toggle-knob"></span>
              </button>
              <span :class="scheduler.enabled ? 'text-gradient' : 'text-muted'" style="font-weight:600;font-size:0.9rem">
                {{ scheduler.enabled ? 'Active' : 'Paused' }}
              </span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Posting Interval</label>
            <select v-model="scheduler.interval" class="input select">
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
              <option value="120">Every 2 hours</option>
              <option value="360">Every 6 hours</option>
              <option value="720">Every 12 hours</option>
              <option value="1440">Once daily</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Content Mix</label>
            <select v-model="scheduler.contentMix" class="input select">
              <option value="alternate">Alternate Qur'an & Hadith</option>
              <option value="quran-only">Qur'an only</option>
              <option value="hadith-only">Hadith only</option>
              <option value="random">Random mix</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:1rem">
            <label class="form-label">Include Image</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="scheduler.includeImage" />
                <span>Auto-generate shareable image for each post</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Active Collections</label>
            <div class="checkbox-group">
              <label v-for="coll in allCollections" :key="coll.id" class="checkbox-label">
                <input type="checkbox" :value="coll.id" v-model="scheduler.collections" />
                <span>{{ coll.name }}</span>
              </label>
            </div>
          </div>

          <button class="btn btn-primary" style="margin-top:1rem;width:100%" @click="saveScheduler">
            💾 Save Configuration
          </button>
        </div>

        <!-- Platform Configuration -->
        <div class="card">
          <h3 style="margin-bottom:1rem;font-size:1.1rem">📱 Connected Platforms</h3>
          <p class="text-muted text-sm" style="margin-bottom:1rem">Configure your social platform handles for auto-posting.</p>

          <div class="platforms-list">
            <div v-for="platform in platforms" :key="platform.id" class="platform-item">
              <div class="platform-header">
                <span class="platform-icon">{{ platform.icon }}</span>
                <span class="platform-name">{{ platform.name }}</span>
                <button
                  class="toggle-btn toggle-sm"
                  :class="{ active: platform.enabled }"
                  @click="platform.enabled = !platform.enabled"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>
              <Transition name="page">
                <div v-if="platform.enabled" class="platform-config">
                  <input
                    v-model="platform.handle"
                    class="input"
                    :placeholder="platform.placeholder"
                    style="font-size:0.85rem"
                  />
                  <input
                    v-if="platform.hasApiKey"
                    v-model="platform.apiKey"
                    class="input"
                    type="password"
                    placeholder="API Key / Bot Token"
                    style="font-size:0.85rem;margin-top:0.4rem"
                  />
                </div>
              </Transition>
            </div>
          </div>

          <button class="btn btn-primary" style="margin-top:1rem;width:100%" @click="savePlatforms">
            💾 Save Platforms
          </button>
        </div>

        <!-- Posting History -->
        <div class="card" style="grid-column: 1 / -1">
          <div class="flex items-center justify-between" style="margin-bottom:1rem">
            <h3 style="font-size:1.1rem">📋 Recent Activity</h3>
            <button class="btn btn-outline btn-sm" @click="testPost">
              🧪 Test Post
            </button>
          </div>

          <div v-if="postingHistory.length === 0" class="text-center" style="padding:2rem 0">
            <div style="font-size:2rem;margin-bottom:0.5rem">📭</div>
            <p class="text-muted">No posting activity yet. Enable the scheduler to start auto-posting.</p>
          </div>

          <div v-else class="history-list">
            <div v-for="post in postingHistory" :key="post.id" class="history-item">
              <div class="history-meta">
                <span :class="post.type === 'quran' ? 'tag tag-quran' : 'tag tag-hadith'">
                  {{ post.type === 'quran' ? '📖 Quran' : '📜 Hadith' }}
                </span>
                <span class="text-muted text-xs">{{ formatTime(post.timestamp) }}</span>
              </div>
              <p class="text-sm" style="margin-top:0.4rem">{{ truncate(post.text, 120) }}</p>
              <div class="history-platforms">
                <span v-for="p in post.platforms" :key="p" class="badge badge-primary" style="margin-right:0.25rem">{{ p }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="card">
          <h3 style="margin-bottom:1rem;font-size:1.1rem">📊 Stats</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value text-gradient">{{ stats.totalPosts }}</div>
              <div class="text-muted text-xs">Total Posts</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-gradient">{{ stats.quranPosts }}</div>
              <div class="text-muted text-xs">Qur'an Ayaat</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-gradient">{{ stats.hadithPosts }}</div>
              <div class="text-muted text-xs">Hadith Posts</div>
            </div>
            <div class="stat-item">
              <div class="stat-value text-gradient">{{ stats.subscribers }}</div>
              <div class="text-muted text-xs">Subscribers</div>
            </div>
          </div>
        </div>

        <!-- Quick Preview -->
        <div class="card">
          <h3 style="margin-bottom:1rem;font-size:1.1rem">👁️ Next Post Preview</h3>
          <div v-if="previewLoading" class="text-center" style="padding:1rem">
            <div class="spinner" style="margin:0 auto"></div>
          </div>
          <div v-else-if="preview">
            <ContentCard
              :type="preview.type"
              :text="preview.text"
              :arabic-text="preview.arabicText"
              :reference="preview.reference"
              :source-link="preview.sourceLink"
              compact
              @share="() => {}"
              @image="openPreviewImage"
            />
          </div>
          <button class="btn btn-outline btn-sm" style="margin-top:0.75rem;width:100%" @click="loadPreview">
            🔄 Refresh Preview
          </button>
        </div>
      </div>

      <!-- Save Indicator -->
      <Transition name="page">
        <div v-if="saved" class="toast-container">
          <div class="toast" style="border-left:3px solid var(--color-success)">
            ✅ Configuration saved!
          </div>
        </div>
      </Transition>

      <!-- Image Generator -->
      <ImageGenerator
        :show="imageOpen"
        :type="imageItem?.type || 'hadith'"
        :text="imageItem?.text || ''"
        :arabic-text="imageItem?.arabicText || ''"
        :reference="imageItem?.reference || ''"
        :source-link="imageItem?.sourceLink || ''"
        @close="imageOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard — NoorBit',
  description: 'Configure auto-posting, manage social platforms, and monitor NoorBit activity.',
})

const saved = ref(false)
const previewLoading = ref(false)
const preview = ref<any>(null)
const imageOpen = ref(false)
const imageItem = ref<any>(null)

function openPreviewImage() {
  if (!preview.value) return
  imageItem.value = preview.value
  imageOpen.value = true
}

const scheduler = reactive({
  enabled: false,
  interval: '15',
  contentMix: 'alternate',
  includeImage: true,
  collections: ['bukhari', 'muslim', 'nawawi', 'qudsi'],
})

const allCollections = [
  { id: 'bukhari', name: 'Sahih al-Bukhari' },
  { id: 'muslim', name: 'Sahih Muslim' },
  { id: 'nawawi', name: '40 Hadith Nawawi' },
  { id: 'qudsi', name: '40 Hadith Qudsi' },
  { id: 'tirmidhi', name: "Jami' at-Tirmidhi" },
  { id: 'abudawud', name: 'Sunan Abu Dawud' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah' },
  { id: 'nasai', name: "Sunan an-Nasa'i" },
  { id: 'malik', name: 'Muwatta Malik' },
]

const platforms = reactive([
  { id: 'twitter', name: 'Twitter / X', icon: '𝕏', enabled: false, handle: '', apiKey: '', hasApiKey: true, placeholder: '@yourhandle' },
  { id: 'telegram', name: 'Telegram Channel', icon: '✈️', enabled: false, handle: '', apiKey: '', hasApiKey: true, placeholder: '@yourchannel' },
  { id: 'whatsapp', name: 'WhatsApp Channel', icon: '💬', enabled: false, handle: '', apiKey: '', hasApiKey: false, placeholder: 'Channel ID or link' },
  { id: 'facebook', name: 'Facebook Page', icon: '📘', enabled: false, handle: '', apiKey: '', hasApiKey: true, placeholder: 'Page name or ID' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', enabled: false, handle: '', apiKey: '', hasApiKey: true, placeholder: 'Profile or company page' },
  { id: 'reddit', name: 'Reddit', icon: '🔼', enabled: false, handle: '', apiKey: '', hasApiKey: false, placeholder: 'r/subreddit' },
])

const postingHistory = reactive<any[]>([])

const stats = reactive({
  totalPosts: 0,
  quranPosts: 0,
  hadithPosts: 0,
  subscribers: 0,
})

function truncate(str: string, len: number): string {
  return str?.length > len ? str.slice(0, len) + '...' : str || ''
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString()
}

function showSaved() {
  saved.value = true
  setTimeout(() => (saved.value = false), 2500)
}

function saveScheduler() {
  localStorage.setItem('noorbit-scheduler', JSON.stringify(toRaw(scheduler)))
  showSaved()
}

function savePlatforms() {
  localStorage.setItem('noorbit-platforms', JSON.stringify(toRaw(platforms)))
  showSaved()
}

async function testPost() {
  try {
    const type = Math.random() > 0.5 ? 'quran' : 'hadith'
    const endpoint = type === 'quran' ? '/api/quran/random' : '/api/hadith/random'
    const data = await $fetch(endpoint) as any

    const enabledPlatforms = platforms.filter(p => p.enabled).map(p => p.name)

    postingHistory.unshift({
      id: Date.now(),
      type,
      text: data.text,
      reference: data.reference,
      platforms: enabledPlatforms.length > 0 ? enabledPlatforms : ['Preview only'],
      timestamp: new Date().toISOString(),
    })

    stats.totalPosts++
    if (type === 'quran') stats.quranPosts++
    else stats.hadithPosts++

    localStorage.setItem('noorbit-history', JSON.stringify(toRaw(postingHistory).slice(0, 50)))
    localStorage.setItem('noorbit-stats', JSON.stringify(toRaw(stats)))
  } catch (e) {
    console.error(e)
  }
}

async function loadPreview() {
  previewLoading.value = true
  try {
    const type = scheduler.contentMix === 'quran-only' ? 'quran'
      : scheduler.contentMix === 'hadith-only' ? 'hadith'
      : Math.random() > 0.5 ? 'quran' : 'hadith'
    const endpoint = type === 'quran' ? '/api/quran/random' : '/api/hadith/random'
    const data = await $fetch(endpoint) as any
    preview.value = { ...data, type }
  } catch (e) {
    console.error(e)
  } finally {
    previewLoading.value = false
  }
}

onMounted(() => {
  // Restore saved config
  try {
    const savedScheduler = localStorage.getItem('noorbit-scheduler')
    if (savedScheduler) Object.assign(scheduler, JSON.parse(savedScheduler))

    const savedPlatforms = localStorage.getItem('noorbit-platforms')
    if (savedPlatforms) {
      const parsed = JSON.parse(savedPlatforms)
      parsed.forEach((p: any, i: number) => {
        if (platforms[i]) Object.assign(platforms[i], p)
      })
    }

    const savedHistory = localStorage.getItem('noorbit-history')
    if (savedHistory) postingHistory.push(...JSON.parse(savedHistory))

    const savedStats = localStorage.getItem('noorbit-stats')
    if (savedStats) Object.assign(stats, JSON.parse(savedStats))

    const subs = JSON.parse(localStorage.getItem('noorbit-subscriptions') || '[]')
    stats.subscribers = subs.length
  } catch {}

  loadPreview()
})
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--color-primary-light);
}

/* Toggle Button */
.toggle-btn {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border);
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
  border: none;
}

.toggle-btn.active {
  background: var(--color-primary-light);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(20px);
}

.toggle-sm {
  width: 36px;
  height: 20px;
}

.toggle-sm .toggle-knob {
  width: 14px;
  height: 14px;
}

.toggle-sm.active .toggle-knob {
  transform: translateX(16px);
}

/* Platforms */
.platforms-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.platform-item {
  padding: 0.75rem;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.platform-item:hover {
  border-color: var(--color-border);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.platform-icon {
  font-size: 1.2rem;
}

.platform-name {
  flex: 1;
  font-weight: 600;
  font-size: 0.9rem;
}

.platform-config {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--color-border-light);
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 0.75rem;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-platforms {
  margin-top: 0.4rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.stat-item {
  text-align: center;
  padding: var(--space-md);
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
}
</style>
