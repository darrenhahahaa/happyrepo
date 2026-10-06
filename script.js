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

// The filler flowers you can add (all optional). Each has its own zone in the bouquet (role):
//   "puffs":  small puffs tucked into the notches between the lilies, just peeking out
//   "frame":  a neat frame around the back and sides
//   "row":    a row along the front lower edge
//   "spikes": spikes spaced along the back, poking above the lilies
// scale is the drawing's size, top is where its highest point is (0-140), and the stem*
// values match the drawing's own stem so the extra stem down to the tied bundle blends in.
const FILLER_TYPES = [
    { key: "babys", label: "Baby's breath", draw: drawBabysBreath, role: "puffs",
      scale: 0.36, top: 32, stemLine: "#4f7a5a", stemColor: "#86ad8b", stemWidth: 3 },
    { key: "eucalyptus", label: "Eucalyptus", draw: drawEucalyptus, role: "frame",
      scale: 0.8, top: 2, stemLine: "#6b4f3f", stemColor: "#a88b78", stemWidth: 3.4 },
    { key: "daisies", label: "Small daisies", draw: drawDaisies, role: "row",
      scale: 0.5, top: 18, stemLine: LEAF_LINE, stemColor: LEAF_GREEN, stemWidth: 4 },
    { key: "lavender", label: "Lavender", draw: drawLavender, role: "spikes",
      scale: 0.7, top: 12, stemLine: "#46704a", stemColor: "#6f9a6a", stemWidth: 3 }
];

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices live here, so Back never loses them.
// lilies:  how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillers: how many of each filler,     e.g. { babys: 1, lavender: 2, ... }
// lilySlots: the lily colors in the order they were added. Each one keeps its own spot in
//            the bouquet (spot number = position in this list).
const state = { lilies: {}, fillers: {}, lilySlots: [] };
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

// Change one count by +1 or -1. For lilies we also keep the spots steady: a new lily takes
// the next free spot, and when one is removed the last lily moves into its spot.
// That way adding or removing a flower hardly moves the others.
function changeCount(group, key, change) {
    state[group][key] += change;
    if (group !== "lilies") return;
    if (change > 0) {
        state.lilySlots.push(key);
    } else {
        const spot = state.lilySlots.lastIndexOf(key);
        const last = state.lilySlots.pop();
        if (spot < state.lilySlots.length) state.lilySlots[spot] = last;
    }
}

