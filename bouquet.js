// bouquet.js: how the bouquet is arranged and drawn. No page code in here, so both the
// builder (script.js) and the test page (gallery.html) use it. It needs flowers.js first.
//
// Every layout is written out by hand in the tables below. The same choices always give
// exactly the same bouquet: there is no randomness anywhere.

// Most lilies allowed in one bouquet
const MAX_LILIES = 18;

// Most of each filler flower
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
//   "puffs":  small puffs tucked in at the edge of the lilies, just peeking out
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

// The wrapping paper and ribbon colors you can pick. "color" is what gets drawn.
const WRAP_COLORS = [
    { key: "cream", label: "Cream", color: "#f4e6c4" },
    { key: "blush", label: "Blush", color: "#f6c1cc" },
    { key: "sage", label: "Sage", color: "#b3cdb4" },
    { key: "lavender", label: "Lavender", color: "#cdbdf0" },
    { key: "kraft", label: "Kraft", color: "#d4a97a" }
];
const RIBBON_COLORS = [
    { key: "mauve", label: "Mauve", color: "#8f5b80" },
    { key: "rose", label: "Rose", color: "#e2849b" },
    { key: "butter", label: "Butter", color: "#f2d46a" },
    { key: "sage", label: "Sage", color: "#7fa88a" },
    { key: "white", label: "White", color: "#ffffff" }
];
// The bouquet is never left unwrapped: these are used until something else is picked
const DEFAULT_WRAP = "cream";
const DEFAULT_RIBBON = "mauve";

