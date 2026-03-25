<template>
  <div class="app-layout">
    <!-- Navbar -->
    <header class="navbar" :class="{ 'navbar-scrolled': scrolled }">
      <div class="container">
        <div class="navbar-inner">
          <NuxtLink to="/" class="navbar-brand">
            <span class="brand-icon">☪</span>
            <span class="brand-text">
              <span class="text-gradient">NoorBit</span>
            </span>
          </NuxtLink>

          <nav class="navbar-links hide-mobile">
            <NuxtLink to="/" class="nav-link" active-class="nav-active">Home</NuxtLink>
            <NuxtLink to="/collections" class="nav-link" active-class="nav-active">Collections</NuxtLink>
            <NuxtLink to="/search" class="nav-link" active-class="nav-active">Search</NuxtLink>
            <NuxtLink to="/subscribe" class="nav-link" active-class="nav-active">Subscribe</NuxtLink>
            <NuxtLink to="/dashboard" class="nav-link" active-class="nav-active">Dashboard</NuxtLink>
          </nav>

          <div class="navbar-actions">
            <button class="btn btn-icon" @click="toggleDarkMode" :title="isDark ? 'Light Mode' : 'Dark Mode'">
              <span v-if="isDark">☀️</span>
              <span v-else>🌙</span>
            </button>
            <button class="btn btn-icon hide-desktop mobile-menu-btn" @click="menuOpen = !menuOpen">
              <span>{{ menuOpen ? '✕' : '☰' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile Menu -->
    <Transition name="slide">
      <div v-if="menuOpen" class="mobile-menu">
        <nav class="mobile-nav">
          <NuxtLink to="/" class="mobile-link" @click="menuOpen = false">🏠 Home</NuxtLink>
          <NuxtLink to="/collections" class="mobile-link" @click="menuOpen = false">📚 Collections</NuxtLink>
          <NuxtLink to="/search" class="mobile-link" @click="menuOpen = false">🔍 Search</NuxtLink>
          <NuxtLink to="/subscribe" class="mobile-link" @click="menuOpen = false">📬 Subscribe</NuxtLink>
          <NuxtLink to="/dashboard" class="mobile-link" @click="menuOpen = false">⚙️ Dashboard</NuxtLink>
        </nav>
      </div>
    </Transition>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="flex items-center gap-sm">
              <span class="brand-icon">☪</span>
              <span class="text-gradient" style="font-size:1.3rem;font-weight:700">NoorBit</span>
            </div>
            <p class="text-secondary text-sm" style="margin-top:0.5rem;max-width:280px">
              Auto-sharing the light of the Qur'an and authentic Hadith to social platforms worldwide.
            </p>
          </div>
          <div class="footer-links">
            <h4 style="font-size:0.9rem;margin-bottom:0.75rem">Content</h4>
            <NuxtLink to="/collections" class="footer-link">Hadith Collections</NuxtLink>
            <NuxtLink to="/search" class="footer-link">Search</NuxtLink>
            <NuxtLink to="/subscribe" class="footer-link">Subscribe</NuxtLink>
          </div>
          <div class="footer-links">
            <h4 style="font-size:0.9rem;margin-bottom:0.75rem">Sources</h4>
            <a href="https://sunnah.com" target="_blank" rel="noopener" class="footer-link">Sunnah.com ↗</a>
            <a href="https://quran.com" target="_blank" rel="noopener" class="footer-link">Quran.com ↗</a>
            <a href="https://alquran.cloud" target="_blank" rel="noopener" class="footer-link">AlQuran Cloud ↗</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="text-muted text-xs">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — NoorBit © {{ new Date().getFullYear() }} — Sharing the Light of Islam</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const scrolled = ref(false)
const menuOpen = ref(false)
const isDark = ref(false)

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('noorbit-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  // Check saved theme
  const saved = localStorage.getItem('noorbit-theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  // Scroll listener
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.navbar-scrolled {
  box-shadow: var(--shadow-md);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 800;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.6rem;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
}

.navbar-links {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 0.9rem;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-active {
  color: var(--color-primary-light);
  background: var(--color-surface);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mobile-menu-btn {
  font-size: 1.3rem;
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg);
  z-index: var(--z-dropdown);
  padding: var(--space-lg);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-link {
  padding: 0.9rem var(--space-md);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.mobile-link:hover {
  background: var(--color-surface);
  color: var(--color-primary-light);
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Main */
.main-content {
  min-height: calc(100vh - 64px - 200px);
}

/* Footer */
.footer {
  background: var(--color-bg-alt);
  border-top: 1px solid var(--color-border-light);
  padding: var(--space-3xl) 0 var(--space-xl);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-2xl);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-link {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary-light);
}

.footer-bottom {
  margin-top: var(--space-2xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
}
</style>
