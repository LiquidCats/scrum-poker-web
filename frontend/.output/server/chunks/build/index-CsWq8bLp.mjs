import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useRoom } from './useRoom-DNNEDPTs.mjs';
import { _ as _export_sfc, n as navigateTo } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { room } = useRoom();
    const activeTab = ref("create");
    const playerName = ref("");
    const roomName = ref("");
    const roomCode = ref("");
    const error = ref("");
    const isLoading = ref(false);
    if (room.value) {
      navigateTo(`/room/${room.value.id}`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12" }, _attrs))} data-v-9673ea35><div class="w-full max-w-md" data-v-9673ea35><div class="text-center mb-12" data-v-9673ea35><div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-poker-gold to-poker-gold-light shadow-glow mb-6 animate-float" data-v-9673ea35><span class="text-poker-felt text-4xl" data-v-9673ea35>\u2660</span></div><h1 class="text-4xl md:text-5xl font-display font-bold mb-4" data-v-9673ea35><span class="gradient-text" data-v-9673ea35>Scrum Poker</span></h1><p class="text-white/60 text-lg" data-v-9673ea35> Real-time planning poker for agile teams </p></div><div class="room-card p-8" data-v-9673ea35><div class="flex rounded-xl bg-white/5 p-1 mb-8" data-v-9673ea35><button class="${ssrRenderClass([unref(activeTab) === "create" ? "bg-poker-gold text-poker-felt" : "text-white/60 hover:text-white", "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"])}" data-v-9673ea35> Create Room </button><button class="${ssrRenderClass([unref(activeTab) === "join" ? "bg-poker-gold text-poker-felt" : "text-white/60 hover:text-white", "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"])}" data-v-9673ea35> Join Room </button></div>`);
      if (unref(error)) {
        _push(`<div class="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-v-9673ea35>${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<form data-v-9673ea35><div class="mb-4" data-v-9673ea35><label class="block text-sm text-white/60 mb-2" data-v-9673ea35>Your Name</label><input${ssrRenderAttr("value", unref(playerName))} type="text" class="input-field" placeholder="Enter your name" maxlength="30" data-v-9673ea35></div>`);
      if (unref(activeTab) === "create") {
        _push(`<div class="mb-6" data-v-9673ea35><label class="block text-sm text-white/60 mb-2" data-v-9673ea35>Room Name (optional)</label><input${ssrRenderAttr("value", unref(roomName))} type="text" class="input-field" placeholder="Sprint Planning" maxlength="50" data-v-9673ea35></div>`);
      } else {
        _push(`<div class="mb-6" data-v-9673ea35><label class="block text-sm text-white/60 mb-2" data-v-9673ea35>Room Code</label><input${ssrRenderAttr("value", unref(roomCode))} type="text" class="input-field font-mono text-center text-xl tracking-widest uppercase" placeholder="ABC123" maxlength="6" data-v-9673ea35></div>`);
      }
      _push(`<button type="submit" class="btn-primary w-full flex items-center justify-center gap-2"${ssrIncludeBooleanAttr(unref(isLoading)) ? " disabled" : ""} data-v-9673ea35>`);
      if (unref(isLoading)) {
        _push(`<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-9673ea35><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-9673ea35></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-9673ea35></path></svg>`);
      } else {
        _push(`<!--[-->${ssrInterpolate(unref(activeTab) === "create" ? "Create Room" : "Join Room")} <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9673ea35><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" data-v-9673ea35></path></svg><!--]-->`);
      }
      _push(`</button></form></div><div class="mt-12 grid grid-cols-3 gap-4 text-center" data-v-9673ea35><div class="p-4" data-v-9673ea35><div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center" data-v-9673ea35><svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9673ea35><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-9673ea35></path></svg></div><p class="text-sm text-white/50" data-v-9673ea35>Real-time</p></div><div class="p-4" data-v-9673ea35><div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center" data-v-9673ea35><svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9673ea35><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" data-v-9673ea35></path></svg></div><p class="text-sm text-white/50" data-v-9673ea35>Team-friendly</p></div><div class="p-4" data-v-9673ea35><div class="w-10 h-10 mx-auto mb-3 rounded-xl bg-poker-gold/10 flex items-center justify-center" data-v-9673ea35><svg class="w-5 h-5 text-poker-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9673ea35><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-9673ea35></path></svg></div><p class="text-sm text-white/50" data-v-9673ea35>Analytics</p></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9673ea35"]]);

export { index as default };
//# sourceMappingURL=index-CsWq8bLp.mjs.map
