# Lilies for Kat : Lily Bouquet Builder

## What it is
A website where people build a custom lily bouquet step by step, then see it as a cute drawn picture at the end. It lives in the `happyrepo` repo and is hosted on GitHub Pages.

## User flow (step by step)
1. **Lilies**: pick lily colors (white, pink stargazer, orange, yellow, blush pink) and how many of each.
2. **Filler flowers**: add things around the lilies: baby's breath, eucalyptus, small daisies, lavender. Optional.
3. **Wrapping**: pick a wrapping paper color and a ribbon color.
4. **Finishing touches**: give the bouquet a name and write a card message. Both optional.
5. **Final reveal**: show the finished bouquet drawing, big, with its name and card.

- Every step has Back and Next buttons. Going back never loses choices.
- Show which step you're on (e.g. "Step 2 of 5").
- A small live preview while building is nice to have. The reveal is the big moment.

## Rules
- A bouquet must always have at least 1 lily. Next is disabled on step 1 until there is one.
- Lilies are the only main flower. Other flowers are fillers around them.
- Max 18 lilies.

## Final reveal screen
- **Download picture**: save the bouquet as a PNG.
- **Save bouquet**: saves it in the browser so it shows up in a "My bouquets" list.
- **My bouquets**: see saved bouquets, open one, use one as the starting point for a new bouquet, or delete one.
- **Make another**: start over from step 1.

## Look and feel
- Cute, illustrated, hand-drawn style. Soft colors, rounded shapes.
- Bouquet drawn with SVG in code. No image files, no AI-generated images.
- Works well on phones.

## Tech
- Plain HTML, CSS, and JavaScript. No frameworks, no build step, no npm.
- Files: `index.html`, `style.css`, `script.js`, `flowers.js` (all SVG drawings: lilies, fillers, wrapping, ribbon), `gallery.html` (test page that shows every drawing).
- The current `index.html` is an older one-page version. Its lily drawing code can be reused.
- Hosted on GitHub Pages from the `main` branch root, so all file paths must be relative.
- Saving uses `localStorage` (key: `happy-lilies-bouquets`), wrapped in try/catch.
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
