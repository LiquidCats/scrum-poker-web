<script setup lang="ts">
const route = useRoute()
const { room, player, isRevealed, joinRoom, checkRoom } = useRoom()

const roomId = computed(() => route.params.id as string)

// Check if user is in the room
const isInRoom = computed(() => {
  return room.value?.id === roomId.value && player.value !== null
})

// If not in room, show join prompt
const showJoinPrompt = ref(false)
const roomNotFound = ref(false)
const playerName = ref('')
const error = ref('')
const isLoading = ref(false)

onMounted(async () => {
  if (!isInRoom.value) {
    // Check if the room exists on the server
    const exists = await checkRoom(roomId.value)
    if (exists) {
      showJoinPrompt.value = true
    } else {
      roomNotFound.value = true
    }
  }
})

const handleJoin = async () => {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const success = await joinRoom(roomId.value, playerName.value.trim())

    if (success) {
      showJoinPrompt.value = false
      error.value = ''
    } else {
      error.value = 'Room not found or could not join'
    }
  } catch {
    error.value = 'Failed to join room'
  } finally {
    isLoading.value = false
  }
}

// Page meta
useHead({
  title: () => room.value ? `${room.value.name} - Scrum Poker` : 'Room - Scrum Poker',
})
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)]">
    <!-- Join prompt modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showJoinPrompt"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div class="room-card w-full max-w-md p-8 animate-bounce-in">
            <h2 class="text-2xl font-bold text-center mb-2">Join Room</h2>
            <p class="text-white/60 text-center mb-8">
              Enter your name to join
              <span class="font-mono text-poker-gold">{{ roomId }}</span>
            </p>

            <!-- Error -->
            <div 
              v-if="error"
              class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {{ error }}
            </div>

            <form @submit.prevent="handleJoin">
              <div class="mb-6">
                <label class="block text-sm text-white/60 mb-2">Your Name</label>
                <input
                  v-model="playerName"
                  type="text"
                  class="input-field"
                  placeholder="Enter your name"
                  autofocus
                  maxlength="30"
                />
              </div>

              <div class="flex gap-3">
                <NuxtLink 
                  to="/"
                  class="btn-secondary flex-1 text-center"
                >
                  Back
                </NuxtLink>
                <button
                  type="submit"
                  class="btn-primary flex-1"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Main room content -->
    <div 
      v-if="isInRoom && room"
      class="max-w-7xl mx-auto px-4 py-8"
    >
      <!-- Room header -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl md:text-3xl font-bold mb-2">{{ room.name }}</h1>
        <p 
          v-if="room.currentIssue"
          class="text-lg text-white/70"
        >
          {{ room.currentIssue }}
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left column: Players & Results -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Players table -->
          <section>
            <PlayersTable />
          </section>

          <!-- Results (shown when revealed) -->
          <section>
            <ResultsPanel />
          </section>
        </div>

        <!-- Right column: Controls -->
        <div class="space-y-8">
          <HostControls />
        </div>
      </div>

      <!-- Voting panel (bottom) -->
      <section class="mt-12 pt-8 border-t border-white/10">
        <VotingPanel />
      </section>
    </div>

    <!-- Room not found -->
    <div
      v-else-if="roomNotFound"
      class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4"
    >
      <div class="text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">Room Not Found</h2>
        <p class="text-white/60 mb-8">
          The room you're looking for doesn't exist or has been closed.
        </p>
        <NuxtLink to="/" class="btn-primary">
          Go Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
