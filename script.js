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
// wrap, ribbon: the keys of the picked wrapping paper and ribbon colors (see bouquet.js).
//               They start with a default so the bouquet is never unwrapped.
// name, message: what was typed for the bouquet's name and the card (both optional, may be empty).
const state = { lilies: {}, fillers: {}, arrangement: null, wrap: DEFAULT_WRAP, ribbon: DEFAULT_RIBBON, name: "", message: "" };

// The length limits of the two text boxes (the default name is in bouquet.js)
const MAX_NAME = 30;
const MAX_MESSAGE = 120;

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
const wrapSwatches = document.getElementById("wrap-swatches");
const ribbonSwatches = document.getElementById("ribbon-swatches");
const arrangeBar = document.getElementById("arrange-bar");
const arrangeBtn = document.getElementById("arrange-btn");
const resetBtn = document.getElementById("reset-btn");
const arrangeHint = document.getElementById("arrange-hint");
const nameInput = document.getElementById("name-input");
const messageInput = document.getElementById("message-input");
const nameCount = document.getElementById("name-count");
const messageCount = document.getElementById("message-count");
const giftTag = document.getElementById("gift-tag");
const tagName = document.getElementById("tag-name");
const tagMessage = document.getElementById("tag-message");

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
    if (n === TOTAL_STEPS) renderReveal();

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
    updateGiftTag();
    if (totalLilies() === 0) {
        previewBox.innerHTML = '<p class="preview-empty">Add a lily to see your bouquet!</p>';
        return;
    }
    previewBox.innerHTML = makeSvg(drawBouquet(state.lilies, state.fillers, state.arrangement, arranging, wrapColors(state.wrap, state.ribbon)), "0 0 300 300");
}

// ---------------------------------------------------------------
// Step 3: wrapping paper and ribbon
// ---------------------------------------------------------------

// Build a row of round color swatches with their names. group is "wrap" or "ribbon"
// (the part of `state` the choice is kept in).
function buildSwatches(container, colors, group) {
    colors.forEach(function (c) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "swatch";
        button.dataset.group = group;
        button.dataset.key = c.key;
        button.setAttribute("role", "radio");
        button.innerHTML = '<span class="swatch-dot" style="background:' + c.color + '"></span>' +
            '<span class="swatch-name">' + c.label + '</span>';
        container.appendChild(button);
    });
}

// Mark the picked swatch in each row
function updateSwatches() {
    document.querySelectorAll(".swatch").forEach(function (button) {
        const picked = state[button.dataset.group] === button.dataset.key;
        button.classList.toggle("picked", picked);
        button.setAttribute("aria-checked", picked ? "true" : "false");
    });
}

// One listener handles both rows. The preview updates right away.
function handleSwatchClick(event) {
    const button = event.target.closest(".swatch");
    if (!button) return;
    state[button.dataset.group] = button.dataset.key;
    updateSwatches();
    renderPreview();
}
wrapSwatches.addEventListener("click", handleSwatchClick);
ribbonSwatches.addEventListener("click", handleSwatchClick);

// ---------------------------------------------------------------
// Step 4: bouquet name and card message
// ---------------------------------------------------------------

// The name to show: what was typed, or the cute default when the box is empty
function bouquetName() {
    return state.name.trim() || DEFAULT_NAME;
}

// Update the character counters and the gift card. The card is shown on step 4 only,
// and not while arranging (so it never gets in the way of dragging).
function updateGiftTag() {
    nameCount.textContent = state.name.length + " / " + MAX_NAME;
    messageCount.textContent = state.message.length + " / " + MAX_MESSAGE;

    tagName.textContent = bouquetName();
    const message = state.message.trim();
    tagMessage.textContent = message || "Your message shows up here";
    tagMessage.classList.toggle("empty", !message);

    giftTag.hidden = !(currentStep === 4 && totalLilies() > 0 && !arranging);
}

