import { QuartzComponent, QuartzComponentProps } from "@jackyzha0/quartz/components/types"
import styles from "./characterInfobox.scss"

// Fields shown first, in this order
const FIRST_FIELDS = ["Full-Name", "Image", "Faction", "Origin", "Status", "Appears-In"]

// Fields rendered as sub-heading + paragraph block rather than a one-liner row
const LONG_FIELDS = new Set([
  "MBTI",
  "Enneagram Tritype",
  "Enneagram-Tritype",
  "Meter-Note",
  "Meter-Self",
  "Meter-Other",
])

// Structural fields not shown in the infobox
const SKIP_FIELDS = new Set(["Class", "title"])

function renderField(key: string, value: unknown) {
  if (value === undefined || value === null || value === "" || value === false) return null
  if (Array.isArray(value) && value.length === 0) return null

  // Image — portrait at top of infobox
  if (key.toLowerCase() === "image") {
    let src = Array.isArray(value) ? String(value[0]) : String(value)
    const wikiMatch = src.match(/^!?\[\[([^\]|]+)/)
    if (wikiMatch) src = wikiMatch[1].trim()
    src = src.split("|")[0].trim()
    if (!src) return null
    return <img class="char-infobox-portrait" src={src} alt="Character portrait" />
  }

  // Array — bulleted list
  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== null && v !== undefined && String(v).trim() !== "")
    if (items.length === 0) return null
    return (
      <div class="char-infobox-list-section">
        <div class="char-infobox-list-label">{key}</div>
        <ul class="char-infobox-list">
          {items.map((item, i) => (
            <li key={i}>{String(item)}</li>
          ))}
        </ul>
      </div>
    )
  }

  const strVal = String(value)
  if (!strVal.trim()) return null

  // Named long fields or multi-line strings → block sub-heading
  if (LONG_FIELDS.has(key) || strVal.includes("\n")) {
    const paragraphs = strVal.split(/\n+/).filter((s) => s.trim())
    if (paragraphs.length === 0) return null
    return (
      <div class="char-infobox-block">
        <div class="char-infobox-block-label">{key}</div>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    )
  }

  // Short scalar — label / value row
  return (
    <div class="char-infobox-row">
      <span class="char-infobox-label">{key}</span>
      <span class="char-infobox-value">{strVal}</span>
    </div>
  )
}

export const CharacterInfobox: QuartzComponent = ({
  fileData,
  displayClass,
}: QuartzComponentProps) => {
  const fm = fileData?.frontmatter as Record<string, unknown> | undefined
  if (!fm || fm.Class !== "Character") return <></>

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

  return (
    <div class={classes}>
      <h3 class="char-infobox-name">{title}</h3>
      {fieldEls}
    </div>
  )
}

CharacterInfobox.displayName = "CharacterInfobox"
CharacterInfobox.css = styles
