/**
 * Mock AI Analyser
 * Produces deterministic-ish results based on text content + image size heuristics.
 * Replace with real Google Vision API when USE_MOCK_AI=false.
 */

const ISSUE_KEYWORDS = {
  pothole:     ['pothole', 'pit', 'hole', 'crater', 'dent', 'road damage'],
  garbage:     ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish', 'bin'],
  sewage:      ['sewage', 'drain', 'sewer', 'overflow', 'water logging', 'flood', 'manhole'],
  road:        ['road', 'pavement', 'crack', 'broken', 'damaged road', 'tarmac', 'asphalt'],
  streetlight: ['streetlight', 'light', 'lamp', 'bulb', 'dark', 'electricity', 'power'],
};

function detectIssueType(text = '', category = '') {
  const lower = (text + ' ' + category).toLowerCase();
  for (const [type, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return 'other';
}

function detectSeverity(text = '', imageBuffer = null) {
  const lower = text.toLowerCase();
  if (['critical', 'emergency', 'dangerous', 'collapse', 'urgent'].some((w) => lower.includes(w)))
    return 'critical';
  if (['severe', 'major', 'large', 'big'].some((w) => lower.includes(w)))
    return 'severe';
  if (['minor', 'small', 'little', 'tiny'].some((w) => lower.includes(w)))
    return 'minor';

  // Use image file size as a heuristic: larger file → potentially more content → higher severity
  if (imageBuffer) {
    const kb = imageBuffer.length / 1024;
    if (kb > 800) return 'severe';
    if (kb > 300) return 'moderate';
  }
  return 'moderate';
}

function assessAuthenticity(imageBuffer, text = '') {
  if (!imageBuffer) {
    // No image uploaded — suspicious
    return { verdict: 'SUSPICIOUS', confidence: 0.35, flags: ['no_image_provided'] };
  }

  const flags = [];
  let confidence = 0.82;

  // Heuristic: very small images are likely not real photos
  if (imageBuffer.length < 10 * 1024) {
    flags.push('image_too_small');
    confidence -= 0.25;
  }

  // Very short description
  if (text.trim().length < 15) {
    flags.push('description_too_short');
    confidence -= 0.15;
  }

  // Detect suspicious keywords
  const suspWords = ['test', 'demo', 'abc', 'fake', 'random', 'xyz'];
  if (suspWords.some((w) => text.toLowerCase().includes(w))) {
    flags.push('suspicious_keywords');
    confidence -= 0.20;
  }

  confidence = Math.max(0, Math.min(1, confidence));

  let verdict;
  if (confidence >= 0.65) verdict = 'REAL';
  else if (confidence >= 0.35) verdict = 'SUSPICIOUS';
  else verdict = 'FAKE';

  return { verdict, confidence: parseFloat(confidence.toFixed(2)), flags };
}

async function mockAnalyse({ imageBuffer, complaintText, category }) {
  const issueType = detectIssueType(complaintText, category);
  const severity = detectSeverity(complaintText, imageBuffer);
  const { verdict, confidence, flags } = assessAuthenticity(imageBuffer, complaintText);

  return { issueType, severity, verdict, confidence, flags };
}

module.exports = { mockAnalyse };
