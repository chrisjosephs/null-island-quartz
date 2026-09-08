# hide-todos

Keeps author-only callouts out of the published Null Island site. Written for the `> [!todo]` convention documented in the vault's `CLAUDE.md`.

## Two modes, and the difference matters

**`mode: strip` (default, what the site currently runs).** Implemented as a `textTransform`, so it deletes the callout from the raw markdown *before Quartz parses it*. The text therefore never reaches the HTML, the search index (`contentIndex.json`), the RSS feed, or the page description. There is nothing on the published site to reveal, which is also why the `?development=1` switch does nothing in this mode — that is the point, not an omission.

**`mode: toggle`.** Ships the callout in the HTML with `hidden` set, and adds a small script that reveals it when the page is loaded with `?development=1`. The choice is remembered in `localStorage`, so it survives clicking through to other pages, and it re-applies on SPA navigation (`enableSPA` is on). **The callout text is present in the published page source in this mode.** Anyone can read it with view-source, and it will be in the search index. Use it for untidiness you don't mind strangers reading, not for spoilers or unpublished notes.

A query parameter cannot be a privacy boundary on a static site. If you want the switch *and* real privacy, run two builds: the public one with `strip`, and a local `npx quartz build --serve` with `toggle` for yourself.

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `mode` | `strip` | `strip` or `toggle`, as above |
| `callouts` | `["todo"]` | Callout types treated as author-only, matched case-insensitively |
| `param` | `development` | Query param that reveals callouts in toggle mode |

Registered in `quartz.config.yaml` at `order: 1` so the strip happens before anything parses the markdown.

## What it matches

The opening line of a callout at any indentation, collapsed (`[!todo]-`) or not, in any case. It then consumes the rest of the blockquote up to the first non-`>` line, plus one trailing blank line. A `[!todo]` written mid-sentence in body text is left alone.

Known limit: a todo callout **nested inside another callout** is not removed, because the inner block never starts a line with a bare `>`. Don't nest them.

## Building

```
cd plugins/hide-todos && npm run build
```

`dist/` is committed, matching `character-infobox`.
