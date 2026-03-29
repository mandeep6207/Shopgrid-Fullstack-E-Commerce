/**
 * AI Service - Handles OpenAI Vision API calls for style analysis
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    '⚠️  OPENAI_API_KEY not set. AI features will not work. Set it in .env'
  );
}

/**
 * Analyze outfit image and extract style attributes
 * @param {string} imageBase64 - Image in base64 format (data:image/... or raw base64)
 * @returns {Promise<Object>} - Style analysis with colors, style, occasion, etc.
 */
async function analyzeStyle(imageBase64) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Ensure proper data URI format
  let imageUrl = imageBase64;
  if (!imageBase64.startsWith('data:image/')) {
    imageUrl = `data:image/jpeg;base64,${imageBase64}`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: `You are a professional fashion stylist AI. Analyze this outfit image and extract style attributes.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "colors": ["color1", "color2", "color3"],
  "primaryColor": "color",
  "style": "casual|business|formal|athletic|trendy|bohemian|minimalist",
  "occasion": "daily|work|party|gym|casual|formal|date|travel",
  "tone": "warm|cool|neutral",
  "formality": "relaxed|smart-casual|business-casual|business-formal",
  "patterns": ["solid", "striped", "floral", "geometric", "none"],
  "confidence": 0.85,
  "description": "Brief 1-2 sentence description of the style"
}

Be concise. Extract the main colors and dominant style. Return confidence 0.8-0.95.`
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return {
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    throw error;
  }
}

module.exports = {
  analyzeStyle
};
