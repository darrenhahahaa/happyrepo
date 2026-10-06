// Kat's two cats for the main page: Pika and Chocolate (both Devon Rex).
// They are SVG drawings made in code, in the same style as the flowers (soft gradients and
// darker outlines of the same color). They sit on top of the big "LILIES FOR KAT" letters.
// Needs flowers.js loaded first (for shade). Used by index.html.

// Each cat's colors. Pika is dark chocolate and white, Chocolate is caramel with dark points.
const CAT_SPECS = [
    {
        id: "pika", name: "Pika", white: true, tailSide: 1,
        body: "#4b2e28", bodyHi: "#6a443a",       // dark brown coat
        points: "#4b2e28", pointsHi: "#68443a",     // face, ears, tail
        innerEar: "#b98277", nose: "#3d241f",
        iris: ["#d8e69a", "#9fb860", "#6d8a3a"],     // big green eyes
        tailSwish: "3.6s", tailDelay: "-1.2s"
    },
    {
        id: "choco", name: "Chocolate", white: false, tailSide: -1,
        body: "#bf9068", bodyHi: "#d8b08a",         // warm caramel coat
        points: "#4a2d24", pointsHi: "#684135",     // darker chocolate face, ears, legs, tail
        innerEar: "#8a5a4c", nose: "#8b6359",
        iris: ["#c4d6e8", "#8fa8c4", "#5d7592"],     // big blue-grey eyes
        tailSwish: "4.3s", tailDelay: "-2.6s"
    }
];

const CAT_OUTLINE_WIDTH = 1.4;

// A darker shade of a color for outlines
function catLine(color) { return shade(color, -0.42); }

