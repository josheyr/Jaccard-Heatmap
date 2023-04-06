var largeText = "this is our giant sample with loads of samples spread among it (the full html page)";
var sample = "the sample";
const ngramSize = 3;

function ngrams(text, n) {
    const result = [];
    for (let i = 0; i <= text.length - n; i++) {
        result.push(text.slice(i, i + n));
    }
    return result;
}

function jaccardSimilarity(a, b) {
    const counterA = new Map([...new Set(a)].map(x => [x, a.filter(y => y === x).length]));
    const counterB = new Map([...new Set(b)].map(x => [x, b.filter(y => y === x).length]));

    const intersection = new Set([...counterA.keys()].filter(x => counterB.has(x)));
    const union = new Set([...counterA.keys(), ...counterB.keys()]);

    const intersectionSum = Array.from(intersection).reduce((acc, x) => acc + Math.min(counterA.get(x), counterB.get(x)), 0);
    const unionSum = Array.from(union).reduce((acc, x) => acc + Math.max(counterA.get(x) || 0, counterB.get(x) || 0), 0);

    return intersectionSum / unionSum;
}

function findBestMatch(largeText, sample, ngramSize) {
    const largeTextNgrams = ngrams(largeText, ngramSize);
    const sampleNgrams = ngrams(sample, ngramSize);
    let bestSimilarity = 0;

    for (let i = 0; i <= largeTextNgrams.length - sampleNgrams.length; i++) {
        const similarity = jaccardSimilarity(sampleNgrams, largeTextNgrams.slice(i, i + sampleNgrams.length));
        bestSimilarity = Math.max(bestSimilarity, similarity);
    }

    return bestSimilarity;
}

function findPercentage(largeText, sample, ngramSize = 3) {
    const bestSimilarity = findBestMatch(largeText, sample, ngramSize);
    const occurrences = Math.floor(largeText.length * bestSimilarity / sample.length);
    const percentage = (occurrences * sample.length / largeText.length) * 100;
    return percentage;
}

function calculateSimilarities(largeText, sample, ngramSize) {
    const largeTextNgrams = ngrams(largeText, ngramSize);
    const sampleNgrams = ngrams(sample, ngramSize);
    const similarities = [];

    for (let i = 0; i <= largeTextNgrams.length - sampleNgrams.length; i++) {
        const similarity = jaccardSimilarity(sampleNgrams, largeTextNgrams.slice(i, i + sampleNgrams.length));
        similarities.push(similarity);
    }

    return similarities;
}

function drawHeatmap(largeText, similarities) {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, largeText.length]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    const color = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateBlues);

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const cells = svg.selectAll(".cell")
        .data(similarities)
        .join("rect")
        .attr("class", "cell")
        .attr("x", (d, i) => x(i))
        .attr("y", 0)
        .attr("width", x(1) - x(0))
        .attr("height", height)
        .attr("fill", d => color(d))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#000").attr("stroke-width", 1);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("stroke", null);
        })
        .on("click", function(event, d, i) {
            alert(`Index: ${i}, Similarity: ${d.toFixed(2)}`);
        });

    const xAxis = d3.axisBottom(x).ticks(10);
const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%"));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .text("Index");

    svg.append("g")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .text("Similarity");
}
  var similarities = calculateSimilarities(largeText, sample, ngramSize);
drawHeatmap(largeText, similarities);

const largeTextInput = document.getElementById("largeText");
const sampleInput = document.getElementById("sample");

// Add event listeners to the input elements
largeTextInput.addEventListener("input", updateVariables);
sampleInput.addEventListener("input", updateVariables);

// Function to update the variables and run the function
function updateVariables() {
  largeText = largeTextInput.value;
  sample = sampleInput.value;
clearHeatmap()
   similarities = calculateSimilarities(largeText, sample, ngramSize);
drawHeatmap(largeText, similarities);
}

const heatmap = document.getElementById("heatmap");

// Function to clear the contents of the heatmap element
function clearHeatmap() {
  heatmap.innerHTML = "";
}
