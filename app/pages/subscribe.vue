<template>
  <div class="subscribe-page section">
    <div class="container container-sm">
      <div class="text-center" style="margin-bottom:2.5rem">
        <span class="badge badge-primary">📬 Subscribe</span>
        <h1 style="margin-top:0.75rem">
          Receive Daily <span class="text-gradient">Noor</span>
        </h1>
        <p class="text-secondary" style="margin-top:0.5rem;max-width:450px;margin-left:auto;margin-right:auto">
          Get Qur'an Ayaat and authentic Hadith delivered to your inbox or preferred platform daily.
        </p>
      </div>

      <!-- Subscription Form -->
      <div class="card" style="max-width:500px;margin:0 auto">
        <form @submit.prevent="subscribe" class="sub-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Name (optional)</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Your name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Content Preferences</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.quran" checked />
                <span>📖 Qur'an Ayaat</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.hadith" checked />
                <span>📜 Hadith</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Delivery Frequency</label>
            <select v-model="form.frequency" class="input select">
              <option value="daily">Daily (1 per day)</option>
              <option value="twice">Twice daily</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Collections</label>
            <div class="checkbox-group">
              <label v-for="coll in collections" :key="coll.id" class="checkbox-label">
                <input type="checkbox" :value="coll.id" v-model="form.collections" />
                <span>{{ coll.name }}</span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:0.5rem" :disabled="submitting">
            {{ submitting ? 'Subscribing...' : '📬 Subscribe' }}
          </button>
        </form>

        <!-- Success Message -->
        <Transition name="page">
          <div v-if="subscribed" class="success-card" style="margin-top:1rem">
            <div class="card" style="background:var(--color-surface);border-color:var(--color-primary-light);text-align:center;padding:1.5rem">
              <div style="font-size:2.5rem;margin-bottom:0.5rem">✅</div>
              <h3>Successfully Subscribed!</h3>
              <p class="text-secondary text-sm" style="margin-top:0.5rem">
                You'll receive your first {{ form.quran ? 'Ayah' : '' }}{{ form.quran && form.hadith ? ' & ' : '' }}{{ form.hadith ? 'Hadith' : '' }} soon, In shaa Allah.
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Why Subscribe -->
      <div style="margin-top:3rem">
        <h3 class="text-center" style="margin-bottom:1.5rem">Why Subscribe?</h3>
        <div class="grid grid-3">
          <div class="card text-center">
            <div style="font-size:2rem;margin-bottom:0.5rem">🌅</div>
            <h4 style="font-size:0.95rem">Start Your Day Right</h4>
            <p class="text-muted text-sm" style="margin-top:0.25rem">Daily reminders from the Qur'an and Sunnah</p>
          </div>
          <div class="card text-center">
            <div style="font-size:2rem;margin-bottom:0.5rem">📱</div>
            <h4 style="font-size:0.95rem">Multi-Platform</h4>
            <p class="text-muted text-sm" style="margin-top:0.25rem">Receive via email, Telegram, or WhatsApp</p>
          </div>
          <div class="card text-center">
            <div style="font-size:2rem;margin-bottom:0.5rem">🎯</div>
            <h4 style="font-size:0.95rem">Personalized</h4>
            <p class="text-muted text-sm" style="margin-top:0.25rem">Choose your preferred collections and frequency</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Subscribe — NoorBit',
  description: 'Subscribe to receive daily Qur\'an Ayaat and authentic Hadith in your inbox or preferred platform.',
})

const form = reactive({
  email: '',
  name: '',
  quran: true,
  hadith: true,
  frequency: 'daily',
  collections: ['bukhari', 'muslim', 'nawawi'],
})

const collections = [
  { id: 'bukhari', name: 'Sahih al-Bukhari' },
  { id: 'muslim', name: 'Sahih Muslim' },
  { id: 'nawawi', name: '40 Hadith Nawawi' },
  { id: 'qudsi', name: '40 Hadith Qudsi' },
  { id: 'tirmidhi', name: "Jami' at-Tirmidhi" },
  { id: 'abudawud', name: 'Sunan Abu Dawud' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah' },
]

const submitting = ref(false)
const subscribed = ref(false)

async function subscribe() {
  if (!form.email) return
  submitting.value = true

  try {
    // Store subscription (for now, save to localStorage as demo; production would POST to server)
    const subs = JSON.parse(localStorage.getItem('noorbit-subscriptions') || '[]')
    subs.push({
      ...toRaw(form),
      id: Date.now(),
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem('noorbit-subscriptions', JSON.stringify(subs))

    subscribed.value = true
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sub-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-primary-light);
}
</style>