// Typing changes the card right away (the bouquet itself isn't redrawn)
nameInput.addEventListener("input", function () {
    state.name = nameInput.value.slice(0, MAX_NAME);
    updateGiftTag();
});
messageInput.addEventListener("input", function () {
    state.message = messageInput.value.slice(0, MAX_MESSAGE);
    updateGiftTag();
});

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

    // show the dotted line around the area flowers can go in, but only while one is being dragged
    const outline = previewBox.querySelector(".area-outline");
    if (outline) outline.setAttribute("opacity", "0.6");

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
    const spot = clampToArea(p.x + drag.grabX, p.y + drag.grabY, state.arrangement.area);
    drag.moveX = spot.x;
    drag.moveY = spot.y;
    const dx = spot.x - drag.item.x;
    const dy = spot.y - drag.item.y;

    // move the flower, and bend its stem so it stays joined to the bundle
    drag.body.setAttribute("transform", "translate(" + dx.toFixed(1) + " " + dy.toFixed(1) + ")");
    drag.stems.forEach(function (path) {
        const route = path.dataset.rim ? { rimY: Number(path.dataset.rim), mouth: Number(path.dataset.mouth) } : null;
        path.setAttribute("d", stemPathData(Number(path.dataset.sx) + dx, Number(path.dataset.sy) + dy, Number(path.dataset.bundle), route));
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
    return JSON.parse(JSON.stringify({ lilies: state.lilies, fillers: state.fillers, arrangement: state.arrangement, wrap: state.wrap, ribbon: state.ribbon, name: state.name, message: state.message }));
}

// The opposite: set the bouquet from saved data
function loadBouquetData(data) {
    LILY_TYPES.forEach(function (type) { state.lilies[type.key] = data.lilies[type.key] || 0; });
    FILLER_TYPES.forEach(function (type) { state.fillers[type.key] = data.fillers[type.key] || 0; });
    state.arrangement = data.arrangement || null;
    state.wrap = data.wrap || DEFAULT_WRAP;
    state.ribbon = data.ribbon || DEFAULT_RIBBON;
    state.name = (data.name || "").slice(0, MAX_NAME);
    state.message = (data.message || "").slice(0, MAX_MESSAGE);
    nameInput.value = state.name;
    messageInput.value = state.message;
    updateSwatches();
    arranging = false;
    updatePickers();
}

// ---------------------------------------------------------------
// Final reveal, saving, and opening saved bouquets
// ---------------------------------------------------------------

const revealPicture = document.getElementById("reveal-picture");
const revealName = document.getElementById("reveal-name");
const revealMessage = document.getElementById("reveal-message");
const saveBtn = document.getElementById("save-btn");
const againBtn = document.getElementById("again-btn");
const saveMessage = document.getElementById("save-message");
const saveChoice = document.getElementById("save-choice");
const saveChoiceText = document.getElementById("save-choice-text");
const updateBtn = document.getElementById("update-btn");
const saveNewBtn = document.getElementById("save-new-btn");

// The id of the saved bouquet this one came from (set when it was opened from My bouquets,
// or after saving). null means it hasn't been saved yet.
let savedId = null;

// Draw the big finished bouquet with its name and card message
function renderReveal() {
    revealPicture.innerHTML = makeSvg(drawBouquet(state.lilies, state.fillers, state.arrangement, false, wrapColors(state.wrap, state.ribbon)), "0 0 300 300");
    revealName.textContent = bouquetName();
    const message = state.message.trim();
    revealMessage.textContent = message;
    revealMessage.hidden = !message;
    saveMessage.textContent = "";
    saveChoice.hidden = true;
    saveBtn.disabled = false;
}

// Is this bouquet exactly what was saved? (Used to tell if an opened bouquet was edited.)
function sameAsSaved(saved) {
    const mine = getBouquetData();
    return ["lilies", "fillers", "arrangement", "wrap", "ribbon", "name", "message"].every(function (key) {
        return JSON.stringify(mine[key] || null) === JSON.stringify(saved[key] || null);
    });
}

// Save as a new bouquet, or (mode "update") replace the one it was opened from
function saveBouquet(mode) {
    const list = readSavedBouquets();
    const data = getBouquetData();
    data.savedAt = Date.now();
    if (mode === "update") {
        data.id = savedId;
        const at = list.findIndex(function (b) { return b.id === savedId; });
        if (at >= 0) list[at] = data; else list.push(data);
    } else {
        data.id = "b" + Date.now().toString(36) + list.length;
        list.push(data);
    }
    saveChoice.hidden = true;
    if (writeSavedBouquets(list)) {
        savedId = data.id;
        saveMessage.textContent = mode === "update" ? "Saved! Your bouquet is updated." : "Saved! Find it in My bouquets.";
    } else {
        saveMessage.textContent = "Sorry, this browser wouldn't let me save. Is private browsing on?";
    }
}

saveBtn.addEventListener("click", function () {
    saveMessage.textContent = "";
    const original = savedId && readSavedBouquets().filter(function (b) { return b.id === savedId; })[0];
    if (!original) {
        saveBouquet("new");
    } else if (sameAsSaved(original)) {
        saveMessage.textContent = "Already saved!";
    } else {
        // it was opened from My bouquets and then changed: ask what to do
        saveChoiceText.textContent = "You changed \u201c" + savedName(original) + "\u201d. Update it, or save this as a new bouquet?";
        saveChoice.hidden = false;
    }
});
updateBtn.addEventListener("click", function () { saveBouquet("update"); });
saveNewBtn.addEventListener("click", function () { saveBouquet("new"); });

// "Make another": clear everything and start again at step 1
againBtn.addEventListener("click", function () {
    savedId = null;
    loadBouquetData({ lilies: {}, fillers: {} });
    showStep(1);
});

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildPicker(lilyList, LILY_TYPES, "lilies", "2 4 96 96");
buildPicker(fillerList, FILLER_TYPES, "fillers", "0 0 100 140");
buildSwatches(wrapSwatches, WRAP_COLORS, "wrap");
buildSwatches(ribbonSwatches, RIBBON_COLORS, "ribbon");
updateSwatches();
updatePickers();

// My bouquets sends us here with ?open=ID (show it in the reveal) or ?start=ID (copy it into
// the builder at step 1). Starting from a bouquet never changes the saved original.
const params = new URLSearchParams(location.search);
const wantedId = params.get("open") || params.get("start");
const wanted = wantedId && readSavedBouquets().filter(function (b) { return b.id === wantedId; })[0];
if (wanted) {
    loadBouquetData(wanted);
    if (params.get("open")) {
        savedId = wanted.id;
        showStep(TOTAL_STEPS);
    } else {
        showStep(1);
    }
} else {
    showStep(1);
}
