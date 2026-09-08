// src/index.ts
import { visit } from "unist-util-visit";
var defaults = {
  callouts: ["todo"],
  mode: "strip",
  param: "development"
};
function openerRe(callouts) {
  const alt = callouts.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`^\\s*>\\s*\\[!(?:${alt})\\][-+]?`, "i");
}
function stripFromSource(src, callouts) {
  const opener = openerRe(callouts);
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!opener.test(lines[i])) {
      out.push(lines[i]);
      continue;
    }
    while (i < lines.length && /^\s*>/.test(lines[i])) i++;
    if (i < lines.length && lines[i].trim() === "") i++;
    i--;
  }
  return out.join("\n");
}
function calloutType(node) {
  const props = node.properties ?? {};
  const raw = props["data-callout"] ?? props["dataCallout"];
  return typeof raw === "string" ? raw.toLowerCase() : void 0;
}
var HideTodos = (userOpts) => {
  const opts = { ...defaults, ...userOpts };
  const wanted = new Set(opts.callouts.map((c) => c.toLowerCase()));
  return {
    name: "HideTodos",
    textTransform(_ctx, src) {
      return opts.mode === "strip" ? stripFromSource(src, opts.callouts) : src;
    },
    htmlPlugins() {
      if (opts.mode !== "toggle") return [];
      return [
        () => (tree) => {
          visit(tree, "element", (node, _i, parent) => {
            if (node.tagName !== "blockquote" || !parent) return;
            const type = calloutType(node);
            if (!type || !wanted.has(type)) return;
            node.properties = {
              ...node.properties,
              className: [
                ...Array.isArray(node.properties?.className) ? node.properties.className : [],
                "author-only"
              ],
              hidden: true
            };
          });
        }
      ];
    },
    externalResources() {
      if (opts.mode !== "toggle") return {};
      const param = JSON.stringify(opts.param);
      return {
        css: [
          {
            content: `.author-only[hidden]{display:none!important}
.author-only{border-left-color:#d40000!important}
body.dev-mode .author-only[hidden]{display:block!important}
body.dev-mode .author-only::after{content:"author only \u2014 not published";display:block;font-size:.75em;opacity:.7;padding:.2rem .8rem}`,
            inline: true
          }
        ],
        js: [
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            spaPreserve: true,
            // Re-applied on SPA navigation, and remembered so the switch
            // survives clicking through to another page.
            script: `(function(){var K="quartz-dev-mode";function apply(){try{
var p=new URLSearchParams(location.search).get(${param});
if(p!==null)localStorage.setItem(K,p==="1"||p==="true"?"1":"0");
document.body.classList.toggle("dev-mode",localStorage.getItem(K)==="1");
}catch(e){}}apply();document.addEventListener("nav",apply);})()`
          }
        ]
      };
    }
  };
};
var index_default = HideTodos;
var manifest = {
  name: "hide-todos",
  displayName: "Hide Todos",
  category: "transformer",
  version: "1.0.0"
};
export {
  HideTodos,
  index_default as default,
  manifest
};
