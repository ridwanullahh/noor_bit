<template>
  <div class="content-card" :class="[`card-${type}`, { 'card-compact': compact }]">
    <!-- Type Tag -->
    <div class="card-header">
      <span :class="type === 'quran' ? 'tag tag-quran' : 'tag tag-hadith'">
        {{ type === 'quran' ? '📖 Qur\'an' : '📜 Hadith' }}
      </span>
      <span v-if="grade" class="badge badge-primary">{{ grade }}</span>
    </div>

    <!-- Arabic Text -->
    <div v-if="arabicText" class="card-arabic">
      <p class="text-arabic" :class="{ 'text-arabic-lg': !compact }">{{ arabicText }}</p>
    </div>

    <!-- Divider -->
    <div v-if="arabicText && text" class="divider-ornament">
      <span class="ornament-star">✦</span>
    </div>

    <!-- English Text -->
    <div v-if="text" class="card-translation">
      <p class="card-text">{{ displayText }}</p>
      <button
        v-if="text.length > 300 && !expanded"
        class="btn btn-ghost btn-sm"
        @click="expanded = true"
      >
        Read more ↓
      </button>
    </div>

    <!-- Reference -->
    <div class="card-footer">
      <div class="card-ref">
        <span class="text-muted text-sm">{{ reference }}</span>
      </div>
      <div class="card-actions">
        <a
          v-if="sourceLink"
          :href="sourceLink"
          target="_blank"
          rel="noopener"
          class="btn btn-ghost btn-sm"
          title="View Source"
        >
          🔗 Source
        </a>
        <button class="btn btn-ghost btn-sm" @click="$emit('share')" title="Share">
          📤 Share
        </button>
        <button class="btn btn-ghost btn-sm" @click="$emit('image')" title="Generate Image">
          🖼️ Image
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  type: 'hadith' | 'quran'
  text?: string
  arabicText?: string
  reference: string
  sourceLink?: string
  grade?: string
  compact?: boolean
}>()

defineEmits<{
  share: []
  image: []
}>()

const expanded = ref(false)

const displayText = computed(() => {
  if (!props.text) return ''
  if (expanded.value || props.text.length <= 300) return props.text
  return props.text.slice(0, 300) + '...'
})
</script>

<style scoped>
.content-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.content-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-quran {
  border-left: 4px solid var(--color-primary-light);
}

.card-hadith {
  border-left: 4px solid var(--color-accent);
}

.card-compact {
  padding: var(--space-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.card-arabic {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-alt);
  border-radius: var(--radius-md);
}

.card-translation {
  margin-top: var(--space-md);
}

.card-text {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.card-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
