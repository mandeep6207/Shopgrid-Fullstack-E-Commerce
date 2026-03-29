/**
 * AI Smart Stylist - Frontend JavaScript Logic
 * Handles image upload, API calls, and result display
 */

let selectedImage = null;
let currentAnalysis = null;

/* ─────────────────────────────────────────────────────────────────── */
/* File Upload Handling */
/* ─────────────────────────────────────────────────────────────────── */

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusMessage = document.getElementById('statusMessage');
const resultsSection = document.getElementById('resultsSection');

// Click to upload
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect({ target: fileInput });
  }
});

/**
 * Handle file selection
 */
function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file (PNG, JPG, JPEG)');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showError('File size must be less than 5MB');
    clearFile();
    return;
  }

  // Read and preview image
  const reader = new FileReader();

  reader.onload = (e) => {
    selectedImage = e.target.result;
    displayPreview(selectedImage);
    analyzeBtn.disabled = false;
    statusMessage.textContent = 'Ready to analyze!';
    statusMessage.style.color = '#51cf66';
  };

  reader.onerror = () => {
    showError('Failed to read file');
    clearFile();
  };

  reader.readAsDataURL(file);
}

/**
 * Display image preview
 */
function displayPreview(imageSrc) {
  previewArea.innerHTML = `<img src="${imageSrc}" alt="Preview" class="preview-image" />`;
}

/**
 * Clear file selection
 */
function clearFile() {
  selectedImage = null;
  fileInput.value = '';
  previewArea.innerHTML = `
    <div class="preview-placeholder">
      <p class="placeholder-text">Image preview will appear here</p>
    </div>
  `;
  analyzeBtn.disabled = true;
  statusMessage.textContent = '';
}

/* ─────────────────────────────────────────────────────────────────── */
/* API Communication */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * Analyze outfit using AI
 */
async function analyzeOutfit() {
  if (!selectedImage) {
    showError('Please select an image first');
    return;
  }

  analyzeBtn.disabled = true;
  showLoading('Analyzing your style with AI...');

  try {
    const response = await apiRequest('/api/ai/style', {
      method: 'POST',
      body: JSON.stringify({
        image: selectedImage
      })
    });

    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }

    currentAnalysis = response.data;
    displayAnalysis(response.data);
    statusMessage.textContent = '';
  } catch (error) {
    console.error('Analysis error:', error);
    showError(
      error.message || 'Failed to analyze image. Please try again.'
    );
  } finally {
    analyzeBtn.disabled = false;
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/* Results Display */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * Display analysis results
 */
function displayAnalysis(data) {
  const { analysis, recommendations } = data;

  // Build analysis section
  const colorsHtml = analysis.colors
    .map(
      (color) => `
    <div class="color-swatch" title="${color}" 
         style="background-color: ${getColorHex(color)};">
    </div>
  `
    )
    .join('');

  const analysisHtml = `
    <div class="analysis-box">
      <h3>📊 Your Style Profile</h3>
      
      <div style="margin-bottom: 20px;">
        <p style="margin: 0; color: #666; font-style: italic; font-size: 0.95rem;">
          "${analysis.description}"
        </p>
      </div>

      <div class="style-attributes">
        <div class="attribute">
          <div class="attribute-label">Style</div>
          <div class="attribute-value">${capitalize(analysis.style)}</div>
        </div>
        <div class="attribute">
          <div class="attribute-label">Occasion</div>
          <div class="attribute-value">${capitalize(analysis.occasion)}</div>
        </div>
        <div class="attribute">
          <div class="attribute-label">Tone</div>
          <div class="attribute-value">${capitalize(analysis.tone)}</div>
        </div>
        <div class="attribute">
          <div class="attribute-label">Formality</div>
          <div class="attribute-value">${capitalize(analysis.formality)}</div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="attribute-label">Colors in Your Outfit</div>
        <div class="colors-display">
          ${colorsHtml}
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="attribute-label">Analysis Confidence</div>
        <div class="confidence-bar">
          <div class="confidence-fill" style="width: ${analysis.confidence * 100}%;"></div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 0.85rem; color: #999;">
          ${Math.round(analysis.confidence * 100)}% confident
        </p>
      </div>
    </div>
  `;

  // Build recommendations section
  const recommendationsHtml = recommendations
    .map((rec) =>
      buildRecommendationCard(rec)
    )
    .join('');

  const allResults = `
    ${analysisHtml}
    <h3 style="margin-top: 40px; margin-bottom: 20px;">🛍️ Recommended For You</h3>
    <div class="recommendations">
      ${recommendationsHtml}
    </div>
  `;

  resultsSection.innerHTML = allResults;
}

/**
 * Build single recommendation card HTML
 */
function buildRecommendationCard(rec) {
  const imageHtml =
    rec.image && rec.image.trim() !== ''
      ? `<img src="${rec.image}" alt="${rec.title}" />`
      : `<div class="rec-image-placeholder">👕</div>`;

  const ratingStars =
    rec.rating >= 4.5
      ? '⭐⭐⭐⭐⭐'
      : rec.rating >= 4
        ? '⭐⭐⭐⭐'
        : rec.rating >= 3
          ? '⭐⭐⭐'
          : '⭐⭐';

  return `
    <div class="rec-card">
      <div class="rec-image">
        ${imageHtml}
        <div class="rec-score">${rec.styleScore}% Match</div>
      </div>
      <div class="rec-content">
        <div class="rec-category">${rec.category || 'Product'}</div>
        <h4 class="rec-title">${rec.title}</h4>
        <div class="rec-price">€${rec.price?.toFixed(2) || '0.00'}</div>
        <div class="rec-reason">💡 ${rec.reason}</div>
        <div class="rec-rating">${ratingStars} ${rec.rating || 'N/A'}</div>
        <button 
          class="rec-btn"
          onclick="viewProduct(${rec.id})"
        >
          View Product →
        </button>
      </div>
    </div>
  `;
}

/**
 * Navigate to product page
 */
function viewProduct(productId) {
  window.location.href = `/product.html?id=${productId}`;
}

/* ─────────────────────────────────────────────────────────────────── */
/* Utility Functions */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * Show loading state
 */
function showLoading(message = 'Loading...') {
  resultsSection.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      ${message}
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  resultsSection.innerHTML = `
    <div class="error-message">
      ❌ ${message}
    </div>
  `;
}

/**
 * Convert color name to hex (simple mapping, can be extended)
 */
function getColorHex(colorName) {
  const colorMap = {
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    grey: '#808080',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    navy: '#000080',
    coral: '#FF7F50',
    teal: '#008080',
    gold: '#FFD700',
    silver: '#C0C0C0',
    beige: '#F5F5DC',
    cream: '#FFFDD0',
    khaki: '#F0E68C',
    tan: '#D2B48C',
    maroon: '#800000',
    olive: '#808000'
  };

  const lowerName = colorName.toLowerCase().trim();
  return colorMap[lowerName] || '#CCCCCC';
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─────────────────────────────────────────────────────────────────── */
/* Initialize */
/* ─────────────────────────────────────────────────────────────────── */

// Load navbar on page load
document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
});