// ---------------------------------------------------------------
// LILY LAYOUTS: one hand-made arrangement for every number of lilies, 1 to 18
// ---------------------------------------------------------------
// The bouquet is drawn in its own "design space" where (0, 0) is the point where all the stems
// are tied together (where the wrapping will hold them). Up is negative y.
// Each lily is [x, y, size, turn]: its place, its size (front lilies are lower and a bit bigger,
// back ones higher and a bit smaller) and how far its petals are turned, in degrees.
// The first lily in each list is the middle one, then the ring around it, then the outer ring.
// Every layout is balanced left to right. centerY is the height of the middle of the dome
// (the lowest bloom sits just above the opening of the wrapping paper; the paper below it
// is about three quarters as tall as the flowers, so it is roughly 40 to 45% of the whole bouquet).
// To change how a bouquet looks, just edit the numbers.
const LILY_LAYOUTS = {
    1: { centerY: -144.5, lilies: [
        [0, -144.5, 0.62, -30]
    ] },
    2: { centerY: -144.5, lilies: [
        [-24, -144.5, 0.62, -30], [24, -144.5, 0.62, -7]
    ] },
    3: { centerY: -195.3, lilies: [
        [0.0, -226.6, 0.589, -30], [29.4, -179.7, 0.636, -7], [-29.4, -179.7, 0.636, 16]
    ] },
    4: { centerY: -238.3, lilies: [
        [0, -238.3, 0.62, -30], [-41.6, -260.4, 0.598, -7], [41.6, -260.4, 0.598, 16],
        [0.0, -194.2, 0.664, -21]
    ] },
    5: { centerY: -199.7, lilies: [
        [0, -199.7, 0.62, -30], [-41.6, -221.8, 0.598, -7], [41.6, -221.8, 0.598, 16],
        [-41.6, -177.6, 0.642, -21], [41.6, -177.6, 0.642, 2]
    ] },
    6: { centerY: -238.3, lilies: [
        [0, -238.3, 0.62, -30], [-41.6, -260.4, 0.598, -7], [41.6, -260.4, 0.598, 16],
        [-41.6, -216.3, 0.642, -21], [41.6, -216.3, 0.642, 2], [0.0, -194.2, 0.664, 25]
    ] },
    7: { centerY: -254.9, lilies: [
        [0, -254.9, 0.62, -30], [0.0, -299.1, 0.576, -7], [-41.6, -277.0, 0.598, 16],
        [41.6, -277.0, 0.598, -21], [-41.6, -232.8, 0.642, 2], [41.6, -232.8, 0.642, 25],
        [0.0, -210.7, 0.664, -12]
    ] },
    8: { centerY: -286.6, lilies: [
        [0, -286.6, 0.62, -30], [0.0, -330.8, 0.576, -7], [-41.6, -308.7, 0.598, 16],
        [41.6, -308.7, 0.598, -21], [-41.6, -264.6, 0.642, 2], [41.6, -264.6, 0.642, 25],
        [0.0, -242.5, 0.664, -12], [0.0, -373.1, 0.533, 11]
    ] },
    9: { centerY: -254.9, lilies: [
        [0, -254.9, 0.62, -30], [0.0, -299.1, 0.576, -7], [-41.6, -277.0, 0.598, 16],
        [41.6, -277.0, 0.598, -21], [-41.6, -232.8, 0.642, 2], [41.6, -232.8, 0.642, 25],
        [0.0, -210.7, 0.664, -12], [-90.8, -277.3, 0.598, 11], [90.8, -277.3, 0.598, -26]
    ] },
    10: { centerY: -286.6, lilies: [
        [0, -286.6, 0.62, -30], [0.0, -330.8, 0.576, -7], [-41.6, -308.7, 0.598, 16],
        [41.6, -308.7, 0.598, -21], [-41.6, -264.6, 0.642, 2], [41.6, -264.6, 0.642, 25],
        [0.0, -242.5, 0.664, -12], [-90.8, -309.0, 0.598, 11], [0.0, -373.1, 0.533, -26],
        [90.8, -309.0, 0.598, -3]
    ] },
    11: { centerY: -271.5, lilies: [
        [0, -271.5, 0.62, -30], [0.0, -315.6, 0.576, -7], [-41.6, -293.5, 0.598, 16],
        [41.6, -293.5, 0.598, -21], [-41.6, -249.4, 0.642, 2], [41.6, -249.4, 0.642, 25],
        [0.0, -227.3, 0.664, -12], [-94.0, -271.5, 0.62, 11], [-60.4, -337.7, 0.554, -26],
        [60.4, -337.7, 0.554, -3], [94.0, -271.5, 0.62, 20]
    ] },
    12: { centerY: -286.6, lilies: [
        [0, -286.6, 0.62, -30], [0.0, -330.8, 0.576, -7], [-41.6, -308.7, 0.598, 16],
        [41.6, -308.7, 0.598, -21], [-41.6, -264.6, 0.642, 2], [41.6, -264.6, 0.642, 25],
        [0.0, -242.5, 0.664, -12], [-94.0, -286.6, 0.62, 11], [-60.4, -352.9, 0.554, -26],
        [0.0, -373.1, 0.533, -3], [60.4, -352.9, 0.554, 20], [94.0, -286.6, 0.62, -17]
    ] },
    13: { centerY: -278.0, lilies: [
        [0, -278.0, 0.62, -30], [0.0, -322.1, 0.576, -7], [-41.6, -300.0, 0.598, 16],
        [41.6, -300.0, 0.598, -21], [-41.6, -255.9, 0.642, 2], [41.6, -255.9, 0.642, 25],
        [0.0, -233.8, 0.664, -12], [-88.3, -248.4, 0.65, 11], [-88.3, -307.5, 0.59, -26],
        [-47.0, -352.8, 0.545, -3], [47.0, -352.8, 0.545, 20], [88.3, -307.5, 0.59, -17],
        [88.3, -248.4, 0.65, 6]
    ] },
    14: { centerY: -286.6, lilies: [
        [0, -286.6, 0.62, -30], [0.0, -330.8, 0.576, -7], [-41.6, -308.7, 0.598, 16],
        [41.6, -308.7, 0.598, -21], [-41.6, -264.6, 0.642, 2], [41.6, -264.6, 0.642, 25],
        [0.0, -242.5, 0.664, -12], [-88.3, -257.1, 0.65, 11], [-88.3, -316.2, 0.59, -26],
        [-47.0, -361.5, 0.545, -3], [0.0, -373.1, 0.533, 20], [47.0, -361.5, 0.545, -17],
        [88.3, -316.2, 0.59, 6], [88.3, -257.1, 0.65, 29]
    ] },
    15: { centerY: -282.7, lilies: [
        [0, -282.7, 0.62, -30], [0.0, -326.9, 0.576, -7], [-41.6, -304.8, 0.598, 16],
        [41.6, -304.8, 0.598, -21], [-41.6, -260.6, 0.642, 2], [41.6, -260.6, 0.642, 25],
        [0.0, -238.6, 0.664, -12], [-85.2, -246.2, 0.657, 11], [-92.6, -297.7, 0.605, -26],
        [-72.0, -338.3, 0.564, -3], [-32.1, -364.0, 0.538, 20], [32.1, -364.0, 0.538, -17],
        [72.0, -338.3, 0.564, 6], [92.6, -297.7, 0.605, 29], [85.2, -246.2, 0.657, -8]
    ] },
    16: { centerY: -286.6, lilies: [
        [0, -286.6, 0.62, -30], [0.0, -330.8, 0.576, -7], [-41.6, -308.7, 0.598, 16],
        [41.6, -308.7, 0.598, -21], [-41.6, -264.6, 0.642, 2], [41.6, -264.6, 0.642, 25],
        [0.0, -242.5, 0.664, -12], [-81.4, -243.4, 0.663, 11], [-94.0, -286.6, 0.62, -26],
        [-81.4, -329.9, 0.577, -3], [-47.0, -361.5, 0.545, 20], [0.0, -373.1, 0.533, -17],
        [47.0, -361.5, 0.545, 6], [81.4, -329.9, 0.577, 29], [94.0, -286.6, 0.62, -8],
        [81.4, -243.4, 0.663, 15]
    ] },
    17: { centerY: -314.2, lilies: [
        [0, -314.2, 0.62, -30], [0.0, -358.3, 0.576, -7], [-41.6, -336.2, 0.598, 16],
        [41.6, -336.2, 0.598, -21], [-41.6, -292.1, 0.642, 2], [41.6, -292.1, 0.642, 25],
        [0.0, -270.0, 0.664, -12], [-66.5, -253.0, 0.681, 11], [-90.8, -291.8, 0.642, -26],
        [-90.8, -336.5, 0.598, -3], [-66.5, -375.3, 0.559, 20], [-24.3, -397.7, 0.536, -17],
        [24.3, -397.7, 0.536, 6], [66.5, -375.3, 0.559, 29], [90.8, -336.5, 0.598, -8],
        [90.8, -291.8, 0.642, 15], [66.5, -253.0, 0.681, -22]
    ] },
    18: { centerY: -340.4, lilies: [
        [0, -340.4, 0.62, -30], [0.0, -384.6, 0.576, -7], [-41.6, -362.5, 0.598, 16],
        [41.6, -362.5, 0.598, -21], [-41.6, -318.3, 0.642, 2], [41.6, -318.3, 0.642, 25],
        [0.0, -296.3, 0.664, -12], [-47.0, -265.5, 0.695, 11], [-81.4, -297.2, 0.663, -26],
        [-94.0, -340.4, 0.62, -3], [-81.4, -383.7, 0.577, 20], [-47.0, -415.3, 0.545, -17],
        [0.0, -426.9, 0.533, 6], [47.0, -415.3, 0.545, 29], [81.4, -383.7, 0.577, -8],
        [94.0, -340.4, 0.62, 15], [81.4, -297.2, 0.663, -22], [47.0, -265.5, 0.695, 1]
    ] }
};

