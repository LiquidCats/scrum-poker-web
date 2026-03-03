<script setup lang="ts">
const { players, votedPlayers, isRevealed, allPlayersVoted } = useRoom();

const votingProgress = computed(() => {
  if (players.value.length === 0) return 0;
  return (votedPlayers.value.length / players.value.length) * 100;
});
</script>

<template>
  <div class="w-full">
    <!-- Header with progress -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white/90">
        Players
        <span class="text-white/50 font-normal">
          ({{ votedPlayers.length }}/{{ players.length }} voted)
        </span>
      </h2>
    </div>

    <!-- Progress bar -->
    <div class="relative h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 bg-gradient-to-r from-poker-gold to-poker-gold-light rounded-full transition-all duration-500"
        :style="{ width: `${votingProgress}%` }"
      />
      <div
        v-if="votingProgress > 0 && !allPlayersVoted"
        class="absolute inset-y-0 left-0 bg-gradient-to-r from-poker-gold to-poker-gold-light rounded-full animate-pulse"
        :style="{ width: `${votingProgress}%` }"
      />
    </div>

    <!-- Players grid -->
    <div
      class="grid gap-6"
      :class="[
        players.length <= 4
          ? 'grid-cols-2 md:grid-cols-4'
          : players.length <= 6
            ? 'grid-cols-3 md:grid-cols-6'
            : 'grid-cols-4 md:grid-cols-8',
      ]"
    >
      <TransitionGroup name="player">
        <PlayerAvatar
          v-for="player in players"
          :key="player.id"
          :player="player"
          :show-vote="isRevealed"
        />
      </TransitionGroup>
    </div>

    <!-- Empty state -->
    <div v-if="players.length === 0" class="text-center py-12">
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-white/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <p class="text-white/50">Waiting for players to join...</p>
    </div>

    <!-- All voted indicator -->
    <Transition name="bounce">
      <div v-if="allPlayersVoted && !isRevealed" class="mt-8 text-center">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-poker-gold/20 border border-poker-gold/30 animate-pulse-glow"
        >
          <svg
            class="w-5 h-5 text-poker-gold"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-poker-gold font-medium">Everyone has voted!</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.player-enter-active,
.player-leave-active {
  transition: all 0.3s ease;
}

.player-enter-from,
.player-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.bounce-enter-active {
  animation: bounce-in 0.5s ease;
}

.bounce-leave-active {
  animation: bounce-in 0.3s ease reverse;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
