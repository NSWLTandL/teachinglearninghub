# Linking the TEP booklets and decks on the site

This explains where the files live and how to turn the grey **"Coming soon"** download
cards into working download links. No new CSS is needed — it reuses the site's existing
`.download-card` style.

## 1. Why the files go in the repo (not the project store)

The Claude **project Files** store only accepts text-extractable formats: PDF, DOCX, CSV,
TXT, HTML, ODT, RTF, EPUB, JSON, XLSX. **.pptx is rejected** — that is the upload error
you hit. So the binaries (`.pptx`, `.docx`) live in the **GitHub repo**, which is also what
serves them for download. (For the project store, upload the **PDF** copies of the decks
instead — see the `project-upload-pdfs` folder.)

## 2. Put the files in a `downloads/` folder

Commit the contents of the `downloads/` folder to the repo root, as `downloads/`:

```
teachinglearning/
  downloads/
    TEP-Pillar1-Behaviour-and-Climate-booklet.docx
    TEP-Pillar1-Behaviour-and-Climate-deck.pptx
    TEP-Pillar3-Instruction-and-Modelling-booklet.docx
    TEP-Pillar3-Instruction-and-Modelling-deck.pptx
    TEP-Pillar4-Checking-for-Understanding-booklet.docx
    TEP-Pillar4-Checking-for-Understanding-deck.pptx
    TEP-Pillar5-Questioning-and-Dialogue-booklet.docx
    TEP-Pillar5-Questioning-and-Dialogue-deck.pptx
```

GitHub Pages then serves each one at:

```
https://nswltandl.github.io/teachinglearning/downloads/<filename>
```

A relative link from any page in the repo root (`href="downloads/<filename>"`) resolves to
the same place — so the snippets below work from every module page.

**Naming convention** (keep it exact, no spaces):
`TEP-Pillar{N}-{Topic}-{booklet|deck}.{docx|pptx}`

## 3. Turn a "Coming soon" card into a live link

A live card is the same markup with **`<span class="download-card download-soon">`**
swapped for **`<a class="download-card" href="…" download>`**, and the `.dl-soon`
"Coming soon" line removed:

```html
<!-- before -->
<span class="download-card download-soon"><div class="type">Slide Deck</div><div class="name">Module 4.1 Slides</div><div class="size">.pptx · 25-min session</div><div class="dl-soon">Coming soon</div></span>

<!-- after -->
<a class="download-card" href="downloads/TEP-Pillar4-Checking-for-Understanding-deck.pptx" download><div class="type">Facilitator Deck</div><div class="name">Checking for Understanding — Slides</div><div class="size">.pptx · session deck</div></a>
```

`download` prompts a save for the `.docx`/`.pptx`; use `target="_blank"` instead for a PDF
you want to open in the browser.

## 4. Worked example

`module-4-1-mini-whiteboards.html` (in this folder) has its **Downloads** section already
wired — open it and copy the pattern. Because the resources are **per pillar**, the same two
files serve every module in that pillar; the section is relabelled "Session resources" to
say so.

## 5. Ready-to-paste blocks (one per pillar)

Drop the matching block in place of the three "Coming soon" cards inside
`<div class="downloads"> … </div>` on each module page (and/or on the pillar landing).

**Pillar 1 — Behaviour & Climate**
```html
<a class="download-card" href="downloads/TEP-Pillar1-Behaviour-and-Climate-booklet.docx" download><div class="type">CPD Booklet</div><div class="name">Behaviour &amp; Climate — Booklet</div><div class="size">.docx · printable</div></a>
<a class="download-card" href="downloads/TEP-Pillar1-Behaviour-and-Climate-deck.pptx" download><div class="type">Facilitator Deck</div><div class="name">Behaviour &amp; Climate — Slides</div><div class="size">.pptx · session deck</div></a>
```

**Pillar 3 — Instruction & Modelling**
```html
<a class="download-card" href="downloads/TEP-Pillar3-Instruction-and-Modelling-booklet.docx" download><div class="type">CPD Booklet</div><div class="name">Instruction &amp; Modelling — Booklet</div><div class="size">.docx · printable</div></a>
<a class="download-card" href="downloads/TEP-Pillar3-Instruction-and-Modelling-deck.pptx" download><div class="type">Facilitator Deck</div><div class="name">Instruction &amp; Modelling — Slides</div><div class="size">.pptx · session deck</div></a>
```

**Pillar 4 — Checking for Understanding**
```html
<a class="download-card" href="downloads/TEP-Pillar4-Checking-for-Understanding-booklet.docx" download><div class="type">CPD Booklet</div><div class="name">Checking for Understanding — Booklet</div><div class="size">.docx · printable</div></a>
<a class="download-card" href="downloads/TEP-Pillar4-Checking-for-Understanding-deck.pptx" download><div class="type">Facilitator Deck</div><div class="name">Checking for Understanding — Slides</div><div class="size">.pptx · session deck</div></a>
```

**Pillar 5 — Questioning & Dialogue**
```html
<a class="download-card" href="downloads/TEP-Pillar5-Questioning-and-Dialogue-booklet.docx" download><div class="type">CPD Booklet</div><div class="name">Questioning &amp; Dialogue — Booklet</div><div class="size">.docx · printable</div></a>
<a class="download-card" href="downloads/TEP-Pillar5-Questioning-and-Dialogue-deck.pptx" download><div class="type">Facilitator Deck</div><div class="name">Questioning &amp; Dialogue — Slides</div><div class="size">.pptx · session deck</div></a>
```

## 6. Note on the external (generic) site

These files are the **internal**, Nishkam-framed resources, so they belong on the internal
module pages only. The external site's "Coming soon" cards need the **generic** versions
(virtues and Gurbani out of the instructional spine) — those are a separate build.
