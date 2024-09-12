// Fuh the patterns from the Google Drive file
async function fetchPatterns() {
    const response = await fetch('https://drive.google.com/uc?export=download&id=1GvJFlZK_-cnTd-TduHDvRiYJs9HCEwqV');
    const text = await response.text();
    return text.split('\n').map(line => {
        const [pattern, prediction] = line.split('--->');
        return {
            pattern: pattern.trim(),
            prediction: prediction.trim()
        };
    });
}

// Function to normalize patterns (sort characters)
function normalizePattern(input) {
    return input.split('').sort().join('');
}

// Function to predict based on input
async function predictFromPatterns(userInput) {
    const patterns = await fetchPatterns();
    const normalizedInput = normalizePattern(userInput);

    // Find the matching pattern
    for (const { pattern, prediction } of patterns) {
        if (normalizePattern(pattern) === normalizedInput) {
            return prediction; // Return the prediction for the matched pattern
        }
    }

    return null; // Return null if no match
}

// Markov Chain Model (Server 1)
function markovChainPrediction(outcomes) {
    const transitionMatrix = {
        'b': { 'b': 0.6, 's': 0.4 },
        's': { 'b': 0.3, 's': 0.7 }
    };
    const lastOutcome = outcomes[outcomes.length - 1];
    const probB = transitionMatrix[lastOutcome]['b'];
    return Math.random() < probB ? 'b' : 's';
}

// Weighted Probability Model (Server 2)
function weightedProbabilityPrediction(outcomes) {
    const countB = outcomes.filter(o => o === 'b').length;
    const countS = outcomes.length - countB;
    const total = outcomes.length;
    const probB = countB / total;
    return Math.random() < probB ? 'b' : 's';
}

// Pseudorandom Model (Server 3)
function pseudorandomPrediction(outcomes) {
    const seed = outcomes.reduce((acc, curr) => acc + (curr === 'b' ? 1 : 0), 0);
    Math.seedrandom(seed);
    return Math.random() < 0.5 ? 'b' : 's';
}

// Convert b/s to Big/Small
function translateOutcome(outcome) {
    return outcome === 'b' ? 'Big (B)' : 'Small (S)';
}

// Ensemble Prediction
function ensemblePrediction(outcomes) {
    const predictions = [];

    const server1Pred = markovChainPrediction(outcomes);
    const server2Pred = weightedProbabilityPrediction(outcomes);
    const server3Pred = pseudorandomPrediction(outcomes);

    predictions.push(server1Pred, server2Pred, server3Pred);

    // Count occurrences of 'b' and 's'
    const countB = predictions.filter(pred => pred === 'b').length;
    const finalPrediction = countB >= 2 ? 'b' : 's'; // Majority vote

    return {
        'Server 1': translateOutcome(server1Pred),
        'Server 2': translateOutcome(server2Pred),
        'Server 3': translateOutcome(server3Pred),
        'Final Prediction': translateOutcome(finalPrediction)
    };
}

// Handle form submission
async function handlePrediction(event) {
    event.preventDefault();
    
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('results-container');
    const checkingMessage = document.getElementById('checking-message');
    
    if (userInput.length !== 5 || !/^[bs]+$/.test(userInput)) {
        alert("Please enter exactly 5 outcomes using 'b' for Big and 's' for Small.");
        return;
    }
    
    resultsContainer.style.display = 'none';
    checkingMessage.style.display = 'block';
    
    // Check if the pattern exists in the file before proceeding
    const patternPrediction = await predictFromPatterns(userInput);

    if (patternPrediction) {
        // If pattern exists, display the matched prediction
        checkingMessage.style.display = 'none';
        resultsContainer.innerHTML = `
            <p><strong>Pattern Matched Prediction: ${patternPrediction}</strong></p>
        `;
        resultsContainer.style.display = 'block';
        return; // Exit function since we found a match
    }

    // If no pattern match found, proceed with ensemble prediction
    const outcomes = Array.from(userInput);
    
    setTimeout(() => {
        const predictions = ensemblePrediction(outcomes);

        checkingMessage.style.display = 'none';
        resultsContainer.innerHTML = `
            <p>Server 1: ${predictions['Server 1']}</p>
            <p>Server 2: ${predictions['Server 2']}</p>
            <p>Server 3: ${predictions['Server 3']}</p>
            <p><strong>Final Prediction: ${predictions['Final Prediction']}</strong></p>
        `;
        resultsContainer.style.display = 'block';
    }, 2000);
}
