<script setup lang="ts">
import type { Player, CardValue } from '~/types'

interface Props {
  player: Player
  showVote?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showVote: false,
  size: 'md',
})

const initials = computed(() => {
  return props.player.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-10 h-10 text-sm'
    case 'lg':
      return 'w-16 h-16 text-xl'
    default:
      return 'w-12 h-12 text-base'
  }
})

// Generate consistent color from name
const avatarColor = computed(() => {
  const colors = [
    'from-emerald-500/30 to-emerald-600/20 border-emerald-500/50',
    'from-blue-500/30 to-blue-600/20 border-blue-500/50',
    'from-purple-500/30 to-purple-600/20 border-purple-500/50',
    'from-pink-500/30 to-pink-600/20 border-pink-500/50',
    'from-amber-500/30 to-amber-600/20 border-amber-500/50',
    'from-cyan-500/30 to-cyan-600/20 border-cyan-500/50',
    'from-rose-500/30 to-rose-600/20 border-rose-500/50',
    'from-indigo-500/30 to-indigo-600/20 border-indigo-500/50',
  ]
  
  const hash = props.player.name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  return colors[hash % colors.length]
})
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Avatar -->
    <div 
      class="relative"
    >
      <div
        class="rounded-full flex items-center justify-center bg-gradient-to-br border-2 font-bold transition-all duration-300"
        :class="[
          sizeClasses,
          avatarColor,
          {
            'ring-2 ring-poker-gold ring-offset-2 ring-offset-poker-felt shadow-glow': player.hasVoted,
          }
        ]"
      >
        {{ initials }}
      </div>

      <!-- Vote indicator -->
      <div 
        v-if="player.hasVoted && !showVote"
        class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-poker-gold flex items-center justify-center"
      >
        <svg class="w-3 h-3 text-poker-felt" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Host crown -->
      <div 
        v-if="player.isHost"
        class="absolute -top-3 left-1/2 -translate-x-1/2 text-poker-gold"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2l2.5 5 5.5.5-4 4 1 5.5L10 14l-5 3 1-5.5-4-4 5.5-.5L10 2z"/>
        </svg>
      </div>

      <!-- Online indicator -->
      <div 
        v-if="player.isOnline"
        class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-poker-felt"
      />
    </div>

    <!-- Name -->
    <span class="text-sm text-white/80 font-medium truncate max-w-20">
      {{ player.name }}
    </span>

    <!-- Vote display (when revealed) -->
    <div 
      v-if="showVote && player.vote"
      class="mt-1 px-3 py-1 rounded-lg bg-poker-gold/20 border border-poker-gold/30"
    >
      <span class="text-poker-gold font-bold font-mono">{{ player.vote }}</span>
    </div>
  </div>
</template>
