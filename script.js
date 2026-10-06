// Total number of steps in the builder
const TOTAL_STEPS = 5;

// (The lily colors, the filler flowers, the limits and the bouquet layouts are in bouquet.js)

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices live here, so Back never loses them.
// lilies:  how many of each lily color, e.g. { white: 2, orange: 1, ... }
// fillers: how many of each filler,     e.g. { babys: 1, lavender: 2, ... }
const state = { lilies: {}, fillers: {} };
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

// Change one count by +1 or -1
function changeCount(group, key, change) {
    state[group][key] += change;
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
    if (totalLilies() === 0) {
        previewBox.innerHTML = '<p class="preview-empty">Add a lily to see your bouquet!</p>';
        return;
    }
    previewBox.innerHTML = makeSvg(drawBouquet(state.lilies, state.fillers), "0 0 300 300");
}

// ---------------------------------------------------------------
// Start
// ---------------------------------------------------------------
buildPicker(lilyList, LILY_TYPES, "lilies", "2 4 96 96");
buildPicker(fillerList, FILLER_TYPES, "fillers", "0 0 100 140");
updatePickers();
showStep(1);
