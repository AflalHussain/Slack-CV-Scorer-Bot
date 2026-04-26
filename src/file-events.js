// File Event Listener - Main orchestration
const logger = require('../utils/logger');
const { validateFile } = require('../utils/validators');
const { 
  downloadFile, 
  getFileInfo, 
  postMessage, 
  updateMessage,
  addReaction 
} = require('../services/slack-service');
const { scoreResume } = require('../services/api-service');
const { 
  buildLoadingMessage, 
  buildScoreCard, 
  buildErrorMessage 
} = require('../ui/blocks');

/**
 * Process the resume file
 */
async function processResume(fileInfo, event, client) {
  const startTime = Date.now();
  let loadingMessage = null;
  
  try {
    // Step 1: Post loading message
    logger.info(`📄 Processing resume: ${fileInfo.name}`);
    const loadingContent = buildLoadingMessage(fileInfo.name);
    loadingMessage = await postMessage(client, event.channel_id, loadingContent);
    
    // Add "eyes" reaction to original file to show we're processing
    if (event.file_id) {
      await addReaction(client, event.channel_id, event.event_ts, 'eyes');
    }
    
    // Step 2: Download the file
    const fileBuffer = await downloadFile(
      fileInfo.url_private, 
      process.env.SLACK_BOT_TOKEN
    );
    
    // Step 3: Send to API for scoring
    const scoreData = await scoreResume(fileBuffer, event.user_id, fileInfo.name);
    
    // Step 4: Build and display result card
    const scoreCard = buildScoreCard(scoreData, fileInfo.name, event.user_id);
    await updateMessage(
      client, 
      event.channel_id, 
      loadingMessage.ts, 
      scoreCard
    );
    
    // Add success reaction
    const emoji = scoreData.score >= 80 ? 'white_check_mark' : 'thumbsup';
    await addReaction(client, event.channel_id, loadingMessage.ts, emoji);
    
    const processingTime = Date.now() - startTime;
    logger.success(`✅ Resume processed successfully in ${processingTime}ms`);
    logger.info(`📊 Score: ${scoreData.score}/100`);
    
  } catch (error) {
    logger.error('❌ Error processing resume:', error.message);
    
    // Update loading message with error
    if (loadingMessage) {
      const errorContent = buildErrorMessage(error.message, fileInfo.name);
      await updateMessage(
        client,
        event.channel_id,
        loadingMessage.ts,
        errorContent
      );
    }
    
    // Add error reaction
    await addReaction(client, event.channel_id, loadingMessage?.ts || event.event_ts, 'x');
  }
}

/**
 * Register file event handlers
 */
module.exports = (app) => {
  
  // Main event: File shared in channel
  app.event('file_shared', async ({ event, client }) => {
    try {
      logger.info(`🔔 File shared event received: ${event.file_id}`);
      
      // Get full file information
      const fileInfo = await getFileInfo(client, event.file_id);
      
      // Validate file
      const validation = validateFile(fileInfo);
      if (!validation.valid) {
        logger.warn(`⚠️ Invalid file: ${validation.errors.join(', ')}`);
        
        // Optionally notify user about invalid file
        await postMessage(client, event.channel_id, {
          text: `⚠️ File validation failed: ${validation.errors.join(', ')}`,
          thread_ts: event.event_ts // Reply in thread
        });
        
        return;
      }
      
      logger.info(`✅ File validated: ${fileInfo.name} (${fileInfo.size} bytes)`);
      
      // Process the resume
      await processResume(fileInfo, event, client);
      
    } catch (error) {
      logger.error('Error in file_shared handler:', error);
      
      // Try to post error message
      try {
        await postMessage(client, event.channel_id, {
          text: `❌ An error occurred while processing the file: ${error.message}`
        });
      } catch (postError) {
        logger.error('Failed to post error message:', postError);
      }
    }
  });
  
  // Handle file changes (optional - if file is edited/updated)
  app.event('file_change', async ({ event, client }) => {
    logger.debug(`File changed: ${event.file_id}`);
    // Could re-process if needed
  });
  
  // Handle file deletions (optional - cleanup)
  app.event('file_deleted', async ({ event }) => {
    logger.debug(`File deleted: ${event.file_id}`);
    // Could cleanup any stored data
  });
  
  logger.info('📝 File event listeners registered');
};
