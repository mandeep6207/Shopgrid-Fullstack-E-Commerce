/**
 * Stylist Service - Matches analyzed style with products in database
 * Calculates confidence scores based on style attributes
 */

const { loadProducts } = require('./products');

/**
 * Calculate style match score between product and analyzed style
 * @param {Object} product - Product from database
 * @param {Object} styleAnalysis - Analysis from AI
 * @returns {number} - Score 0-100
 */
function calculateStyleMatch(product, styleAnalysis) {
  let score = 50; // Start with base score

  // Extract product attributes (assuming they exist in product object)
  const productCategory = (product.category || '').toLowerCase();
  const productColors = (product.colors || []).map(c => c.toLowerCase());
  const productStyle = (product.style || '').toLowerCase();
  const productPrice = product.price || 0;

  // Extract analyzed attributes
  const analyzeColors = styleAnalysis.colors.map(c => c.toLowerCase());
  const analyzedStyle = styleAnalysis.style.toLowerCase();
  const analyzedOccasion = styleAnalysis.occasion.toLowerCase();
  const analyzedTone = styleAnalysis.tone.toLowerCase();

  // 1. Color Match (40% of score boost)
  let colorMatch = 0;
  if (productColors && productColors.length > 0) {
    const matchedColors = productColors.filter(pc =>
      analyzeColors.some(ac => ac.includes(pc) || pc.includes(ac))
    );
    colorMatch = (matchedColors.length / Math.max(productColors.length, 1)) * 40;
  } else if (analyzeColors.length > 0) {
    // If product has no color data, give partial credit
    colorMatch = 20;
  }

  // 2. Style Match (30% of score boost)
  let styleMatch = 0;
  const styleMapping = {
    casual: ['tshirt', 'jeans', 'sneaker', 'hoodie', 'simple', 'everyday'],
    formal: ['blazer', 'suit', 'dress', 'heels', 'tie', 'dress-shirt'],
    athletic: ['sports', 'gym', 'track', 'yoga', 'running', 'athletic'],
    trendy: ['fashion', 'modern', 'style', 'trendy', 'contemporary'],
    bohemian: ['boho', 'hippie', 'ethnic', 'flowy', 'maxi'],
    business: ['business', 'office', 'corporate', 'professional']
  };

  if (productStyle && styleMapping[analyzedStyle]) {
    if (styleMapping[analyzedStyle].some(s => productCategory.includes(s))) {
      styleMatch = 30;
    } else if (productCategory === analyzedStyle) {
      styleMatch = 25;
    } else {
      styleMatch = 5;
    }
  } else {
    styleMatch = 10;
  }

  // 3. Occasion Match (20% of score boost)
  let occasionMatch = 0;
  const occasionMapping = {
    daily: ['everyday', 'casual', 'basic'],
    work: ['business', 'office', 'professional', 'blazer'],
    party: ['dress', 'heels', 'cocktail', 'evening', 'formal'],
    gym: ['sports', 'athletic', 'gym', 'yoga', 'running'],
    casual: ['casual', 'everyday', 'tshirt', 'jeans'],
    formal: ['formal', 'suit', 'dress', 'evening'],
    date: ['dress', 'elegant', 'nice', 'casual-formal']
  };

  if (occasionMapping[analyzedOccasion]) {
    if (occasionMapping[analyzedOccasion].some(o => productCategory.includes(o))) {
      occasionMatch = 20;
    } else {
      occasionMatch = 5;
    }
  } else {
    occasionMatch = 10;
  }

  // 4. Natural Fit Bonus (10% extra)
  let fitBonus = 0;
  if (
    productPrice > 0 &&
    productPrice < 500 &&
    productCategory &&
    analyzeColors.length > 0
  ) {
    fitBonus = 10;
  }

  // Total score
  score = Math.min(100, colorMatch + styleMatch + occasionMatch + fitBonus);

  // Apply AI confidence as multiplier (0.6 to 1.0 range)
  const confidenceMultiplier = Math.max(
    0.6,
    styleAnalysis.confidence || 0.8
  );
  score = score * confidenceMultiplier;

  return Math.round(score);
}

/**
 * Get top product recommendations based on style analysis
 * @param {Object} styleAnalysis - Analysis from AI
 * @param {number} limit - Number of recommendations to return
 * @returns {Array} - Top recommendations with scores
 */
function getRecommendations(styleAnalysis, limit = 5) {
  try {
    const products = loadProducts();

    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    // Score all products
    const scored = products.map(product => ({
      ...product,
      styleScore: calculateStyleMatch(product, styleAnalysis)
    }));

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.styleScore - a.styleScore)
      .slice(0, limit)
      .map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        image: item.image,
        rating: item.rating,
        styleScore: item.styleScore,
        reason: generateRecommendationReason(item, styleAnalysis)
      }));
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Generate human-readable reason for recommendation
 * @param {Object} product - Product object
 * @param {Object} styleAnalysis - AI style analysis
 * @returns {string} - Reason message
 */
function generateRecommendationReason(product, styleAnalysis) {
  const reasons = [];

  // Color reason
  if (product.colors && product.colors.length > 0) {
    const productColors = product.colors.map(c => c.toLowerCase());
    const matchedColor = productColors.find(pc =>
      styleAnalysis.colors.some(ac => ac.toLowerCase() === pc)
    );
    if (matchedColor) {
      reasons.push(`matches your ${matchedColor} palette`);
    }
  }

  // Style reason
  if (product.style) {
    reasons.push(`perfect for ${styleAnalysis.occasion} wear`);
  }

  // Price reason (if under €50)
  if (product.price && product.price < 50) {
    reasons.push(`great value`);
  }

  if (reasons.length === 0) {
    reasons.push('complements your style');
  }

  return reasons.slice(0, 2).join(', ');
}

module.exports = {
  getRecommendations,
  calculateStyleMatch,
  generateRecommendationReason
};
