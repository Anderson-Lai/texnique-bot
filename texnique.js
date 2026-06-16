// see latex/texnique.pdf for how this number
// was calculated
const MINIMUM_POINT_VALUE = 17; 

const POLLING_TIMEOUT = 75;
const FALLBACK_FACTOR = 10;

const MAXIMUM_SCORE = 2000;
const SCORE_OFFSET = 50;

const POINT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 21, 22, 33
];

let totalScore = 0;
let targetScore = 0;

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

    return Number(components.join("").split(" ")[0]);
}

function skipProblem() {
    document.getElementById("skip-button").click();
}

function endGame() {
    document.getElementById("end-game-button").click();
}

function dispatchChangeEvent() {
    let input = document.getElementById("user-input");
    input.dispatchEvent(new Event('change', {
        bubbles: true
    }));
}

function pruneProblem(minimumPoints, score, pointValue) {
    // if this condition is met, we greedily prune problems
    // to reach the maximum score exactly since we are 
    // already close to the maximum score
    if (score >= MAXIMUM_SCORE - SCORE_OFFSET) {
        const neededScore = MAXIMUM_SCORE - score;
        for (const points of POINT_OPTIONS) {
            let remainingScore = neededScore - points;

            if (remainingScore < 0) {
                break;
            }

            // greedy part
            if (points > targetScore) {
                targetScore = points;
            }
        }

        if (pointValue != targetScore) {
            skipProblem();
            return false;
        }
    }
    // skip since problem's points are below the
    // minimum point threshold
    else if (pointValue < minimumPoints) {
        skipProblem();
        return false;
    }

    return true;
}

function solve(minimumPoints, score) {
    const pointValue = getProblemValue();

    if (!pruneProblem(minimumPoints, score, pointValue)) {
        return 0;
    }

    const title = getTitle();
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
        return 0;
    }

    // since problem could be solved,
    // reset the targetScore
    targetScore = 0;

    return pointValue;
}

const problemTitle = document.getElementById("problem-title");

let titleObserver = new MutationObserver(() => {
    // end game condition
    if (totalScore === MAXIMUM_SCORE) {
        endGame();
        return;
    }

    // in case the target loads before we can
    // input a solution, we add this as a fallback
    setTimeout(() => {
        dispatchChangeEvent();
    }, FALLBACK_FACTOR * POLLING_TIMEOUT);

    // we now assume that we can find the problem and input the solution
    // into the textbox BEFORE the target finishes loading

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

    totalScore += solve(MINIMUM_POINT_VALUE, totalScore);

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
        // cleanup and prepare for the next game
        titleObserver.disconnect();
        totalScore = 0;
        targetScore = 0;
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