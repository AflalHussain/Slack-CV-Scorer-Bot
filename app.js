require('dotenv').config();
const { App } = require('@slack/bolt');
const fileEventHandler = require('./src/listeners/file-events');
const logger = require('./src/utils/logger');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true, // Enable Socket Mode for development (no public URL needed)
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Register event listeners
fileEventHandler(app);

// App Home - shows when user opens bot in sidebar
app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '👋 Welcome to CV Scorer!',
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*How to use:*\n1. Invite this bot to a channel\n2. Drop a resume PDF file\n3. Get instant AI scoring!\n\n_Currently using mock API for demo purposes._'
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '📊 *Features:*\n• Instant resume analysis\n• Detailed strengths & weaknesses\n• Professional score cards\n• Fast processing (<3 seconds)'
            }
          }
        ]
      }
    });
  } catch (error) {
    logger.error('Error publishing home view:', error);
  }
});

// Error handler
app.error(async (error) => {
  logger.error('App error:', error);
});

// Start the app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  
  logger.info(`⚡️ Slack CV Bot is running on port ${port}!`);
  logger.info(`📝 Socket Mode: ${app.socketMode ? 'Enabled' : 'Disabled'}`);
  logger.info(`🧪 Mock API: ${process.env.MOCK_API_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
})();
