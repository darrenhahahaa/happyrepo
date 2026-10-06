// Total number of steps in the builder
const TOTAL_STEPS = 5;

// Most lilies allowed in one bouquet
const MAX_LILIES = 18;

// Most of each filler flower (so the preview never gets too crowded)
const MAX_EACH_FILLER = 6;

// The lily colors you can pick. "draw" is the drawing function from flowers.js.
const LILY_TYPES = [
    { key: "white", label: "White", draw: drawWhiteLily },
    { key: "stargazer", label: "Pink stargazer", draw: drawStargazerLily },
    { key: "orange", label: "Orange", draw: drawOrangeLily },
    { key: "yellow", label: "Yellow", draw: drawYellowLily },
    { key: "blush", label: "Blush pink", draw: drawBlushLily }
];

// The filler flowers you can add (all optional)
const FILLER_TYPES = [
    { key: "babys", label: "Baby's breath", draw: drawBabysBreath },
    { key: "eucalyptus", label: "Eucalyptus", draw: drawEucalyptus },
    { key: "daisies", label: "Small daisies", draw: drawDaisies },
    { key: "lavender", label: "Lavender", draw: drawLavender }
];

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices live here, so Back never loses them.
// lilies:  how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillers: how many of each filler,     e.g. { babys: 1, lavender: 2, ... }
const state = { lilies: {}, fillers: {} };
LILY_TYPES.forEach(function (type) { state.lilies[type.key] = 0; });
FILLER_TYPES.forEach(function (type) { state.fillers[type.key] = 0; });

// Grab the page elements we need
const steps = document.querySelectorAll(".step");
const stepLabel = document.getElementById("step-label");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");
const previewBox = document.getElementById("preview");
const lilyList = document.getElementById("lily-list");
const lilyTotalText = document.getElementById("lily-total");
const lilyMessage = document.getElementById("lily-message");
const fillerList = document.getElementById("filler-list");

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
// Pickers (step 1 lilies and step 2 fillers work the same way)
// ---------------------------------------------------------------

// Build one row per flower: a small picture, the name, and - / + buttons.
// group is "lilies" or "fillers" (the part of `state` these counts live in).
function buildPicker(container, types, group, thumbBox) {
    types.forEach(function (type) {
        const row = document.createElement("div");
        row.className = "lily-row";
        row.innerHTML =
            '<div class="lily-thumb">' + makeSvg(type.draw({ headOnly: true }), thumbBox) + '</div>' +
            '<span class="lily-name">' + type.label + '</span>' +
            '<div class="counter">' +
            '<button type="button" class="count-btn" data-group="' + group + '" data-key="' + type.key + '" data-change="-1" aria-label="Fewer ' + type.label + '">&minus;</button>' +
            '<span class="count" id="count-' + type.key + '">0</span>' +
            '<button type="button" class="count-btn" data-group="' + group + '" data-key="' + type.key + '" data-change="1" aria-label="More ' + type.label + '">+</button>' +
            '</div>';
        container.appendChild(row);
    });
}

// Can this flower go up by one? Lilies share a total limit; each filler has its own.
function canAdd(group, key) {
    if (group === "lilies") return totalLilies() < MAX_LILIES;
    return state.fillers[key] < MAX_EACH_FILLER;
}

// One listener handles every - and + button in both pickers
function handleCountClick(event) {
    const btn = event.target.closest(".count-btn");
    if (!btn) return;
    const group = btn.dataset.group;
    const key = btn.dataset.key;
    const change = Number(btn.dataset.change);

    // Stay between 0 and the limit
    if (state[group][key] + change < 0) return;
    if (change > 0 && !canAdd(group, key)) return;

    state[group][key] += change;
    updatePickers();
}
lilyList.addEventListener("click", handleCountClick);
fillerList.addEventListener("click", handleCountClick);

