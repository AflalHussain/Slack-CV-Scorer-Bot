# 🚀 Quick Setup Guide - Slack CV Scorer Bot

**Time to complete: 10 minutes**

This guide walks you through setting up the bot step-by-step with screenshots references.

---

## Part 1: Create Slack App (5 minutes)

### 1.1 Create New App

1. Open https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Fill in:
   - **App Name:** `CV Scorer Bot`
   - **Workspace:** Select your workspace
5. Click **"Create App"**

✅ **You should now see your app's Basic Information page**

---

### 1.2 Enable Socket Mode

**Why?** Socket Mode lets you develop without needing a public URL.

1. In left sidebar → **Settings → Socket Mode**
2. Toggle **"Enable Socket Mode"** to ON
3. A modal appears asking for a token name
4. Enter: `socket_token`
5. Click **"Generate"**
6. **COPY THE TOKEN** (starts with `xapp-`) - you'll need this!
7. Click **"Done"**

📝 **Save this token:** `xapp-1-xxxxx...`

---

### 1.3 Add Bot Token Scopes

**Why?** Scopes define what your bot can do.

1. In left sidebar → **Features → OAuth & Permissions**
2. Scroll down to **"Scopes"** section
3. Under **"Bot Token Scopes"**, click **"Add an OAuth Scope"**
4. Add these 4 scopes:
   - `chat:write` - Post messages
   - `files:read` - Read uploaded files
   - `reactions:write` - Add emoji reactions
   - `users:read` - Get user info

✅ **You should see 4 scopes listed**

---

### 1.4 Subscribe to Events

**Why?** Events tell your bot when files are uploaded.

1. In left sidebar → **Features → Event Subscriptions**
2. Toggle **"Enable Events"** to ON
3. Scroll down to **"Subscribe to bot events"**
4. Click **"Add Bot User Event"**
5. Add these events:
   - `file_shared` - When a file is uploaded
   - `app_home_opened` - When user opens bot
   
6. Click **"Save Changes"** (bottom right)

⚠️ **Important:** You may see a warning about "Request URL" - ignore it for Socket Mode!

---

### 1.5 Install App to Workspace

1. In left sidebar → **Settings → Install App**
2. Click **"Install to Workspace"**
3. Review permissions
4. Click **"Allow"**
5. **COPY THE BOT TOKEN** (starts with `xoxb-`) - you'll need this!

📝 **Save this token:** `xoxb-xxxxx...`

---

### 1.6 Get Signing Secret

1. In left sidebar → **Settings → Basic Information**
2. Scroll to **"App Credentials"**
3. Click **"Show"** next to **Signing Secret**
4. **COPY THE SECRET**

📝 **Save this secret:** (32-character string)

---

## Part 2: Setup Project (3 minutes)

### 2.1 Install Dependencies

```bash
cd slack-cv-bot-demo
npm install
```

Expected output:
```
added 234 packages in 15s
```

---

### 2.2 Create .env File

```bash
cp .env.example .env
```

---

### 2.3 Add Your Tokens

Edit `.env` file and replace with your values:

```bash
# Replace these with YOUR values from Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token-from-step-1.5
SLACK_APP_TOKEN=xapp-your-app-token-from-step-1.2
SLACK_SIGNING_SECRET=your-secret-from-step-1.6

# Leave these as-is for demo
MOCK_API_ENABLED=true
MOCK_API_DELAY=2000
PORT=3000
```

**Token checklist:**
- [ ] SLACK_BOT_TOKEN starts with `xoxb-`
- [ ] SLACK_APP_TOKEN starts with `xapp-`
- [ ] SLACK_SIGNING_SECRET is 32 characters

---

## Part 3: Run & Test (2 minutes)

### 3.1 Start the Bot

```bash
npm start
```

**Expected output:**
```
⚡️ Slack CV Bot is running on port 3000!
📝 Socket Mode: Enabled
🧪 Mock API: Enabled
📝 File event listeners registered
```

✅ **If you see this, your bot is running!**

❌ **If you see errors:**
- Check tokens in .env
- Verify Socket Mode is enabled
- Make sure app is installed to workspace

---

### 3.2 Test in Slack

#### A) Invite Bot to Channel

1. Open Slack
2. Go to any channel (e.g., `#general` or create `#test-bot`)
3. Type: `/invite @CV Scorer Bot`
4. Press Enter

