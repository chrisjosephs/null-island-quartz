import type { QuartzTransformerPlugin } from "@jackyzha0/quartz/plugins/types"
import type { Root } from "mdast"
import { visit } from "unist-util-visit"

/**
 * CommonMark compiles `***`, `---` and `___` to an identical bare <hr>, so CSS
 * has nothing to hook onto. The distinction does survive in the AST, though:
 * every thematicBreak node carries its source offset, so we can look at the
 * character it was actually written with and put that on the element.
 *
 * Output:  <hr data-hr="beat">      written as ***
 *          <hr data-hr="section">   written as --- or ___
 */

export interface Options {
  /** Vertical margin on a beat break (`***`). Frequent, so it stays tight. */
  beatMargin: string
  /** Vertical margin on a section break (`---`). Rare, so it gets the air. */
  sectionMargin: string
  /** Emit the default stylesheet. Turn off to style `[data-hr]` yourself. */
  injectCss: boolean
}

const defaults: Options = {
  beatMargin: "16px",
  sectionMargin: "32px",
  injectCss: true,
}

type Weight = "beat" | "section"

function weightAt(src: string, offset: number | undefined): Weight {
  if (typeof offset !== "number") return "section"
  // Skip any leading indentation on the line the rule starts at.
  let i = offset
  while (i < src.length && (src[i] === " " || src[i] === "\t")) i++
  return src[i] === "*" ? "beat" : "section"
}

export const HrWeights: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }

  return {
    name: "HrWeights",

    markdownPlugins() {
      return [
        () => (tree: Root, file: { value?: unknown }) => {
          const src = typeof file.value === "string" ? file.value : ""
          if (!src) return
          visit(tree, "thematicBreak", (node: any) => {
            const weight = weightAt(src, node.position?.start?.offset)
            node.data = node.data ?? {}
            node.data.hProperties = {
              ...(node.data.hProperties ?? {}),
              "data-hr": weight,
            }
          })
        },
      ]
    },

    externalResources() {
      if (!opts.injectCss) return {}
      return {
        css: [
          {
            content:
              `hr[data-hr="beat"]{margin-top:${opts.beatMargin};margin-bottom:${opts.beatMargin}}` +
              `hr[data-hr="section"]{margin-top:${opts.sectionMargin};margin-bottom:${opts.sectionMargin}}`,
            inline: true,
          },
        ],
      }
    },
  }
}

export default HrWeights

export const manifest = {
  name: "hr-weights",
  displayName: "HR Weights",
  category: "transformer",
  version: "1.0.0",
}
