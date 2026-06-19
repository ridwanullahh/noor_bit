<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-content image-gen-modal">
          <div class="modal-header">
            <h3>Generate Shareable Image</h3>
            <button class="btn btn-icon btn-ghost" @click="$emit('close')">✕</button>
          </div>

          <!-- Theme Selector -->
          <div class="gen-controls">
            <div class="gen-row">
              <div class="gen-group">
                <label class="gen-label">Theme</label>
                <div class="theme-picker">
                  <button
                    v-for="t in themes"
                    :key="t.id"
                    class="theme-swatch"
                    :class="{ active: selectedTheme === t.id }"
                    :style="{ background: t.swatch }"
                    :title="t.name"
                    @click="selectedTheme = t.id"
                  >
                    <span v-if="selectedTheme === t.id" class="swatch-check">&#10003;</span>
                  </button>
                </div>
              </div>

              <div class="gen-group">
                <label class="gen-label">Size</label>
                <div class="size-picker">
                  <button
                    v-for="s in sizes"
                    :key="s.id"
                    class="size-btn"
                    :class="{ active: selectedSize === s.id }"
                    @click="selectedSize = s.id"
                  >
                    <span class="size-icon" :style="{ aspectRatio: s.ratio, border: '2px solid currentColor', width: '24px', borderRadius: '2px' }"></span>
                    <span class="size-name">{{ s.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="gen-group">
              <label class="gen-label">Font Size</label>
              <div class="font-slider">
                <input type="range" min="14" max="36" v-model.number="fontSize" class="range-input" />
                <span class="text-muted text-xs">{{ fontSize }}px</span>
              </div>
            </div>

            <div class="gen-group">
              <label class="checkbox-label" style="cursor:pointer">
                <input type="checkbox" v-model="showArabic" />
                <span class="text-sm">Include Arabic text</span>
              </label>
              <label class="checkbox-label" style="cursor:pointer">
                <input type="checkbox" v-model="showSource" />
                <span class="text-sm">Include source link</span>
              </label>
            </div>
          </div>

          <!-- Preview -->
          <div class="gen-preview">
            <div v-if="generating" class="gen-loading">
              <div class="spinner"></div>
              <span class="text-muted text-sm">Generating image...</span>
            </div>
            <canvas ref="canvasEl" class="gen-canvas" :class="{ hidden: !previewUrl }"></canvas>
            <img v-if="previewUrl" :src="previewUrl" class="preview-img" alt="Generated shareable image" />
          </div>

          <!-- Actions -->
          <div class="gen-actions">
            <button class="btn btn-primary" @click="generateImage" :disabled="generating">
              🎨 {{ previewUrl ? 'Regenerate' : 'Generate' }}
            </button>
            <button v-if="previewUrl" class="btn btn-accent" @click="downloadImage">
              ⬇️ Download
            </button>
            <button v-if="previewUrl && canNativeShare" class="btn btn-outline" @click="shareImage">
              📤 Share
            </button>
          </div>

          <!-- Quick Share (if generated) -->
          <div v-if="previewUrl" class="gen-quick-share">
            <span class="text-muted text-xs">Quick share:</span>
            <button class="mini-share-btn twitter" @click="shareToTwitter" title="Twitter">𝕏</button>
            <button class="mini-share-btn whatsapp" @click="shareToWhatsApp" title="WhatsApp">💬</button>
            <button class="mini-share-btn telegram" @click="shareToTelegram" title="Telegram">✈</button>
            <button class="mini-share-btn facebook" @click="shareToFacebook" title="Facebook">f</button>
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

const canvasEl = ref<HTMLCanvasElement>()
const previewUrl = ref('')
const generating = ref(false)
const fontSize = ref(22)
const showArabic = ref(true)
const showSource = ref(true)
const selectedTheme = ref('emerald')
const selectedSize = ref('square')
const canNativeShare = computed(() => typeof navigator !== 'undefined' && !!navigator.share)

const themes = [
  { id: 'emerald', name: 'Emerald Gold', swatch: 'linear-gradient(135deg, #064e3b, #059669, #d4a843)', bg: '#064e3b', text: '#ffffff', accent: '#d4a843', secondary: '#a8d4a8' },
  { id: 'dark', name: 'Night Mode', swatch: 'linear-gradient(135deg, #0a150f, #132a1c, #10b981)', bg: '#0a150f', text: '#e8f5e8', accent: '#10b981', secondary: '#6a9a6a' },
  { id: 'parchment', name: 'Parchment', swatch: 'linear-gradient(135deg, #faf5e4, #d4a843)', bg: '#faf5e4', text: '#2d1f0e', accent: '#b8922e', secondary: '#8a6a3a' },
  { id: 'ocean', name: 'Ocean Breeze', swatch: 'linear-gradient(135deg, #0c4a6e, #0284c7, #38bdf8)', bg: '#0c4a6e', text: '#ffffff', accent: '#38bdf8', secondary: '#7dd3fc' },
  { id: 'minimal', name: 'Clean White', swatch: 'linear-gradient(135deg, #ffffff, #f0f0f0)', bg: '#ffffff', text: '#1a1a1a', accent: '#059669', secondary: '#666666' },
]

const sizes = [
  { id: 'square', name: 'Square', w: 1080, h: 1080, ratio: '1' },
  { id: 'portrait', name: 'Story', w: 1080, h: 1920, ratio: '9/16' },
  { id: 'landscape', name: 'Wide', w: 1200, h: 675, ratio: '16/9' },
]

function getTheme() {
  return themes.find(t => t.id === selectedTheme.value) || themes[0]
}

function getSize() {
  return sizes.find(s => s.id === selectedSize.value) || sizes[0]
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return []
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function drawGeometricPattern(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, opacity: number) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  const patternSize = 80
  for (let x = 0; x < w + patternSize; x += patternSize) {
    for (let y = 0; y < h + patternSize; y += patternSize) {
      ctx.beginPath()
      ctx.moveTo(x, y - patternSize / 3)
      ctx.lineTo(x + patternSize / 3, y)
      ctx.lineTo(x, y + patternSize / 3)
      ctx.lineTo(x - patternSize / 3, y)
      ctx.closePath()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, patternSize / 6, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
}

function drawStarPattern(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * 0.4
    const angle = (i * Math.PI) / points - Math.PI / 2
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

async function generateImage() {
  const canvas = canvasEl.value
  if (!canvas) return

  generating.value = true
  previewUrl.value = ''

  await nextTick()

  const theme = getTheme()
  const size = getSize()
  const ctx = canvas.getContext('2d')!
  const w = size.w
  const h = size.h

  canvas.width = w
  canvas.height = h

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, w, h)
  bgGrad.addColorStop(0, theme.bg)
  bgGrad.addColorStop(1, adjustColor(theme.bg, 20))
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  // Geometric overlay
  drawGeometricPattern(ctx, w, h, theme.accent, 0.06)

  // Decorative corners
  ctx.save()
  ctx.strokeStyle = theme.accent
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.4
  const cornerLen = w * 0.12
  // Top-left
  ctx.beginPath()
  ctx.moveTo(40, 40 + cornerLen)
  ctx.lineTo(40, 40)
  ctx.lineTo(40 + cornerLen, 40)
  ctx.stroke()
  // Top-right
  ctx.beginPath()
  ctx.moveTo(w - 40 - cornerLen, 40)
  ctx.lineTo(w - 40, 40)
  ctx.lineTo(w - 40, 40 + cornerLen)
  ctx.stroke()
  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(40, h - 40 - cornerLen)
  ctx.lineTo(40, h - 40)
  ctx.lineTo(40 + cornerLen, h - 40)
  ctx.stroke()
  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(w - 40 - cornerLen, h - 40)
  ctx.lineTo(w - 40, h - 40)
  ctx.lineTo(w - 40, h - 40 - cornerLen)
  ctx.stroke()
  ctx.restore()

  // Decorative stars
  drawStarPattern(ctx, w * 0.08, h * 0.08, 12, 8, theme.accent + '40')
  drawStarPattern(ctx, w * 0.92, h * 0.08, 12, 8, theme.accent + '40')
  drawStarPattern(ctx, w * 0.08, h * 0.92, 12, 8, theme.accent + '40')
  drawStarPattern(ctx, w * 0.92, h * 0.92, 12, 8, theme.accent + '40')

  // Type badge
  const badgeY = h * 0.08
  const badgeText = props.type === 'quran' ? '📖 Qur\'an' : '📜 Hadith'
  ctx.font = `bold ${Math.round(w * 0.022)}px "Segoe UI", system-ui, sans-serif`
  const badgeWidth = ctx.measureText(badgeText).width + 40
  const badgeX = (w - badgeWidth) / 2

  ctx.fillStyle = theme.accent + '30'
  roundRect(ctx, badgeX, badgeY, badgeWidth, w * 0.04, w * 0.02)
  ctx.fill()
  ctx.fillStyle = theme.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(badgeText, w / 2, badgeY + w * 0.02)

  // Content area
  const contentX = w * 0.1
  const contentWidth = w * 0.8
  let currentY = h * 0.16

  // Arabic text
  if (showArabic.value && props.arabicText) {
    const arabicSize = Math.round(fontSize.value * (w / 1080) * 1.6)
    ctx.font = `${arabicSize}px "Amiri", "Traditional Arabic", "Noto Naskh Arabic", serif`
    ctx.fillStyle = theme.text
    ctx.textAlign = 'right'
    ctx.direction = 'rtl'
    ctx.textBaseline = 'top'

    const arabicLines = wrapText(ctx, props.arabicText, contentWidth)
    const arabicLineHeight = arabicSize * 1.8

    // Arabic background panel
    const arabicBlockHeight = arabicLines.length * arabicLineHeight + arabicSize
    ctx.save()
    ctx.fillStyle = theme.text + '08'
    roundRect(ctx, contentX - 20, currentY - 15, contentWidth + 40, arabicBlockHeight, 12)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = theme.text
    for (const line of arabicLines) {
      ctx.fillText(line, contentX + contentWidth, currentY)
      currentY += arabicLineHeight
    }

    // Ornamental divider
    currentY += arabicSize * 0.5
    ctx.save()
    ctx.fillStyle = theme.accent
    ctx.textAlign = 'center'
    ctx.direction = 'ltr'
    ctx.font = `${Math.round(w * 0.025)}px serif`
    ctx.fillText('✦  ✦  ✦', w / 2, currentY)
    ctx.restore()
    currentY += w * 0.06
  }

  // English text
  if (props.text) {
    const engSize = Math.round(fontSize.value * (w / 1080))
    ctx.font = `${engSize}px "Segoe UI", "Outfit", system-ui, sans-serif`
    ctx.fillStyle = theme.text
    ctx.textAlign = 'left'
    ctx.direction = 'ltr'
    ctx.textBaseline = 'top'

    const maxText = props.text.length > 500 ? props.text.slice(0, 500) + '...' : props.text
    const engLines = wrapText(ctx, maxText, contentWidth)
    const engLineHeight = engSize * 1.7

    for (const line of engLines) {
      if (currentY + engLineHeight > h * 0.82) break
      ctx.fillText(line, contentX, currentY)
      currentY += engLineHeight
    }
  }

  // Reference
  const refY = h * 0.86
  ctx.font = `italic ${Math.round(w * 0.02)}px "Segoe UI", system-ui, sans-serif`
  ctx.fillStyle = theme.secondary
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.direction = 'ltr'
  ctx.fillText(`— ${props.reference}`, w / 2, refY)

  // Source link
  if (showSource.value && props.sourceLink) {
    ctx.font = `${Math.round(w * 0.016)}px "Segoe UI", system-ui, sans-serif`
    ctx.fillStyle = theme.accent
    ctx.fillText(props.sourceLink, w / 2, refY + w * 0.035)
  }

  // Branding bar
  const brandY = h * 0.94
  ctx.fillStyle = theme.accent + '20'
  ctx.fillRect(0, brandY - 10, w, h - brandY + 10)

  ctx.font = `bold ${Math.round(w * 0.022)}px "Segoe UI", system-ui, sans-serif`
  ctx.fillStyle = theme.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('☪ NoorBit', w / 2, brandY + (h - brandY) / 2)

  // Export
  previewUrl.value = canvas.toDataURL('image/png')
  generating.value = false
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function downloadImage() {
  if (!previewUrl.value) return
  const link = document.createElement('a')
  link.download = `noorbit-${props.type}-${props.reference.replace(/\s+/g, '-').toLowerCase()}.png`
  link.href = previewUrl.value
  link.click()
}

async function shareImage() {
  if (!previewUrl.value) return
  try {
    const blob = await (await fetch(previewUrl.value)).blob()
    const file = new File([blob], `noorbit-${props.type}.png`, { type: 'image/png' })
    await navigator.share({
      title: props.reference,
      text: `${props.type === 'quran' ? 'Qur\'an Ayah' : 'Hadith'}: ${props.reference}`,
      files: [file],
    })
  } catch {}
}

function shareToTwitter() {
  const text = props.text ? props.text.slice(0, 240) : props.reference
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text + '\n\n📱 via NoorBit')}`, '_blank')
}

function shareToWhatsApp() {
  const text = buildShareText()
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

function shareToTelegram() {
  const text = encodeURIComponent(props.text?.slice(0, 200) || props.reference)
  const url = encodeURIComponent(props.sourceLink || 'https://noorbit.app')
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
}

function shareToFacebook() {
  const url = encodeURIComponent(props.sourceLink || 'https://noorbit.app')
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

function buildShareText(): string {
  let msg = ''
  if (showArabic.value && props.arabicText) msg += props.arabicText + '\n\n'
  if (props.text) msg += props.text + '\n\n'
  msg += `— ${props.reference}`
  if (showSource.value && props.sourceLink) msg += `\n\n🔗 ${props.sourceLink}`
  msg += '\n\n📱 Shared via NoorBit'
  return msg
}

watch(() => props.show, (val) => {
  if (val) {
    previewUrl.value = ''
    fontSize.value = 22
    showArabic.value = true
    showSource.value = true
  }
})
</script>

<style scoped>
.image-gen-modal {
  max-width: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.modal-header h3 {
  font-size: 1.15rem;
}

.gen-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.gen-row {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.gen-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.gen-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-picker {
  display: flex;
  gap: 0.5rem;
}

.theme-swatch {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-swatch:hover {
  transform: scale(1.1);
}

.theme-swatch.active {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.swatch-check {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.size-picker {
  display: flex;
  gap: 0.4rem;
}

.size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-alt);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.75rem;
}

.size-btn:hover {
  border-color: var(--color-primary-light);
}

.size-btn.active {
  border-color: var(--color-primary-light);
  background: var(--color-surface);
  color: var(--color-primary-light);
}

.size-name {
  font-weight: 600;
}

.font-slider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-input {
  flex: 1;
  accent-color: var(--color-primary-light);
  height: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--color-primary-light);
}

.gen-preview {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border-light);
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.gen-canvas {
  display: none;
}

.gen-canvas.hidden {
  display: none;
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-md);
}

.gen-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
}

.gen-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.gen-actions .btn {
  flex: 1;
  min-width: 120px;
}

.gen-quick-share {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.mini-share-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mini-share-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.mini-share-btn.twitter:hover { border-color: #1da1f2; color: #1da1f2; }
.mini-share-btn.whatsapp:hover { border-color: #25d366; color: #25d366; }
.mini-share-btn.telegram:hover { border-color: #0088cc; color: #0088cc; }
.mini-share-btn.facebook:hover { border-color: #1877f2; color: #1877f2; }

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-content, .modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.97);
  opacity: 0;
}
</style>
