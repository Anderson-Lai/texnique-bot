const MINIMUM_POINT_VALUE = 10;

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

function solve(minimumPoints) {
    let title = getTitle();
    let pointValue = getProblemValue();

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

        // force an update until problem changes
        do {
            input.dispatchEvent(new Event('change', {
                bubbles: true
            }));
        } while (getProblemTitle() === title);
    }

    if (!found) {
        skipProblem();
        return;
    }
}

const problemTitle = document.getElementById("problem-title");

let titleObserver = new MutationObserver(() => {
    solve(MINIMUM_POINT_VALUE);
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
    // so we need to manually force a change in order to start the cycle
    skipProblem();
})
windowObserver.observe(gameWindow, {
    attributes: true,
    attributeFilter: ["class", "style"]
});