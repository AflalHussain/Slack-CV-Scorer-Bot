// Slack Service - Handles Slack API interactions
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Download file from Slack
 */
async function downloadFile(url, token) {
  try {
    logger.debug(`Downloading file from Slack: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'arraybuffer', // Important: get binary data
      timeout: 30000
    });
    
    logger.success(`File downloaded successfully (${response.data.length} bytes)`);
    return response.data;
    
  } catch (error) {
    logger.error('Error downloading file from Slack:', error.message);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Get detailed file information
 */
async function getFileInfo(client, fileId) {
  try {
    const result = await client.files.info({
      file: fileId
    });
    
    return result.file;
    
  } catch (error) {
    logger.error('Error getting file info:', error.message);
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

/**
 * Post a message to a channel
 */
async function postMessage(client, channel, messageContent) {
  try {
    const result = await client.chat.postMessage({
      channel,
      ...messageContent
    });
    
    return result;
    
  } catch (error) {
    logger.error('Error posting message:', error.message);
    throw new Error(`Failed to post message: ${error.message}`);
  }
}

/**
 * Update an existing message
 */
async function updateMessage(client, channel, timestamp, messageContent) {
  try {
    const result = await client.chat.update({
      channel,
      ts: timestamp,
      ...messageContent
    });
    
    return result;
    
  } catch (error) {
    logger.error('Error updating message:', error.message);
    throw new Error(`Failed to update message: ${error.message}`);
  }
}

/**
 * Add reaction to a message
 */
async function addReaction(client, channel, timestamp, emoji) {
  try {
    await client.reactions.add({
      channel,
      timestamp,
      name: emoji
    });
    
  } catch (error) {
    logger.warn('Error adding reaction:', error.message);
    // Don't throw - reactions are nice-to-have
  }
}

/**
 * Get user information
 */
async function getUserInfo(client, userId) {
  try {
    const result = await client.users.info({
      user: userId
    });
    
    return result.user;
    
  } catch (error) {
    logger.error('Error getting user info:', error.message);
    return null;
  }
}

module.exports = {
  downloadFile,
  getFileInfo,
  postMessage,
  updateMessage,
  addReaction,
  getUserInfo
};