// ---------------------------------------------------------------
// FILLER LAYOUTS: one hand-made arrangement for every number of each filler, 1 to 6
// ---------------------------------------------------------------
// Eucalyptus, lavender and baby's breath: angles around the lilies, in degrees clockwise from
// straight up (0 = the middle of the back, 90 = the right side, -90 = the left side).
// Daisies: sideways positions in a row along the front, 0 = the middle.
const FILLER_LAYOUTS = {
    eucalyptus: {                       // a frame around the back and sides
        1: [0],
        2: [-62, 62],
        3: [-70, 0, 70],
        4: [-95, -45, 45, 95],
        5: [-95, -45, 0, 45, 95],
        6: [-100, -65, -30, 30, 65, 100]
    },
    lavender: {                         // spikes spaced along the back
        1: [0],
        2: [-14, 14],
        3: [-28, 0, 28],
        4: [-36, -12, 12, 36],
        5: [-48, -24, 0, 24, 48],
        6: [-50, -30, -10, 10, 30, 50]
    },
    babys: {                            // puffs at the edge, between the lavender spikes
        1: [0],
        2: [-20, 20],
        3: [-40, 0, 40],
        4: [-55, -20, 20, 55],
        5: [-70, -35, 0, 35, 70],
        6: [-75, -45, -20, 20, 45, 75]
    },
    daisies: {                          // a row along the front lower edge
        1: [0],
        2: [-17, 17],
        3: [-34, 0, 34],
        4: [-51, -17, 17, 51],
        5: [-68, -34, 0, 34, 68],
        6: [-85, -51, -17, 17, 51, 85]
    }
};

// ---------------------------------------------------------------
// Colors: spread each lily color out evenly
// ---------------------------------------------------------------

// Give every lily place a color so that lilies of the same color are as far apart as possible.
// counts is how many of each color, e.g. { white: 2, orange: 1, ... }. Returns one color per place.
// It is worked out the same way every time (no randomness).
function spreadColors(spots, counts) {
    const left = {};
    LILY_TYPES.forEach(function (type) { left[type.key] = counts[type.key]; });

    // 1. place the colors one spot at a time, each time picking the color that has no neighbor
    //    nearby (a color with more lilies left goes first when it's a tie)
    const types = [];
    spots.forEach(function (spot, k) {
        let best = null;
        let bestGap = -1;
        LILY_TYPES.forEach(function (type) {
            if (left[type.key] === 0) return;
            let gap = 1e9;
            types.forEach(function (other, j) {
                if (other === type) gap = Math.min(gap, Math.hypot(spots[j][0] - spot[0], spots[j][1] - spot[1]));
            });
            if (gap > bestGap + 1 || (gap >= bestGap - 1 && left[type.key] > left[best.key])) {
                best = type;
                bestGap = gap;
            }
        });
        left[best.key]--;
        types.push(best);
    });

    // 2. then swap pairs of lilies while that moves same-colored lilies further apart
    function clumpiness() {
        let total = 0;
        for (let a = 0; a < spots.length; a++) {
            for (let b = 0; b < a; b++) {
                if (types[a] === types[b]) {
                    const d = Math.hypot(spots[a][0] - spots[b][0], spots[a][1] - spots[b][1]);
                    total += 1 / (d * d);
                }
            }
        }
        return total;
    }
    let improved = true;
    for (let pass = 0; improved && pass < 30; pass++) {
        improved = false;
        for (let a = 0; a < spots.length; a++) {
            for (let b = a + 1; b < spots.length; b++) {
                if (types[a] === types[b]) continue;
                const before = clumpiness();
                const swap = types[a];
                types[a] = types[b];
                types[b] = swap;
                if (clumpiness() < before - 1e-12) {
                    improved = true;
                } else {
                    types[b] = types[a];
                    types[a] = swap;
                }
            }
        }
    }
    return types;
}

