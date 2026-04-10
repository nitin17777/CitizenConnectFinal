/**
 * AI Integration Service
 * Sends image + metadata to the AI microservice and returns the analysis report.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * @param {string} imagePath  - Absolute path to uploaded image on disk
 * @param {object} meta       - { complaintText, category, location }
 * @returns {object}          - AI report JSON
 */
async function callAIService(imagePath, meta = {}) {
  const form = new FormData();

  if (imagePath && fs.existsSync(imagePath)) {
    form.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg',
    });
  }

  form.append('complaintText', meta.complaintText || '');
  form.append('category', meta.category || 'other');
  form.append('location', meta.location || '');

  const response = await axios.post(`${AI_SERVICE_URL}/analyse`, form, {
    headers: { ...form.getHeaders() },
    timeout: 30000, // 30 second timeout
  });

  return response.data;
}

module.exports = { callAIService };