// Refresh the numbers, the buttons, the messages and the preview
function updatePickers() {
    const total = totalLilies();

    LILY_TYPES.forEach(function (type) {
        document.getElementById("count-" + type.key).textContent = state.lilies[type.key];
    });
    FILLER_TYPES.forEach(function (type) {
        document.getElementById("count-" + type.key).textContent = state.fillers[type.key];
    });

    // - is off at 0, + is off at the limit
    document.querySelectorAll(".count-btn").forEach(function (btn) {
        const isMinus = Number(btn.dataset.change) < 0;
        btn.disabled = isMinus
            ? state[btn.dataset.group][btn.dataset.key] === 0
            : !canAdd(btn.dataset.group, btn.dataset.key);
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

// Turn counts into one flat list that mixes the types together,
// e.g. { white: 2, orange: 1 } becomes [white, orange, white]
function mixedList(types, counts) {
    const list = [];
    let total = 0;
    types.forEach(function (type) { total += counts[type.key]; });
    for (let round = 0; list.length < total; round++) {
        types.forEach(function (type) {
            if (counts[type.key] > round) list.push(type);
        });
    }
    return list;
}

// Draw the bouquet so far: fillers at the back, then the lilies on top
function renderPreview() {
    const lilies = mixedList(LILY_TYPES, state.lilies);
    const n = lilies.length;
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
    const heads = lilies.map(function (type, i) {
        const r = spacing * Math.sqrt(i);
        const turn = i * 137.5 * Math.PI / 180;
        return {
            type: type,
            x: baseX + r * Math.cos(turn),
            y: 130 + r * Math.sin(turn) * 0.75,
            spin: i * 37
        };
    });

    // ----- fillers (drawn first, so they sit behind the lilies) -----
    // The lily dome is roughly an oval around (150, 130). Fillers stick out past its edge.
    const reach = spacing * Math.sqrt(n - 1);
    const domeW = reach + 47 * size;
    const domeH = reach * 0.75 + 47 * size;
    function insideDome(x, y) {
        const dx = (x - 150) / domeW;
        const dy = (y - 130) / domeH;
        return dx * dx + dy * dy <= 1;
    }

    const fillers = mixedList(FILLER_TYPES, state.fillers);
    const m = fillers.length;
    // Fan the fillers out evenly from -55 to +55 degrees. A stride mixes the kinds up.
    let stride = Math.max(1, Math.round(m / 3));
    while (m > 1 && gcd(stride, m) !== 1) stride++;

    let fillerSvg = '';
    fillers.forEach(function (type, i) {
        const slot = (i * stride) % m;
        const degrees = m === 1 ? 20 : -55 + 110 * slot / (m - 1);
        const a = degrees * Math.PI / 180;

        // walk out from the base along this angle to find where the lily dome ends
        let edge = 0;
        for (let d = 0; d < 400; d += 2) {
            if (insideDome(baseX + d * Math.sin(a), baseY - d * Math.cos(a))) edge = d;
        }
        // reach a bit past the dome (a different amount each time so it looks natural)
        let tip = (edge > 0 ? edge : 120) + 22 + (i % 3) * 9;
        // never go off the edges of the picture
        tip = Math.min(tip, 275, Math.abs(Math.sin(a)) > 0.01 ? 120 / Math.abs(Math.sin(a)) : 275);
        const scale = Math.max(0.5, tip / 128);

        // the drawing is 100 x 140 with its stem at the bottom middle, so
        // turn it around that point and place the stem at the base
        fillerSvg += '<g transform="translate(' + baseX + ' ' + baseY + ') rotate(' + degrees.toFixed(1) + ') scale(' + scale.toFixed(3) + ') translate(-50 -140)">' +
            type.draw() + '</g>';
    });

    // ----- lily stems and heads -----
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

    previewBox.innerHTML = makeSvg(fillerSvg + stems + flowers, "0 0 300 300");
}

// Greatest common divisor (used to pick the stride above)
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildPicker(lilyList, LILY_TYPES, "lilies", "2 4 96 96");
buildPicker(fillerList, FILLER_TYPES, "fillers", "0 0 100 140");
updatePickers();
showStep(1);
