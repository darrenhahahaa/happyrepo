// flowers.js: all the flower, wrapping and ribbon drawings.
// Every draw function returns a string of SVG shapes (a <g> group).
// Put that string inside an <svg> using the matching viewBox from VIEWBOX below.
// Everything is drawn in code, no image files.

// Size of the drawing area for each kind of drawing
const VIEWBOX = {
    flower: "0 0 100 140",   // lilies and fillers: stem ends at the bottom middle (50, 140)
    wrapping: "0 0 200 220",
    ribbon: "0 0 120 100"
};

// Colors shared by all the drawings
const LEAF_GREEN = "#8fc79a";
const LEAF_LINE = "#4f8b60";

// Make a color lighter (amount 0 to 1) or darker (amount 0 to -1). Works with "#rrggbb".
function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const target = amount < 0 ? 0 : 255;
    const p = Math.abs(amount);
    const mix = function (c) { return Math.round((target - c) * p + c); };
    const r = mix(n >> 16);
    const g = mix((n >> 8) & 255);
    const b = mix(n & 255);
    return "#" + [r, g, b].map(function (c) { return c.toString(16).padStart(2, "0"); }).join("");
}

// Wrap drawing pieces in a full <svg> tag (handy for the gallery and later for the PNG download)
function makeSvg(inner, viewBox, size) {
    const px = size ? ' width="' + size + '"' : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '"' + px + '>' + inner + '</svg>';
}

// ---------------------------------------------------------------
// LILIES
// ---------------------------------------------------------------

