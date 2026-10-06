// Total number of steps in the builder
const TOTAL_STEPS = 5;

// Most lilies allowed in one bouquet
const MAX_LILIES = 18;

// The lily colors you can pick. "draw" is the drawing function from flowers.js.
const LILY_TYPES = [
    { key: "white", label: "White", draw: drawWhiteLily },
    { key: "stargazer", label: "Pink stargazer", draw: drawStargazerLily },
    { key: "orange", label: "Orange", draw: drawOrangeLily },
    { key: "yellow", label: "Yellow", draw: drawYellowLily },
    { key: "blush", label: "Blush pink", draw: drawBlushLily }
];

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices live here, so Back never loses them.
// lilies: how many of each color, e.g. { white: 2, orange: 1, ... }
const state = { lilies: {} };
LILY_TYPES.forEach(function (type) { state.lilies[type.key] = 0; });

// Grab the page elements we need
const steps = document.querySelectorAll(".step");
const stepLabel = document.getElementById("step-label");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");
const previewBox = document.getElementById("preview");
const lilyList = document.getElementById("lily-list");
const lilyTotalText = document.getElementById("lily-total");
const lilyMessage = document.getElementById("lily-message");

// ---------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------

// Add up all the lilies
function totalLilies() {
    let total = 0;
    LILY_TYPES.forEach(function (type) { total += state.lilies[type.key]; });
    return total;
}

// Turn Next on or off. On step 1 it needs at least 1 lily.
function updateNav() {
    backBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === 1 && totalLilies() === 0;
    // The reveal (last step) has no Next button
    nextBtn.classList.toggle("hidden", currentStep === TOTAL_STEPS);
}

// Show one step and hide the others, then update the label and buttons
function showStep(n) {
    currentStep = n;

    steps.forEach(function (section) {
        const isCurrent = Number(section.dataset.step) === n;
        section.classList.toggle("active", isCurrent);
    });

    stepLabel.textContent = "Step " + n + " of " + TOTAL_STEPS;

    // The big reveal on the last step replaces the small preview
    previewBox.classList.toggle("collapsed", n === TOTAL_STEPS);

    updateNav();
}

backBtn.addEventListener("click", function () {
    if (currentStep > 1) showStep(currentStep - 1);
});

nextBtn.addEventListener("click", function () {
    if (nextBtn.disabled) return;
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
});

// ---------------------------------------------------------------
// Step 1: lily picker
// ---------------------------------------------------------------

// Build one row per lily color: a small picture, the name, and - / + buttons
function buildLilyPicker() {
    LILY_TYPES.forEach(function (type) {
        const row = document.createElement("div");
        row.className = "lily-row";
        row.innerHTML =
            '<div class="lily-thumb">' + makeSvg(type.draw({ headOnly: true }), "2 4 96 96") + '</div>' +
            '<span class="lily-name">' + type.label + '</span>' +
            '<div class="counter">' +
            '<button type="button" class="count-btn" data-key="' + type.key + '" data-change="-1" aria-label="Fewer ' + type.label + ' lilies">&minus;</button>' +
            '<span class="count" id="count-' + type.key + '">0</span>' +
            '<button type="button" class="count-btn" data-key="' + type.key + '" data-change="1" aria-label="More ' + type.label + ' lilies">+</button>' +
            '</div>';
        lilyList.appendChild(row);
    });
}

// One listener handles every - and + button
lilyList.addEventListener("click", function (event) {
    const btn = event.target.closest(".count-btn");
    if (!btn) return;
    const key = btn.dataset.key;
    const change = Number(btn.dataset.change);
    const newCount = state.lilies[key] + change;

    // Stay between 0 and the 18-lily limit
    if (newCount < 0) return;
    if (change > 0 && totalLilies() >= MAX_LILIES) return;

    state.lilies[key] = newCount;
    updateLilyPicker();
});

// Refresh the numbers, the buttons, the message and the preview
function updateLilyPicker() {
    const total = totalLilies();

    LILY_TYPES.forEach(function (type) {
        document.getElementById("count-" + type.key).textContent = state.lilies[type.key];
    });

    // - is off at 0, + is off when the bouquet is full
    lilyList.querySelectorAll(".count-btn").forEach(function (btn) {
        const isMinus = Number(btn.dataset.change) < 0;
        btn.disabled = isMinus ? state.lilies[btn.dataset.key] === 0 : total >= MAX_LILIES;
    });

    lilyTotalText.textContent = "Lilies: " + total + " of " + MAX_LILIES;
    lilyMessage.textContent = total === 0
        ? "Add at least 1 lily to continue."
        : (total >= MAX_LILIES ? "Your bouquet is full!" : "");

    renderPreview();
    updateNav();
}

// ---------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------

// Draw the bouquet so far. Right now it only has lilies.
function renderPreview() {
    // Make one flat list of lily colors, mixing the colors together
    const list = [];
    for (let round = 0; list.length < totalLilies(); round++) {
        LILY_TYPES.forEach(function (type) {
            if (state.lilies[type.key] > round) list.push(type);
        });
    }

    const n = list.length;
    if (n === 0) {
        previewBox.innerHTML = '<p class="preview-empty">Add a lily to see your bouquet!</p>';
        return;
    }

    // The preview is drawn on a 300 x 300 canvas. All stems meet at the base point.
    const baseX = 150;
    const baseY = 285;
    // Lily size shrinks as more lilies are added, so they all fit
    const size = Math.min(0.9, 135 / (28 * Math.sqrt(n) + 47));
    const spacing = 28 * size;

    // Spread the flower heads in a round dome (a sunflower-style spiral)
    const heads = list.map(function (type, i) {
        const r = spacing * Math.sqrt(i);
        const turn = i * 137.5 * Math.PI / 180;
        return {
            type: type,
            x: baseX + r * Math.cos(turn),
            y: 130 + r * Math.sin(turn) * 0.75,
            spin: i * 37
        };
    });

    let stems = '';
    let flowers = '';
    heads.forEach(function (h) {
        // a stem from the flower head down to the base
        const path = 'M' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ' L' + baseX + ' ' + baseY;
        stems += '<path d="' + path + '" stroke="' + LEAF_LINE + '" stroke-width="' + (3.4 * size + 1.4).toFixed(1) + '" stroke-linecap="round"/>';
        stems += '<path d="' + path + '" stroke="' + LEAF_GREEN + '" stroke-width="' + (3.4 * size).toFixed(1) + '" stroke-linecap="round"/>';
    });
    // Draw the higher flowers first so the lower ones overlap them
    heads.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (h) {
        flowers += '<g transform="translate(' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ') rotate(' + h.spin + ') scale(' + size.toFixed(3) + ') translate(-50 -52)">' +
            h.type.draw({ headOnly: true }) + '</g>';
    });

    previewBox.innerHTML = makeSvg(stems + flowers, "0 0 300 300");
}

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildLilyPicker();
updateLilyPicker();
showStep(1);
