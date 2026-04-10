/**
 * Main Analyser Orchestrator
 * Coordinates mock or real analysis + cost estimation
 */

const { estimateCost } = require('./costEstimator');
const { mockAnalyse } = require('./mockAnalyser');

const USE_MOCK = process.env.USE_MOCK_AI !== 'false';

async function analyseComplaint({ imageBuffer, complaintText, category, location }) {
  let analysisResult;

  if (USE_MOCK) {
    analysisResult = await mockAnalyse({ imageBuffer, complaintText, category });
  } else {
    // Dynamically import real analyser only when needed
    const { realAnalyse } = require('./visionAnalyser');
    analysisResult = await realAnalyse({ imageBuffer, complaintText, category });
  }

  const { issueType, severity, verdict, confidence, flags } = analysisResult;
  const estimatedCost = estimateCost(issueType, severity);

  const response = {
    verdict,          // "REAL" | "SUSPICIOUS" | "FAKE"
    confidence,       // 0-1
    issueType,        // "pothole" | "garbage" | "sewage" | "road" | "streetlight" | "other"
    severity,         // "minor" | "moderate" | "severe" | "critical"
    estimatedCost,    // number in INR (₹)
    flags,            // [] | ["no_image_provided", ...]
  };

  console.log(`[AI-ANALYSE] verdict=${verdict} confidence=${confidence} type=${issueType} severity=${severity} cost=₹${estimatedCost}`);
  return response;
}

module.exports = { analyseComplaint };
