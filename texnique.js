const MINIMUM_POINT_VALUE = 16; // see texnique.pdf as to how this number was calculated
const POLLING_TIMEOUT = 50;

function getTitle() {
    let text = document.getElementById("problem-title").textContent;

    // remove 'Problem n:' prefix
    let components = text.split(" ");
    components.splice(0, 2);

    let title = components.join(" ");
    return title;
}

function getProblemValue() {
    let points = document.getElementById("problem-points").textContent;

    // remove '(' prefix
    let components = points.split("");
    components.splice(0, 1);

    return components.join("").split(" ")[0];
}

function skipProblem() {
    document.getElementById("skip-button").click();
}

function dispatchChangeEvent() {
    let input = document.getElementById("user-input");
    input.dispatchEvent(new Event('change', {
        bubbles: true
    }));
}

function solve(minimumPoints) {
    const title = getTitle();
    const pointValue = getProblemValue();
    const oldTarget = document.getElementById("target").innerHTML;

    if (pointValue < minimumPoints) {
        skipProblem();
        return;
    }
    
    let found = false;
    for (const problem of globalThis.questions) {
        if (problem.title != title) {
            continue;
        }
    
        found = true;
        const solution = problem.latex;
        
        // enter solution since problem title can be found
        let input = document.getElementById("user-input");
        input.value = solution;
    }

    if (!found) {
        skipProblem();
        return;
    }
}

const problemTitle = document.getElementById("problem-title");

// we assume that we can find the problem and input the solution
// into the textbox BEFORE the target finishes loading
let titleObserver = new MutationObserver(() => {
    // in the case that the target loads before
    // we can input a solution, we add this as a fallback
    setTimeout(() => {
        dispatchChangeEvent();
    }, 10 * POLLING_TIMEOUT);

    // setup detection change in target (i.e., the target
    // has been loaded so that we can solve the problem)
    let targetContainer = document.getElementById("target");

    let timeout;
    let targetObserver = new MutationObserver(() => {
       clearTimeout(timeout);

       timeout = setTimeout(() => {
           targetObserver.disconnect();
           dispatchChangeEvent();
       }, POLLING_TIMEOUT);
    });

    solve(MINIMUM_POINT_VALUE);

    // begin detecting changes
    targetObserver.observe(targetContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    })
});
titleObserver.observe(problemTitle, {
    childList: true,
    characterData: true,
    subtree: true
});

const gameWindow = document.getElementById("game-window");

let windowObserver = new MutationObserver(() => {
    if (getComputedStyle(gameWindow).display === "none") {
        titleObserver.disconnect();
        return;
    }

    titleObserver.observe(problemTitle, {
        childList: true,
        characterData: true,
        subtree: true
    });
    // since the site only just reveals the question, not changing the question,
    // we need to manually force a change (which the titleObserver detects) 
    // in order to start the problem-solving loop
    skipProblem();
})
windowObserver.observe(gameWindow, {
    attributes: true,
    attributeFilter: ["class", "style"]
});