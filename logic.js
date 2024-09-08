// Store patterns in local storage or backend
function storePattern(outcomes, result) {
    let storedPatterns = JSON.parse(localStorage.getItem('patterns')) || {};
    storedPatterns[outcomes.join('')] = result;
    localStorage.setItem('patterns', JSON.stringify(storedPatterns));
}

// Check if a pattern exists in local storage or backend
function checkPattern(outcomes) {
    let storedPatterns = JSON.parse(localStorage.getItem('patterns')) || {};
    return storedPatterns[outcomes.join('')] || null;
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

// Weighted Probability Model (Server 2) with recent outcomes weighted higher
function weightedProbabilityPrediction(outcomes) {
    const total = outcomes.length;
    let weightSum = 0;
    let weightedB = 0;
    
    outcomes.forEach((outcome, index) => {
        const weight = index + 1; // Give higher weight to recent outcomes
        if (outcome === 'b') {
            weightedB += weight;
        }
        weightSum += weight;
    });

    const probB = weightedB / weightSum;
    return Math.random() < probB ? 'b' : 's';
}

// Pseudorandom Model (Server 3) with improved seed randomness
function pseudorandomPrediction(outcomes) {
    const seed = outcomes.reduce((acc, curr) => acc + (curr === 'b' ? 1 : 0), 0);
    Math.seedrandom(seed);
    return Math.random() < 0.5 ? 'b' : 's';
}

// Convert b/s to Big/Small
function translateOutcome(outcome) {
    return outcome === 'b' ? 'Big (B)' : 'Small (S)';
}

// Ensemble Prediction with pattern recognition
function ensemblePrediction(outcomes) {
    // Check if pattern exists in storage
    const storedResult = checkPattern(outcomes);
    if (storedResult) {
        return {
            'Final Prediction': translateOutcome(storedResult),
            'Note': 'Pattern detected, using stored result'
        };
    }

    // Proceed with model predictions if no pattern match
    const predictions = [];

    const server1Pred = markovChainPrediction(outcomes);
    const server2Pred = weightedProbabilityPrediction(outcomes);
    const server3Pred = pseudorandomPrediction(outcomes);

    predictions.push(server1Pred, server2Pred, server3Pred);

    // Count occurrences of 'b' and 's'
    const countB = predictions.filter(pred => pred === 'b').length;
    const finalPrediction = countB >= 2 ? 'b' : 's'; // Majority vote

    // Store the new pattern and result
    storePattern(outcomes, finalPrediction);

    return {
        'Server 1': translateOutcome(server1Pred),
        'Server 2': translateOutcome(server2Pred),
        'Server 3': translateOutcome(server3Pred),
        'Final Prediction': translateOutcome(finalPrediction)
    };
}

// Handle form submission and betting strategy
function handlePrediction(event) {
    event.preventDefault();
    
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('results-container');
    const checkingMessage = document.getElementById('checking-message');
    
    if (userInput.length !== 5 || !/^[bs]+$/.test(userInput)) {
        alert("Please enter exactly 5 outcomes using 'b' for Big and 's' for Small.");
        return;
    }
    
    const outcomes = Array.from(userInput);
    resultsContainer.style.display = 'none';
    checkingMessage.style.display = 'block';
    
    // Simulate server checking delay
    setTimeout(() => {
        const predictions = ensemblePrediction(outcomes);

        checkingMessage.style.display = 'none';
        resultsContainer.innerHTML = `
            <p>Server 1: ${predictions['Server 1']}</p>
            <p>Server 2: ${predictions['Server 2']}</p>
            <p>Server 3: ${predictions['Server 3']}</p>
            <p><strong>Final Prediction: ${predictions['Final Prediction']}</strong></p>
            <p><em>${predictions['Note'] || ''}</em></p>
        `;
        resultsContainer.style.display = 'block';
    }, 2000);
}
