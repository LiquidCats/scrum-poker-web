<script setup lang="ts">
import type { CardValue } from "~/types";

interface Props {
  value: CardValue;
  selected?: boolean;
  flipped?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  flipped: false,
  disabled: false,
  size: "md",
});

const emit = defineEmits<{
  select: [value: CardValue];
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-14 h-20 text-lg";
    case "lg":
      return "w-24 h-36 text-4xl";
    default:
      return "w-20 h-28 text-2xl";
  }
});

const handleClick = () => {
  if (!props.disabled) {
    emit("select", props.value);
  }
};

// Special card styling
const isSpecialCard = computed(() => ["?", "☕"].includes(props.value));
</script>

<template>
  <button
    class="poker-card group"
    :class="[
      sizeClasses,
      {
        selected: selected,
        flipped: flipped,
        'opacity-50 cursor-not-allowed hover:translate-y-0': disabled,
      },
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <div class="poker-card-inner">
      <!-- Front of card -->
      <div
        class="poker-card-front"
        :class="{ 'text-poker-accent': isSpecialCard }"
      >
        <!-- Corner decorations -->
        <span class="absolute top-2 left-2 text-xs font-mono opacity-60">
          {{ value }}
        </span>
        <span
          class="absolute bottom-2 right-2 text-xs font-mono opacity-60 rotate-180"
        >
          {{ value }}
        </span>

        <!-- Main value -->
        <span class="font-display font-bold relative z-10">
          {{ value }}
        </span>

        <!-- Subtle pattern -->
        <div
          class="absolute inset-4 border border-current opacity-10 rounded-lg"
          :class="{ 'border-poker-accent': isSpecialCard }"
        />
      </div>

      <!-- Back of card -->
      <div class="poker-card-back">
        <div
          class="w-12 h-12 rounded-full bg-poker-gold/20 flex items-center justify-center"
        >
          <span class="text-poker-gold text-2xl">♠</span>
        </div>
      </div>
    </div>

    <!-- Selection glow effect -->
    <div
      v-if="selected"
      class="absolute inset-0 rounded-xl bg-poker-gold/10 animate-pulse-glow pointer-events-none"
    />
  </button>
</template>