// Draw one cat on a 120 x 190 canvas. It sits with its paws at y = 136; the tail hangs below that.
function drawCat(spec) {
    const id = spec.id;
    const sw = CAT_OUTLINE_WIDTH;
    const white = "#fbf6ee", whiteShade = "#e6d9cb";
    // mirror a left-side x position to the right side
    const R = function (x) { return 120 - x; };
    // tail side: 1 = hangs on the right, -1 = on the left
    const T = spec.tailSide === 1 ? function (x) { return x; } : R;

    function stroke(color, w) { return ' stroke="' + catLine(color) + '" stroke-width="' + (w || sw) + '" stroke-linejoin="round" stroke-linecap="round"'; }
    function grad(name, top, bottom) {
        return '<linearGradient id="' + id + '-' + name + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset="1" stop-color="' + bottom + '"/></linearGradient>';
    }
    function fill(name) { return 'url(#' + id + '-' + name + ')'; }

    const defs = '<defs>' +
        grad('body', spec.bodyHi, spec.body) +
        grad('head', spec.pointsHi, spec.points) +
        grad('white', white, whiteShade) +
        grad('legs', spec.pointsHi, spec.points) +
        '<radialGradient id="' + id + '-iris" cx="0.5" cy="0.62" r="0.65"><stop offset="0" stop-color="' + spec.iris[0] + '"/><stop offset="0.6" stop-color="' + spec.iris[1] + '"/><stop offset="1" stop-color="' + spec.iris[2] + '"/></radialGradient>' +
        '</defs>';

    // little curly-coat marks (small arcs) at [x, y]
    function curls(list, color, size) {
        return list.map(function (p) {
            return '<path d="M' + p[0] + ' ' + p[1] + ' q' + (size / 2) + ' -' + size + ' ' + size + ' 0" fill="none" stroke="' + color + '" stroke-width="0.9" stroke-linecap="round" opacity="0.5"/>';
        }).join('');
    }

    // --- ground shadow ---
    let s = '<ellipse cx="60" cy="136" rx="40" ry="3.2" fill="#5a3250" opacity="0.18"/>';

    // --- tail: hangs down over the front of the letters. The whole group swishes slowly. ---
    const tailPath = 'M' + T(86) + ' 126 C' + T(106) + ' 124 ' + T(108) + ' 148 ' + T(100) + ' 158 C' + T(95) + ' 165 ' + T(100) + ' 174 ' + T(108) + ' 176';
    s += '<g class="tail" style="animation-duration:' + spec.tailSwish + ';animation-delay:' + spec.tailDelay + ';transform-origin:' + T(86) + 'px 126px">' +
        '<path d="' + tailPath + '" fill="none" stroke="' + catLine(spec.points) + '" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="' + tailPath + '" fill="none" stroke="' + spec.points + '" stroke-width="4.6" stroke-linecap="round"/>' +
        '<path d="' + tailPath + '" fill="none" stroke="' + spec.pointsHi + '" stroke-width="1.4" stroke-linecap="round" opacity="0.5" transform="translate(-0.8 0)"/>' +
        '</g>';

    // --- body: a slim neck widening to the haunches ---
    s += '<path d="M46 62 C40 78 33 96 31 114 C30 126 34 134 44 135 L76 135 C86 134 90 126 89 114 C87 96 80 78 74 62 Z" fill="' + fill('body') + '"' + stroke(spec.body) + '/>';
    // hind legs (rounded haunches) and hind feet
    [36, 84].forEach(function (cx) {
        s += '<ellipse cx="' + cx + '" cy="117" rx="10" ry="17" fill="' + fill('body') + '"' + stroke(spec.body) + '/>';
        s += '<ellipse cx="' + (cx < 60 ? 29 : 91) + '" cy="134" rx="8" ry="3.6" fill="' + spec.points + '"' + stroke(spec.points) + '/>';
    });
    // belly highlight and curly coat marks
    s += '<ellipse cx="60" cy="100" rx="13" ry="22" fill="#ffffff" opacity="0.12"/>';
    s += curls([[38, 100], [41, 112], [35, 124], [80, 98], [82, 111], [85, 123], [52, 86], [66, 90]], catLine(spec.body), 5);

    // --- chest (Pika has a white chest) ---
    if (spec.white) {
        s += '<path d="M45 64 C44 90 46 112 51 132 L69 132 C74 112 76 90 75 64 Z" fill="' + fill('white') + '"/>';
        s += curls([[54, 84], [62, 92], [55, 102], [63, 110]], whiteShade, 4.5);
    }

    // --- front legs and paws ---
    const legColor = spec.white ? fill('white') : fill('legs');
    const legBase = spec.white ? white : spec.points;
    const legLine = spec.white ? whiteShade : spec.points;
    [[47, 56], [64, 73]].forEach(function (lx) {
        const legShape = 'M' + lx[0] + ' 104 C' + lx[0] + ' 96 ' + lx[1] + ' 96 ' + lx[1] + ' 104 L' + lx[1] + ' 130 C' + lx[1] + ' 134 ' + lx[0] + ' 134 ' + lx[0] + ' 130';
        s += '<path d="' + legShape + ' Z" fill="' + legColor + '"/>';
        s += '<path d="M' + lx[0] + ' 108 L' + lx[0] + ' 130 M' + lx[1] + ' 108 L' + lx[1] + ' 130" fill="none"' + stroke(legLine, 1.2) + '/>';
        s += '<ellipse cx="' + ((lx[0] + lx[1]) / 2) + '" cy="132.5" rx="6.6" ry="4" fill="' + (spec.white ? fill('white') : fill('legs')) + '"' + stroke(legLine, 1.2) + '/>';
        // toe lines
        s += '<path d="M' + ((lx[0] + lx[1]) / 2 - 2) + ' 134 v2 M' + ((lx[0] + lx[1]) / 2 + 2) + ' 134 v2" stroke="' + catLine(legBase) + '" stroke-width="0.7" opacity="0.5" stroke-linecap="round"/>';
    });
    if (spec.white) {
        // Pika: a brown patch on one front leg, above the paw
        s += '<path d="M47 104 C46.6 112 47.4 119 49.5 123 C52.5 124.6 55.6 121.5 56 117 L56 104 Z" fill="' + spec.points + '"/>';
    }

    // --- head (everything that tilts when the cat is tapped) ---
    s += '<g class="head" style="transform-origin:60px 72px">';

    // big ears (the left and right are mirrors)
    [false, true].forEach(function (right) {
        const X = right ? R : function (x) { return x; };
        s += '<g class="ear ' + (right ? 'ear-r' : 'ear-l') + '" style="transform-origin:' + X(42) + 'px 44px">' +
            '<path d="M' + X(31) + ' 47 C' + X(24) + ' 32 ' + X(19) + ' 14 ' + X(20) + ' 1 C' + X(33) + ' 4 ' + X(49) + ' 18 ' + X(55) + ' 38 Z" fill="' + fill('head') + '"' + stroke(spec.points) + '/>' +
            '<path d="M' + X(33) + ' 42 C' + X(28) + ' 30 ' + X(25) + ' 17 ' + X(25) + ' 7 C' + X(34) + ' 11 ' + X(45) + ' 22 ' + X(49) + ' 35 Z" fill="' + spec.innerEar + '" opacity="0.85"/>' +
            '<path d="M' + X(30) + ' 40 C' + X(27) + ' 28 ' + X(25) + ' 16 ' + X(24) + ' 6" fill="none" stroke="' + spec.pointsHi + '" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>' +
            '</g>';
    });

    // the face shape
    s += '<path d="M31 49 C30 34 43 27 60 27 C77 27 90 34 89 49 C88 62 76 73 60 73 C44 73 32 62 31 49 Z" fill="' + fill('head') + '"' + stroke(spec.points) + '/>';
    s += '<ellipse cx="60" cy="38" rx="16" ry="5" fill="#ffffff" opacity="0.1"/>';

    if (spec.white) {
        // Pika: white stripe down the forehead, white muzzle and cheeks, dark nose patch
        s += '<path d="M57.5 27.5 C58 38 57 44 56 50 C54 56 49 60 46 64 C45 70 52 73 60 73 C68 73 75 70 74 64 C71 60 66 56 64 50 C63 44 62 38 62.5 27.5 Z" fill="' + fill('white') + '"/>';
        s += '<ellipse cx="45" cy="64" rx="6.5" ry="5.5" fill="' + white + '"/><ellipse cx="75" cy="64" rx="6.5" ry="5.5" fill="' + white + '"/>';
        s += '<ellipse cx="60" cy="63.5" rx="6.2" ry="4.4" fill="' + spec.nose + '"/>';
        s += '<ellipse cx="58.2" cy="62" rx="2" ry="1" fill="#ffffff" opacity="0.3"/>';
        s += '<ellipse cx="46" cy="68" rx="4.5" ry="2.4" fill="#f2a9a9" opacity="0.28"/><ellipse cx="74" cy="68" rx="4.5" ry="2.4" fill="#f2a9a9" opacity="0.28"/>';
    } else {
        // Chocolate: a slightly lighter muzzle and a soft brown nose
        s += '<ellipse cx="60" cy="66" rx="11" ry="6.5" fill="#6d4a3d" opacity="0.55"/>';
        s += '<path d="M56.5 62 L63.5 62 L60 66 Z" fill="' + spec.nose + '"' + stroke(spec.nose, 0.8) + '/>';
    }
    // the face outline again, on top of the white markings
    s += '<path d="M31 49 C30 34 43 27 60 27 C77 27 90 34 89 49 C88 62 76 73 60 73 C44 73 32 62 31 49 Z" fill="none"' + stroke(spec.points) + '/>';
    // mouth
    s += '<path d="M60 ' + (spec.white ? 68 : 66) + ' v1.6 M60 ' + (spec.white ? 69.6 : 67.6) + ' q-3.2 3 -6.4 1 M60 ' + (spec.white ? 69.6 : 67.6) + ' q3.2 3 6.4 1" fill="none" stroke="' + catLine(spec.points) + '" stroke-width="0.9" stroke-linecap="round"/>';

    // forehead curls
    s += curls([[48, 38], [54, 35], [66, 35], [72, 38], [60, 33]], spec.pointsHi, 4);

    // huge round eyes
    [46, 74].forEach(function (cx) {
        const cy = 51;
        s += '<g class="eye">' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="' + fill('iris') + '"' + stroke(spec.iris[2], 1.1) + '/>' +
            '<ellipse cx="' + cx + '" cy="' + (cy + 0.4) + '" rx="4.4" ry="5.8" fill="#1b1417"/>' +
            '<circle cx="' + (cx - 2.8) + '" cy="' + (cy - 3.2) + '" r="2.1" fill="#ffffff" opacity="0.92"/>' +
            '<circle cx="' + (cx + 3) + '" cy="' + (cy + 3.2) + '" r="1" fill="#ffffff" opacity="0.6"/>' +
            '</g>';
        // the eyelid: hidden until a blink, then it closes over the eye from the top
        s += '<g class="lid" style="transform-origin:' + cx + 'px ' + (cy - 9.6) + 'px">' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="9.8" fill="' + spec.points + '"/>' +
            '<path d="M' + (cx - 7) + ' ' + (cy + 3.5) + ' Q' + cx + ' ' + (cy + 6.5) + ' ' + (cx + 7) + ' ' + (cy + 3.5) + '" fill="none" stroke="' + catLine(spec.points) + '" stroke-width="1" stroke-linecap="round"/>' +
            '</g>';
    });

    // curly whiskers
    [[1, 0], [-1, 0]].forEach(function (side) {
        const m = side[0];
        const x = function (v) { return 60 + m * (v - 60); };
        [[0, 0], [1, 5]].forEach(function (w) {
            const dy = w[1];
            s += '<path d="M' + x(52) + ' ' + (67 + dy * 0.2) + ' C' + x(44) + ' ' + (64 + dy) + ' ' + x(38) + ' ' + (67 + dy) + ' ' + x(33) + ' ' + (72 + dy) + '" fill="none" stroke="#f3e9dc" stroke-width="0.8" stroke-linecap="round" opacity="0.75"/>';
        });
    });

    s += '</g>';   // end of head

    return defs + s;
}

