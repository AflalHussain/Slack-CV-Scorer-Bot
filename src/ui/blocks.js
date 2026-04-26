// Slack Block Kit UI Templates

/**
 * Get color based on score
 */
function getScoreColor(score) {
  if (score >= 80) return '#36a64f'; // Green
  if (score >= 60) return '#ff9800'; // Orange
  return '#e01e5a'; // Red
}

/**
 * Get emoji based on score
 */
function getScoreEmoji(score) {
  if (score >= 90) return '🌟';
  if (score >= 80) return '✅';
  if (score >= 70) return '👍';
  if (score >= 60) return '⚠️';
  return '❌';
}

/**
 * Build loading message
 */
function buildLoadingMessage(fileName) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🔄 *Analyzing resume...*\n\`${fileName}\``
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_This usually takes 2-3 seconds_'
          }
        ]
      }
    ],
    text: `Analyzing resume: ${fileName}` // Fallback text
  };
}

/**
 * Build complete score card
 */
function buildScoreCard(scoreData, fileName, userId) {
  const emoji = getScoreEmoji(scoreData.score);
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Build strengths list
  const strengthsList = scoreData.strengths
    .map((s, i) => `${i + 1}. ${s}`)
    .join('\n');
  
  // Build weaknesses list
  const weaknessesList = scoreData.weaknesses
    .map((w, i) => `${i + 1}. ${w}`)
    .join('\n');
  
  const blocks = [
    // Header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${emoji} Resume Analysis Complete`,
        emoji: true
      }
    },
    
    // File name and score
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*File:* \`${fileName}\`\n*Overall Score:* *${scoreData.score}/100*`
      }
    },
    
    {
      type: 'divider'
    },
    
    // Key Strengths
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*✅ Key Strengths*\n${strengthsList}`
      }
    },
    
    // Areas for Improvement
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*⚠️ Areas for Improvement*\n${weaknessesList}`
      }
    }
  ];
  
  // Add skills match if available
  if (scoreData.skills_match !== undefined) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎯 Skills Match:* ${Math.round(scoreData.skills_match * 100)}%`
      }
    });
  }
  
  blocks.push(
    {
      type: 'divider'
    },
    
    // Context footer
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Analyzed by Teamther.ai | Requested by <@${userId}> | ${timestamp}`
        }
      ]
    }
  );
  
  // Add action buttons if report ID exists
  if (scoreData.report_id) {
    blocks.splice(blocks.length - 2, 0, {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📊 View Full Report',
            emoji: true
          },
          url: `https://teamther.ai/reports/${scoreData.report_id}`,
          style: scoreData.score >= 80 ? 'primary' : undefined
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '💾 Download PDF',
            emoji: true
          },
          url: `https://teamther.ai/reports/${scoreData.report_id}/download`
        }
      ]
    });
  }
  
  return {
    blocks,
    text: `Resume scored: ${scoreData.score}/100` // Fallback text
  };
}

/**
 * Build error message
 */
function buildErrorMessage(error, fileName) {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *Error analyzing resume*\n\`${fileName}\``
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:* ${error}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_Please try again or contact support if the issue persists_'
          }
        ]
      }
    ],
    text: `Error analyzing resume: ${error}` // Fallback text
  };
}

module.exports = {
  buildLoadingMessage,
  buildScoreCard,
  buildErrorMessage,
  getScoreColor,
  getScoreEmoji
};
