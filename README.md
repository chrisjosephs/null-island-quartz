# Null Island

This repository is the **renderer** for the *Null Island* project — it turns the
story's Obsidian vault into a browsable static website.

There are two ways to use what's here:

- **Read the book.** The site presents *Null Island I — Leviathan* (and what
  follows) as readable, navigable text, with character names linking to their
  pages and hover-previews along the way.
- **Geek out on the wiki.** Every character, location, and artefact has its own
  page with full front-matter detail — factions, origins, psychological
  profiles, thematic notes, the lot. It's a deep-lore reference for anyone who
  wants to fall down the rabbit hole. The hardcore-fan version: nothing hidden,
  everything catalogued.

## What this is

*Null Island* is a near-realist comitragedy set around the Year of Our LOL.
The source lives as a structured Obsidian vault (Markdown + front matter); this
project compiles that vault into HTML using [Quartz](https://quartz.jzhao.xyz/).

The vault is the single source of truth. This renderer reads it and produces:
linked character/location/artefact pages, a knowledge graph, full-text search,
backlinks, and Wikipedia-style hover-previews.

## Structure

- `content/` — the Null Island vault (the actual writing and lore). Markdown.
- `quartz/` — the Quartz site generator and custom components.
- `quartz.config.*` / `quartz.layout.*` — site configuration and layout.

Author-facing notes (anything named `*NOTES`) are excluded from the published
site by design — they're working documents, not reader content.

## Building locally

```bash
npm i
npx quartz build --serve
```

Then open the local address it prints (usually `localhost:8080`).

## Deploying

The site builds and publishes automatically via GitHub Actions on push. See
`.github/workflows/` for the deploy workflow.

---

## Built with Quartz

This site is generated using **Quartz v5**, a static-site generator that turns
Markdown into a website.

> "[One] who works with the door open gets all kinds of interruptions, but
> [they] also occasionally gets clues as to what the world is and what might be
> important." — Richard Hamming

Quartz is a set of tools that helps you publish your
[digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a
website for free.

🔗 Documentation: https://quartz.jzhao.xyz/ ·
[Quartz Discord](https://discord.gg/cRFFHYye7t) ·
[Sponsor Quartz](https://github.com/sponsors/jackyzha0)
