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
//   role "hole":  tucked into the gaps between lilies. holeOffset spreads the kinds over different gaps.
//                 above = how far the tip pokes up past the highest lily next to the gap;
//                 rise  = (instead of above) how far the tip sits past the gap itself.
//   role "frame": around the edge of the lilies, mostly at the back.
// scale is the drawing's size, top is where its highest point is (0-140), and the stem*
// values match the drawing's own stem so the extra stem down to the gathering point blends in.
const FILLER_TYPES = [
    { key: "babys", label: "Baby's breath", draw: drawBabysBreath, role: "hole", holeOffset: 0, above: 12,
      scale: 0.5, top: 32, stemLine: "#4f7a5a", stemColor: "#86ad8b", stemWidth: 3 },
    { key: "eucalyptus", label: "Eucalyptus", draw: drawEucalyptus, role: "frame",
      scale: 0.85, top: 2, stemLine: "#6b4f3f", stemColor: "#a88b78", stemWidth: 3.4 },
    { key: "daisies", label: "Small daisies", draw: drawDaisies, role: "hole", holeOffset: 1, rise: 17,
      scale: 0.5, top: 18, stemLine: LEAF_LINE, stemColor: LEAF_GREEN, stemWidth: 4 },
    { key: "lavender", label: "Lavender", draw: drawLavender, role: "hole", holeOffset: 2, above: 40,
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

// A hole at (x, y). `top` is the height of the highest lily around it, so fillers
// can poke up just past the blooms.
function makeHole(x, y, around) {
    let top = 0;
    around.forEach(function (k) { top = Math.min(top, LILY_SLOTS[k].y - LILY_RADIUS); });
    return { x: x, y: y, top: top };
}

// Find the open spots between the lilies that are there so far (n lilies).
// A "hole" is the middle of three lilies that touch. Holes are listed in the order they appear.
function findHoles(n) {
    const near = LILY_SPACING * 1.3;
    function close(a, b) {
        return Math.hypot(LILY_SLOTS[a].x - LILY_SLOTS[b].x, LILY_SLOTS[a].y - LILY_SLOTS[b].y) <= near;
    }
    const holes = [];
    for (let k = 2; k < n; k++) {
        for (let j = 1; j < k; j++) {
            for (let i = 0; i < j; i++) {
                if (close(i, j) && close(j, k) && close(i, k)) {
                    holes.push(makeHole(
                        (LILY_SLOTS[i].x + LILY_SLOTS[j].x + LILY_SLOTS[k].x) / 3,
                        (LILY_SLOTS[i].y + LILY_SLOTS[j].y + LILY_SLOTS[k].y) / 3,
                        [i, j, k]
                    ));
                }
            }
        }
    }
    if (holes.length > 0) return holes;
    // fewer than 3 lilies: use the spot between two lilies, or the side of the only lily
    if (n >= 2) {
        return [makeHole((LILY_SLOTS[0].x + LILY_SLOTS[1].x) / 2, (LILY_SLOTS[0].y + LILY_SLOTS[1].y) / 2, [0, 1])];
    }
    return [makeHole(LILY_SLOTS[0].x + LILY_SPACING / 2, LILY_SLOTS[0].y, [0])];
}

// Where eucalyptus sprigs frame the bouquet: angles around the lily dome (0 = straight up)
const FRAME_ANGLES = [-60, 60, -88, 88, -32, 32];

// Draw one filler. Its tip goes to (tipX, tipY); the stem runs back to the gathering point.
// Returns the picture, and adds the tip to `bounds` so we know how far to zoom out.
function placeFiller(type, tipX, tipY, wiggle, bounds) {
    const distance = Math.hypot(tipX, tipY);
    const turn = Math.atan2(tipX, -tipY) + wiggle * Math.PI / 180;    // angle from straight up
    const length = (140 - type.top) * type.scale;                       // height of the drawing
    const stemLength = Math.max(0, distance - length);                  // extra stem needed
    const bx = stemLength * Math.sin(turn);
    const by = -stemLength * Math.cos(turn);

    bounds.add(distance * Math.sin(turn), -distance * Math.cos(turn), 16);

    let s = '';
    if (stemLength > 0) {
        const path = 'M0 0 L' + bx.toFixed(1) + ' ' + by.toFixed(1);
        s += '<path d="' + path + '" stroke="' + type.stemLine + '" stroke-width="' + (type.stemWidth * type.scale).toFixed(2) + '" stroke-linecap="round"/>';
        s += '<path d="' + path + '" stroke="' + type.stemColor + '" stroke-width="' + (type.stemWidth * type.scale * 0.5).toFixed(2) + '" stroke-linecap="round"/>';
    }
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g transform="translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + (turn * 180 / Math.PI).toFixed(1) + ') scale(' + type.scale + ') translate(-50 -140)">' + type.draw() + '</g>';
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

    // ----- fillers -----
    const holes = findHoles(n);
    let domeRadius = 0;
    heads.forEach(function (h) {
        domeRadius = Math.max(domeRadius, Math.hypot(h.x, h.y + DOME_HEIGHT) + LILY_RADIUS);
    });

    let frame = '';       // eucalyptus (furthest back)
    let tucked = '';      // baby's breath, daisies, lavender (between the lilies)
    FILLER_TYPES.forEach(function (type) {
        for (let j = 0; j < fillerCounts[type.key]; j++) {
            if (type.role === "frame") {
                // eucalyptus: around the edge of the lily dome, mostly at the back
                const angle = FRAME_ANGLES[j % FRAME_ANGLES.length] * Math.PI / 180;
                const out = domeRadius + 22;
                frame += placeFiller(type, out * Math.sin(angle), -DOME_HEIGHT - out * Math.cos(angle), 0, bounds);
            } else {
                // the others: in a hole between lilies. Each kind uses every 3rd hole, so they spread out.
                const hole = holes[(j * 3 + type.holeOffset) % holes.length];
                let tipX;
                let tipY;
                if (type.above !== undefined) {
                    // tip pokes up `above` units past the highest lily next to the hole
                    tipY = hole.top - type.above;
                    tipX = hole.x * tipY / hole.y;
                } else {
                    // tip sits just beyond the hole itself (so the flowers show in the gap)
                    const length = Math.hypot(hole.x, hole.y);
                    tipX = hole.x + hole.x / length * type.rise;
                    tipY = hole.y + hole.y / length * type.rise;
                }
                tucked += placeFiller(type, tipX, tipY, (type.holeOffset - 1) * 2 + j, bounds);
            }
        }
    });

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
