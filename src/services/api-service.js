// API Service - Handles calls to Teamther API or mock
const axios = require('axios');
const logger = require('../utils/logger');
const { mockScoreResume } = require('./mock-api');

/**
 * Score a resume using Teamther API
 */
async function scoreResume(fileBuffer, userId, fileName) {
  const useMockAPI = process.env.MOCK_API_ENABLED === 'true';
  
  if (useMockAPI) {
    logger.info(`Using MOCK API for resume scoring`);
    return await mockScoreResume(fileBuffer, userId);
  }
  
  // Real API call
  logger.info(`Calling Teamther API for resume scoring`);
  
  try {
    const response = await axios.post(
      process.env.TEAMTHER_API_URL || 'https://api.teamther.ai/v1/score',
      fileBuffer,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TEAMTHER_API_KEY}`,
          'Content-Type': 'application/pdf',
          'X-User-ID': userId,
          'X-File-Name': fileName
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    logger.success(`Teamther API response received`);
    return response.data;
    
  } catch (error) {
    logger.error(`Teamther API error:`, error.message);
    
    // Provide more specific error messages
    if (error.response) {
      // API responded with error
      throw new Error(`API Error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // No response received
      throw new Error('API Error: No response from server');
    } else {
      // Request setup error
      throw new Error(`API Error: ${error.message}`);
    }
  }
}

/**
 * Check API health
 */
async function checkAPIHealth() {
  const useMockAPI = process.env.MOCK_API_ENABLED === 'true';
  
  if (useMockAPI) {
    return { status: 'healthy', mode: 'mock' };
  }
  
  try {
    const response = await axios.get(
      `${process.env.TEAMTHER_API_URL}/health`,
      {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${process.env.TEAMTHER_API_KEY}`
        }
      }
    );
    
    return { status: 'healthy', mode: 'production', data: response.data };
  } catch (error) {
    logger.warn('API health check failed:', error.message);
    return { status: 'unhealthy', mode: 'production', error: error.message };
  }
}

module.exports = {
  scoreResume,
  checkAPIHealth
};
