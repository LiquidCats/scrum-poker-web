import { _ as __nuxt_component_0 } from "./nuxt-link-7aa-msc4.js";
import { defineComponent, mergeProps, withCtx, createVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
import { u as useRoom } from "./useRoom-DNNEDPTs.js";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/ishabanov/Code/scrum-poker-web/frontend/node_modules/defu/dist/defu.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { room } = useRoom();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col noise-overlay" }, _attrs))}><header class="relative z-10 px-6 py-4 border-b border-white/5"><div class="max-w-7xl mx-auto flex items-center justify-between">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-3 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-poker-gold to-poker-gold-light flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform"${_scopeId}><span class="text-poker-felt text-xl"${_scopeId}>♠</span></div><span class="text-xl font-display font-bold gradient-text"${_scopeId}> Scrum Poker </span>`);
          } else {
            return [
              createVNode("div", { class: "w-10 h-10 rounded-xl bg-gradient-to-br from-poker-gold to-poker-gold-light flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform" }, [
                createVNode("span", { class: "text-poker-felt text-xl" }, "♠")
              ]),
              createVNode("span", { class: "text-xl font-display font-bold gradient-text" }, " Scrum Poker ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(room)) {
        _push(`<div class="flex items-center gap-4"><span class="hidden sm:block text-white/50 text-sm"> Room: <span class="font-mono text-poker-gold">${ssrInterpolate(unref(room).id)}</span></span><button class="text-white/50 hover:text-white transition-colors text-sm flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> Leave </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header><main class="flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="relative z-10 px-6 py-4 border-t border-white/5"><div class="max-w-7xl mx-auto flex items-center justify-between text-sm text-white/30"><span>Built with Nuxt 3</span><div class="flex items-center gap-4"><a href="#" class="hover:text-poker-gold transition-colors">Help</a><a href="#" class="hover:text-poker-gold transition-colors">GitHub</a></div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=default-DATqDoY0.js.map
