/**
 * AI Routes - Smart Stylist feature endpoints
 */

const express = require('express');
const { analyzeStyle } = require('../services/aiService');
const { getRecommendations } = require('../services/stylistService');
const { sendResponse } = require('../services/apiResponse');

const router = express.Router();

/**
 * POST /api/ai/style
 * Analyze outfit image and get product recommendations
 *
 * Body:
 * {
 *   "image": "base64_image_data"  // Can be data:image/jpeg;base64,... or raw base64
 * }
 */
router.post('/style', async (req, res) => {
  try {
    const { image } = req.body;

    // Validate input
    if (!image) {
      return sendResponse(res, 400, false, null, 'Image is required');
    }

    if (typeof image !== 'string' || image.length < 100) {
      return sendResponse(res, 400, false, null, 'Invalid image data');
    }

    // Analyze style using OpenAI Vision
    const analysisResult = await analyzeStyle(image);

    if (!analysisResult.success) {
      return sendResponse(res, 500, false, null, 'Failed to analyze style');
    }

    const styleAnalysis = analysisResult.analysis;

    // Get recommendations based on analysis
    const recommendations = getRecommendations(styleAnalysis, 5);

    // Return successful response
    return sendResponse(res, 200, true, {
      analysis: {
        colors: styleAnalysis.colors,
        primaryColor: styleAnalysis.primaryColor,
        style: styleAnalysis.style,
        occasion: styleAnalysis.occasion,
        tone: styleAnalysis.tone,
        formality: styleAnalysis.formality,
        confidence: styleAnalysis.confidence,
        description: styleAnalysis.description
      },
      recommendations: recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('POST /api/ai/style error:', error.message);

    // Check for specific error types
    if (error.message.includes('OPENAI_API_KEY')) {
      return sendResponse(
        res,
        500,
        false,
        null,
        'AI feature not configured. Set OPENAI_API_KEY in .env'
      );
    }

    if (error.message.includes('OpenAI API error')) {
      return sendResponse(
        res,
        503,
        false,
        null,
        'OpenAI API error: ' + error.message.substring(0, 100)
      );
    }

    return sendResponse(
      res,
      500,
      false,
      null,
      'Error analyzing style: ' + error.message
    );
  }
});

/**
 * GET /api/ai/health
 * Check if AI features are available
 */
router.get('/health', (_req, res) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const available = !!openaiKey;

  return sendResponse(res, 200, true, {
    aiAvailable: available,
    service: 'openai-vision',
    message: available
      ? 'AI Stylist ready'
      : 'OPENAI_API_KEY not configured'
  });
});

module.exports = router;
