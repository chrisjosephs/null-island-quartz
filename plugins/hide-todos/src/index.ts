import type { QuartzTransformerPlugin } from "@jackyzha0/quartz/plugins/types"
import type { Root, Element, Parent } from "hast"
import { visit } from "unist-util-visit"

export interface Options {
  /** Callout types treated as author-only. Matched case-insensitively. */
  callouts: string[]
  /**
   * strip  - removed from the source before it is parsed. The text never
   *          reaches the HTML, the search index, the RSS feed or the page
   *          description. Nothing to reveal, so no switch.
   * toggle - shipped in the HTML but hidden, revealed by the query param.
   *          Convenient, but the text IS in the published page source.
   */
  mode: "strip" | "toggle"
  /** Query param that reveals hidden callouts in toggle mode: ?development=1 */
  param: string
}

const defaults: Options = {
  callouts: ["todo"],
  mode: "strip",
  param: "development",
}

/** Matches the opening line of a callout, e.g. `> [!todo] Title` (any indent). */
function openerRe(callouts: string[]): RegExp {
  const alt = callouts.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
  return new RegExp(`^\\s*>\\s*\\[!(?:${alt})\\][-+]?`, "i")
}

/**
 * Deletes whole callout blocks from raw markdown. A callout is a blockquote, so
 * it runs from its opening line to the first line that is not `>`-prefixed.
 */
function stripFromSource(src: string, callouts: string[]): string {
  const opener = openerRe(callouts)
  const lines = src.split("\n")
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    if (!opener.test(lines[i])) {
      out.push(lines[i])
      continue
    }
    // Consume the rest of the blockquote.
    while (i < lines.length && /^\s*>/.test(lines[i])) i++
    // Swallow one trailing blank line so we don't leave a double gap.
    if (i < lines.length && lines[i].trim() === "") i++
    i--
  }

  return out.join("\n")
}

/** hast stores `data-callout` under either key depending on how it was built. */
function calloutType(node: Element): string | undefined {
  const props = (node.properties ?? {}) as Record<string, unknown>
  const raw = props["data-callout"] ?? props["dataCallout"]
  return typeof raw === "string" ? raw.toLowerCase() : undefined
}

export const HideTodos: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaults, ...userOpts }
  const wanted = new Set(opts.callouts.map((c) => c.toLowerCase()))

  return {
    name: "HideTodos",

    textTransform(_ctx, src) {
      return opts.mode === "strip" ? stripFromSource(src, opts.callouts) : src
    },

    htmlPlugins() {
      if (opts.mode !== "toggle") return []
      return [
        () => (tree: Root) => {
          visit(tree, "element", (node: Element, _i, parent: Parent | undefined) => {
            if (node.tagName !== "blockquote" || !parent) return
            const type = calloutType(node)
            if (!type || !wanted.has(type)) return
            node.properties = {
              ...node.properties,
              className: [
                ...(Array.isArray(node.properties?.className) ? node.properties.className : []),
                "author-only",
              ],
              hidden: true,
            }
          })
        },
      ]
    },

    externalResources() {
      if (opts.mode !== "toggle") return {}
      const param = JSON.stringify(opts.param)
      return {
        css: [
          {
            content: `.author-only[hidden]{display:none!important}
.author-only{border-left-color:#d40000!important}
body.dev-mode .author-only[hidden]{display:block!important}
body.dev-mode .author-only::after{content:"author only — not published";display:block;font-size:.75em;opacity:.7;padding:.2rem .8rem}`,
            inline: true,
          },
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
}catch(e){}}apply();document.addEventListener("nav",apply);})()`,
          },
        ],
      }
    },
  }
}

export default HideTodos

export const manifest = {
  name: "hide-todos",
  displayName: "Hide Todos",
  category: "transformer",
  version: "1.0.0",
}
