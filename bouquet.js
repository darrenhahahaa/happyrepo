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

// ---------------------------------------------------------------
// LILY LAYOUTS: one hand-made arrangement for every number of lilies, 1 to 18
// ---------------------------------------------------------------
// The bouquet is drawn in its own "design space" where (0, 0) is the point where all the stems
// are tied together (where the wrapping will hold them). Up is negative y.
// Each lily is [x, y, size, turn]: its place, its size (front lilies are lower and a bit bigger,
// back ones higher and a bit smaller) and how far its petals are turned, in degrees.
// The first lily in each list is the middle one, then the ring around it, then the outer ring.
// Every layout is balanced left to right. centerY is the height of the middle of the dome.
// To change how a bouquet looks, just edit the numbers.
const LILY_LAYOUTS = {
    1: { centerY: -124, lilies: [
        [0, -124, 0.62, -30]
    ] },
    2: { centerY: -124, lilies: [
        [-27, -124, 0.62, -30], [27, -124, 0.62, -7]
    ] },
    3: { centerY: -141.6, lilies: [
        [0.0, -176.8, 0.588, -30], [34.6, -124.0, 0.636, -7], [-34.6, -124.0, 0.636, 16]
    ] },
    4: { centerY: -169.8, lilies: [
        [0, -169.8, 0.62, -30], [-45.0, -192.6, 0.599, -7], [45.0, -192.6, 0.599, 16],
        [0.0, -124.0, 0.662, -21]
    ] },
    5: { centerY: -146.9, lilies: [
        [0, -146.9, 0.62, -30], [-45.0, -169.8, 0.599, -7], [45.0, -169.8, 0.599, 16],
        [-45.0, -124.0, 0.641, -21], [45.0, -124.0, 0.641, 2]
    ] },
    6: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [-46.8, -195.3, 0.598, -7], [46.8, -195.3, 0.598, 16],
        [-46.8, -147.8, 0.642, -21], [46.8, -147.8, 0.642, 2], [0.0, -124.0, 0.663, 25]
    ] },
    7: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12]
    ] },
    8: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [0.0, -266.6, 0.533, 11]
    ] },
    9: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-104.3, -196.1, 0.598, 11], [104.3, -196.1, 0.598, -26]
    ] },
    10: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-104.3, -196.1, 0.598, 11], [0.0, -266.6, 0.533, -26],
        [104.3, -196.1, 0.598, -3]
    ] },
    11: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-108.0, -171.5, 0.62, 11], [-69.4, -244.3, 0.553, -26],
        [69.4, -244.3, 0.553, -3], [108.0, -171.5, 0.62, 20]
    ] },
    12: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-108.0, -171.5, 0.62, 11], [-69.4, -244.3, 0.553, -26],
        [0.0, -266.6, 0.533, -3], [69.4, -244.3, 0.553, 20], [108.0, -171.5, 0.62, -17]
    ] },
    13: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-101.5, -139.0, 0.65, 11], [-101.5, -204.0, 0.59, -26],
        [-54.0, -253.8, 0.545, -3], [54.0, -253.8, 0.545, 20], [101.5, -204.0, 0.59, -17],
        [101.5, -139.0, 0.65, 6]
    ] },
    14: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-101.5, -139.0, 0.65, 11], [-101.5, -204.0, 0.59, -26],
        [-54.0, -253.8, 0.545, -3], [0.0, -266.6, 0.533, 20], [54.0, -253.8, 0.545, -17],
        [101.5, -204.0, 0.59, 6], [101.5, -139.0, 0.65, 29]
    ] },
    15: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-97.9, -131.4, 0.657, 11], [-106.4, -188.0, 0.605, -26],
        [-82.7, -232.6, 0.564, -3], [-36.9, -260.8, 0.538, 20], [36.9, -260.8, 0.538, -17],
        [82.7, -232.6, 0.564, 6], [106.4, -188.0, 0.605, 29], [97.9, -131.4, 0.657, -8]
    ] },
    16: { centerY: -171.5, lilies: [
        [0, -171.5, 0.62, -30], [0.0, -219.0, 0.577, -7], [-46.8, -195.3, 0.598, 16],
        [46.8, -195.3, 0.598, -21], [-46.8, -147.8, 0.642, 2], [46.8, -147.8, 0.642, 25],
        [0.0, -124.0, 0.663, -12], [-93.5, -124.0, 0.663, 11], [-108.0, -171.5, 0.62, -26],
        [-93.5, -219.0, 0.577, -3], [-54.0, -253.8, 0.545, 20], [0.0, -266.6, 0.533, -17],
        [54.0, -253.8, 0.545, 6], [93.5, -219.0, 0.577, 29], [108.0, -171.5, 0.62, -8],
        [93.5, -124.0, 0.663, 15]
    ] },
    17: { centerY: -191.2, lilies: [
        [0, -191.2, 0.62, -30], [0.0, -238.7, 0.577, -7], [-46.8, -215.0, 0.598, 16],
        [46.8, -215.0, 0.598, -21], [-46.8, -167.4, 0.642, 2], [46.8, -167.4, 0.642, 25],
        [0.0, -143.7, 0.663, -12], [-76.4, -124.0, 0.681, 11], [-104.3, -166.6, 0.642, -26],
        [-104.3, -215.8, 0.598, -3], [-76.4, -258.4, 0.559, 20], [-28.0, -283.0, 0.536, -17],
        [28.0, -283.0, 0.536, 6], [76.4, -258.4, 0.559, 29], [104.3, -215.8, 0.598, -8],
        [104.3, -166.6, 0.642, 15], [76.4, -124.0, 0.681, -22]
    ] },
    18: { centerY: -206.3, lilies: [
        [0, -206.3, 0.62, -30], [0.0, -253.8, 0.577, -7], [-46.8, -230.1, 0.598, 16],
        [46.8, -230.1, 0.598, -21], [-46.8, -182.5, 0.642, 2], [46.8, -182.5, 0.642, 25],
        [0.0, -158.8, 0.663, -12], [-54.0, -124.0, 0.695, 11], [-93.5, -158.8, 0.663, -26],
        [-108.0, -206.3, 0.62, -3], [-93.5, -253.8, 0.577, 20], [-54.0, -288.6, 0.545, -17],
        [0.0, -301.3, 0.533, 6], [54.0, -288.6, 0.545, 29], [93.5, -253.8, 0.577, -8],
        [108.0, -206.3, 0.62, 15], [93.5, -158.8, 0.663, -22], [54.0, -124.0, 0.695, 1]
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
    return { x: place, y: dome.cy + dome.down + 8 + Math.abs(place) * 0.08 };                       // daisies: a row along the front
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
    return Math.min(1.5, 270 / up, 140 / side);
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
    return { zoom: Math.min(fitZoom(template.items), 0.8), nextId: 1, items: template.items };
}

// The part of the canvas where flowers may be placed: an oval-ish bouquet area inside the picture.
function arrangeArea(zoom) {
    const maxX = 140 / zoom;
    const minY = -270 / zoom + 14;
    const maxY = -40;
    return { maxX: maxX, minY: minY, maxY: maxY, cx: 0, cy: (minY + maxY) / 2, rx: maxX * 1.25, ry: (maxY - minY) / 2 * 1.25 };
}

// Keep a point inside the bouquet area (so a flower can't be dragged off the wrap)
function clampToArea(x, y, zoom) {
    const area = arrangeArea(zoom);
    x = Math.max(-area.maxX, Math.min(area.maxX, x));
    y = Math.max(area.minY, Math.min(area.maxY, y));
    const dx = (x - area.cx) / area.rx;
    const dy = (y - area.cy) / area.ry;
    const out = Math.hypot(dx, dy);
    if (out > 1) {
        x = area.cx + dx / out * area.rx;
        y = area.cy + dy / out * area.ry;
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
        const area = arrangeArea(arrangement.zoom);
        for (let y = area.minY; y <= -90; y += 10) {
            for (let x = -area.maxX; x <= area.maxX; x += 10) {
                const spot = clampToArea(x, y, arrangement.zoom);
                if (Math.abs(spot.x - x) > 1 || Math.abs(spot.y - y) > 1) continue;
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
    const spot = clampToArea(best.x, best.y, arrangement.zoom);
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

// A stem from (x, y) down into the tied bundle at (bundleX, 0). Two paths: an outline and a lighter middle.
// The data-* values let the builder bend the stem while a flower is being dragged.
function stemPaths(x, y, bundleX, outline, outlineWidth, color, colorWidth) {
    const path = 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' Q' + (x + (bundleX - x) * 0.15).toFixed(1) + ' ' + (y * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
    const data = ' class="stem-path" data-sx="' + x.toFixed(1) + '" data-sy="' + y.toFixed(1) + '" data-bundle="' + bundleX.toFixed(1) + '" fill="none" stroke-linecap="round"';
    return '<path d="' + path + '"' + data + ' stroke="' + outline + '" stroke-width="' + outlineWidth.toFixed(2) + '"/>' +
        '<path d="' + path + '"' + data + ' stroke="' + color + '" stroke-width="' + colorWidth.toFixed(2) + '"/>';
}

// An invisible circle that makes a flower easy to grab with a finger
function hitCircle(x, y, r) {
    return '<circle class="hit" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="rgba(0,0,0,0.001)"/>';
}

function drawLilyItem(item, bundleX) {
    const type = lilyTypeFor(item.type);
    return '<g class="item" data-id="' + item.id + '">' +
        stemPaths(item.x, item.y, bundleX, LEAF_LINE, 4.4, LEAF_GREEN, 2.4) +
        '<g class="body">' +
        '<g transform="translate(' + item.x.toFixed(1) + ' ' + item.y.toFixed(1) + ') rotate(' + item.spin + ') scale(' + item.scale.toFixed(3) + ') translate(-50 -52)">' +
        type.draw({ headOnly: true }) + '</g>' +
        hitCircle(item.x, item.y, 47 * item.scale * 0.9) +
        '</g></g>';
}

// A filler: the drawing with its tip at (item.x, item.y), and its stem curving down into the bundle
function drawFillerItem(item, bundleX) {
    const type = fillerTypeFor(item.type);
    const length = (140 - type.top) * type.scale;                      // height of the drawing
    const lean = Math.atan2(item.x, 230);                              // leans a little outward
    const ax = Math.sin(lean);
    const ay = -Math.cos(lean);                                        // the direction it points
    const bx = item.x - ax * length;                                   // where the drawing's own stem starts
    const by = item.y - ay * length;

    let s = '<g class="item" data-id="' + item.id + '">';
    if (by < -4) s += stemPaths(bx, by, bundleX, type.stemLine, type.stemWidth * type.scale, type.stemColor, type.stemWidth * type.scale * 0.5);
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g class="body"><g transform="translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + (lean * 180 / Math.PI).toFixed(1) + ') scale(' + type.scale + ') translate(-50 -140)">' + type.draw() + '</g>';
    s += hitCircle(item.x - ax * length * 0.3, item.y - ay * length * 0.3, Math.max(16, length * 0.22));
    return s + '</g></g>';
}

// Draw a list of items (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// zoom: how much to scale it. showArea: draw a dotted line around the area flowers can be moved in.
function drawItems(items, zoom, showArea) {
    // tie all stems into one bundle, in left-to-right order so they don't cross
    const bundleX = {};
    const bundleWidth = Math.min(26, 8 + items.length * 1.2);
    items.slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (it, i) {
        bundleX[it.id] = items.length > 1 ? (i / (items.length - 1) - 0.5) * bundleWidth : 0;
    });

    // draw from the back (low z) to the front (high z)
    let pictures = '';
    items.slice().sort(function (a, b) { return a.z - b.z; }).forEach(function (it) {
        pictures += it.kind === "lily" ? drawLilyItem(it, bundleX[it.id]) : drawFillerItem(it, bundleX[it.id]);
    });

    let area = '';
    if (showArea) {
        // the edge of the area flowers can be moved in, as a dotted line
        const a = arrangeArea(zoom);
        const points = [];
        for (let i = 0; i < 90; i++) {
            const angle = i / 90 * 2 * Math.PI;
            const edge = clampToArea(a.cx + a.rx * Math.cos(angle), a.cy + a.ry * Math.sin(angle), zoom);
            points.push(edge.x.toFixed(1) + ' ' + edge.y.toFixed(1));
        }
        area = '<path d="M' + points.join(' L') + ' Z" fill="none" stroke="#F8F1C4" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.5"/>';
    }

    // Everything below the tie is trimmed flat, like a florist's cut stems.
    return '<defs><clipPath id="bouquet-trim"><rect x="-600" y="-900" width="1200" height="900"/></clipPath></defs>' +
        '<g class="bouquet-zoom" transform="translate(150 285) scale(' + zoom.toFixed(3) + ')">' + area +
        '<g class="bouquet-items" clip-path="url(#bouquet-trim)">' + pictures + '</g></g>';
}

// Draw the whole bouquet (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// lilyCounts: how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillerCounts: how many of each filler, e.g. { babys: 1, lavender: 2, ... }
// arrangement (optional): flowers moved by hand. If it is given, it is drawn instead of the template.
// showArea (optional): draw the dotted line around the area flowers can be moved in.
function drawBouquet(lilyCounts, fillerCounts, arrangement, showArea) {
    if (arrangement) return drawItems(arrangement.items, arrangement.zoom, showArea);
    const template = templateItems(lilyCounts, fillerCounts);
    if (template.items.length === 0) return '';
    return drawItems(template.items, fitZoom(template.items), false);
}
