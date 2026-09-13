// src/index.ts
import { visit } from "unist-util-visit";
var defaults = {
  beatMargin: "16px",
  sectionMargin: "32px",
  injectCss: true
};
function weightAt(src, offset) {
  if (typeof offset !== "number") return "section";
  let i = offset;
  while (i < src.length && (src[i] === " " || src[i] === "	")) i++;
  return src[i] === "*" ? "beat" : "section";
}
var HrWeights = (userOpts) => {
  const opts = { ...defaults, ...userOpts };
  return {
    name: "HrWeights",
    markdownPlugins() {
      return [
        () => (tree, file) => {
          const src = typeof file.value === "string" ? file.value : "";
          if (!src) return;
          visit(tree, "thematicBreak", (node) => {
            const weight = weightAt(src, node.position?.start?.offset);
            node.data = node.data ?? {};
            node.data.hProperties = {
              ...node.data.hProperties ?? {},
              "data-hr": weight
            };
          });
        }
      ];
    },
    externalResources() {
      if (!opts.injectCss) return {};
      return {
        css: [
          {
            content: `hr[data-hr="beat"]{margin-top:${opts.beatMargin};margin-bottom:${opts.beatMargin}}hr[data-hr="section"]{margin-top:${opts.sectionMargin};margin-bottom:${opts.sectionMargin}}`,
            inline: true
          }
        ]
      };
    }
  };
};
var index_default = HrWeights;
var manifest = {
  name: "hr-weights",
  displayName: "HR Weights",
  category: "transformer",
  version: "1.0.0"
};
export {
  HrWeights,
  index_default as default,
  manifest
};