// One lily seen from the front, drawn from a few color options:
//   id: short name (used for the color gradients), petal: main petal color,
//   throat: color near the middle, stripe: color of the center stripe on each petal,
//   spots: freckle color (or null), line: outline color (optional)
function drawLily(o) {
    const line = o.line || shade(o.petal, -0.45);
    const outerFill = "url(#" + o.id + "-outer)";
    const innerFill = "url(#" + o.id + "-inner)";

    // Color blends: the petals fade from the throat color at the base to the petal color at the tip
    let s = '<defs>' +
        '<linearGradient id="' + o.id + '-outer" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#c9df93"/>' +
        '<stop offset="0.3" stop-color="' + shade(o.petal, -0.08) + '"/>' +
        '<stop offset="1" stop-color="' + shade(o.petal, -0.14) + '"/></linearGradient>' +
        '<linearGradient id="' + o.id + '-inner" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="' + o.throat + '"/>' +
        '<stop offset="0.3" stop-color="' + o.petal + '"/>' +
        '<stop offset="1" stop-color="' + shade(o.petal, -0.05) + '"/></linearGradient>' +
        '</defs>';

    // Two petal shapes pointing up from the center (0, 0):
    // the outer ones are narrow and pointed, the inner ones are wider with a wavy edge
    const outerShape = "M0 0 C-9 -6 -13 -20 -9 -32 C-6 -39 -2 -43 0 -47 C2 -43 6 -39 9 -32 C13 -20 9 -6 0 0 Z";
    const innerShape = "M0 0 C-16 -8 -21 -22 -17 -32 C-15 -36 -12 -36 -10 -40 C-7 -44 -3 -45 0 -48 C3 -45 7 -44 10 -40 C12 -36 15 -36 17 -32 C21 -22 16 -8 0 0 Z";
    // freckle positions along the middle of a petal: [x, y, size]
    const freckles = [[-3, -10, 1.1], [3, -12, 1.3], [-6, -16, 1.2], [1, -17, 1.5], [6, -19, 1.1], [-3, -22, 1.4],
                      [4, -25, 1.2], [-7, -25, 1], [0, -29, 1.3], [-3, -33, 1], [6, -31, 0.9]];

    // Draws one petal turned by `angle` degrees. wide = true for the inner petals.
    function petal(angle, wide) {
        let p = '<g transform="rotate(' + angle + ')">';
        p += '<path d="' + (wide ? innerShape : outerShape) + '" fill="' + (wide ? innerFill : outerFill) + '" stroke="' + line + '" stroke-width="1.5" stroke-linejoin="round"/>';
        // stripe down the middle of the petal
        p += '<path d="M0 -3 C-2.5 -14 -3 -28 0 -40 C3 -28 2.5 -14 0 -3 Z" fill="' + o.stripe + '" opacity="0.5"/>';
        // the groove and the fine veins
        p += '<path d="M0 -4 L0 -40" stroke="' + line + '" stroke-width="1" stroke-linecap="round" opacity="0.5"/>';
        const spread = wide ? 1 : 0.65;
        [-1, 1].forEach(function (side) {
            p += '<path d="M0 -6 C' + (side * 5 * spread) + ' -16 ' + (side * 7 * spread) + ' -28 ' + (side * 5 * spread) + ' -36" fill="none" stroke="' + line + '" stroke-width="0.7" stroke-linecap="round" opacity="0.3"/>';
            p += '<path d="M0 -6 C' + (side * 10 * spread) + ' -14 ' + (side * 13 * spread) + ' -24 ' + (side * 11 * spread) + ' -31" fill="none" stroke="' + line + '" stroke-width="0.6" stroke-linecap="round" opacity="0.2"/>';
        });
        // freckles (the wide petals get all of them, narrow petals a few)
        if (o.spots) {
            freckles.forEach(function (f, i) {
                if (wide || i < 7) {
                    p += '<circle cx="' + (f[0] * spread) + '" cy="' + f[1] + '" r="' + f[2] + '" fill="' + o.spots + '" opacity="0.85"/>';
                }
            });
        }
        return p + '</g>';
    }

    // A long thin leaf pointing up from (0, 0)
    function leaf(x, y, angle, len) {
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + angle + ')">' +
            '<path d="M0 0 C-5 -' + (len * 0.3) + ' -4.5 -' + (len * 0.7) + ' 0 -' + len + ' C4.5 -' + (len * 0.7) + ' 5 -' + (len * 0.3) + ' 0 0 Z" fill="' + LEAF_GREEN + '" stroke="' + LEAF_LINE + '" stroke-width="1.3" stroke-linejoin="round"/>' +
            '<path d="M0 -2 L0 -' + (len * 0.9) + '" stroke="' + LEAF_LINE + '" stroke-width="0.9" stroke-linecap="round" opacity="0.7"/>' +
            '<path d="M1.6 -' + (len * 0.2) + ' L1.6 -' + (len * 0.65) + '" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" opacity="0.35"/>' +
            '</g>';
    }

    // stem (dark outline, then a lighter line on top)
    s += '<path d="M50 52 C47 80 53 110 50 140" fill="none" stroke="' + LEAF_LINE + '" stroke-width="5" stroke-linecap="round"/>';
    s += '<path d="M50 52 C47 80 53 110 50 140" fill="none" stroke="' + LEAF_GREEN + '" stroke-width="2.6" stroke-linecap="round"/>';
    // leaves along the stem
    s += leaf(50, 130, -62, 38);
    s += leaf(51, 114, 58, 34);
    s += leaf(49, 98, -50, 26);
    // a closed bud on a little side stalk
    s += '<path d="M51 120 C62 120 72 114 78 105" fill="none" stroke="' + LEAF_LINE + '" stroke-width="3.4" stroke-linecap="round"/>';
    s += '<path d="M51 120 C62 120 72 114 78 105" fill="none" stroke="' + LEAF_GREEN + '" stroke-width="1.6" stroke-linecap="round"/>';
    s += '<g transform="translate(78 105) rotate(28)">' +
        '<ellipse cx="0" cy="-12" rx="5.4" ry="13" fill="' + innerFill + '" stroke="' + line + '" stroke-width="1.4"/>' +
        '<path d="M0 -2 C-3 -10 -3 -18 0 -25 M0 -2 C3 -10 3 -18 0 -25" fill="none" stroke="' + line + '" stroke-width="0.8" opacity="0.5"/>' +
        '<path d="M-5 -4 C-4 -1 4 -1 5 -4 C4 1 -4 1 -5 -4 Z" fill="' + LEAF_GREEN + '" stroke="' + LEAF_LINE + '" stroke-width="1"/>' +
        '</g>';

    // the flower head, centered at (50, 52)
    s += '<g transform="translate(50 52)">';
    [0, 120, 240].forEach(function (a) { s += petal(a, false); });   // outer petals (behind)
    [60, 180, 300].forEach(function (a) { s += petal(a, true); });   // inner petals (in front)
    // green star in the middle of the flower
    s += '<circle r="5.5" fill="#b8d56a" opacity="0.85"/>';
    // stamens: curved filaments with big rusty anthers covered in pollen
    [12, 72, 132, 192, 252, 312].forEach(function (a, i) {
        const len = 19 + (i % 2) * 4;
        s += '<g transform="rotate(' + a + ')">';
        s += '<path d="M0 0 Q2 -' + (len * 0.5) + ' 0 -' + len + '" fill="none" stroke="' + shade(o.throat, -0.35) + '" stroke-width="1.1" stroke-linecap="round"/>';
        s += '<ellipse cx="0" cy="-' + (len + 2) + '" rx="2.3" ry="5.2" fill="#a9521c" stroke="#6e300e" stroke-width="0.8" transform="rotate(' + (i % 2 ? 14 : -14) + ' 0 -' + (len + 2) + ')"/>';
        s += '<circle cx="0.8" cy="-' + (len + 3) + '" r="0.7" fill="#f2b45a"/>';
        s += '</g>';
    });
    // the pistil: a longer stalk ending in a 3-lobed tip
    s += '<path d="M0 0 Q4 -12 6 -26" fill="none" stroke="#7aa850" stroke-width="1.6" stroke-linecap="round"/>';
    s += '<circle cx="4.6" cy="-27" r="1.8" fill="#d9e48a" stroke="#7aa850" stroke-width="0.8"/>';
    s += '<circle cx="7.8" cy="-26" r="1.8" fill="#d9e48a" stroke="#7aa850" stroke-width="0.8"/>';
    s += '<circle cx="6.2" cy="-29" r="1.8" fill="#d9e48a" stroke="#7aa850" stroke-width="0.8"/>';
    s += '</g>';
    return '<g>' + s + '</g>';
}

