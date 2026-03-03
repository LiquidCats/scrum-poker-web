<script setup lang="ts">
import type { CardValue } from "~/types";

const { room, player, castVote, clearVote, isRevealed } = useRoom();
const { deck } = usePokerDeck();

const selectedValue = computed(() => player.value?.vote ?? null);

const handleCardSelect = (value: CardValue) => {
  if (selectedValue.value === value) {
    clearVote();
  } else {
    castVote(value);
  }
};
</script>

<template>
  <div class="w-full">
    <!-- Section header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-white/90">Choose your card</h2>
      <button
        v-if="selectedValue"
        class="text-sm text-poker-gold hover:text-poker-gold-light transition-colors"
        @click="clearVote"
      >
        Clear selection
      </button>
    </div>

    <!-- Card deck -->
    <div class="flex flex-wrap justify-center gap-3 md:gap-4">
      <PokerCard
        v-for="card in deck"
        :key="card.value"
        :value="card.value"
        :selected="selectedValue === card.value"
        :disabled="isRevealed"
        @select="handleCardSelect"
      />
    </div>

    <!-- Selected card indicator -->
    <Transition name="slide-up">
      <div v-if="selectedValue" class="mt-8 text-center">
        <p class="text-white/60 text-sm mb-2">Your vote</p>
        <div
          class="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-poker-gold/10 border border-poker-gold/30"
        >
          <span class="text-3xl font-bold text-poker-gold">{{
            selectedValue
          }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
