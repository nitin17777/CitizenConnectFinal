/**
 * Cost Estimation Engine
 * Rule-based: issueType × severity × cityTierMultiplier
 * Rounded to nearest ₹500
 */

const BASE_COSTS = {
  pothole:     { minor: 5000,  moderate: 15000, severe: 35000, critical: 75000 },
  garbage:     { minor: 2000,  moderate: 6000,  severe: 12000, critical: 25000 },
  sewage:      { minor: 8000,  moderate: 20000, severe: 50000, critical: 100000 },
  road:        { minor: 10000, moderate: 30000, severe: 70000, critical: 150000 },
  streetlight: { minor: 3000,  moderate: 8000,  severe: 15000, critical: 30000 },
  other:       { minor: 4000,  moderate: 10000, severe: 25000, critical: 50000 },
};

// City tier multipliers: 1 = metro, 2 = tier-2, 3 = tier-3
const TIER_MULTIPLIERS = { 1: 1.2, 2: 1.0, 3: 0.8 };

function estimateCost(issueType, severity) {
  const tier = parseInt(process.env.CITY_TIER || '2', 10);
  const multiplier = TIER_MULTIPLIERS[tier] || 1.0;

  const typeMap = BASE_COSTS[issueType] || BASE_COSTS.other;
  const base = typeMap[severity] || typeMap.moderate;
  const raw = base * multiplier;

  // Round to nearest 500
  return Math.round(raw / 500) * 500;
}

module.exports = { estimateCost };
