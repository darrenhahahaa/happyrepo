# Lilies for Kat : Lily Bouquet Builder

## What it is
A website where people build a custom lily bouquet step by step, then see it as a cute drawn picture at the end. It lives in the `happyrepo` repo and is hosted on GitHub Pages.

## User flow (step by step)
0. **Main page** (`index.html`, shows first): the design from the old `main-page.html`: big "LILIES FOR KAT" word, a swaying bouquet that changes colors, falling petals. Two pill buttons side by side (on phones, near the top under the nav): **Make a bouquet** (filled cream, opens `builder.html` at step 1) and **My bouquets** (outlined cream, opens the saved bouquets list). The nav links do the same things. The site is a gift for Kat, whose favorite flower is the lily.
1. **Lilies**: pick lily colors (white, pink stargazer, orange, yellow, blush pink) and how many of each.
2. **Filler flowers**: add things around and between the lilies: baby's breath, eucalyptus, small daisies, lavender. Optional. Max 6 of each.
3. **Wrapping**: pick a wrapping paper color (Cream, Blush, Sage, Lavender, Kraft) and a ribbon color (Mauve, Rose, Butter, Sage, White) from round swatches with names. The wrap and bow are drawn around the bouquet in the live preview and update right away. Defaults: Cream paper and Mauve ribbon, so the bouquet is never unwrapped (it is wrapped from step 1).
4. **Finishing touches**: give the bouquet a name (max 30 characters) and write a card message (max 120, with a live character count). Both optional; an empty name becomes "Bouquet for Kat". A small gift card hangs by the wrap in the preview (bottom right, tilted, with a string up toward the ribbon) and updates as you type. It shows on this step only, and is hidden while arranging.
5. **Final reveal**: show the finished bouquet drawing, big, with its name and card.

- Every step has Back and Next buttons. Going back never loses choices.
- Show which step you're on (e.g. "Step 2 of 5").
- A small live preview while building is nice to have. The reveal is the big moment.
- **Arrange it yourself**: a button under the preview. The bouquet starts with the template layout. Switch it on and any flower can be dragged (mouse or touch). The flower you pick up moves to the front. Flowers stay inside the bouquet area, a dome just above the wrap's opening (a dotted outline shows it, but only while a flower is being dragged), never outside it or down into the wrap. A dragged flower keeps its stem going into the wrap. **Reset arrangement** snaps everything back to the template. Custom positions are kept when going Back/Next and are part of the data saved to My bouquets (`getBouquetData` / `loadBouquetData` in `script.js`). Adding or removing a flower keeps all the others where they are: a new flower takes a free spot, a removed one is the last one added of that kind.

## Rules
- A bouquet must always have at least 1 lily. Next is disabled on step 1 until there is one.
- Lilies are the only main flower. Other flowers are fillers.
- The bouquet must look clean and organized, and every flower can be seen. Lilies sit in neat rings like a rounded dome: one in the middle, then a ring of 6, then an outer ring of up to 11. Front lilies are a bit lower and bigger, back ones a bit higher and smaller. They may overlap a little at the edges, but most of each bloom always shows. Every layout is balanced left to right.
- Fillers go in clear zones (all drawn behind the lilies, never covering a bloom), roughly symmetrical left to right:
  - eucalyptus: a neat frame around the back and sides
  - lavender: a few spikes spaced evenly along the back, poking above the lilies
  - baby's breath: small puffs tucked into the gaps on the edge, just peeking out
  - daisies: a neat row along the front lower edge
- All stems (lilies and fillers) are tied into one tight bundle at the bottom, where the wrapping gathers them. Stems curve neatly into it and are trimmed flat. No long messy stems.
- The bouquet is proportioned like a real one: the wrapping paper is about 40-45% of the total height and holds the bouquet. The flowers sit right at its opening, the flower dome is only a little wider than the opening, and stems are short and mostly hidden behind the paper (no long bare stems). The paper's top edge sits just below the lowest lily and is as wide as the stems are there; it narrows to a point under the tied stems. Stems enter the paper through its opening. The ribbon is a sash with a bow where the paper narrows. Flowers sit above the paper's top edge and are never covered by it. In "Arrange it yourself" flowers can't be dragged below the paper's top edge.
- Layouts are hand-made, not automatic. `bouquet.js` has a fixed table with one arrangement for every number of lilies (1 to 18, `LILY_LAYOUTS`) and one for every number of each filler (1 to 6, `FILLER_LAYOUTS`). To change how a bouquet looks, edit the numbers in those tables. Adding a flower switches to the next template layout, so the flowers can move a little (but not once the bouquet has been arranged by hand).
- Lily colors are spread out evenly (same colors as far apart as possible, not clumped), worked out the same way every time.
- No randomness anywhere in the layout: the same choices always give exactly the same bouquet.
- The whole bouquet scales down a little as flowers are added so it always fits.
- Max 18 lilies.

