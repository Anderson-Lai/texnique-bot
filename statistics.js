import { questions } from "./questions.js";

let statistics = {};

for (const problem in questions) {
    statistics[Math.ceil(questions[problem].length / 10.0)] = (!statistics[Math.ceil(questions[problem].length / 10.0)] ? 1 : statistics[Math.ceil(questions[problem].length / 10.0)] + 1);
}

console.log(statistics);
console.log();

function statisticsToProbabilities(statistics) {
    let totalTrials = 0;
    for (const key in statistics) {
        totalTrials += statistics[key];
    }

    let probabilities = {};
    for (const key in statistics) {
        probabilities[key] = statistics[key] / totalTrials;
    }
    return probabilities;
}

function expectedValue(statistics) {
    let probabilities = statisticsToProbabilities(statistics);

    let expectedValue = 0;
    for (const key in probabilities) {
        expectedValue += key * probabilities[key];
    }

    return expectedValue;
}

let expectedValues = {};

for (let i = 1; i < 33; i++) {
    let interested = statistics;
    for (let j = 1; j < i; j++) {
        if (interested[j]) {
            delete interested[j];
        }
    }
    expectedValues[i] = expectedValue(interested);
}

// average number of problems solved
// in the 3-minute mode
let scaling = 95;

for (const key in expectedValues) {
    console.log(`At least ${key}: ${scaling * expectedValues[key]}`);
}