function drawWhiteLily() {
    return drawLily({ id: "lily-white", petal: "#fffdf8", throat: "#f1f4c4", stripe: "#d4e29a", spots: null, line: "#b3ab9a" });
}

function drawStargazerLily() {
    return drawLily({ id: "lily-stargazer", petal: "#f27fa8", throat: "#fbc9d8", stripe: "#c0306a", spots: "#a01c55" });
}

function drawOrangeLily() {
    return drawLily({ id: "lily-orange", petal: "#ff9f3d", throat: "#ffd9a0", stripe: "#d9631a", spots: "#8f3a12" });
}

function drawYellowLily() {
    return drawLily({ id: "lily-yellow", petal: "#ffdc4d", throat: "#fff3b0", stripe: "#e8b800", spots: null });
}

function drawBlushLily() {
    return drawLily({ id: "lily-blush", petal: "#f8cfd8", throat: "#fff1ee", stripe: "#e79bb0", spots: null });
}

// ---------------------------------------------------------------
// FILLER FLOWERS
// ---------------------------------------------------------------

// A tiny random number maker. The same seed always gives the same numbers,
// so a drawing looks identical every time (a real random would change it on each refresh).
function seeded(seed) {
    return function () {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

// Baby's breath: lots of fine branching stems with tiny five-petal flowers and buds
function drawBabysBreath() {
    const rand = seeded(11);
    const stem = "#86ad8b";
    const stemLine = "#4f7a5a";
    const petalLine = "#c8c5dc";
    let stems = '';
    let blooms = '';

    // one tiny flower with 5 round petals and a pale center
    function flower(x, y, r) {
        let f = '';
        for (let i = 0; i < 5; i++) {
            const a = i * 72 * Math.PI / 180 + rand();
            f += '<circle cx="' + (x + Math.cos(a) * r * 0.75).toFixed(1) + '" cy="' + (y + Math.sin(a) * r * 0.75).toFixed(1) + '" r="' + (r * 0.62).toFixed(1) + '" fill="#ffffff" stroke="' + petalLine + '" stroke-width="0.6"/>';
        }
        return f + '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r * 0.3).toFixed(1) + '" fill="#e6dc7e"/>';
    }
    // a closed bud
    function bud(x, y) {
        return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.5" fill="#f6f2f8" stroke="' + petalLine + '" stroke-width="0.6"/>';
    }

    // a branch that splits in two or three, again and again. angle is in radians from straight up.
    function branch(x, y, angle, len, depth) {
        const x2 = x + Math.sin(angle) * len;
        const y2 = y - Math.cos(angle) * len;
        stems += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="' + stem + '" stroke-width="' + (0.7 + depth * 0.45).toFixed(2) + '" stroke-linecap="round"/>';
        if (depth === 0) {
            // end of the branch: a little cluster of flowers and buds on short stalks
            [[0, 0, 1], [-4, 3, 0], [4, 2.5, 0]].forEach(function (c, i) {
                const cx = x2 + c[0];
                const cy = y2 + c[1];
                if (i > 0) {
                    stems += '<path d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + cx.toFixed(1) + ' ' + cy.toFixed(1) + '" stroke="' + stem + '" stroke-width="0.5"/>';
                }
                blooms += (c[2] || rand() > 0.45) ? flower(cx, cy, 1.9 + rand() * 0.9) : bud(cx, cy);
            });
            return;
        }
        // two or three child branches fanning out
        const spread = [-0.62, 0.58, 0.04];
        const kids = depth === 3 ? 3 : 2;
        for (let k = 0; k < kids; k++) {
            branch(x2, y2, angle * 0.55 + spread[k] + (rand() - 0.5) * 0.25, len * (0.72 + rand() * 0.1), depth - 1);
        }
    }

    // the main stem, then the branching
    stems += '<path d="M50 140 L50 118" stroke="' + stemLine + '" stroke-width="3" stroke-linecap="round"/>';
    stems += '<path d="M50 140 L50 118" stroke="' + stem + '" stroke-width="1.5" stroke-linecap="round"/>';
    branch(50, 118, 0, 30, 4);
    // a couple of thin leaves where the stem starts to branch
    stems += '<path d="M50 120 Q40 116 34 108 Q44 110 50 120 Z" fill="' + stem + '" stroke="' + stemLine + '" stroke-width="0.8"/>';
    stems += '<path d="M50 120 Q60 116 66 108 Q56 110 50 120 Z" fill="' + stem + '" stroke="' + stemLine + '" stroke-width="0.8"/>';
    return '<g>' + stems + blooms + '</g>';
}

// Eucalyptus: a reddish stem with pairs of round, powdery blue-green leaves
function drawEucalyptus() {
    const stemColor = "#a88b78";
    const stemLine = "#6b4f3f";
    const leafLine = "#587f73";

    let s = '<defs><linearGradient id="euc-leaf" x1="0" y1="1" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#8fb0a4"/><stop offset="0.6" stop-color="#a9c8bc"/>' +
        '<stop offset="1" stop-color="#cfe2da"/></linearGradient></defs>';

    // The stem wiggles gently. This gives the x position of the stem at height y.
    function stemX(y) { return 50 + 3.5 * Math.sin(y / 17); }

    let d = 'M' + stemX(140).toFixed(1) + ' 140';
    for (let y = 135; y >= 12; y -= 5) { d += ' L' + stemX(y).toFixed(1) + ' ' + y; }
    s += '<path d="' + d + '" fill="none" stroke="' + stemLine + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '<path d="' + d + '" fill="none" stroke="' + stemColor + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';

    // One round leaf on a short stalk, pointing up from (0, 0), made bigger or smaller by `size`
    function leaf(x, y, angle, size) {
        let l = '<g transform="translate(' + x.toFixed(1) + ' ' + y + ') rotate(' + angle + ') scale(' + size.toFixed(2) + ')">';
        l += '<path d="M0 0 L0 -4" stroke="' + stemLine + '" stroke-width="1.4" stroke-linecap="round"/>';
        l += '<path d="M0 -3 C-11 -5 -14 -19 -7 -24 C-3 -27 3 -27 7 -24 C14 -19 11 -5 0 -3 Z" fill="url(#euc-leaf)" stroke="' + leafLine + '" stroke-width="1.2" stroke-linejoin="round"/>';
        // lighter half, like light catching the leaf
        l += '<path d="M0 -3 L0 -26.5 C3 -26.5 5 -25.5 7 -24 C14 -19 11 -5 0 -3 Z" fill="#ffffff" opacity="0.22"/>';
        // the middle vein and side veins
        l += '<path d="M0 -4 L0 -25" stroke="' + leafLine + '" stroke-width="0.9" stroke-linecap="round"/>';
        [[-9, 7], [-14, 9], [-19, 8]].forEach(function (v) {
            l += '<path d="M0 ' + v[0] + ' Q-4 ' + (v[0] - 1.5) + ' -' + v[1] + ' ' + (v[0] - 5) + '" fill="none" stroke="' + leafLine + '" stroke-width="0.6" opacity="0.65"/>';
            l += '<path d="M0 ' + v[0] + ' Q4 ' + (v[0] - 1.5) + ' ' + v[1] + ' ' + (v[0] - 5) + '" fill="none" stroke="' + leafLine + '" stroke-width="0.6" opacity="0.65"/>';
        });
        return l + '</g>';
    }

    // pairs of leaves going up the stem, smaller toward the top
    [122, 102, 84, 68, 53, 40, 28].forEach(function (y, i) {
        const size = 0.95 - i * 0.07;
        s += leaf(stemX(y), y, -72 + i * 2, size);
        s += leaf(stemX(y), y - 6, 70 - i * 2, size * 0.95);
        // a small bump on the stem where the leaves join
        s += '<circle cx="' + stemX(y).toFixed(1) + '" cy="' + y + '" r="1.8" fill="' + stemColor + '" stroke="' + stemLine + '" stroke-width="0.8"/>';
    });
    s += leaf(stemX(14), 16, 0, 0.5);   // top leaf
    return '<g>' + s + '</g>';
}

// Small daisies: two open daisies, one tilted daisy and a bud, on green stems
function drawDaisies() {
    const petalLine = "#c9b8ae";

    let s = '<defs>' +
        '<radialGradient id="daisy-center" cx="0.4" cy="0.35" r="0.7">' +
        '<stop offset="0" stop-color="#ffe37a"/><stop offset="0.65" stop-color="#f7b900"/><stop offset="1" stop-color="#c58500"/></radialGradient>' +
        '<linearGradient id="daisy-petal" x1="0" y1="1" x2="0" y2="0">' +
        '<stop offset="0" stop-color="#fbeab0"/><stop offset="0.35" stop-color="#ffffff"/><stop offset="1" stop-color="#fffefb"/></linearGradient>' +
        '</defs>';

    // One thin petal pointing up from the center, with a rounded tip and fine ridges
    const petalShape = "M0 -4 C-3.2 -8 -3.6 -15 -1.6 -18 C-0.6 -19.4 0.6 -19.4 1.6 -18 C3.6 -15 3.2 -8 0 -4 Z";

    // One daisy centered at (0, 0): a back ring and a front ring of petals, and a dotted center
    function daisy() {
        let d = '';
        const count = 14;
        for (let ring = 0; ring < 2; ring++) {
            for (let i = 0; i < count; i++) {
                const a = (i + ring * 0.5) * 360 / count;
                d += '<g transform="rotate(' + a.toFixed(1) + ')">' +
                    '<path d="' + petalShape + '" fill="' + (ring ? 'url(#daisy-petal)' : '#f1ebe4') + '" stroke="' + petalLine + '" stroke-width="0.8" stroke-linejoin="round"/>' +
                    (ring ? '<path d="M0 -6 L0 -16 M-1.2 -7 L-1.2 -14.5 M1.2 -7 L1.2 -14.5" stroke="' + petalLine + '" stroke-width="0.4" opacity="0.7"/>' : '') +
                    '</g>';
            }
        }
        d += '<circle r="6.2" fill="#d99a10" opacity="0.5"/>';
        d += '<circle r="5.4" fill="url(#daisy-center)" stroke="#b97a00" stroke-width="0.9"/>';
        // tiny florets arranged in a spiral
        for (let i = 1; i < 22; i++) {
            const a = i * 137.5 * Math.PI / 180;
            const r = 0.95 * Math.sqrt(i);
            d += '<circle cx="' + (Math.cos(a) * r).toFixed(2) + '" cy="' + (Math.sin(a) * r).toFixed(2) + '" r="0.5" fill="#a86d00" opacity="0.75"/>';
        }
        d += '<circle cx="-1.8" cy="-1.9" r="1.2" fill="#fff6b8" opacity="0.7"/>';
        return d;
    }

    // a lobed daisy leaf pointing up from (0, 0)
    function leaf(x, y, angle, size) {
        return '<g transform="translate(' + x + ' ' + y + ') rotate(' + angle + ') scale(' + size + ')">' +
            '<path d="M0 0 C-3 -3 -7 -4 -8 -8 C-5 -8 -4 -10 -5 -13 C-2 -12 -1 -15 0 -19 C1 -15 2 -12 5 -13 C4 -10 5 -8 8 -8 C7 -4 3 -3 0 0 Z" fill="' + LEAF_GREEN + '" stroke="' + LEAF_LINE + '" stroke-width="1.1" stroke-linejoin="round"/>' +
            '<path d="M0 -1 L0 -16" stroke="' + LEAF_LINE + '" stroke-width="0.7" opacity="0.7"/></g>';
    }

    // each flower: [x, y, size, tilt]. A tilt below 1 squashes it so it looks turned sideways.
    const heads = [[26, 46, 0.85, 1], [74, 34, 0.8, 0.62], [53, 76, 0.9, 1]];
    const budSpot = [80, 78];

    function stemTo(x, y) {
        const path = 'M50 140 Q' + (50 + (x - 50) * 0.15).toFixed(1) + ' ' + (y + (140 - y) * 0.6).toFixed(1) + ' ' + x + ' ' + y;
        return '<path d="' + path + '" fill="none" stroke="' + LEAF_LINE + '" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="' + path + '" fill="none" stroke="' + LEAF_GREEN + '" stroke-width="2" stroke-linecap="round"/>';
    }
    heads.forEach(function (h) { s += stemTo(h[0], h[1]); });
    s += stemTo(budSpot[0], budSpot[1]);
    // leaves low on the stems
    s += leaf(50, 128, -58, 1.15);
    s += leaf(50, 122, 56, 1.05);
    s += leaf(48, 108, -40, 0.8);
    // the closed bud: white petals peeking out of green sepals
    s += '<g transform="translate(' + budSpot[0] + ' ' + budSpot[1] + ') rotate(12)">' +
        '<ellipse cx="0" cy="-5" rx="4.2" ry="6" fill="url(#daisy-petal)" stroke="' + petalLine + '" stroke-width="0.9"/>' +
        '<path d="M-4.2 -1 C-5 -6 -3 -8 0 -9 C3 -8 5 -6 4.2 -1 C2 0 -2 0 -4.2 -1 Z" fill="' + LEAF_GREEN + '" stroke="' + LEAF_LINE + '" stroke-width="0.9"/>' +
        '<path d="M-2 -1 L-2.5 -7 M2 -1 L2.5 -7 M0 -1 L0 -8" stroke="' + LEAF_LINE + '" stroke-width="0.5" opacity="0.7"/></g>';
    heads.forEach(function (h) {
        s += '<g transform="translate(' + h[0] + ' ' + h[1] + ') rotate(' + (h[3] < 1 ? -20 : 0) + ') scale(' + h[2] + ' ' + (h[2] * h[3]) + ')">' + daisy() + '</g>';
    });
    return '<g>' + s + '</g>';
}

// Lavender: three bending stems, each topped with a spike of tiny florets in rings (whorls)
function drawLavender() {
    const stem = "#6f9a6a";
    const stemLine = "#46704a";
    const purples = ["#8e6fd0", "#a688e0", "#b79df0", "#9a7ad8"];
    const purpleLine = "#5b3f96";
    const calyx = "#9db59a";

    // One spike pointing up from (0, 0), `len` tall, leaning `bend` to the side near the top
    function spike(len, bend) {
        // the stem curves gently: x position at height h
        function xAt(h) { return bend * (h / len) * (h / len); }

        let d = 'M0 0';
        for (let h = 6; h <= len; h += 6) { d += ' L' + xAt(h).toFixed(1) + ' -' + h; }
        let s = '<path d="' + d + '" fill="none" stroke="' + stemLine + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
        s += '<path d="' + d + '" fill="none" stroke="' + stem + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';

        // rings of florets along the top part of the stem, from the bottom ring up to the tip
        const rings = 9;
        const spikeLen = len * 0.42;
        const angles = [-64, -38, -12, 14, 40, 66];
        for (let i = 0; i < rings; i++) {
            const h = len - spikeLen + i * (spikeLen / rings);
            const cx = xAt(h);
            const size = 1 - 0.38 * (i / (rings - 1));          // florets shrink toward the tip
            const twist = i % 2 ? 9 : -9;                        // each ring is turned a bit
            angles.forEach(function (a, k) {
                const ang = a + twist;
                const color = purples[(i + k) % purples.length];
                s += '<g transform="translate(' + cx.toFixed(1) + ' -' + h.toFixed(1) + ') rotate(' + ang + ') scale(' + size.toFixed(2) + ')">' +
                    // little gray-green cup at the base of the floret
                    '<ellipse cx="0" cy="-1.6" rx="1.7" ry="3" fill="' + calyx + '" stroke="' + stemLine + '" stroke-width="0.6"/>' +
                    // the purple petals, with a tiny notch showing the two lips
                    '<ellipse cx="0" cy="-5.2" rx="2.7" ry="4.4" fill="' + color + '" stroke="' + purpleLine + '" stroke-width="0.8"/>' +
                    '<path d="M0 -6 L0 -9" stroke="' + purpleLine + '" stroke-width="0.6" opacity="0.7"/>' +
                    '</g>';
            });
        }
        // closed buds on the very tip
        const tipX = xAt(len);
        [[-1.6, 2, 2], [1.6, 3, 2], [0, 6, 2.2]].forEach(function (b) {
            s += '<ellipse cx="' + (tipX + b[0]).toFixed(1) + '" cy="-' + (len + b[1]) + '" rx="1.8" ry="' + b[2] + '" fill="#7a5cc0" stroke="' + purpleLine + '" stroke-width="0.7"/>';
        });
        return s;
    }

    let s = '';
    // thin silvery-green leaves at the bottom
    [[-30, 42], [-12, 50], [12, 50], [30, 42]].forEach(function (l) {
        s += '<path d="M50 140 Q' + (50 + l[0] * 0.2) + ' ' + (140 - l[1] * 0.6) + ' ' + (50 + l[0]) + ' ' + (140 - l[1]) + '" fill="none" stroke="' + stemLine + '" stroke-width="2.4" stroke-linecap="round"/>';
        s += '<path d="M50 140 Q' + (50 + l[0] * 0.2) + ' ' + (140 - l[1] * 0.6) + ' ' + (50 + l[0]) + ' ' + (140 - l[1]) + '" fill="none" stroke="#9cc49a" stroke-width="1.1" stroke-linecap="round"/>';
    });
    // three spikes fanning out from the bottom middle
    s += '<g transform="translate(50 140) rotate(-17)">' + spike(104, -4) + '</g>';
    s += '<g transform="translate(50 140) rotate(17)">' + spike(104, 4) + '</g>';
    s += '<g transform="translate(50 140)">' + spike(118, 2) + '</g>';
    return '<g>' + s + '</g>';
}


// ---------------------------------------------------------------
// WRAPPING PAPER AND RIBBON
// options: { color: "#rrggbb" }
// ---------------------------------------------------------------

// Wrapping paper: a cone of paper with a folded-over front sheet, creases, shading and polka dots
function drawWrapping(options) {
    const color = (options && options.color) || "#f6c1cc";
    const id = "wrap-" + color.slice(1);
    const line = shade(color, -0.38);
    const back = shade(color, -0.14);
    const dot = shade(color, 0.5);
    const crease = shade(color, -0.3);

    // outlines of the two sheets
    const backShape = "M14 56 C40 34 70 50 100 38 C130 26 160 46 186 54 L114 208 Q101 222 88 208 Z";
    const frontShape = "M14 56 C46 44 98 56 138 90 L102 214 Q94 218 90 208 Z";

    let s = '<defs>' +
        // light on the left fading to shadow on the right
        '<linearGradient id="' + id + '-shade" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity="0.16"/></linearGradient>' +
        '<clipPath id="wrap-clip-back"><path d="' + backShape + '"/></clipPath>' +
        '<clipPath id="wrap-clip-front"><path d="' + frontShape + '"/></clipPath>' +
        '</defs>';

    // dots in a staggered grid. They get clipped to the shape of each sheet.
    let dots = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 8; col++) {
            const x = 14 + col * 26 + (row % 2) * 13;
            const y = 50 + row * 20;
            dots += '<circle cx="' + x + '" cy="' + y + '" r="3.6" fill="' + dot + '"/>';
        }
    }

    // back sheet
    s += '<path d="' + backShape + '" fill="' + back + '"/>';
    s += '<g clip-path="url(#wrap-clip-back)">' + dots + '</g>';
    s += '<path d="' + backShape + '" fill="url(#' + id + '-shade)"/>';
    // creases on the back sheet
    s += '<path d="M148 60 C140 110 128 160 112 204 M120 44 C122 100 118 150 108 200" fill="none" stroke="' + crease + '" stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>';
    s += '<path d="' + backShape + '" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linejoin="round"/>';

    // front sheet, folded over from the left (a soft shadow first so it looks lifted)
    s += '<path d="M138 90 L102 214" stroke="#000000" stroke-width="7" opacity="0.1" stroke-linecap="round"/>';
    s += '<path d="' + frontShape + '" fill="' + color + '"/>';
    s += '<g clip-path="url(#wrap-clip-front)">' + dots.replace(new RegExp(dot, 'g'), shade(color, 0.55)) + '</g>';
    s += '<path d="' + frontShape + '" fill="url(#' + id + '-shade)"/>';
    // creases on the front sheet
    s += '<path d="M44 52 C54 104 74 164 92 208 M78 58 C86 112 96 160 98 210" fill="none" stroke="' + crease + '" stroke-width="1.2" opacity="0.45" stroke-linecap="round"/>';
    // the top edge folded back in a cuff, showing the lighter inside of the paper
    s += '<path d="M14 56 C46 44 98 56 138 90 L131 95 C94 63 46 53 14 63 Z" fill="' + shade(color, 0.38) + '" stroke="' + line + '" stroke-width="1.4" stroke-linejoin="round"/>';
    s += '<path d="' + frontShape + '" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linejoin="round"/>';

    // a bright edge along the top rim
    s += '<path d="M16 56 C46 44 70 50 100 40" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/>';
    return '<g>' + s + '</g>';
}