// ---------------------------------------------------------------
// Putting the cats on the page
// ---------------------------------------------------------------

// Pika sits on the left, Chocolate on the right. Everything is built inside the #cats box.
function initCats() {
    const box = document.getElementById("cats");
    if (!box) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    CAT_SPECS.forEach(function (spec, i) {
        const cat = document.createElement("button");
        cat.type = "button";
        cat.className = "cat " + (i === 0 ? "cat-left" : "cat-right");
        cat.setAttribute("aria-label", spec.name + " the cat. Tap to say hi.");
        cat.innerHTML = '<svg viewBox="0 0 120 190" aria-hidden="true">' + drawCat(spec) + '</svg>' +
            '<span class="cat-name">' + spec.name + '</span>';
        box.appendChild(cat);

        let nameTimer = null;
        cat.addEventListener("click", function () {
            // the name shows for a moment after a tap (it also shows on hover)
            cat.classList.add("show");
            clearTimeout(nameTimer);
            nameTimer = setTimeout(function () { cat.classList.remove("show"); }, 2500);

            // tilt the head
            cat.classList.remove("tilt");
            void cat.offsetWidth;                    // lets the animation start again
            cat.classList.add("tilt");

            // a small heart floats up
            const heart = document.createElement("span");
            heart.className = "heart";
            heart.textContent = "♥";
            cat.appendChild(heart);
            setTimeout(function () { heart.remove(); }, 1500);
        });

        if (calm) return;   // reduced motion: no blinking or ear twitching

        // Blinks at random times (sometimes twice in a row)
        function blink() {
            cat.classList.remove("blinking");
            void cat.offsetWidth;
            cat.classList.add("blinking");
            if (Math.random() < 0.25) setTimeout(blink, 380);
        }
        function nextBlink() {
            setTimeout(function () { blink(); nextBlink(); }, 2500 + Math.random() * 4000);
        }
        // An occasional ear twitch (one ear at random)
        function twitch() {
            const ear = cat.querySelector(Math.random() < 0.5 ? ".ear-l" : ".ear-r");
            ear.classList.remove("twitch");
            void ear.getBoundingClientRect();
            ear.classList.add("twitch");
        }
        function nextTwitch() {
            setTimeout(function () { twitch(); nextTwitch(); }, 5000 + Math.random() * 8000);
        }
        setTimeout(nextBlink, Math.random() * 3000);
        setTimeout(nextTwitch, 2000 + Math.random() * 5000);
    });

    placeCats();
}

// Find where the tops of the big letters are, so the cats sit right on them.
// It measures the first line of the word with the real font.
function placeCats() {
    const box = document.getElementById("cats");
    const word = document.getElementById("word");
    if (!box || !word || !word.firstChild) return;
    const h1 = word.parentElement;
    const cs = getComputedStyle(h1);

    // how tall a capital letter is, and how far the font's ascent reaches above the baseline
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    const m = ctx.measureText("L");
    const size = parseFloat(cs.fontSize);
    const ascent = m.fontBoundingBoxAscent || size * 1.0;
    const capHeight = m.actualBoundingBoxAscent || size * 0.7;

    // the top of the first line's text, measured from the top of the heading
    const range = document.createRange();
    range.selectNodeContents(word.firstChild);
    const textTop = range.getBoundingClientRect().top - h1.getBoundingClientRect().top;
    box.style.setProperty("--cap-top", (textTop + ascent - capHeight).toFixed(1) + "px");
}
