// Total number of steps in the builder
const TOTAL_STEPS = 5;

// (The lily colors, the filler flowers, the limits and the bouquet layouts are in bouquet.js)

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices live here, so Back never loses them.
// lilies:  how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillers: how many of each filler,     e.g. { babys: 1, lavender: 2, ... }
// arrangement: null while the bouquet uses the hand-made template layout. Once someone starts
//              "Arrange it yourself" it holds the position of every flower (see bouquet.js).
const state = { lilies: {}, fillers: {}, arrangement: null };

// Is "Arrange it yourself" switched on right now? (Only for the current visit to a step.)
let arranging = false;
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
const arrangeBar = document.getElementById("arrange-bar");
const arrangeBtn = document.getElementById("arrange-btn");
const resetBtn = document.getElementById("reset-btn");
const arrangeHint = document.getElementById("arrange-hint");

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

    // moving to another step switches arranging off (the arrangement itself is kept)
    arranging = false;
    renderPreview();

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

// Change one count by +1 or -1
function changeCount(group, key, change) {
    state[group][key] += change;

    // If flowers have been arranged by hand, everyone else stays where they are:
    // a new flower gets a free spot, and a removed flower is the only one that goes.
    if (state.arrangement) {
        if (totalLilies() === 0) {
            state.arrangement = null;      // no lilies left, so nothing to arrange
            arranging = false;
        } else if (change > 0) {
            arrangementAdd(state.arrangement, group, key, state.lilies, state.fillers);
        } else {
            arrangementRemove(state.arrangement, group, key);
        }
    }
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

// Show the bouquet so far in the preview box (drawBouquet is in bouquet.js)
function renderPreview() {
    updateArrangeBar();
    if (totalLilies() === 0) {
        previewBox.innerHTML = '<p class="preview-empty">Add a lily to see your bouquet!</p>';
        return;
    }
    previewBox.innerHTML = makeSvg(drawBouquet(state.lilies, state.fillers, state.arrangement, arranging), "0 0 300 300");
}

// ---------------------------------------------------------------
// Arrange it yourself
// ---------------------------------------------------------------

// Show or hide the arrange buttons and the hint, and tell the preview whether it is being arranged
function updateArrangeBar() {
    const canArrange = totalLilies() > 0 && currentStep !== TOTAL_STEPS;
    arrangeBar.hidden = !canArrange;
    arrangeBtn.textContent = arranging ? "Done arranging" : "Arrange it yourself";
    resetBtn.hidden = !state.arrangement;
    arrangeHint.hidden = !(canArrange && arranging);
    previewBox.classList.toggle("arranging", arranging);
}

// The button switches arranging on and off. Switching it on copies the template layout,
// and from then on every flower can be moved.
arrangeBtn.addEventListener("click", function () {
    if (!arranging && !state.arrangement) {
        state.arrangement = startArrangement(state.lilies, state.fillers);
    }
    arranging = !arranging;
    renderPreview();
});

// "Reset arrangement": everything snaps back to the template layout
resetBtn.addEventListener("click", function () {
    state.arrangement = arranging ? startArrangement(state.lilies, state.fillers) : null;
    renderPreview();
});

// Turn a pointer position (mouse or finger) into a position in the bouquet drawing
function pointInBouquet(event, zoomGroup) {
    const point = zoomGroup.ownerSVGElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(zoomGroup.getScreenCTM().inverse());
}

// The flower being dragged right now (null when nothing is picked up)
let drag = null;

previewBox.addEventListener("pointerdown", function (event) {
    if (!arranging || !state.arrangement || drag) return;
    const picture = event.target.closest(".item");
    if (!picture) return;
    const item = state.arrangement.items.filter(function (it) { return it.id === picture.dataset.id; })[0];
    if (!item) return;

    const zoomGroup = previewBox.querySelector(".bouquet-zoom");
    const start = pointInBouquet(event, zoomGroup);
    drag = {
        pointerId: event.pointerId,
        item: item,
        zoomGroup: zoomGroup,
        grabX: item.x - start.x,          // so the flower doesn't jump to the finger
        grabY: item.y - start.y,
        body: picture.querySelector(".body"),
        stems: picture.querySelectorAll(".stem-path"),
        moveX: item.x,
        moveY: item.y
    };

    // the flower you pick up goes to the front
    item.z = highestZ(state.arrangement) + 1;
    picture.parentNode.appendChild(picture);

    previewBox.setPointerCapture(event.pointerId);
    event.preventDefault();
});

previewBox.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const p = pointInBouquet(event, drag.zoomGroup);
    // stay inside the bouquet area
    const spot = clampToArea(p.x + drag.grabX, p.y + drag.grabY, state.arrangement.zoom);
    drag.moveX = spot.x;
    drag.moveY = spot.y;
    const dx = spot.x - drag.item.x;
    const dy = spot.y - drag.item.y;

    // move the flower, and bend its stem so it stays joined to the bundle
    drag.body.setAttribute("transform", "translate(" + dx.toFixed(1) + " " + dy.toFixed(1) + ")");
    drag.stems.forEach(function (path) {
        const x = Number(path.dataset.sx) + dx;
        const y = Number(path.dataset.sy) + dy;
        const bundle = Number(path.dataset.bundle);
        path.setAttribute("d", "M" + x.toFixed(1) + " " + y.toFixed(1) + " Q" + (x + (bundle - x) * 0.15).toFixed(1) + " " + (y * 0.4).toFixed(1) + " " + bundle.toFixed(1) + " 0");
    });
});

// Let go: keep the new position and redraw the bouquet properly
function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.item.x = drag.moveX;
    drag.item.y = drag.moveY;
    drag = null;
    renderPreview();
}
previewBox.addEventListener("pointerup", endDrag);
previewBox.addEventListener("pointercancel", endDrag);

// ---------------------------------------------------------------
// Saving (used by "My bouquets" in build step 7)
// ---------------------------------------------------------------

// Everything needed to rebuild this bouquet, as plain data that can be saved with JSON.
// It includes the hand-arranged positions, so a saved bouquet keeps them.
function getBouquetData() {
    return JSON.parse(JSON.stringify({ lilies: state.lilies, fillers: state.fillers, arrangement: state.arrangement }));
}

// The opposite: set the bouquet from saved data
function loadBouquetData(data) {
    LILY_TYPES.forEach(function (type) { state.lilies[type.key] = data.lilies[type.key] || 0; });
    FILLER_TYPES.forEach(function (type) { state.fillers[type.key] = data.fillers[type.key] || 0; });
    state.arrangement = data.arrangement || null;
    arranging = false;
    updatePickers();
}

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildPicker(lilyList, LILY_TYPES, "lilies", "2 4 96 96");
buildPicker(fillerList, FILLER_TYPES, "fillers", "0 0 100 140");
updatePickers();
showStep(1);