// ---------------------------------------------------------------
// Drawing the bouquet
// ---------------------------------------------------------------
// A bouquet is a list of "items", one per flower. Each item is a plain object that can be saved:
//   { id, kind: "lily" or "filler", type: the color or filler key, x, y, scale, spin, z }
// For a lily, (x, y) is the middle of the flower. For a filler, it is the tip.
// z is the drawing order: higher z is drawn later, so it is in front.
// The "template" is the hand-made layout. "Arrange it yourself" starts from a copy of the template
// and then the items are moved by hand.

const LILY_REACH = 34;      // how far a lily's petals reach (the front ones are bigger)

// The bouquet is drawn on a 300 x 300 canvas. The tied stems sit at the bottom middle, at (150, BASE_Y),
// which leaves room under them for the point of the wrapping paper.
const BASE_Y = 266;
const ROOM_ABOVE = BASE_Y - 12;      // how much canvas there is above the tied stems

// How big the dome of lilies is: how far it reaches to the side (rx), up and down from its middle.
// Fillers are placed around this outline.
function domeSize(heads, centerY) {
    let rx = 0;
    let up = 0;
    let down = 0;
    heads.forEach(function (h) {
        rx = Math.max(rx, Math.abs(h.x));
        up = Math.max(up, centerY - h.y);
        down = Math.max(down, h.y - centerY);
    });
    return { cy: centerY, rx: rx + LILY_REACH, up: up + LILY_REACH, down: down + LILY_REACH };
}

// A point on (or beyond) the edge of the dome, `extra` units out, at an angle clockwise from straight up
function onDome(dome, angle, extra) {
    const a = angle * Math.PI / 180;
    const height = Math.cos(a) >= 0 ? dome.up : dome.down;
    return { x: (dome.rx + extra) * Math.sin(a), y: dome.cy - (height + extra) * Math.cos(a) };
}

// Where a filler's tip goes for one place in its layout
function fillerTip(type, place, dome) {
    if (type.role === "frame") return onDome(dome, place, 26);
    if (type.role === "spikes") return onDome(dome, place, 38 + (1 - Math.abs(place) / 90) * 14);   // the middle ones are tallest
    if (type.role === "puffs") return onDome(dome, place, 2);
    return { x: place, y: dome.cy + dome.down - 6 + Math.abs(place) * 0.08 };                       // daisies: a row along the front, at the wrap's opening
}

function lilyTypeFor(key) {
    return LILY_TYPES.filter(function (type) { return type.key === key; })[0];
}
function fillerTypeFor(key) {
    return FILLER_TYPES.filter(function (type) { return type.key === key; })[0];
}

// Drawing order of the template: eucalyptus at the very back, then lavender, then baby's breath,
// then the lilies (back to front), and the row of daisies in front.
const FILLER_Z_START = { frame: 0, spikes: 10, puffs: 20, row: 500 };

// The hand-made layout as a list of items, for these counts. Returns { items, centerY }.
function templateItems(lilyCounts, fillerCounts) {
    let n = 0;
    LILY_TYPES.forEach(function (type) { n += lilyCounts[type.key]; });
    if (n === 0) return { items: [], centerY: 0 };

    const layout = LILY_LAYOUTS[n];
    const colors = spreadColors(layout.lilies, lilyCounts);
    const items = [];

    // lilies: back ones are drawn first, so give them the lower z
    const byHeight = layout.lilies.map(function (spot, k) { return k; }).sort(function (a, b) {
        return layout.lilies[a][1] - layout.lilies[b][1];
    });
    layout.lilies.forEach(function (spot, k) {
        items.push({ id: "lily-" + k, kind: "lily", type: colors[k].key, x: spot[0], y: spot[1], scale: spot[2], spin: spot[3], z: 100 + byHeight.indexOf(k) });
    });

    // fillers: around the dome of lilies
    const dome = domeSize(items, layout.centerY);
    FILLER_TYPES.forEach(function (type) {
        const count = fillerCounts[type.key];
        if (count === 0) return;
        FILLER_LAYOUTS[type.key][count].forEach(function (place, j) {
            const tip = fillerTip(type, place, dome);
            items.push({ id: type.key + "-" + j, kind: "filler", type: type.key, x: tip.x, y: tip.y, scale: 1, spin: 0, z: FILLER_Z_START[type.role] + j });
        });
    });
    return { items: items, centerY: layout.centerY };
}

