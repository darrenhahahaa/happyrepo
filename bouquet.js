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

// Draw one filler with its tip at (tipX, tipY). Its stem curves down into the tied bundle at (bundleX, 0).
// Returns the picture, and adds the tip to `bounds` so we know how far to zoom out.
function placeFiller(type, tipX, tipY, bundleX, bounds) {
    const length = (140 - type.top) * type.scale;                      // height of the drawing
    const lean = Math.atan2(tipX, 230);                                // leans a little outward
    const ax = Math.sin(lean);
    const ay = -Math.cos(lean);                                        // the direction it points
    const bx = tipX - ax * length;                                     // where the drawing's own stem starts
    const by = tipY - ay * length;

    bounds.add(tipX, tipY, 16);

    let s = '';
    if (by < -4) {
        // a smooth stem from the drawing down into the bundle
        const path = 'M' + bx.toFixed(1) + ' ' + by.toFixed(1) + ' Q' + (bx + (bundleX - bx) * 0.15).toFixed(1) + ' ' + (by * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
        s += '<path d="' + path + '" fill="none" stroke="' + type.stemLine + '" stroke-width="' + (type.stemWidth * type.scale).toFixed(2) + '" stroke-linecap="round"/>';
        s += '<path d="' + path + '" fill="none" stroke="' + type.stemColor + '" stroke-width="' + (type.stemWidth * type.scale * 0.5).toFixed(2) + '" stroke-linecap="round"/>';
    }
    // the drawing is 100 x 140 with its stem at the bottom middle
    s += '<g transform="translate(' + bx.toFixed(1) + ' ' + by.toFixed(1) + ') rotate(' + (lean * 180 / Math.PI).toFixed(1) + ') scale(' + type.scale + ') translate(-50 -140)">' + type.draw() + '</g>';
    return s;
}

// Draw the whole bouquet (picture pieces, no <svg> tag) on a 300 x 300 canvas.
// lilyCounts: how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillerCounts: how many of each filler, e.g. { babys: 1, lavender: 2, ... }
// Also used for the big reveal later.
function drawBouquet(lilyCounts, fillerCounts) {
    let n = 0;
    LILY_TYPES.forEach(function (type) { n += lilyCounts[type.key]; });
    if (n === 0) return '';

    // the hand-made layout for this many lilies, and a color for every place in it
    const layout = LILY_LAYOUTS[n];
    const colors = spreadColors(layout.lilies, lilyCounts);
    const heads = layout.lilies.map(function (spot, k) {
        return { type: colors[k], x: spot[0], y: spot[1], scale: spot[2], spin: spot[3] };
    });
    const dome = domeSize(heads, layout.centerY);

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
    heads.forEach(function (head) {
        bounds.add(head.x, head.y, LILY_REACH + 2);
        stems.push({ x: head.x, head: head });
    });

    // ----- fillers: work out where each tip goes -----
    const layers = { frame: [], spikes: [], puffs: [], row: [] };
    FILLER_TYPES.forEach(function (type) {
        const count = fillerCounts[type.key];
        if (count === 0) return;
        FILLER_LAYOUTS[type.key][count].forEach(function (place) {
            let tip;
            if (type.role === "frame") {
                tip = onDome(dome, place, 26);
            } else if (type.role === "spikes") {
                tip = onDome(dome, place, 38 + (1 - Math.abs(place) / 90) * 14);   // the middle ones are tallest
            } else if (type.role === "puffs") {
                tip = onDome(dome, place, 2);
            } else {
                tip = { x: place, y: dome.cy + dome.down + 8 + Math.abs(place) * 0.08 };
            }
            const filler = { type: type, x: tip.x, y: tip.y };
            layers[type.role].push(filler);
            stems.push({ x: filler.x, filler: filler });
        });
    });

    // ----- tie all stems into one bundle, in left-to-right order so they don't cross -----
    stems.sort(function (a, b) { return a.x - b.x; });
    const bundleWidth = Math.min(26, 8 + stems.length * 1.2);
    stems.forEach(function (stem, i) {
        stem.bundleX = stems.length > 1 ? (i / (stems.length - 1) - 0.5) * bundleWidth : 0;
    });
    function bundleOf(key, thing) {
        return stems.filter(function (s) { return s[key] === thing; })[0].bundleX;
    }

    // ----- draw, from the back to the front -----
    let behind = '';
    ['frame', 'spikes', 'puffs'].forEach(function (role) {
        layers[role].forEach(function (f) {
            behind += placeFiller(f.type, f.x, f.y, bundleOf('filler', f), bounds);
        });
    });

    let lilyStems = '';
    heads.forEach(function (h) {
        const bundleX = bundleOf('head', h);
        const path = 'M' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ' Q' + (h.x + (bundleX - h.x) * 0.15).toFixed(1) + ' ' + (h.y * 0.4).toFixed(1) + ' ' + bundleX.toFixed(1) + ' 0';
        lilyStems += '<path d="' + path + '" fill="none" stroke="' + LEAF_LINE + '" stroke-width="4.4" stroke-linecap="round"/>';
        lilyStems += '<path d="' + path + '" fill="none" stroke="' + LEAF_GREEN + '" stroke-width="2.4" stroke-linecap="round"/>';
    });

    let row = '';
    layers.row.forEach(function (f) {
        row += placeFiller(f.type, f.x, f.y, bundleOf('filler', f), bounds);
    });

    let flowers = '';
    heads.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (h) {
        flowers += '<g transform="translate(' + h.x.toFixed(1) + ' ' + h.y.toFixed(1) + ') rotate(' + h.spin + ') scale(' + h.scale.toFixed(3) + ') translate(-50 -52)">' +
            h.type.draw({ headOnly: true }) + '</g>';
    });

    // zoom the whole bouquet to fit the canvas (the tied stems sit at the bottom middle).
    // Everything below the tie is trimmed flat, like a florist's cut stems.
    const zoom = Math.min(1.5, 270 / bounds.up, 140 / bounds.side);
    return '<defs><clipPath id="bouquet-trim"><rect x="-600" y="-900" width="1200" height="900"/></clipPath></defs>' +
        '<g transform="translate(150 285) scale(' + zoom.toFixed(3) + ')"><g clip-path="url(#bouquet-trim)">' +
        behind + lilyStems + row + flowers + '</g></g>';
}
