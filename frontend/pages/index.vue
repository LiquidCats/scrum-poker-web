<script setup lang="ts">
const { createRoom, joinRoom, room } = useRoom()

const activeTab = ref<'create' | 'join'>('create')
const playerName = ref('')
const roomName = ref('')
const roomCode = ref('')
const error = ref('')
const isLoading = ref(false)

// Redirect if already in a room
if (room.value) {
  navigateTo(`/room/${room.value.id}`)
}

const handleCreate = async () => {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    const newRoom = await createRoom(
      roomName.value.trim() || 'Planning Session',
      playerName.value.trim()
    )
    
    await navigateTo(`/room/${newRoom.id}`)
  } catch (e) {
    error.value = 'Failed to create room'
  } finally {
    isLoading.value = false
  }
}

const handleJoin = async () => {
  if (!playerName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  if (!roomCode.value.trim()) {
    error.value = 'Please enter a room code'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    const success = await joinRoom(
      roomCode.value.trim().toUpperCase(),
      playerName.value.trim()
    )
    
    if (success) {
      await navigateTo(`/room/${roomCode.value.trim().toUpperCase()}`)
    } else {
      error.value = 'Room not found. Check the code and try again.'
    }
  } catch (e) {
    error.value = 'Failed to join room'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Hero -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-poker-gold to-poker-gold-light shadow-glow mb-6 animate-float">
          <span class="text-poker-felt text-4xl">♠</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-display font-bold mb-4">
          <span class="gradient-text">Scrum Poker</span>
        </h1>
        <p class="text-white/60 text-lg">
          Real-time planning poker for agile teams
        </p>
      </div>

      <!-- Form card -->
      <div class="room-card p-8">
        <!-- Tabs -->
        <div class="flex rounded-xl bg-white/5 p-1 mb-8">
          <button
            class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
            :class="activeTab === 'create' 
              ? 'bg-poker-gold text-poker-felt' 
              : 'text-white/60 hover:text-white'"
            @click="activeTab = 'create'"
          >
            Create Room
          </button>
          <button
            class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
            :class="activeTab === 'join' 
              ? 'bg-poker-gold text-poker-felt' 
              : 'text-white/60 hover:text-white'"
            @click="activeTab = 'join'"
          >
            Join Room
          </button>
        </div>

        <!-- Error message -->
        <Transition name="slide-down">
          <div 
            v-if="error"
            class="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {{ error }}
          </div>
        </Transition>

        <!-- Form -->
        <form @submit.prevent="activeTab === 'create' ? handleCreate() : handleJoin()">
          <!-- Name input (always shown) -->
          <div class="mb-4">
            <label class="block text-sm text-white/60 mb-2">Your Name</label>
            <input
              v-model="playerName"
              type="text"
              class="input-field"
              placeholder="Enter your name"
              maxlength="30"
            />
          </div>

          <!-- Create room fields -->
          <Transition name="slide" mode="out-in">
            <div v-if="activeTab === 'create'" key="create" class="mb-6">
              <label class="block text-sm text-white/60 mb-2">Room Name (optional)</label>
              <input
                v-model="roomName"
                type="text"
                class="input-field"
                placeholder="Sprint Planning"
                maxlength="50"
              />
            </div>

            <!-- Join room fields -->
            <div v-else key="join" class="mb-6">
              <label class="block text-sm text-white/60 mb-2">Room Code</label>
              <input
                v-model="roomCode"
                type="text"
                class="input-field font-mono text-center text-xl tracking-widest uppercase"
                placeholder="ABC123"
                maxlength="6"
              />
            </div>
          </Transition>

          <!-- Submit button -->
          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <svg 
              v-if="isLoading"
              class="w-5 h-5 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <template v-else>
              {{ activeTab === 'create' ? 'Create Room' : 'Join Room' }}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </template>
          </button>
        </form>
      </div>

      <!-- Features -->
      <div class="mt-12 grid grid-cols-3 gap-4 text-center">
        <div class="p-4">
          <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p class="text-sm text-white/50">Real-time</p>
        </div>
        <div class="p-4">
          <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p class="text-sm text-white/50">Team-friendly</p>
        </div>
        <div class="p-4">
          <div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p class="text-sm text-white/50">Analytics</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
