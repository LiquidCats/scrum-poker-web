import { _ as __nuxt_component_0 } from './nuxt-link-7aa-msc4.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderTeleport, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
import { u as useRoom, a as usePokerDeck } from './useRoom-DNNEDPTs.mjs';
import { _ as _export_sfc, u as useRoute } from './server.mjs';
import { u as useHead } from './v3-BsPTsufE.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "PlayerAvatar",
  __ssrInlineRender: true,
  props: {
    player: {},
    showVote: { type: Boolean, default: false },
    size: { default: "md" }
  },
  setup(__props) {
    const props = __props;
    const initials = computed(() => {
      return props.player.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
    });
    const sizeClasses = computed(() => {
      switch (props.size) {
        case "sm":
          return "w-10 h-10 text-sm";
        case "lg":
          return "w-16 h-16 text-xl";
        default:
          return "w-12 h-12 text-base";
      }
    });
    const avatarColor = computed(() => {
      const colors = [
        "from-emerald-500/30 to-emerald-600/20 border-emerald-500/50",
        "from-blue-500/30 to-blue-600/20 border-blue-500/50",
        "from-purple-500/30 to-purple-600/20 border-purple-500/50",
        "from-pink-500/30 to-pink-600/20 border-pink-500/50",
        "from-amber-500/30 to-amber-600/20 border-amber-500/50",
        "from-cyan-500/30 to-cyan-600/20 border-cyan-500/50",
        "from-rose-500/30 to-rose-600/20 border-rose-500/50",
        "from-indigo-500/30 to-indigo-600/20 border-indigo-500/50"
      ];
      const hash = props.player.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col items-center gap-2" }, _attrs))}><div class="relative"><div class="${ssrRenderClass([[
        unref(sizeClasses),
        unref(avatarColor),
        {
          "ring-2 ring-poker-gold ring-offset-2 ring-offset-poker-felt shadow-glow": __props.player.hasVoted
        }
      ], "rounded-full flex items-center justify-center bg-gradient-to-br border-2 font-bold transition-all duration-300"])}">${ssrInterpolate(unref(initials))}</div>`);
      if (__props.player.hasVoted && !__props.showVote) {
        _push(`<div class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-poker-gold flex items-center justify-center"><svg class="w-3 h-3 text-poker-felt" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.player.isHost) {
        _push(`<div class="absolute -top-3 left-1/2 -translate-x-1/2 text-poker-gold"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l2.5 5 5.5.5-4 4 1 5.5L10 14l-5 3 1-5.5-4-4 5.5-.5L10 2z"></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.player.isOnline) {
        _push(`<div class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-poker-felt"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><span class="text-sm text-white/80 font-medium truncate max-w-20">${ssrInterpolate(__props.player.name)}</span>`);
      if (__props.showVote && __props.player.vote) {
        _push(`<div class="mt-1 px-3 py-1 rounded-lg bg-poker-gold/20 border border-poker-gold/30"><span class="text-poker-gold font-bold font-mono">${ssrInterpolate(__props.player.vote)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PlayerAvatar.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "PlayersTable",
  __ssrInlineRender: true,
  setup(__props) {
    const { players, votedPlayers, isRevealed, allPlayersVoted } = useRoom();
    const votingProgress = computed(() => {
      if (players.value.length === 0) return 0;
      return votedPlayers.value.length / players.value.length * 100;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PlayerAvatar = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full" }, _attrs))} data-v-5fc82e85><div class="flex items-center justify-between mb-6" data-v-5fc82e85><h2 class="text-xl font-semibold text-white/90" data-v-5fc82e85> Players <span class="text-white/50 font-normal" data-v-5fc82e85> (${ssrInterpolate(unref(votedPlayers).length)}/${ssrInterpolate(unref(players).length)} voted) </span></h2></div><div class="relative h-2 bg-white/10 rounded-full mb-8 overflow-hidden" data-v-5fc82e85><div class="absolute inset-y-0 left-0 bg-gradient-to-r from-poker-gold to-poker-gold-light rounded-full transition-all duration-500" style="${ssrRenderStyle({ width: `${unref(votingProgress)}%` })}" data-v-5fc82e85></div>`);
      if (unref(votingProgress) > 0 && !unref(allPlayersVoted)) {
        _push(`<div class="absolute inset-y-0 left-0 bg-gradient-to-r from-poker-gold to-poker-gold-light rounded-full animate-pulse" style="${ssrRenderStyle({ width: `${unref(votingProgress)}%` })}" data-v-5fc82e85></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="${ssrRenderClass([[
        unref(players).length <= 4 ? "grid-cols-2 md:grid-cols-4" : unref(players).length <= 6 ? "grid-cols-3 md:grid-cols-6" : "grid-cols-4 md:grid-cols-8"
      ], "grid gap-6"])}" data-v-5fc82e85><!--[-->`);
      ssrRenderList(unref(players), (player) => {
        _push(ssrRenderComponent(_component_PlayerAvatar, {
          key: player.id,
          player,
          "show-vote": unref(isRevealed)
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
      if (unref(players).length === 0) {
        _push(`<div class="text-center py-12" data-v-5fc82e85><div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center" data-v-5fc82e85><svg class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-5fc82e85><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" data-v-5fc82e85></path></svg></div><p class="text-white/50" data-v-5fc82e85>Waiting for players to join...</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(allPlayersVoted) && !unref(isRevealed)) {
        _push(`<div class="mt-8 text-center" data-v-5fc82e85><div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-poker-gold/20 border border-poker-gold/30 animate-pulse-glow" data-v-5fc82e85><svg class="w-5 h-5 text-poker-gold" fill="currentColor" viewBox="0 0 20 20" data-v-5fc82e85><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-5fc82e85></path></svg><span class="text-poker-gold font-medium" data-v-5fc82e85>Everyone has voted!</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PlayersTable.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-5fc82e85"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ResultsPanel",
  __ssrInlineRender: true,
  setup(__props) {
    const { votingResults, isRevealed } = useRoom();
    const maxCount = computed(() => {
      if (!votingResults.value) return 0;
      return Math.max(...Object.values(votingResults.value.distribution));
    });
    const sortedDistribution = computed(() => {
      if (!votingResults.value) return [];
      const { getNumericValue } = usePokerDeck();
      return Object.entries(votingResults.value.distribution).sort(([a], [b]) => {
        const aNum = getNumericValue(a);
        const bNum = getNumericValue(b);
        if (aNum === null && bNum === null) return 0;
        if (aNum === null) return 1;
        if (bNum === null) return -1;
        return aNum - bNum;
      });
    });
    const formatNumber = (num) => {
      if (num === null) return "-";
      return num % 1 === 0 ? num.toString() : num.toFixed(1);
    };
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(isRevealed) && unref(votingResults)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "stats-panel" }, _attrs))} data-v-d85f4e34><div class="flex items-center justify-between mb-6" data-v-d85f4e34><h2 class="text-xl font-semibold text-white/90" data-v-d85f4e34>Results</h2>`);
        if (unref(votingResults).consensus) {
          _push(`<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30" data-v-d85f4e34><svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20" data-v-d85f4e34><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-d85f4e34></path></svg><span class="text-green-400 text-sm font-medium" data-v-d85f4e34>Consensus!</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-3 gap-4 mb-8" data-v-d85f4e34><div class="text-center p-4 rounded-xl bg-white/5" data-v-d85f4e34><p class="text-white/50 text-sm mb-1" data-v-d85f4e34>Average</p><p class="text-3xl font-bold gradient-text" data-v-d85f4e34>${ssrInterpolate(formatNumber(unref(votingResults).average))}</p></div><div class="text-center p-4 rounded-xl bg-white/5" data-v-d85f4e34><p class="text-white/50 text-sm mb-1" data-v-d85f4e34>Median</p><p class="text-3xl font-bold gradient-text" data-v-d85f4e34>${ssrInterpolate(formatNumber(unref(votingResults).median))}</p></div><div class="text-center p-4 rounded-xl bg-white/5" data-v-d85f4e34><p class="text-white/50 text-sm mb-1" data-v-d85f4e34>Most Voted</p><p class="text-3xl font-bold gradient-text" data-v-d85f4e34>${ssrInterpolate(unref(votingResults).mode || "-")}</p></div></div><div data-v-d85f4e34><h3 class="text-sm text-white/50 mb-4" data-v-d85f4e34>Vote Distribution</h3><div class="space-y-3" data-v-d85f4e34><!--[-->`);
        ssrRenderList(unref(sortedDistribution), ([value, count]) => {
          _push(`<div class="flex items-center gap-4" data-v-d85f4e34><div class="w-12 h-12 flex-shrink-0 rounded-lg bg-poker-card flex items-center justify-center" data-v-d85f4e34><span class="text-poker-felt font-bold text-lg" data-v-d85f4e34>${ssrInterpolate(value)}</span></div><div class="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden" data-v-d85f4e34><div class="h-full bg-gradient-to-r from-poker-gold/60 to-poker-gold-light/60 rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3" style="${ssrRenderStyle({ width: `${count / unref(maxCount) * 100}%` })}" data-v-d85f4e34><span class="text-sm font-medium text-poker-felt/80" data-v-d85f4e34>${ssrInterpolate(count)} vote${ssrInterpolate(count !== 1 ? "s" : "")}</span></div></div><div class="w-12 text-right" data-v-d85f4e34><span class="text-white/80 font-mono" data-v-d85f4e34>${ssrInterpolate(Math.round(count / unref(votingResults).totalVotes * 100))}% </span></div></div>`);
        });
        _push(`<!--]--></div></div><div class="mt-6 pt-6 border-t border-white/10 flex justify-between text-sm text-white/50" data-v-d85f4e34><span data-v-d85f4e34>${ssrInterpolate(unref(votingResults).totalVotes)} total votes</span><span data-v-d85f4e34>${ssrInterpolate(unref(votingResults).validVotes)} numeric votes</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ResultsPanel.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-d85f4e34"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "HostControls",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      room,
      isHost,
      isRevealed,
      allPlayersVoted,
      votedPlayers
    } = useRoom();
    const issueInput = ref("");
    const isEditingIssue = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(room)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="room-card"><div class="flex items-start justify-between gap-4"><div class="flex-1 min-w-0"><label class="block text-sm text-white/50 mb-2">Current Story/Issue</label>`);
        if (unref(isEditingIssue) && unref(isHost)) {
          _push(`<div class="flex gap-2"><input id="issue-input"${ssrRenderAttr("value", unref(issueInput))} type="text" class="input-field flex-1" placeholder="Enter story or issue..."><button class="btn-primary"> Save </button><button class="btn-secondary"> Cancel </button></div>`);
        } else {
          _push(`<div class="flex items-center gap-3"><p class="${ssrRenderClass([{ "text-white/40 italic": !unref(room).currentIssue }, "text-lg text-white truncate"])}">${ssrInterpolate(unref(room).currentIssue || "No issue set")}</p>`);
          if (unref(isHost)) {
            _push(`<button class="text-poker-gold hover:text-poker-gold-light transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div></div></div><div class="room-card"><div class="flex items-center justify-between"><div><label class="block text-sm text-white/50 mb-1">Room Code</label><p class="text-2xl font-mono font-bold tracking-widest text-poker-gold">${ssrInterpolate(unref(room).id)}</p></div><button class="btn-secondary flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> Invite </button></div></div>`);
        if (unref(isHost)) {
          _push(`<div class="flex flex-wrap gap-4">`);
          if (!unref(isRevealed)) {
            _push(`<button${ssrIncludeBooleanAttr(unref(votedPlayers).length === 0) ? " disabled" : ""} class="${ssrRenderClass([{ "opacity-50 cursor-not-allowed": unref(votedPlayers).length === 0 }, "btn-primary flex-1 flex items-center justify-center gap-2"])}"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Reveal Cards `);
            if (unref(allPlayersVoted)) {
              _push(`<span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20"> All voted! </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(isRevealed)) {
            _push(`<button class="btn-accent flex-1 flex items-center justify-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> New Round </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (!unref(isRevealed) && unref(votedPlayers).length > 0) {
          _push(`<div class="text-center py-4"><p class="text-white/50"> Waiting for host to reveal cards... </p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HostControls.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PokerCard",
  __ssrInlineRender: true,
  props: {
    value: {},
    selected: { type: Boolean, default: false },
    flipped: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { default: "md" }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
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
    const isSpecialCard = computed(() => ["?", "\u2615"].includes(props.value));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: ["poker-card group", [
          unref(sizeClasses),
          {
            "selected": __props.selected,
            "flipped": __props.flipped,
            "opacity-50 cursor-not-allowed hover:translate-y-0": __props.disabled
          }
        ]],
        disabled: __props.disabled
      }, _attrs))}><div class="poker-card-inner"><div class="${ssrRenderClass([{ "text-poker-accent": unref(isSpecialCard) }, "poker-card-front"])}"><span class="absolute top-2 left-2 text-xs font-mono opacity-60">${ssrInterpolate(__props.value)}</span><span class="absolute bottom-2 right-2 text-xs font-mono opacity-60 rotate-180">${ssrInterpolate(__props.value)}</span><span class="font-display font-bold relative z-10">${ssrInterpolate(__props.value)}</span><div class="${ssrRenderClass([{ "border-poker-accent": unref(isSpecialCard) }, "absolute inset-4 border border-current opacity-10 rounded-lg"])}"></div></div><div class="poker-card-back"><div class="w-12 h-12 rounded-full bg-poker-gold/20 flex items-center justify-center"><span class="text-poker-gold text-2xl">\u2660</span></div></div></div>`);
      if (__props.selected) {
        _push(`<div class="absolute inset-0 rounded-xl bg-poker-gold/10 animate-pulse-glow pointer-events-none"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PokerCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VotingPanel",
  __ssrInlineRender: true,
  setup(__props) {
    const { player, castVote, clearVote, isRevealed } = useRoom();
    const { deck } = usePokerDeck();
    const selectedValue = computed(() => {
      var _a, _b;
      return (_b = (_a = player.value) == null ? void 0 : _a.vote) != null ? _b : null;
    });
    const handleCardSelect = (value) => {
      if (selectedValue.value === value) {
        clearVote();
      } else {
        castVote(value);
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PokerCard = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full" }, _attrs))} data-v-cb30b220><div class="flex items-center justify-between mb-6" data-v-cb30b220><h2 class="text-xl font-semibold text-white/90" data-v-cb30b220> Choose your card </h2>`);
      if (unref(selectedValue)) {
        _push(`<button class="text-sm text-poker-gold hover:text-poker-gold-light transition-colors" data-v-cb30b220> Clear selection </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-wrap justify-center gap-3 md:gap-4" data-v-cb30b220><!--[-->`);
      ssrRenderList(unref(deck), (card) => {
        _push(ssrRenderComponent(_component_PokerCard, {
          key: card.value,
          value: card.value,
          selected: unref(selectedValue) === card.value,
          disabled: unref(isRevealed),
          onSelect: handleCardSelect
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
      if (unref(selectedValue)) {
        _push(`<div class="mt-8 text-center" data-v-cb30b220><p class="text-white/60 text-sm mb-2" data-v-cb30b220>Your vote</p><div class="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-poker-gold/10 border border-poker-gold/30" data-v-cb30b220><span class="text-3xl font-bold text-poker-gold" data-v-cb30b220>${ssrInterpolate(unref(selectedValue))}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VotingPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-cb30b220"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { room, player } = useRoom();
    const roomId = computed(() => route.params.id);
    const isInRoom = computed(() => {
      var _a;
      return ((_a = room.value) == null ? void 0 : _a.id) === roomId.value && player.value !== null;
    });
    const showJoinPrompt = ref(false);
    const roomNotFound = ref(false);
    const playerName = ref("");
    const error = ref("");
    ref(false);
    useHead({
      title: () => room.value ? `${room.value.name} - Scrum Poker` : "Room - Scrum Poker"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_PlayersTable = __nuxt_component_1;
      const _component_ResultsPanel = __nuxt_component_2;
      const _component_HostControls = _sfc_main$3;
      const _component_VotingPanel = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-[calc(100vh-8rem)]" }, _attrs))} data-v-7939f6f2>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showJoinPrompt)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-7939f6f2><div class="room-card w-full max-w-md p-8 animate-bounce-in" data-v-7939f6f2><h2 class="text-2xl font-bold text-center mb-2" data-v-7939f6f2>Join Room</h2><p class="text-white/60 text-center mb-8" data-v-7939f6f2> Enter your name to join <span class="font-mono text-poker-gold" data-v-7939f6f2>${ssrInterpolate(unref(roomId))}</span></p>`);
          if (unref(error)) {
            _push2(`<div class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-v-7939f6f2>${ssrInterpolate(unref(error))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<form data-v-7939f6f2><div class="mb-6" data-v-7939f6f2><label class="block text-sm text-white/60 mb-2" data-v-7939f6f2>Your Name</label><input${ssrRenderAttr("value", unref(playerName))} type="text" class="input-field" placeholder="Enter your name" autofocus maxlength="30" data-v-7939f6f2></div><div class="flex gap-3" data-v-7939f6f2>`);
          _push2(ssrRenderComponent(_component_NuxtLink, {
            to: "/",
            class: "btn-secondary flex-1 text-center"
          }, {
            default: withCtx((_, _push3, _parent2, _scopeId) => {
              if (_push3) {
                _push3(` Back `);
              } else {
                return [
                  createTextVNode(" Back ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push2(`<button type="submit" class="btn-primary flex-1" data-v-7939f6f2> Join Room </button></div></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(isInRoom) && unref(room)) {
        _push(`<div class="max-w-7xl mx-auto px-4 py-8" data-v-7939f6f2><div class="mb-8 text-center" data-v-7939f6f2><h1 class="text-2xl md:text-3xl font-bold mb-2" data-v-7939f6f2>${ssrInterpolate(unref(room).name)}</h1>`);
        if (unref(room).currentIssue) {
          _push(`<p class="text-lg text-white/70" data-v-7939f6f2>${ssrInterpolate(unref(room).currentIssue)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid lg:grid-cols-3 gap-8" data-v-7939f6f2><div class="lg:col-span-2 space-y-8" data-v-7939f6f2><section data-v-7939f6f2>`);
        _push(ssrRenderComponent(_component_PlayersTable, null, null, _parent));
        _push(`</section><section data-v-7939f6f2>`);
        _push(ssrRenderComponent(_component_ResultsPanel, null, null, _parent));
        _push(`</section></div><div class="space-y-8" data-v-7939f6f2>`);
        _push(ssrRenderComponent(_component_HostControls, null, null, _parent));
        _push(`</div></div><section class="mt-12 pt-8 border-t border-white/10" data-v-7939f6f2>`);
        _push(ssrRenderComponent(_component_VotingPanel, null, null, _parent));
        _push(`</section></div>`);
      } else if (unref(roomNotFound)) {
        _push(`<div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4" data-v-7939f6f2><div class="text-center" data-v-7939f6f2><div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center" data-v-7939f6f2><svg class="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-7939f6f2><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-7939f6f2></path></svg></div><h2 class="text-2xl font-bold mb-2" data-v-7939f6f2>Room Not Found</h2><p class="text-white/60 mb-8" data-v-7939f6f2> The room you&#39;re looking for doesn&#39;t exist or has been closed. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "btn-primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Go Home `);
            } else {
              return [
                createTextVNode(" Go Home ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/room/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7939f6f2"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-CGXjn0Lw.mjs.map
