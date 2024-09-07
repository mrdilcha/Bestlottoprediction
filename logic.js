document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const userInput = document.getElementById('user-input').value.toLowerCase();
    if (userInput.length !== 5 || /[^bs]/.test(userInput)) {
        alert("Invalid input. Please enter exactly 5 outcomes using 'b' and 's'.");
        return;
    }

    const outcomes = userInput.split('');
    const resultsContainer = document.getElementById('results-container');
    const checkingMessage = document.getElementById('checking-message');
    const serverResults = document.getElementById('server-results');

    checkingMessage.style.display = 'block';
    resultsContainer.style.display = 'none';

    // Simulate server checking delay
    setTimeout(() => {
        checkingMessage.style.display = 'none';
        resultsContainer.style.display = 'block';

        const predictions = generatePredictions(outcomes);
        serverResults.innerHTML = `
            <div><span class="server-name">Server 1:</span> <span class="prediction">${predictions.server1}</span></div>
            <div><span class="server-name">Server 2:</span> <span class="prediction">${predictions.server2}</span></div>
            <div><span class="server-name">Server 3:</span> <span class="prediction">${predictions.server3}</span></div>
            <div><span class="server-name">Final Prediction:</span> <span class="prediction">${predictions.final}</span></div>
        `;
    }, 2000);
});

function generatePredictions(outcomes) {
    function markovChainPrediction(outcomes) {
        const transitionMatrix = {
            'b': { 'b': 0.6, 's': 0.4 },
            's': { 'b': 0.3, 's': 0.7 }
        };
        const lastOutcome = outcomes[outcomes.length - 1];
        return Math.random() < transitionMatrix[lastOutcome]['b'] ? 'Big (B)' : 'Small (S)';
    }

    function weightedProbabilityPrediction(outcomes) {
        const counts = outcomes.reduce((acc, outcome) => {
            acc[outcome] = (acc[outcome] || 0) + 1;
            return acc;
        }, {});
        const total = outcomes.length;
        return Math.random() < (counts['b'] / total) ? 'Big (B)' : 'Small (S)';
    }

    function pseudorandomPrediction(outcomes) {
        const seed = outcomes.reduce((acc, outcome) => acc + (outcome === 'b' ? 1 : 0), 0);
        Math.seedrandom(seed);
        return Math.random() < 0.5 ? 'Big (B)' : 'Small (S)';
    }

    const server1 = markovChainPrediction(outcomes);
    const server2 = weightedProbabilityPrediction(outcomes);
    const server3 = pseudorandomPrediction(outcomes);

    const finalPrediction = [server1, server2, server3].sort((a, b) =>
        outcomes.filter(v => v === a).length - outcomes.filter(v => v === b).length
    )[0];

    return {
        server1,
        server2,
        server3,
        final: finalPrediction
    };
}