// How far to zoom so every item fits on the 300 x 300 canvas (the tied stems are at the bottom middle)
function fitZoom(items) {
    let up = 0;
    let side = 0;
    items.forEach(function (it) {
        const r = it.kind === "lily" ? LILY_REACH + 2 : 16;
        up = Math.max(up, -it.y + r);
        side = Math.max(side, Math.abs(it.x) + r);
    });
    return Math.min(1.5, ROOM_ABOVE / up, 140 / side);
}

// ---------------------------------------------------------------
// Arranging by hand
// ---------------------------------------------------------------
// An "arrangement" is { zoom, nextId, items }: a copy of the items that can be moved around.
// It is plain data (numbers and text), so it can be kept with a saved bouquet.
// The zoom is locked while arranging, so the picture doesn't rescale while you drag.

// Start arranging: copy the template layout for these counts
function startArrangement(lilyCounts, fillerCounts) {
    const template = templateItems(lilyCounts, fillerCounts);
    const zoom = Math.min(fitZoom(template.items), 0.8);
    const rimY = wrapRim(template.items);
    return { zoom: zoom, nextId: 1, items: template.items, rimY: rimY, area: domeArea(template.items, rimY, zoom) };
}

// The lowest a flower's middle may go, and the top edge of the paper, for these items.
// The paper's top edge sits just below the lowest lily (the daisies at the front are tucked into the opening).
function wrapRim(items) {
    let bottom = -1e9;
    items.forEach(function (it) {
        if (it.kind === "lily") bottom = Math.max(bottom, it.y + 47 * it.scale);
    });
    return Math.min(-40, bottom + 26);
}

// The area where flowers may be placed: a dome (half an oval) just above the wrap's opening.
// It is a little bigger than the flowers are when you start, and always fits on the canvas.
function domeArea(items, rimY, zoom) {
    let half = 0;
    let top = 0;
    items.forEach(function (it) {
        const r = it.kind === "lily" ? LILY_REACH : 16;
        half = Math.max(half, Math.abs(it.x) + r);
        top = Math.min(top, it.y - r);
    });
    const baseY = rimY - 26;                                         // a flower's middle stays above this
    const rx = Math.min(half + 24, 140 / zoom - 6);
    const ry = Math.min(baseY - top + 20, baseY + ROOM_ABOVE / zoom - 10);
    return { baseY: baseY, rx: rx, ry: ry };
}

// Keep a point inside the dome (so a flower can't be dragged off the bouquet or down into the wrap)
function clampToArea(x, y, area) {
    y = Math.min(y, area.baseY);
    const dx = x / area.rx;
    const dy = (y - area.baseY) / area.ry;
    const out = Math.hypot(dx, dy);
    if (out > 1) {
        x = dx / out * area.rx;
        y = area.baseY + dy / out * area.ry;
    }
    return { x: x, y: y };
}

function highestZ(arrangement) {
    let z = 0;
    arrangement.items.forEach(function (it) { z = Math.max(z, it.z); });
    return z;
}

