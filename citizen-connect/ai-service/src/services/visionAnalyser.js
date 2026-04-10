/**
 * Real Google Vision API analyser
 * Only used when USE_MOCK_AI=false and GOOGLE_APPLICATION_CREDENTIALS is set.
 */

const vision = require('@google-cloud/vision');
const { detectIssueTypeFromLabels } = require('./mockAnalyser');

let client;
function getClient() {
  if (!client) client = new vision.ImageAnnotatorClient();
  return client;
}

const LABEL_TO_ISSUE = {
  'pothole': 'pothole',
  'asphalt': 'road',
  'road': 'road',
  'pavement': 'road',
  'crack': 'road',
  'garbage': 'garbage',
  'waste': 'garbage',
  'litter': 'garbage',
  'trash': 'garbage',
  'sewer': 'sewage',
  'drain': 'sewage',
  'flood': 'sewage',
  'street light': 'streetlight',
  'lamp': 'streetlight',
};

function mapLabelsToIssue(labels = []) {
  for (const label of labels) {
    const lower = label.description.toLowerCase();
    for (const [keyword, issue] of Object.entries(LABEL_TO_ISSUE)) {
      if (lower.includes(keyword)) return issue;
    }
  }
  return 'other';
}

function scoreSeverityFromSafeSearch(safeSearch, labels) {
  // Use label confidence scores as a proxy for severity
  const topScore = labels.length > 0 ? labels[0].score : 0.5;
  if (topScore > 0.9) return 'critical';
  if (topScore > 0.75) return 'severe';
  if (topScore > 0.5) return 'moderate';
  return 'minor';
}

async function realAnalyse({ imageBuffer, complaintText, category }) {
  const visionClient = getClient();

  const [labelResult] = await visionClient.labelDetection({ image: { content: imageBuffer } });
  const [safeResult] = await visionClient.safeSearchDetection({ image: { content: imageBuffer } });

  const labels = labelResult.labelAnnotations || [];
  const safeSearch = safeResult.safeSearchAnnotation || {};

  const issueType = mapLabelsToIssue(labels);
  const severity = scoreSeverityFromSafeSearch(safeSearch, labels);

  // Use top label score as confidence proxy
  const topLabelScore = labels.length > 0 ? labels[0].score : 0.5;
  const confidence = parseFloat(Math.min(topLabelScore + 0.1, 1.0).toFixed(2));

  const flags = [];
  if (['LIKELY', 'VERY_LIKELY'].includes(safeSearch.adult)) flags.push('adult_content');
  if (['LIKELY', 'VERY_LIKELY'].includes(safeSearch.violence)) flags.push('violent_content');

  let verdict;
  if (confidence >= 0.65) verdict = 'REAL';
  else if (confidence >= 0.35) verdict = 'SUSPICIOUS';
  else verdict = 'FAKE';

  return { issueType, severity, verdict, confidence, flags };
}

module.exports = { realAnalyse };
