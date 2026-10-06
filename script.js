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

// The filler flowers you can add (all optional). Each has its own job in the bouquet:
//   role "hole":  tucked into a gap between the lilies. rise = how far the tip sits above its gap.
//   role "frame": around the edge of the lilies, mostly at the back.
// scale is the drawing's size, top is where its highest point is (0-140), and the stem*
// values match the drawing's own stem so the extra stem down to the gathering point blends in.
const FILLER_TYPES = [
    { key: "babys", label: "Baby's breath", draw: drawBabysBreath, role: "hole", rise: 50,
      scale: 0.5, top: 32, stemLine: "#4f7a5a", stemColor: "#86ad8b", stemWidth: 3 },
    { key: "eucalyptus", label: "Eucalyptus", draw: drawEucalyptus, role: "frame",
      scale: 0.85, top: 2, stemLine: "#6b4f3f", stemColor: "#a88b78", stemWidth: 3.4 },
    { key: "daisies", label: "Small daisies", draw: drawDaisies, role: "hole", rise: 12,
      scale: 0.5, top: 18, stemLine: LEAF_LINE, stemColor: LEAF_GREEN, stemWidth: 4 },
    { key: "lavender", label: "Lavender", draw: drawLavender, role: "hole", rise: 62,
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
// the stems gather (where the wrapping will hold them). Up is negative y.
// Every flower has a fixed place, so adding one flower never moves the others.
// The finished picture is then zoomed as a whole to fit the preview.

const LILY_SCALE = 0.6;                    // size of each lily in the design space
const LILY_SPACING = 92 * LILY_SCALE;     // distance between lily centers (leaves a small gap)
const LILY_RADIUS = 47 * LILY_SCALE;       // how far a lily's petals reach
const DOME_HEIGHT = 180;                   // how far above the gathering point the middle lily sits

// 18 lily places in a honeycomb pattern, filled from the middle outward
const LILY_SLOTS = (function () {
    const spots = [];
    for (let j = -3; j <= 3; j++) {
        for (let i = -4; i <= 4; i++) {
            spots.push({ x: LILY_SPACING * (i + j / 2), y: LILY_SPACING * j * Math.sqrt(3) / 2 });
        }
    }
    // closest to the middle first (ties go around in a circle)
    spots.sort(function (a, b) {
        const da = Math.round((a.x * a.x + a.y * a.y) / 10);
        const db = Math.round((b.x * b.x + b.y * b.y) / 10);
        return da - db || Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x);
    });
    return spots.slice(0, MAX_LILIES).map(function (p, k) {
        // a tiny fixed wobble so it looks hand-arranged, not like a grid
        return {
            x: p.x + 5 * Math.sin(k * 12.9898),
            y: -DOME_HEIGHT + p.y * 0.95 + 5 * Math.cos(k * 78.233)
        };
    });
})();

// ---------------------------------------------------------------
// Filler slots
// ---------------------------------------------------------------
// Every filler stem gets its OWN slot, so no two fillers ever sit in the same spot.
//  1. The lilies take their places first (LILY_SLOTS above).
//  2. We find the open gaps left between the lilies, and a ring of spots just outside them.
//  3. We spread slots evenly over the whole dome with a golden-angle spiral
//     (each new point turns 137.5 degrees, which never lines up with an earlier one).
//     Each spiral point claims the nearest gap that is still free.
// Stems are handed out round-robin over the kinds (lavender, baby's breath, daisies, eucalyptus,
// lavender, ...), so each kind is spread over the dome and the kinds are mixed evenly.
// All of this is worked out once, so a flower's place never depends on what else is in the bouquet.

const FILLER_ORDER = ["lavender", "babys", "daisies", "eucalyptus"];
const FILLER_SLOT_COUNT = MAX_EACH_FILLER * FILLER_ORDER.length;

// A repeatable "random" number between 0 and 1 for a given whole number.
// The same number always gives the same answer, so the bouquet never reshuffles when you click.
function pseudoRandom(n) {
    const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
}

const FILLER_SLOTS = (function () {
    // the open gaps between lilies: the middle of three touching lilies, and between two
    const near = LILY_SPACING * 1.3;
    function close(a, b) {
        return Math.hypot(LILY_SLOTS[a].x - LILY_SLOTS[b].x, LILY_SLOTS[a].y - LILY_SLOTS[b].y) <= near;
    }
    const gaps = [];
    const count = LILY_SLOTS.length;
    for (let k = 1; k < count; k++) {
        for (let j = 0; j < k; j++) {
            if (!close(j, k)) continue;
            gaps.push({ x: (LILY_SLOTS[j].x + LILY_SLOTS[k].x) / 2, y: (LILY_SLOTS[j].y + LILY_SLOTS[k].y) / 2 });
            for (let i = 0; i < j; i++) {
                if (close(i, j) && close(i, k)) {
                    gaps.push({
                        x: (LILY_SLOTS[i].x + LILY_SLOTS[j].x + LILY_SLOTS[k].x) / 3,
                        y: (LILY_SLOTS[i].y + LILY_SLOTS[j].y + LILY_SLOTS[k].y) / 3
                    });
                }
            }
        }
    }
    // a ring of spots just outside the outermost lilies (the edge of the bouquet)
    let outer = 0;
    LILY_SLOTS.forEach(function (s) { outer = Math.max(outer, Math.hypot(s.x, s.y + DOME_HEIGHT)); });
    for (let a = 0; a < 12; a++) {
        const angle = a * Math.PI / 6;
        gaps.push({ x: (outer + 16) * Math.sin(angle), y: -DOME_HEIGHT - (outer + 16) * Math.cos(angle) * 0.95 });
    }

    // spread the slots over the dome with a golden-angle spiral, and give each the nearest free gap
    const reach = outer + 16;
    const slots = [];
    for (let p = 0; p < FILLER_SLOT_COUNT; p++) {
        const radius = reach * Math.sqrt((p + 0.5) / FILLER_SLOT_COUNT);
        const turn = p * 137.508;                                    // degrees
        const wanted = {
            x: radius * Math.cos(turn * Math.PI / 180),
            y: -DOME_HEIGHT + 0.95 * radius * Math.sin(turn * Math.PI / 180)
        };
        let best = -1;
        gaps.forEach(function (g, index) {
            if (g.taken) return;
            const d = Math.hypot(g.x - wanted.x, g.y - wanted.y);
            if (best < 0 || d < Math.hypot(gaps[best].x - wanted.x, gaps[best].y - wanted.y)) best = index;
        });
        gaps[best].taken = true;
        slots.push({ x: gaps[best].x, y: gaps[best].y, turn: ((turn % 360) + 360) % 360 });
    }
    return slots;
})();

// Draw one filler. Its tip goes to (tipX, tipY); the stem runs back to the gathering point.
// Returns the picture, and adds the tip to `bounds` so we know how far to zoom out.
function placeFiller(type, tipX, tipY, wiggle, sizeMul, bounds) {
    const scale = type.scale * sizeMul;
    const distance = Math.hypot(tipX, tipY);
    const turn = Math.atan2(tipX, -tipY) + wiggle * Math.PI / 180;    // angle from straight up
    const length = (140 - type.top) * scale;                            // height of the drawing
    const stemLength = Math.max(0, distance - length);                  // extra stem needed
    const bx = stemLength * Math.sin(turn);
    const by = -stemLength * Math.cos(turn);

    bounds.add(distance * Math.sin(turn), -distance * Math.cos(turn), 16);

    let s = '';
    if (stemLength > 0) {
        const path = 'M0 0 L' + bx.toFixed(1) + ' ' + by.toFixed(1);
        s += '<path d="' + path + '" stroke="' + type.stemLine + '" stroke-width="' + (type.stemWidth * scale).toFixed(2) + '" stroke-linecap="round"/>';
        s += '<path d="' + path + '" stroke="' + type.stemColor + '" stroke-width="' + (type.stemWidth * scale * 0.5).toFixed(2) + '" stroke-linecap="round"/>';
    }
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g transform="translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + (turn * 180 / Math.PI).toFixed(1) + ') scale(' + scale.toFixed(3) + ') translate(-50 -140)">' + type.draw() + '</g>';
    return s;
}

// Draw the whole bouquet (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// lilyTypes: the lily types in the order they were added. Reusable for the big reveal later.
function drawBouquet(lilyTypes, fillerCounts) {
    const n = lilyTypes.length;
    const heads = lilyTypes.map(function (type, k) {
        return { type: type, x: LILY_SLOTS[k].x, y: LILY_SLOTS[k].y, spin: k * 37 };
    });

    // track how far the bouquet reaches so we can zoom it to fit
    const bounds = {
        up: 0,
        side: 0,
        add: function (x, y, r) {
            this.up = Math.max(this.up, -y + r);
            this.side = Math.max(this.side, Math.abs(x) + r);
        }
    };
    heads.forEach(function (h) { bounds.add(h.x, h.y, LILY_RADIUS); });

    // ----- fillers: each stem uses its own slot -----
    let domeRadius = 0;
    heads.forEach(function (h) {
        domeRadius = Math.max(domeRadius, Math.hypot(h.x, h.y + DOME_HEIGHT) + LILY_RADIUS);
    });

    const behind = [];     // eucalyptus (furthest back)
    const between = [];    // lavender, baby's breath, daisies (between the lilies)
    FILLER_TYPES.forEach(function (type) {
        const kind = FILLER_ORDER.indexOf(type.key);
        for (let j = 0; j < fillerCounts[type.key]; j++) {
            // round-robin: the 1st of each kind, then the 2nd of each kind, and so on
            const number = j * FILLER_ORDER.length + kind;
            const slot = FILLER_SLOTS[number];
            // a small tilt and size difference for each stem (the same every time)
            const wiggle = (pseudoRandom(number + 1) - 0.5) * 8;
            const sizeMul = 0.9 + pseudoRandom(number + 101) * 0.2;

            if (type.role === "frame") {
                // eucalyptus: around the edge of the lilies. The slot picks the direction,
                // spread from -100 to +100 degrees around straight up (the back and the sides).
                const angle = ((slot.turn / 360 - 0.5) * 200) * Math.PI / 180;
                const out = domeRadius + 22;
                behind.push({ y: 0, svg: placeFiller(type, out * Math.sin(angle), -DOME_HEIGHT - out * Math.cos(angle), wiggle, sizeMul, bounds) });
            } else {
                // the others: the tip sits a little above the slot's gap between lilies
                const tipY = slot.y - type.rise * sizeMul;
                between.push({ y: tipY, svg: placeFiller(type, slot.x, tipY, wiggle, sizeMul, bounds) });
            }
        }
    });
    // higher ones first, so lower ones overlap them
    between.sort(function (a, b) { return a.y - b.y; });
    const frame = behind.map(function (f) { return f.svg; }).join('');
    const tucked = between.map(function (f) { return f.svg; }).join('');

    // ----- lily stems and heads (drawn last, so they sit in front of the fillers) -----
    let stems = '';
    let flowers = '';
    heads.forEach(function (h) {
        const path = 'M' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ' L0 0';
        stems += '<path d="' + path + '" stroke="' + LEAF_LINE + '" stroke-width="4.4" stroke-linecap="round"/>';
        stems += '<path d="' + path + '" stroke="' + LEAF_GREEN + '" stroke-width="2.4" stroke-linecap="round"/>';
    });
    // higher flowers first, so lower ones overlap them
    heads.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (h) {
        flowers += '<g transform="translate(' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ') rotate(' + h.spin + ') scale(' + LILY_SCALE + ') translate(-50 -52)">' +
            h.type.draw({ headOnly: true }) + '</g>';
    });

    // zoom the whole bouquet to fit the canvas (the gathering point sits at the bottom middle)
    const zoom = Math.min(1.5, 270 / bounds.up, 140 / bounds.side);
    return '<g transform="translate(150 285) scale(' + zoom.toFixed(3) + ')">' + frame + tucked + stems + flowers + '</g>';
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
