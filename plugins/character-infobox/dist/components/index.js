import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime"

// Compiled CSS — source is in ../src/characterInfobox.scss
const CHAR_INFOBOX_CSS = `
.char-infobox {
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.char-infobox h3.char-infobox-name {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  border-bottom: 1px solid var(--lightgray);
  padding-bottom: 0.4rem;
}
.char-infobox-portrait {
  width: 100%;
  max-width: 200px;
  border-radius: 4px;
  display: block;
  margin: 0 auto 0.6rem;
}
.char-infobox-row {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
  flex-wrap: wrap;
  margin-bottom: 0.2rem;
}
.char-infobox-label {
  font-weight: 600;
  color: var(--darkgray);
  min-width: 5rem;
  flex-shrink: 0;
  font-size: 0.8rem;
}
.char-infobox-value {
  color: var(--dark);
  font-size: 0.85rem;
  flex: 1;
}
.char-infobox-block {
  margin-bottom: 0.4rem;
}
.char-infobox-block-label {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.1rem;
}
.char-infobox-block p {
  margin: 0 0 0.15rem;
  font-size: 0.85rem;
  color: var(--dark);
}
.char-infobox-list-section {
  margin-bottom: 0.4rem;
}
.char-infobox-list-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--darkgray);
  margin-bottom: 0.1rem;
}
.char-infobox-list {
  margin: 0.1rem 0 0 1.2rem;
  padding: 0;
  font-size: 0.85rem;
  color: var(--dark);
}
.char-infobox-list li {
  margin-bottom: 0.05rem;
}
`

// Fields shown first, in this order
const FIRST_FIELDS = ["Full-Name", "Image", "Faction", "Origin", "Status", "Appears-In"]

// Fields rendered as a sub-heading + paragraph block (not a one-liner row)
const LONG_FIELDS = new Set([
  "MBTI",
  "Enneagram Tritype",
  "Enneagram-Tritype",
  "Meter-Note",
  "Meter-Self",
  "Meter-Other",
])

// Fields hidden from the infobox — structural, not content
const SKIP_FIELDS = new Set(["Class", "title"])

function renderField(key, value) {
  // Skip nullish / empty values
  if (value === undefined || value === null || value === "" || value === false) return null
  if (Array.isArray(value) && value.length === 0) return null

  // Image — portrait at top of infobox
  if (key.toLowerCase() === "image") {
    let src = Array.isArray(value) ? String(value[0]) : String(value)
    // Handle Obsidian embed syntax: ![[file.jpg]] or [[file.jpg]]
    const wikiMatch = src.match(/^!?\[\[([^\]|]+)/)
    if (wikiMatch) src = wikiMatch[1].trim()
    // Strip alias: filename.jpg|Alias
    src = src.split("|")[0].trim()
    if (!src) return null
    return _jsx("img", { class: "char-infobox-portrait", src, alt: "Character portrait" })
  }

  // Array — bulleted list
  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    if (items.length === 0) return null
    return _jsxs("div", {
      class: "char-infobox-list-section",
      children: [
        _jsx("div", { class: "char-infobox-list-label", children: key }),
        _jsx("ul", {
          class: "char-infobox-list",
          children: items.map((item, i) => _jsx("li", { children: String(item) }, String(i))),
        }),
      ],
    })
  }

  const strVal = String(value)
  if (!strVal.trim()) return null

  // Named long fields OR any string containing a newline → block with sub-heading
  if (LONG_FIELDS.has(key) || strVal.includes("\n")) {
    const paragraphs = strVal.split(/\n+/).filter((s) => s.trim())
    if (paragraphs.length === 0) return null
    return _jsxs("div", {
      class: "char-infobox-block",
      children: [
        _jsx("div", { class: "char-infobox-block-label", children: key }),
        ...paragraphs.map((p, i) => _jsx("p", { children: p }, String(i))),
      ],
    })
  }

  // Default — short scalar row: label | value
  return _jsxs("div", {
    class: "char-infobox-row",
    children: [
      _jsx("span", { class: "char-infobox-label", children: key }),
      _jsx("span", { class: "char-infobox-value", children: strVal }),
    ],
  })
}

const CharacterInfobox = ({ fileData, displayClass }) => {
  const fm = fileData?.frontmatter
  if (!fm || fm.Class !== "Character") return null

  const allKeys = Object.keys(fm).filter((k) => !SKIP_FIELDS.has(k))
  const firstKeys = FIRST_FIELDS.filter((k) => allKeys.includes(k))
  const restKeys = allKeys.filter((k) => !FIRST_FIELDS.includes(k))
  const orderedKeys = [...firstKeys, ...restKeys]

  const fieldEls = orderedKeys.map((k) => renderField(k, fm[k])).filter((el) => el !== null)

  const classes = ["char-infobox", displayClass].filter(Boolean).join(" ")
  const title =
    typeof fm.title === "string"
      ? fm.title
      : fm["Full-Name"]
        ? String(fm["Full-Name"])
        : "Character"

  return _jsxs("div", {
    class: classes,
    children: [_jsx("h3", { class: "char-infobox-name", children: title }), ...fieldEls],
  })
}

CharacterInfobox.displayName = "CharacterInfobox"
CharacterInfobox.css = CHAR_INFOBOX_CSS

export { CharacterInfobox }
