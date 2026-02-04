<script setup lang="ts">
import type { CardValue } from '~/types'

const { votingResults, isRevealed, players } = useRoom()

// Get the maximum count for scaling the bars
const maxCount = computed(() => {
  if (!votingResults.value) return 0
  return Math.max(...Object.values(votingResults.value.distribution))
})

// Sort distribution by numeric value for display
const sortedDistribution = computed(() => {
  if (!votingResults.value) return []
  
  const { getNumericValue } = usePokerDeck()
  
  return Object.entries(votingResults.value.distribution)
    .sort(([a], [b]) => {
      const aNum = getNumericValue(a as CardValue)
      const bNum = getNumericValue(b as CardValue)
      if (aNum === null && bNum === null) return 0
      if (aNum === null) return 1
      if (bNum === null) return -1
      return aNum - bNum
    })
})

const formatNumber = (num: number | null): string => {
  if (num === null) return '-'
  return num % 1 === 0 ? num.toString() : num.toFixed(1)
}
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-if="isRevealed && votingResults"
      class="stats-panel"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white/90">Results</h2>
        <div 
          v-if="votingResults.consensus"
          class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
        >
          <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-green-400 text-sm font-medium">Consensus!</span>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="text-center p-4 rounded-xl bg-white/5">
          <p class="text-white/50 text-sm mb-1">Average</p>
          <p class="text-3xl font-bold gradient-text">
            {{ formatNumber(votingResults.average) }}
          </p>
        </div>
        <div class="text-center p-4 rounded-xl bg-white/5">
          <p class="text-white/50 text-sm mb-1">Median</p>
          <p class="text-3xl font-bold gradient-text">
            {{ formatNumber(votingResults.median) }}
          </p>
        </div>
        <div class="text-center p-4 rounded-xl bg-white/5">
          <p class="text-white/50 text-sm mb-1">Most Voted</p>
          <p class="text-3xl font-bold gradient-text">
            {{ votingResults.mode || '-' }}
          </p>
        </div>
      </div>

      <!-- Vote distribution -->
      <div>
        <h3 class="text-sm text-white/50 mb-4">Vote Distribution</h3>
        <div class="space-y-3">
          <div 
            v-for="[value, count] in sortedDistribution"
            :key="value"
            class="flex items-center gap-4"
          >
            <!-- Card value -->
            <div class="w-12 h-12 flex-shrink-0 rounded-lg bg-poker-card flex items-center justify-center">
              <span class="text-poker-felt font-bold text-lg">{{ value }}</span>
            </div>

            <!-- Bar -->
            <div class="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-poker-gold/60 to-poker-gold-light/60 rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3"
                :style="{ width: `${(count / maxCount) * 100}%` }"
              >
                <span class="text-sm font-medium text-poker-felt/80">
                  {{ count }} vote{{ count !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>

            <!-- Count -->
            <div class="w-12 text-right">
              <span class="text-white/80 font-mono">
                {{ Math.round((count / votingResults.totalVotes) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Votes info -->
      <div class="mt-6 pt-6 border-t border-white/10 flex justify-between text-sm text-white/50">
        <span>{{ votingResults.totalVotes }} total votes</span>
        <span>{{ votingResults.validVotes }} numeric votes</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