// Rebuild the lily spots from the counts (for when a saved bouquet is loaded later)
function rebuildLilySlots() {
    state.lilySlots = mixedList(LILY_TYPES, state.lilies).map(function (type) { return type.key; });
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

    changeCount(group, key, change);
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

// ---------------------------------------------------------------
// Bouquet layout
// ---------------------------------------------------------------
// The bouquet is laid out in its own "design space" where (0, 0) is the point where all
// the stems are tied together (where the wrapping will hold them). Up is negative y.
// The lilies sit in neat rings like a rounded dome, and each kind of filler has its own zone.
// Every flower has a fixed place, so adding one flower never moves the others.
// The finished picture is then zoomed as a whole so it always fits.

const LILY_SCALE = 0.62;                   // size of a lily in the middle of the dome
const LILY_REACH = 34;                     // how far a lily's petals reach (the front ones are bigger)
const RING_DISTANCE = [0, 56, 112];        // how far each ring is from the middle lily
const SQUASH = 0.88;                       // rings are squashed a little so the bouquet looks like a dome
const DOME_CENTER_Y = -222;                // height of the middle lily above the tied stems

// Where lilies go, in the order they are added. Angles are in degrees, clockwise from straight up.
// The orders go in left/right pairs so the bouquet stays balanced.
const RING1_ORDER = [180, -60, 60, -120, 120, 0];                        // 6 lilies around the middle one
const RING2_ORDER = [0, -90, 90, -30, 30, -150, 150, -60, 60, -120, 120]; // 11 more in the outer ring

// A repeatable "random" number between 0 and 1 for a given whole number.
// The same number always gives the same answer, so the bouquet never reshuffles when you click.
function pseudoRandom(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
}

// The 18 lily places: the middle, then ring 1, then ring 2.
// Lilies at the front (the bottom) are a little lower and bigger, the ones at the back a little higher and smaller.
const LILY_SLOTS = (function () {
    const places = [{ ring: 0, angle: 0 }];
    RING1_ORDER.forEach(function (a) { places.push({ ring: 1, angle: a }); });
    RING2_ORDER.forEach(function (a) { places.push({ ring: 2, angle: a }); });
    return places.map(function (place, k) {
        const distance = RING_DISTANCE[place.ring];
        const angle = place.angle * Math.PI / 180;
        const back = distance * Math.cos(angle) * SQUASH;               // positive = toward the back
        const depth = -back / (RING_DISTANCE[2] * SQUASH);              // -1 = back ... +1 = front
        return {
            x: distance * Math.sin(angle),
            y: DOME_CENTER_Y - back,
            scale: LILY_SCALE * (1 + 0.14 * depth),
            spin: pseudoRandom(k + 7) * 72
        };
    });
})();

// How big the dome of lilies is for n lilies: how far it reaches to the side (rx), up (up) and down (down)
// from the middle lily. Fillers are placed around this outline.
function domeSize(n) {
    let rx = 0;
    let up = 0;
    let down = 0;
    for (let k = 0; k < n; k++) {
        rx = Math.max(rx, Math.abs(LILY_SLOTS[k].x));
        up = Math.max(up, DOME_CENTER_Y - LILY_SLOTS[k].y);
        down = Math.max(down, LILY_SLOTS[k].y - DOME_CENTER_Y);
    }
    return { rx: rx + LILY_REACH, up: up + LILY_REACH, down: down + LILY_REACH };
}

// A point on (or beyond) the edge of the dome, `extra` units out, at an angle clockwise from straight up
function onDome(dome, angle, extra) {
    const a = angle * Math.PI / 180;
    const height = Math.cos(a) >= 0 ? dome.up : dome.down;
    return { x: (dome.rx + extra) * Math.sin(a), y: DOME_CENTER_Y - (height + extra) * Math.cos(a) };
}

// Each filler kind fills its own zone, in left/right pairs (so odd counts are off by just one):
const EUCALYPTUS_ANGLES = [-65, 65, -35, 35, -95, 95];             // a frame around the back and sides
const LAVENDER_ANGLES = [-12, 12, -36, 36, -60, 60];               // spikes spaced along the back
const PUFF_ANGLES = [-45, 45, -80, 80, -20, 20];                     // puffs tucked in between the lilies on the edge
const DAISY_SPOTS = [-0.5, 0.5, -1.5, 1.5, -2.5, 2.5];             // a row along the front, spaced evenly
const DAISY_SPACING = 34;

// Draw one filler with its tip at (tipX, tipY). Its stem curves down into the tied bundle at (bundleX, 0).
// Returns the picture, and adds the tip to `bounds` so we know how far to zoom out.
function placeFiller(type, tipX, tipY, wiggle, sizeMul, bundleX, bounds) {
    const scale = type.scale * sizeMul;
    const length = (140 - type.top) * scale;                           // height of the drawing
    const lean = Math.atan2(tipX, 230) + wiggle * Math.PI / 180;       // leans a little outward
    const ax = Math.sin(lean);
    const ay = -Math.cos(lean);                                        // the direction it points
    const bx = tipX - ax * length;                                     // where the drawing's own stem starts
    const by = tipY - ay * length;

    bounds.add(tipX, tipY, 16);

    let s = '';
    if (by < -4) {
        // a smooth stem from the drawing down into the bundle
        const path = 'M' + bx.toFixed(1) + ' ' + by.toFixed(1) + ' Q' + (bx + (bundleX - bx) * 0.15).toFixed(1) + ' ' + (by * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
        s += '<path d="' + path + '" fill="none" stroke="' + type.stemLine + '" stroke-width="' + (type.stemWidth * scale).toFixed(2) + '" stroke-linecap="round"/>';
        s += '<path d="' + path + '" fill="none" stroke="' + type.stemColor + '" stroke-width="' + (type.stemWidth * scale * 0.5).toFixed(2) + '" stroke-linecap="round"/>';
    }
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g transform="translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + (lean * 180 / Math.PI).toFixed(1) + ') scale(' + scale.toFixed(3) + ') translate(-50 -140)">' + type.draw() + '</g>';
    return s;
}

// Draw the whole bouquet (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// lilyTypes: the lily types in the order they were added. Reusable for the big reveal later.
function drawBouquet(lilyTypes, fillerCounts) {
    const n = lilyTypes.length;
    const dome = domeSize(n);

    // track how far the bouquet reaches so we can zoom it to fit
    const bounds = {
        up: 0,
        side: 0,
        add: function (x, y, r) {
            this.up = Math.max(this.up, -y + r);
            this.side = Math.max(this.side, Math.abs(x) + r);
        }
    };

    // every stem in the bouquet, so we can tie them into one neat bundle
    const stems = [];

    const heads = lilyTypes.map(function (type, k) {
        const slot = LILY_SLOTS[k];
        const head = { type: type, x: slot.x, y: slot.y, scale: slot.scale, spin: slot.spin };
        bounds.add(head.x, head.y, LILY_REACH + 2);
        stems.push({ x: head.x, head: head });
        return head;
    });

    // ----- fillers: work out where each tip goes -----
    const layers = { frame: [], spikes: [], puffs: [], row: [] };
    FILLER_TYPES.forEach(function (type, kind) {
        for (let j = 0; j < fillerCounts[type.key]; j++) {
            let tip;
            if (type.role === "frame") {
                tip = onDome(dome, EUCALYPTUS_ANGLES[j], 26);
            } else if (type.role === "spikes") {
                const angle = LAVENDER_ANGLES[j];
                tip = onDome(dome, angle, 38 + (1 - Math.abs(angle) / 90) * 14);   // the middle ones are tallest
            } else if (type.role === "puffs") {
                tip = onDome(dome, PUFF_ANGLES[j], 2);
            } else {
                const x = DAISY_SPOTS[j] * DAISY_SPACING;
                tip = { x: x, y: DOME_CENTER_Y + dome.down + 8 + Math.abs(x) * 0.08 };
            }
            // a small tilt and size difference for each stem (the same every time)
            const seed = (kind + 1) * 50 + j;
            const filler = {
                type: type,
                x: tip.x,
                y: tip.y,
                wiggle: (pseudoRandom(seed) - 0.5) * 6,
                sizeMul: 0.94 + pseudoRandom(seed + 500) * 0.12
            };
            layers[type.role].push(filler);
            stems.push({ x: filler.x, filler: filler });
        }
    });

    // ----- tie all stems into one bundle, in left-to-right order so they don't cross -----
    stems.sort(function (a, b) { return a.x - b.x; });
    const bundleWidth = Math.min(26, 8 + stems.length * 1.2);
    stems.forEach(function (stem, i) {
        stem.bundleX = stems.length > 1 ? (i / (stems.length - 1) - 0.5) * bundleWidth : 0;
    });

    // ----- draw, from the back to the front -----
    let behind = '';
    ['frame', 'spikes', 'puffs'].forEach(function (role) {
        layers[role].forEach(function (f) {
            behind += placeFiller(f.type, f.x, f.y, f.wiggle, f.sizeMul, stems.filter(function (s) { return s.filler === f; })[0].bundleX, bounds);
        });
    });

    let lilyStems = '';
    heads.forEach(function (h) {
        const bundleX = stems.filter(function (s) { return s.head === h; })[0].bundleX;
        const path = 'M' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ' Q' + (h.x + (bundleX - h.x) * 0.15).toFixed(1) + ' ' + (h.y * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
        lilyStems += '<path d="' + path + '" fill="none" stroke="' + LEAF_LINE + '" stroke-width="4.4" stroke-linecap="round"/>';
        lilyStems += '<path d="' + path + '" fill="none" stroke="' + LEAF_GREEN + '" stroke-width="2.4" stroke-linecap="round"/>';
    });

    let row = '';
    layers.row.forEach(function (f) {
        row += placeFiller(f.type, f.x, f.y, f.wiggle, f.sizeMul, stems.filter(function (s) { return s.filler === f; })[0].bundleX, bounds);
    });

    let flowers = '';
    heads.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (h) {
        flowers += '<g transform="translate(' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ') rotate(' + h.spin.toFixed(0) + ') scale(' + h.scale.toFixed(3) + ') translate(-50 -52)">' +
            h.type.draw({ headOnly: true }) + '</g>';
    });

    // zoom the whole bouquet to fit the canvas (the tied stems sit at the bottom middle).
    // Everything below the tie is trimmed flat, like a florist's cut stems.
    const zoom = Math.min(1.5, 270 / bounds.up, 140 / bounds.side);
    return '<defs><clipPath id="bouquet-trim"><rect x="-600" y="-900" width="1200" height="900"/></clipPath></defs>' +
        '<g transform="translate(150 285) scale(' + zoom.toFixed(3) + ')"><g clip-path="url(#bouquet-trim)">' +
        behind + lilyStems + row + flowers + '</g></g>';
}

// Show the bouquet so far in the preview box
function renderPreview() {
    if (state.lilySlots.length === 0) {
        previewBox.innerHTML = '<p class="preview-empty">Add a lily to see your bouquet!</p>';
        return;
    }
    const lilyTypes = state.lilySlots.map(function (key) {
        return LILY_TYPES.filter(function (type) { return type.key === key; })[0];
    });
    previewBox.innerHTML = makeSvg(drawBouquet(lilyTypes, state.fillers), "0 0 300 300");
}

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildPicker(lilyList, LILY_TYPES, "lilies", "2 4 96 96");
buildPicker(fillerList, FILLER_TYPES, "fillers", "0 0 100 140");
updatePickers();
showStep(1);