// A flower was added (the counts already include it): put it in the best free place and leave the others alone.
function arrangementAdd(arrangement, group, key, lilyCounts, fillerCounts) {
    const items = arrangement.items;
    const id = "new-" + arrangement.nextId;
    const z = highestZ(arrangement) + 1;
    arrangement.nextId++;
    const lilies = items.filter(function (it) { return it.kind === "lily"; });

    if (group === "lilies") {
        // try a grid of spots; pick the one furthest from the other lilies, but still close to the bunch
        let cx = 0;
        let cy = -200;
        if (lilies.length > 0) {
            cx = lilies.reduce(function (s, it) { return s + it.x; }, 0) / lilies.length;
            cy = lilies.reduce(function (s, it) { return s + it.y; }, 0) / lilies.length;
        }
        let best = null;
        let bestScore = -1e9;
        const area = arrangement.area;
        for (let y = area.baseY - area.ry; y <= area.baseY; y += 8) {
            for (let x = -area.rx; x <= area.rx; x += 8) {
                const spot = clampToArea(x, y, area);
                if (Math.abs(spot.x - x) > 1 || Math.abs(spot.y - y) > 1) continue;      // outside the dome
                let gap = 60;
                lilies.forEach(function (it) { gap = Math.min(gap, Math.hypot(it.x - x, it.y - y)); });
                const score = gap - 0.1 * Math.hypot(x - cx, y - cy);
                if (score > bestScore) {
                    bestScore = score;
                    best = { x: x, y: y };
                }
            }
        }
        // take the size of the nearest lily, so front and back keep their look
        let near = lilies[0];
        lilies.forEach(function (it) {
            if (Math.hypot(it.x - best.x, it.y - best.y) < Math.hypot(near.x - best.x, near.y - best.y)) near = it;
        });
        items.push({ id: id, kind: "lily", type: key, x: best.x, y: best.y, scale: near ? near.scale : LILY_SCALE_DEFAULT, spin: ((arrangement.nextId * 23) % 60) - 30, z: z });
        return;
    }

    // a filler: use the spots of the hand-made layout for the new count, and take the one
    // furthest from the fillers of the same kind that are already there
    const type = fillerTypeFor(key);
    const count = fillerCounts[key];
    let cy = -200;
    if (lilies.length > 0) cy = lilies.reduce(function (s, it) { return s + it.y; }, 0) / lilies.length;
    const dome = domeSize(lilies, cy);
    const same = items.filter(function (it) { return it.kind === "filler" && it.type === key; });
    let best = null;
    let bestGap = -1;
    FILLER_LAYOUTS[key][count].forEach(function (place) {
        const tip = fillerTip(type, place, dome);
        let gap = 1e6;
        same.forEach(function (it) { gap = Math.min(gap, Math.hypot(it.x - tip.x, it.y - tip.y)); });
        if (gap > bestGap) {
            bestGap = gap;
            best = tip;
        }
    });
    const spot = clampToArea(best.x, best.y, arrangement.area);
    items.push({ id: id, kind: "filler", type: key, x: spot.x, y: spot.y, scale: 1, spin: 0, z: z });
}

const LILY_SCALE_DEFAULT = 0.62;

// A flower was removed: take away the one of that kind added last. Everyone else stays put.
function arrangementRemove(arrangement, group, key) {
    const kind = group === "lilies" ? "lily" : "filler";
    for (let i = arrangement.items.length - 1; i >= 0; i--) {
        if (arrangement.items[i].kind === kind && arrangement.items[i].type === key) {
            arrangement.items.splice(i, 1);
            return;
        }
    }
}

// ---------------------------------------------------------------
// Drawing the items
// ---------------------------------------------------------------

// The shape of a stem from (x, y) down into the tied bundle at (bundleX, 0), as the text of an SVG path.
// With a "route" ({ rimY, mouth }) the stem goes into the wrapping paper through its opening: it comes down to the
// paper's top edge (kept inside the opening) and then runs straight down to the bundle, hidden by the paper.
// The builder also uses this while a flower is being dragged.
function stemPathData(x, y, bundleX, route) {
    if (!route || y >= route.rimY) {
        return 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q' + (x + (bundleX - x) * 0.15).toFixed(1) + ' ' + (y * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
    }
    const limit = route.mouth - 10;
    const entry = Math.max(-limit, Math.min(limit, bundleX + (x - bundleX) * (route.rimY / y)));
    return 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q' + (x + (entry - x) * 0.1).toFixed(1) + ' ' + ((y + route.rimY) / 2).toFixed(1) + ' ' +
        entry.toFixed(1) + ' ' + route.rimY.toFixed(1) + ' L' + bundleX.toFixed(1) + ' 0';
}

// A stem as two paths: an outline and a lighter middle.
// The data-* values let the builder bend the stem while a flower is being dragged.
function stemPaths(x, y, bundleX, route, outline, outlineWidth, color, colorWidth) {
    const path = stemPathData(x, y, bundleX, route);
    let data = ' class="stem-path" data-sx="' + x.toFixed(1) + '" data-sy="' + y.toFixed(1) + '" data-bundle="' + bundleX.toFixed(1) + '"';
    if (route) data += ' data-rim="' + route.rimY.toFixed(1) + '" data-mouth="' + route.mouth.toFixed(1) + '"';
    data += ' fill="none" stroke-linecap="round" stroke-linejoin="round"';
    return '<path d="' + path + '"' + data + ' stroke="' + outline + '" stroke-width="' + outlineWidth.toFixed(2) + '"/>' +
        '<path d="' + path + '"' + data + ' stroke="' + color + '" stroke-width="' + colorWidth.toFixed(2) + '"/>';
}

// An invisible circle that makes a flower easy to grab with a finger
function hitCircle(x, y, r) {
    return '<circle class="hit" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="rgba(0,0,0,0.001)"/>';
}