✅ **Bot should join the channel**

#### B) Drop a PDF File

1. Drag and drop ANY PDF file into the channel
2. Watch what happens! 🎉

**You should see:**
```
1. "🔄 Analyzing resume..." (appears immediately)
2. Beautiful score card appears after 2-3 seconds:
   - Overall Score: 85/100
   - ✅ Key Strengths
   - ⚠️ Areas for Improvement
   - 🎯 Skills Match
```

---

## 🎉 Success Criteria

✅ Bot responds to PDF uploads
✅ Shows loading message
✅ Displays score card with proper formatting
✅ Card shows score, strengths, weaknesses
✅ Reactions appear (eyes, checkmark)

---

## 🐛 Common Issues & Fixes

### Issue: Bot doesn't respond

**Fix:**
1. Check console for errors
2. Verify bot is in channel (`/invite @CV Scorer Bot`)
3. Make sure file is a PDF
4. Restart the bot (`Ctrl+C`, then `npm start`)

---

### Issue: "Invalid token" error

**Fix:**
1. Check `.env` file has correct tokens
2. Tokens should have no extra spaces
3. `SLACK_BOT_TOKEN` must start with `xoxb-`
4. `SLACK_APP_TOKEN` must start with `xapp-`

---

### Issue: "Socket connection failed"

**Fix:**
1. Go to Slack App settings
2. Settings → Socket Mode
3. Make sure it's ENABLED
4. Regenerate token if needed

---

### Issue: Bot sees file but doesn't process

**Fix:**
1. Check file is actually a PDF (not .docx or .txt)
2. Check file is under 10MB
3. Look at console logs for validation errors

---

## 📊 Testing Scenarios

### Test 1: Basic Functionality
- ✅ Drop a PDF
- ✅ See loading message
- ✅ See score card

### Test 2: Different Scores
- Try multiple PDFs
- Each should get different random scores (65-95)
- Different strengths/weaknesses each time

### Test 3: Invalid Files
- ✅ Drop a .docx file → Should be ignored
- ✅ Drop a .txt file → Should be ignored
- ✅ Drop a huge file (>10MB) → Should show error

### Test 4: Multiple Uploads
- Drop 3 PDFs quickly
- All should process correctly
- No conflicts or errors

---

## 🎬 Demo Tips

### For Live Demos:

1. **Prepare test PDFs:**
   - 3-4 sample resumes
   - Different quality levels
   - Real-looking names

2. **Clean channel:**
   - Use a dedicated `#demo` channel
   - Clear previous messages

3. **Talking points:**
   - "Watch how fast this is..." (drop file)
   - "Loading message shows we're working..."
   - "Beautiful score card in 3 seconds!"
   - "Shows actionable feedback..."

4. **Backup plan:**
   - Take screenshot of working example
   - Have video recording ready
   - Know how to restart quickly

---

## 🔄 Restarting the Bot

If something goes wrong:

```bash
# Stop the bot
Ctrl + C

# Clear console
clear

# Restart
npm start
```

---

## 📱 Next Steps

### After Successful Test:

1. **Show to stakeholders**
   - Works with mock data
   - Proves the concept

2. **Connect real API**
   - Set `MOCK_API_ENABLED=false`
   - Add real API endpoint
   - Test with production data

3. **Add features**
   - User mapping
   - Credit tracking
   - Analytics
   - Batch processing

---

## 💡 Pro Tips

1. **Use test workspace** - Don't test in production Slack
2. **Keep console open** - Logs show everything
3. **Test frequently** - Drop files often during development
4. **Restart often** - Code changes require restart
5. **Check Block Kit Builder** - Preview UI designs first

---

## 📞 Need Help?

### Check These First:
1. ✅ Tokens are correct in .env
2. ✅ Socket Mode is enabled
3. ✅ Bot is invited to channel
4. ✅ Console shows no errors

### Still Stuck?
- Re-read the README.md
- Check Slack API docs
- Google the error message
- Start over with fresh app

---

## 🎯 Success! What Now?

You now have a working Slack bot that:
- ✅ Detects PDF uploads
- ✅ Shows professional UI
- ✅ Returns mock scores
- ✅ Handles errors gracefully

**Ready for the next step?**
→ See README.md for connecting real API
→ See architecture docs for how it works

---

**Setup complete! Time to score some resumes! 🚀**
