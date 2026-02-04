<script setup lang="ts">
const { room, leaveRoom } = useRoom()

const handleLeave = () => {
  leaveRoom()
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col noise-overlay">
    <!-- Header -->
    <header class="relative z-10 px-6 py-4 border-b border-white/5">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink 
          to="/"
          class="flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-poker-gold to-poker-gold-light flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <span class="text-poker-felt text-xl">♠</span>
          </div>
          <span class="text-xl font-display font-bold gradient-text">
            Scrum Poker
          </span>
        </NuxtLink>

        <!-- Room info & actions -->
        <div 
          v-if="room"
          class="flex items-center gap-4"
        >
          <span class="hidden sm:block text-white/50 text-sm">
            Room: <span class="font-mono text-poker-gold">{{ room.id }}</span>
          </span>
          <button
            class="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-2"
            @click="handleLeave"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="relative z-10 px-6 py-4 border-t border-white/5">
      <div class="max-w-7xl mx-auto flex items-center justify-between text-sm text-white/30">
        <span>Built with Nuxt 3</span>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-poker-gold transition-colors">Help</a>
          <a href="#" class="hover:text-poker-gold transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
</template>