function drawLilyItem(item, bundleX, route) {
    const type = lilyTypeFor(item.type);
    return '<g class="item" data-id="' + item.id + '">' +
        stemPaths(item.x, item.y, bundleX, route, LEAF_LINE, 4.4, LEAF_GREEN, 2.4) +
        '<g class="body">' +
        '<g transform="translate(' + item.x.toFixed(1) + ' ' + item.y.toFixed(1) + ') rotate(' + item.spin + ') scale(' + item.scale.toFixed(3) + ') translate(-50 -52)">' +
        type.draw({ headOnly: true }) + '</g>' +
        hitCircle(item.x, item.y, 47 * item.scale * 0.9) +
        '</g></g>';
}

// Where a filler's drawing sits: its size, the way it leans, and where its own stem starts (bx, by)
function fillerGeometry(item) {
    const type = fillerTypeFor(item.type);
    const length = (140 - type.top) * type.scale;                      // height of the drawing
    const lean = Math.atan2(item.x, 230);                              // leans a little outward
    const ax = Math.sin(lean);
    const ay = -Math.cos(lean);                                        // the direction it points
    return { type: type, length: length, lean: lean, ax: ax, ay: ay, bx: item.x - ax * length, by: item.y - ay * length };
}

// A filler: the drawing with its tip at (item.x, item.y), and its stem curving down into the bundle
function drawFillerItem(item, bundleX, route) {
    const g = fillerGeometry(item);
    const type = g.type;
    let s = '<g class="item" data-id="' + item.id + '">';
    if (g.by < -4) s += stemPaths(g.bx, g.by, bundleX, route, type.stemLine, type.stemWidth * type.scale, type.stemColor, type.stemWidth * type.scale * 0.5);
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g class="body"><g transform="translate(' + g.bx.toFixed(1) + ' ' + g.by.toFixed(1) + ') rotate(' + (g.lean * 180 / Math.PI).toFixed(1) + ') scale(' + type.scale + ') translate(-50 -140)">' + type.draw() + '</g>';
    s += hitCircle(item.x - g.ax * g.length * 0.3, item.y - g.ay * g.length * 0.3, Math.max(16, g.length * 0.22));
    return s + '</g></g>';
}

// ---------------------------------------------------------------
// The wrapping paper and the bow
// ---------------------------------------------------------------

// Where a stem starts: a lily's middle, or the bottom of a filler's own stem (null if it starts below the paper)
function stemStart(item, rimY) {
    if (item.kind === "lily") return item.y < rimY ? { x: item.x, y: item.y } : null;
    const g = fillerGeometry(item);
    return g.by < rimY && g.by < -4 ? { x: g.bx, y: g.by } : null;
}

// How wide the paper's opening is: as wide as the stems are at its top edge, plus a little
function wrapMouth(items, bundleX, rimY) {
    let reach = 0;
    items.forEach(function (it) {
        const start = stemStart(it, rimY);
        if (!start) return;
        const bx = bundleX[it.id];
        reach = Math.max(reach, Math.abs(bx + (start.x - bx) * (rimY / start.y)));
    });
    return Math.max(48, Math.min(140, reach + 14));
}

// Draw the wrapping paper, the sash and the bow. wrap: { paper: "#hex", ribbon: "#hex" }.
// The paper's top edge (rimY) sits just below the lowest bloom, as wide as the opening (mouth), and it narrows
// to a point below the tied stems. The bow is tied where the paper narrows.
function drawWrap(wrap, rimY, mouth) {
    // drawWrapping is 200 x 220 with its top edge around y = 46, its point around y = 214,
    // and 86 either side of the middle at the top. Stretch it to fit.
    const sx = mouth / 86;
    const sy = (16 - rimY) / 168;
    const sashY = 150;                                // where the paper narrows (in the drawing)
    const line = shade(wrap.ribbon, -0.4);
    const band = '<path d="M57 ' + sashY + ' Q100 ' + (sashY + 13) + ' 143 ' + sashY + '" fill="none" stroke="' + line + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M57 ' + sashY + ' Q100 ' + (sashY + 13) + ' 143 ' + sashY + '" fill="none" stroke="' + wrap.ribbon + '" stroke-width="6.5" stroke-linecap="round"/>';
    const bowSize = 0.75 * Math.min(sx, sy);
    const bowX = 0;
    const bowY = rimY + (sashY + 6 - 46) * sy;

    return '<g class="wrap" pointer-events="none">' +
        '<g transform="translate(0 ' + rimY.toFixed(1) + ') scale(' + sx.toFixed(3) + ' ' + sy.toFixed(3) + ') translate(-100 -46)">' +
        drawWrapping({ color: wrap.paper }) + band + '</g>' +
        '<g transform="translate(' + (bowX - 60 * bowSize).toFixed(1) + ' ' + (bowY - 48 * bowSize).toFixed(1) + ') scale(' + bowSize.toFixed(3) + ')">' +
        drawRibbon({ color: wrap.ribbon }) + '</g></g>';
}

