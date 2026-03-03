<script setup lang="ts">
const {
  room,
  isHost,
  isRevealed,
  allPlayersVoted,
  votedPlayers,
  revealVotes,
  resetRound,
  setIssue,
} = useRoom();

const issueInput = ref("");
const isEditingIssue = ref(false);
const isLinkCopied = ref(false);

const handleSetIssue = () => {
  if (issueInput.value.trim()) {
    setIssue(issueInput.value.trim());
    isEditingIssue.value = false;
  }
};

const startEditingIssue = () => {
  issueInput.value = room.value?.currentIssue || "";
  isEditingIssue.value = true;
  nextTick(() => {
    document.getElementById("issue-input")?.focus();
  });
};

// Copy room link
const copyRoomLink = async () => {
  if (!room.value) return;

  const link = `${window.location.origin}/room/${room.value.id}`;
  await navigator.clipboard.writeText(link);

  isLinkCopied.value = true;

  let timeoutID = setTimeout(() => {
    isLinkCopied.value = false;
    clearTimeout(timeoutID);
  }, 1000);
};
</script>

<template>
  <div v-if="room" class="space-y-6">
    <!-- Issue/Story input -->
    <div class="room-card">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <label class="block text-sm text-white/50 mb-2"
            >Current Story/Issue</label
          >

          <div v-if="isEditingIssue && isHost" class="flex gap-2">
            <input
              id="issue-input"
              v-model="issueInput"
              type="text"
              class="input-field flex-1"
              placeholder="Enter story or issue..."
              @keydown.enter="handleSetIssue"
              @keydown.escape="isEditingIssue = false"
            />
            <button class="btn-primary" @click="handleSetIssue">Save</button>
            <button class="btn-secondary" @click="isEditingIssue = false">
              Cancel
            </button>
          </div>

          <div v-else class="flex items-center gap-3">
            <p
              class="text-lg text-white truncate"
              :class="{
                'text-white/40 italic': !room.currentIssue,
              }"
            >
              {{ room.currentIssue || "No issue set" }}
            </p>
            <button
              v-if="isHost"
              class="text-poker-gold hover:text-poker-gold-light transition-colors"
              @click="startEditingIssue"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Room info & invite -->
    <div class="room-card">
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-sm text-white/50 mb-1">Room Code</label>
          <p
            class="text-2xl font-mono font-bold tracking-widest text-poker-gold"
          >
            {{ room.id }}
          </p>
        </div>
        <button
          class="btn-secondary flex items-center gap-2"
          @click="copyRoomLink"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          {{ isLinkCopied ? "Copied!" : "Invite" }}
        </button>
      </div>
    </div>

    <!-- Host controls -->
    <div v-if="isHost" class="flex flex-wrap gap-4">
      <button
        v-if="!isRevealed"
        class="btn-primary flex-1 flex items-center justify-center gap-2"
        :disabled="votedPlayers.length === 0"
        :class="{
          'opacity-50 cursor-not-allowed': votedPlayers.length === 0,
        }"
        @click="revealVotes"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Reveal Cards
        <span
          v-if="allPlayersVoted"
          class="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20"
        >
          All voted!
        </span>
      </button>

      <button
        v-if="isRevealed"
        class="btn-accent flex-1 flex items-center justify-center gap-2"
        @click="resetRound"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        New Round
      </button>
    </div>

    <!-- Non-host waiting message -->
    <div
      v-else-if="!isRevealed && votedPlayers.length > 0"
      class="text-center py-4"
    >
      <p class="text-white/50">Waiting for host to reveal cards...</p>
    </div>
  </div>
</template>

<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
