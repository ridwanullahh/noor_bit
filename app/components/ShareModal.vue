<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-content share-modal">
          <div class="modal-header">
            <h3>Share this {{ type === 'quran' ? 'Ayah' : 'Hadith' }}</h3>
            <button class="btn btn-icon btn-ghost" @click="$emit('close')">✕</button>
          </div>

          <!-- Preview -->
          <div class="share-preview card-glass" style="margin:1rem 0;padding:1rem;border-radius:var(--radius-md)">
            <p v-if="arabicText" class="text-arabic" style="font-size:1.1rem;margin-bottom:0.5rem">{{ truncate(arabicText, 120) }}</p>
            <p class="text-secondary text-sm">{{ truncate(text, 200) }}</p>
            <p class="text-muted text-xs" style="margin-top:0.5rem">— {{ reference }}</p>
          </div>

          <!-- Platform Buttons -->
          <div class="share-platforms">
            <button class="share-btn twitter" @click="shareToTwitter">
              <span class="share-icon">𝕏</span>
              <span>Twitter / X</span>
            </button>
            <button class="share-btn telegram" @click="shareToTelegram">
              <span class="share-icon">✈</span>
              <span>Telegram</span>
            </button>
            <button class="share-btn whatsapp" @click="shareToWhatsApp">
              <span class="share-icon">💬</span>
              <span>WhatsApp</span>
            </button>
            <button class="share-btn facebook" @click="shareToFacebook">
              <span class="share-icon">f</span>
              <span>Facebook</span>
            </button>
            <button class="share-btn linkedin" @click="shareToLinkedIn">
              <span class="share-icon">in</span>
              <span>LinkedIn</span>
            </button>
            <button class="share-btn reddit" @click="shareToReddit">
              <span class="share-icon">⬆</span>
              <span>Reddit</span>
            </button>
            <button class="share-btn email-btn" @click="shareViaEmail">
              <span class="share-icon">✉</span>
              <span>Email</span>
            </button>
            <button v-if="canNativeShare" class="share-btn native" @click="nativeShare">
              <span class="share-icon">📤</span>
              <span>More...</span>
            </button>
          </div>

          <!-- Copy Link -->
          <div class="share-copy">
            <input
              class="input"
              :value="shareText"
              readonly
              ref="copyInput"
            />
            <button class="btn btn-primary btn-sm" @click="copyToClipboard">
              {{ copied ? '✓ Copied!' : '📋 Copy' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  type: 'hadith' | 'quran'
  text: string
  arabicText?: string
  reference: string
  sourceLink?: string
}>()

defineEmits<{ close: [] }>()

const copied = ref(false)
const copyInput = ref<HTMLInputElement>()
const canNativeShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share)

function truncate(str: string, len: number): string {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const shareText = computed(() => {
  let msg = ''
  if (props.arabicText) msg += props.arabicText + '\n\n'
  if (props.text) msg += props.text + '\n\n'
  msg += `— ${props.reference}`
  if (props.sourceLink) msg += `\n\n🔗 ${props.sourceLink}`
  msg += '\n\n📱 Shared via NoorBit'
  return msg
})

const encodedText = computed(() => encodeURIComponent(shareText.value))
const encodedUrl = computed(() => encodeURIComponent(props.sourceLink || 'https://noorbit.app'))

function shareToTwitter() {
  const text = truncate(shareText.value, 260)
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
}

function shareToTelegram() {
  window.open(`https://t.me/share/url?url=${encodedUrl.value}&text=${encodedText.value}`, '_blank')
}

function shareToWhatsApp() {
  window.open(`https://wa.me/?text=${encodedText.value}`, '_blank')
}

function shareToFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl.value}&quote=${encodedText.value}`, '_blank')
}

function shareToLinkedIn() {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl.value}`, '_blank')
}

function shareToReddit() {
  window.open(`https://www.reddit.com/submit?url=${encodedUrl.value}&title=${encodeURIComponent(props.reference)}`, '_blank')
}

function shareViaEmail() {
  const subject = encodeURIComponent(`${props.type === 'quran' ? 'Qur\'an Ayah' : 'Hadith'}: ${props.reference}`)
  window.open(`mailto:?subject=${subject}&body=${encodedText.value}`, '_blank')
}

async function nativeShare() {
  try {
    await navigator.share({
      title: props.reference,
      text: shareText.value,
      url: props.sourceLink,
    })
  } catch {}
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareText.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    copyInput.value?.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}
</script>

<style scoped>
.share-modal {
  max-width: 520px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.modal-header h3 {
  font-size: 1.15rem;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-bottom: var(--space-lg);
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--color-border);
  background: var(--color-bg-alt);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.share-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.share-icon {
  font-size: 1.1rem;
  width: 1.5rem;
  text-align: center;
}

.twitter:hover { border-color: #1da1f2; color: #1da1f2; }
.telegram:hover { border-color: #0088cc; color: #0088cc; }
.whatsapp:hover { border-color: #25d366; color: #25d366; }
.facebook:hover { border-color: #1877f2; color: #1877f2; }
.linkedin:hover { border-color: #0077b5; color: #0077b5; }
.reddit:hover { border-color: #ff4500; color: #ff4500; }
.email-btn:hover { border-color: var(--color-primary-light); color: var(--color-primary-light); }
.native:hover { border-color: var(--color-accent); color: var(--color-accent); }

.share-copy {
  display: flex;
  gap: 0.5rem;
}

.share-copy .input {
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
}

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.97);
  opacity: 0;
}
</style>