// Ribbon: a satin bow with big loops, small inner loops, a knot and two notched tails
function drawRibbon(options) {
    const color = (options && options.color) || "#e2849b";
    const id = "rib-" + color.slice(1);
    const line = shade(color, -0.42);
    const deep = shade(color, -0.2);
    const light = shade(color, 0.4);

    // satin sheen: dark, then a bright stripe, then back to the main color
    let s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + deep + '"/><stop offset="0.35" stop-color="' + light + '"/>' +
        '<stop offset="0.6" stop-color="' + color + '"/><stop offset="1" stop-color="' + deep + '"/></linearGradient></defs>';

    // the left half of the bow; the right half is the same drawing flipped
    const half =
        // tail with a V-cut end
        '<path d="M55 54 C48 68 38 80 28 94 L38 92 L40 100 C50 86 58 72 65 56 Z" fill="' + deep + '" stroke="' + line + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M52 60 C46 72 40 80 34 90" fill="none" stroke="' + light + '" stroke-width="1" opacity="0.6" stroke-linecap="round"/>' +
        // big outer loop
        '<path d="M60 48 C34 8 4 20 8 46 C12 70 44 60 60 48 Z" fill="url(#' + id + ')" stroke="' + line + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        // smaller inner loop showing the inside of the ribbon
        '<path d="M60 48 C44 26 22 30 22 44 C22 56 46 54 60 48 Z" fill="' + deep + '" stroke="' + line + '" stroke-width="1.4" stroke-linejoin="round"/>' +
        // fold lines and a shiny highlight along the loop
        '<path d="M58 47 C44 38 30 36 22 42" fill="none" stroke="' + line + '" stroke-width="0.9" opacity="0.5" stroke-linecap="round"/>' +
        '<path d="M14 36 C20 24 34 20 44 28" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.55" stroke-linecap="round"/>';

    s += '<g transform="translate(120 0) scale(-1 1)">' + half + '</g>';
    s += half;
    // the knot with a little crease
    s += '<path d="M52 42 C52 38 68 38 68 42 L69 54 C69 58 51 58 51 54 Z" fill="url(#' + id + ')" stroke="' + line + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<path d="M56 41 L55.5 55 M62 41 L62.5 55" stroke="' + line + '" stroke-width="0.8" opacity="0.5"/>';
    return '<g>' + s + '</g>';
}
