// Helper function for moving average
function movingAverage(arr, weights) {
    return arr
        .slice(-weights.length)  // Consider only the recent outcomes based on weights length
        .reduce((acc, val, idx) => acc + val * weights[idx], 0) / weights.reduce((acc, w) => acc + w, 0);
}

// Markov Chain Model (Server 1) - Higher-Order
function markovChainPrediction(outcomes) {
    const transitionMatrix = {
        'bb': { 'b': 0.7, 's': 0.3 },
        'bs': { 'b': 0.5, 's': 0.5 },
        'sb': { 'b': 0.4, 's': 0.6 },
        'ss': { 'b': 0.2, 's': 0.8 }
    };
    const lastTwoOutcomes = outcomes.slice(-2).join('');
    const probB = transitionMatrix[lastTwoOutcomes]['b'];
    return Math.random() < probB ? 'b' : 's';
}

// Weighted Probability Model (Server 2) - Moving Average
function weightedProbabilityPrediction(outcomes) {
    const countB = outcomes.filter(o => o === 'b').length;
    const total = outcomes.length;
    
    // Weighted moving average for recent outcomes
    const weights = [1, 2, 3, 4, 5];  // More weight to recent outcomes
    const probB = movingAverage(outcomes.map(o => o === 'b' ? 1 : 0), weights);
    
    return Math.random() < probB ? 'b' : 's';
}

// Pseudorandom Model (Server 3) - Enhanced Seeding
function pseudorandomPrediction(outcomes) {
    const seed = outcomes.reduce((acc, curr, idx) => acc + (curr === 'b' ? idx + 1 : 0), 0);
    Math.seedrandom(seed);  // Using seedrandom for reproducibility
    return Math.random() < 0.5 ? 'b' : 's';
}

// Convert b/s to Big/Small
function translateOutcome(outcome) {
    return outcome === 'b' ? 'Big (B)' : 'Small (S)';
}

// Machine Learning-Style Weighted Voting
function ensemblePrediction(outcomes) {
    const predictions = [];

    const server1Pred = markovChainPrediction(outcomes);
    const server2Pred = weightedProbabilityPrediction(outcomes);
    const server3Pred = pseudorandomPrediction(outcomes);

    predictions.push(server1Pred, server2Pred, server3Pred);

    // Count occurrences of 'b' and 's' and apply weighted voting
    const modelWeights = [0.5, 0.3, 0.2];  // Assign higher weight to more reliable models
    const weightedPredictions = predictions.map((pred, idx) => pred === 'b' ? modelWeights[idx] : 0);
    const finalPrediction = weightedPredictions.reduce((a, b) => a + b) >= 0.5 ? 'b' : 's';  // Weighted majority vote

    return {
        'Server 1': translateOutcome(server1Pred),
        'Server 2': translateOutcome(server2Pred),
        'Server 3': translateOutcome(server3Pred),
        'Final Prediction': translateOutcome(finalPrediction)
    };
}

// Handle form submission with input validation
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
        `;
        resultsContainer.style.display = 'block';
    }, 2000);
}
