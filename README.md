# Slack CV Scorer Bot - Demo

A Slack bot that provides instant AI-powered resume scoring. Drop a PDF resume into any channel and get detailed analysis with strengths, weaknesses, and an overall score.

## 🎯 Features

- **Instant Analysis**: Drop a resume PDF and get results in ~3 seconds
- **Beautiful UI**: Professional score cards using Slack Block Kit
- **Detailed Feedback**: 
  - Overall score (0-100)
  - Key strengths (3-4 points)
  - Areas for improvement (2-3 points)
  - Skills match percentage
- **Mock API Mode**: Test without a real API backend
- **Socket Mode**: No public URL needed for development

## 🏗️ Architecture

```
User drops PDF → File Event → Download File → Score API → Display Result Card
```

**Tech Stack:**
- Node.js 18+
- Slack Bolt SDK
- Socket Mode (development)
- Mock API (for demo)

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Slack Workspace** where you have admin access
3. **Slack App** (we'll create this together)

## 🚀 Quick Start (5 minutes)

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"** → **"From scratch"**
3. Name it: `CV Scorer Bot`
4. Choose your workspace
5. Click **"Create App"**

### Step 2: Configure App Settings

#### A) Enable Socket Mode
1. Go to **Settings → Socket Mode**
2. Toggle **Enable Socket Mode** → ON
3. Give it a token name: `socket_token`
4. Copy the **App Token** (starts with `xapp-`)
5. Save it - you'll need this!

#### B) Add Bot Token Scopes
1. Go to **Features → OAuth & Permissions**
2. Scroll to **Scopes → Bot Token Scopes**
3. Add these scopes:
   ```
   chat:write          (post messages)
   files:read          (read file info)
   reactions:write     (add reactions)
   users:read          (get user info)
   ```

#### C) Subscribe to Events
1. Go to **Features → Event Subscriptions**
2. Toggle **Enable Events** → ON
3. Expand **Subscribe to bot events**
4. Add these events:
   ```
   file_shared
   file_change (optional)
   app_home_opened
   ```
5. Click **Save Changes**

#### D) Install App to Workspace
1. Go to **Settings → Install App**
2. Click **"Install to Workspace"**
3. Click **"Allow"**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Save it - you'll need this!

### Step 3: Setup Project

```bash
# Clone or download the project
cd slack-cv-bot-demo

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Step 4: Configure Environment

Edit `.env` file with your tokens:

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_SIGNING_SECRET=your-signing-secret

# Mock API settings
MOCK_API_ENABLED=true
MOCK_API_DELAY=2000

# Server
PORT=3000
```

**Where to find values:**
- `SLACK_BOT_TOKEN`: OAuth & Permissions page
- `SLACK_APP_TOKEN`: Socket Mode page
- `SLACK_SIGNING_SECRET`: Basic Information page → App Credentials

### Step 5: Run the Bot

```bash
npm start
```

You should see:
```
⚡️ Slack CV Bot is running on port 3000!
📝 Socket Mode: Enabled
🧪 Mock API: Enabled
📝 File event listeners registered
```

### Step 6: Test It!

1. **Invite bot to a channel:**
   - In Slack, go to any channel
   - Type: `/invite @CV Scorer Bot`

2. **Drop a PDF resume:**
   - Drag and drop any PDF file
   - Watch the magic! ✨

3. **See results:**
   - Loading message appears (~1s)
   - Beautiful score card displays (~2-3s)
   - Shows score, strengths, weaknesses

## 📁 Project Structure

```
slack-cv-bot-demo/
├── app.js                          # Main entry point
├── package.json
├── .env                            # Your secrets
│
├── src/
│   ├── listeners/
│   │   └── file-events.js          # File upload handler
│   │
│   ├── services/
│   │   ├── api-service.js          # Calls Teamther API
│   │   ├── mock-api.js             # Mock scoring responses
│   │   └── slack-service.js        # Slack API helpers
│   │
│   ├── ui/
│   │   └── blocks.js               # Block Kit templates
│   │
│   └── utils/
│       ├── logger.js               # Colored logging
│       └── validators.js           # Input validation
```

## 🎨 Customization

### Change Mock API Delay
In `.env`:
```bash
MOCK_API_DELAY=3000  # 3 seconds
```

### Customize Score Card UI
Edit `src/ui/blocks.js`:
- Change colors in `getScoreColor()`
- Modify emojis in `getScoreEmoji()`
- Add/remove sections in `buildScoreCard()`

### Add Channel Restrictions
Edit `src/listeners/file-events.js`:
```javascript
// Only process in specific channels
const allowedChannels = ['C123ABC', 'C456DEF'];
if (!allowedChannels.includes(event.channel_id)) {
  return;
}
```

## 🔌 Connecting Real API

### Step 1: Update .env
```bash
MOCK_API_ENABLED=false
TEAMTHER_API_URL=https://api.teamther.ai/v1/score
TEAMTHER_API_KEY=your-api-key-here
```

### Step 2: API Expected Format

**Request:**
```javascript
POST /v1/score
Headers:
  Authorization: Bearer {api_key}
  Content-Type: application/pdf
  X-User-ID: {slack_user_id}
  X-File-Name: {filename}
Body: 
  <binary PDF data>
```

**Response:**
```json
{
  "score": 85,
  "strengths": [
    "Strong technical background",
    "Excellent communication skills"
  ],
  "weaknesses": [
    "Limited cloud experience",
    "No agile methodology"
  ],
  "skills_match": 0.87,
  "report_id": "rpt_abc123",
  "metadata": {
    "total_experience_years": 5,
    "education_level": "Master"
  }
}
```

## 🧪 Testing

### Test with Mock API
1. Ensure `MOCK_API_ENABLED=true`
2. Drop any PDF file
3. See randomized scores (65-95)

### Test Error Handling
1. Set invalid `SLACK_BOT_TOKEN`
2. Watch error messages
3. Check console logs

### Test Different File Types
1. Drop a .docx file → Should be ignored
2. Drop a .txt file → Should be ignored
3. Only PDFs are processed

## 📊 What the Bot Does

```
1. User drops resume.pdf in #hiring channel
   ↓
2. Bot detects file_shared event
   ↓
3. Bot validates: Is it a PDF? < 10MB?
   ↓
4. Bot posts: "🔄 Analyzing resume..."
   ↓
5. Bot downloads PDF from Slack
   ↓
6. Bot sends to API (mock or real)
   ↓
7. API returns score + analysis (2-3s)
   ↓
8. Bot updates message with beautiful card:
   - Overall Score: 85/100
   - ✅ Key Strengths (3-4 points)
   - ⚠️ Areas for Improvement (2-3 points)
   - 🎯 Skills Match: 87%
   - Buttons: View Report | Download PDF
   ↓
9. Done! (~3 seconds total)
```

## 🔒 Security Best Practices

1. **Never commit .env file**
   - Already in `.gitignore`
   
2. **Rotate tokens regularly**
   - Change tokens monthly
   
3. **Use OAuth for production**
   - Don't share bot tokens
   
4. **Validate all inputs**
   - Check file types, sizes
   
5. **Rate limiting**
   - Add user/channel limits

## 🚀 Deployment Options

### Option 1: AWS Lambda
- Cheap, scales automatically
- Use Serverless Framework
- ~$5/month for 10k resumes

### Option 2: Heroku
- Easiest deployment
- Free tier available
- Good for testing

### Option 3: DigitalOcean
- Simple VPS
- $5/month droplet
- Full control

### Option 4: Railway
- Modern, fast deployment
- GitHub integration
- Free tier available

## 🐛 Troubleshooting

### Bot doesn't respond
- Check bot is invited to channel
- Verify Socket Mode is enabled
- Check console for errors

### "Invalid token" error
- Verify tokens in .env
- Check token format (xoxb-, xapp-)
- Reinstall app to workspace

### File not processing
- Check file is PDF
- Verify file < 10MB
- Check console logs for errors

### API timeout
- Increase timeout in api-service.js
- Check API endpoint is reachable
- Try mock API first

## 📝 Next Steps

### For Demo/Presentation:
1. ✅ Works with mock API
2. Create demo video
3. Prepare sample resumes
4. Test in demo workspace

### For Production:
1. Connect real Teamther API
2. Add user authentication
3. Implement credit system
4. Add analytics/logging
5. Deploy to cloud
6. Set up monitoring

## 🎯 Features to Add (Future)

- [ ] User preferences (notification settings)
- [ ] Batch processing (multiple files)
- [ ] Comparison view (compare 2+ resumes)
- [ ] Export to CSV/Excel
- [ ] Integration with ATS systems
- [ ] Slack workflow automation
- [ ] Admin dashboard
- [ ] Usage analytics

## 📚 Resources

- [Slack Bolt SDK](https://slack.dev/bolt-js/)
- [Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Slack API Docs](https://api.slack.com/)
- [Socket Mode Guide](https://api.slack.com/apis/connections/socket)

## 💡 Tips

1. **Test in dev workspace first** - Don't test in production
2. **Use Block Kit Builder** - Preview UI before coding
3. **Check logs religiously** - Console tells you everything
4. **Start with mock API** - Faster iteration
5. **Handle errors gracefully** - Always show user what went wrong

## 🤝 Support

Need help? Check:
1. Console logs (most errors show here)
2. Slack API docs
3. This README
4. Google/Stack Overflow

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Teamther.ai**

Ready to score some resumes! 🚀
