// Total number of steps in the builder
const TOTAL_STEPS = 5;

// Which step we're on (starts at 1)
let currentStep = 1;

// All the bouquet choices will live here, so Back never loses them.
// (Empty for now; later steps will fill it in.)
const state = {};

// Grab the page elements we need
const steps = document.querySelectorAll(".step");
const stepLabel = document.getElementById("step-label");
const backBtn = document.getElementById("back-btn");
const nextBtn = document.getElementById("next-btn");

// Show one step and hide the others, then update the label and buttons
function showStep(n) {
    currentStep = n;

    steps.forEach(function (section) {
        const isCurrent = Number(section.dataset.step) === n;
        section.classList.toggle("active", isCurrent);
    });

    stepLabel.textContent = "Step " + n + " of " + TOTAL_STEPS;

    // Can't go back from step 1
    backBtn.disabled = n === 1;

    // The reveal (last step) has no Next button
    nextBtn.classList.toggle("hidden", n === TOTAL_STEPS);
}

backBtn.addEventListener("click", function () {
    if (currentStep > 1) showStep(currentStep - 1);
});

nextBtn.addEventListener("click", function () {
    if (currentStep < TOTAL_STEPS) showStep(currentStep + 1);
});

// Start on step 1
showStep(1);