// Draw a list of items (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// zoom: how much to scale it. area: draws an invisible dotted line around the area flowers can be moved in.
// rimY: where the top edge of the wrapping paper is.
// wrap: { paper, ribbon } colors to draw the wrapping and bow, or nothing to leave the bouquet unwrapped.
function drawItems(items, zoom, area, wrap, rimY) {
    // tie all stems into one bundle, in left-to-right order so they don't cross
    const bundleX = {};
    const bundleWidth = Math.min(26, 8 + items.length * 1.2);
    items.slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (it, i) {
        bundleX[it.id] = items.length > 1 ? (i / (items.length - 1) - 0.5) * bundleWidth : 0;
    });

    // with wrapping paper, the stems go in through its opening
    const route = wrap ? { rimY: rimY, mouth: wrapMouth(items, bundleX, rimY) } : null;

    // draw from the back (low z) to the front (high z)
    let pictures = '';
    items.slice().sort(function (a, b) { return a.z - b.z; }).forEach(function (it) {
        pictures += it.kind === "lily" ? drawLilyItem(it, bundleX[it.id], route) : drawFillerItem(it, bundleX[it.id], route);
    });

    // The dotted line around the area flowers can be moved in. It is there but invisible; the builder
    // shows it only while a flower is being dragged.
    let outline = '';
    if (area) {
        const points = [];
        for (let i = 0; i <= 60; i++) {
            const angle = Math.PI + i / 60 * Math.PI;                       // the top half of an oval
            points.push((area.rx * Math.cos(angle)).toFixed(1) + ' ' + (area.baseY + area.ry * Math.sin(angle)).toFixed(1));
        }
        points.push('0 ' + area.baseY.toFixed(1).replace('-0.0', '0'));
        outline = '<path class="area-outline" d="M' + points.join(' L') + ' Z" fill="none" stroke="#F8F1C4" stroke-width="1.5" stroke-dasharray="6 6" opacity="0"/>';
    }

    // Everything below the tie is trimmed flat, like a florist's cut stems.
    return '<defs><clipPath id="bouquet-trim"><rect x="-600" y="-900" width="1200" height="900"/></clipPath></defs>' +
        '<g class="bouquet-zoom" transform="translate(150 ' + BASE_Y + ') scale(' + zoom.toFixed(3) + ')">' + outline +
        '<g class="bouquet-items" clip-path="url(#bouquet-trim)">' + pictures + '</g>' +
        (wrap ? drawWrap(wrap, rimY, route.mouth) : '') + '</g>';
}

// Draw the whole bouquet (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// lilyCounts: how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillerCounts: how many of each filler, e.g. { babys: 1, lavender: 2, ... }
// arrangement (optional): flowers moved by hand. If it is given, it is drawn instead of the template.
// showArea (optional): draw the dotted line around the area flowers can be moved in.
// wrap (optional): { paper: "#hex", ribbon: "#hex" }. The bouquet is wrapped with these colors.
function drawBouquet(lilyCounts, fillerCounts, arrangement, showArea, wrap) {
    if (arrangement) {
        return drawItems(arrangement.items, arrangement.zoom, showArea ? arrangement.area : null, wrap, arrangement.rimY);
    }
    const template = templateItems(lilyCounts, fillerCounts);
    if (template.items.length === 0) return '';
    return drawItems(template.items, fitZoom(template.items), null, wrap, wrapRim(template.items));
}

// Find the colors for a wrap key and a ribbon key (falls back to the defaults)
function wrapColors(wrapKey, ribbonKey) {
    const paper = WRAP_COLORS.filter(function (c) { return c.key === wrapKey; })[0] || WRAP_COLORS[0];
    const ribbon = RIBBON_COLORS.filter(function (c) { return c.key === ribbonKey; })[0] || RIBBON_COLORS[0];
    return { paper: paper.color, ribbon: ribbon.color };
}

// ---------------------------------------------------------------
// Saved bouquets (used by the builder to save, and by the main page's My bouquets)
// ---------------------------------------------------------------

// The browser's storage key, and the name used when nobody typed one
const SAVE_KEY = "happy-lilies-bouquets";
const DEFAULT_NAME = "Bouquet for Kat";

// The list of saved bouquets. Any problem (storage blocked, broken data) gives an empty list.
function readSavedBouquets() {
    try {
        const list = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
        return Array.isArray(list) ? list.filter(function (b) { return b && b.lilies && b.fillers; }) : [];
    } catch (e) {
        return [];
    }
}

// Save the whole list. Returns true if it worked, false if the browser said no.
function writeSavedBouquets(list) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        return false;
    }
}

// The name to show for a saved bouquet
function savedName(b) {
    return ((b && b.name) || "").trim() || DEFAULT_NAME;
}

// A small picture of a saved bouquet (an <svg> tag as text)
function savedPicture(b) {
    return makeSvg(drawBouquet(b.lilies, b.fillers, b.arrangement || null, false, wrapColors(b.wrap, b.ribbon)), "0 0 300 300");
}