## Final reveal screen
- **Download picture**: save the bouquet as a PNG.
- **Save bouquet**: saves everything (lilies, fillers, hand-arranged positions, wrap, ribbon, name, card) in the browser, and shows "Saved!". If the bouquet was opened from My bouquets and then changed, it asks: "Update it" or "Save as new". Unchanged: "Already saved!". If the browser blocks saving, it says so.
- **My bouquets**: a grid of cards (small drawing + name) with **Open** (`builder.html?open=ID`, shows it in the reveal), **Use as starting point** (`builder.html?start=ID`, copies it into the builder at step 1; the saved original stays unchanged) and **Delete** (asks "Are you sure?" on the card first). It is a panel on the main page (`index.html#saved`). With no saved bouquets it shows "No bouquets yet. Make your first one!" and a Make a bouquet button. Always works, even before saving exists.
- **Make another**: start over from step 1.

## Look and feel
- Cute, illustrated, hand-drawn style. Soft colors, rounded shapes.
- The whole site matches the main page: pink-mauve gradient background (#B78AA6 to #D2A9C3 to #E6C6D6), cream text (#F8F1C4), headings in Unbounded (light, 300), small text and labels in Space Mono, thin cream divider lines, small monospace labels like "Step 2 of 5", and rounded pill buttons (filled cream with mauve text = main action, outlined cream = second action). Both fonts load from Google Fonts.
- Text must stay easy to read: on the builder, text sits on mauve cards (`--panel`), not straight on the light part of the gradient.
- Use the shared classes in `style.css` for anything new (final reveal, My bouquets, form fields): `.btn` with `.btn-fill` or `.btn-line`, and the card, heading and divider styles already there.
- Bouquet drawn with SVG in code. No image files, no AI-generated images.
- Works well on phones.

## Tech
- Plain HTML, CSS, and JavaScript. No frameworks, no build step, no npm.
- Files:
  - `index.html`: the main page. It has its own styles and script inline and does not use `style.css` or `script.js`. It also holds two panels that open from the address: "My bouquets" (`#saved`) and "A note for Kat" (`#note`, a card with her note, exact words fixed: do not edit the wording).
  - `builder.html`: the step-by-step bouquet builder, styled to match the main page. Uses `style.css`, `flowers.js`, `bouquet.js` and `script.js`.
  - `style.css`, `script.js`: the builder's styles (the main page look, see Look and feel) and logic. `gallery.html` uses `style.css` too.
  - `flowers.js`: all SVG drawings for the builder: lilies, fillers, wrapping, ribbon.
  - `bouquet.js`: the hand-made bouquet layouts, the code that draws a whole bouquet (`drawBouquet`), and the code for arranging by hand (`startArrangement`, `arrangementAdd`, `arrangementRemove`, `clampToArea`). No page code, so the builder and the gallery both use it. Also holds the lily and filler lists and the limits.
  - `gallery.html`: test page that shows every drawing and the bouquet layouts (1, 3, 6, 9, 12 and 18 lilies, with and without fillers, and the filler layouts 1 to 6).
- Hosted on GitHub Pages from the `main` branch root, so all file paths must be relative.
- Saving uses `localStorage` (key: `happy-lilies-bouquets`), wrapped in try/catch. The save helpers (`readSavedBouquets`, `writeSavedBouquets`, `savedName`, `savedPicture`) are in `bouquet.js`, so the builder and the main page share them. Each saved bouquet is `{id, savedAt, name, message, lilies, fillers, arrangement, wrap, ribbon}`. The main page loads `flowers.js` and `bouquet.js` to draw the small pictures.
- PNG download: draw the SVG onto a canvas, then export as PNG.
- No backend, no API keys, no prices or payments.

## Build order
1. Step-by-step shell (5 steps with Back/Next)
2. Lily picker + drawing
3. Filler flowers
4. Wrapping + ribbon
5. Name + card message
6. Final reveal + download PNG
7. Save + My bouquets

## Working with me
- I'm new to coding. Explain what you changed in a few plain sentences.
- Build one feature at a time, then tell me how to test it with Live Server.
- Add short comments in the code so I can follow it.
- Don't commit or push. I'll do that myself. Suggest a commit message when a feature is done.
