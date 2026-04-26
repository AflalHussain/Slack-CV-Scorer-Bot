# 📖 Quick Reference Card

## Essential Commands

### Development
```bash
npm install          # Install dependencies
npm start           # Run bot
Ctrl+C              # Stop bot
```

### Logs
```bash
# Local development - check console

# Production (PM2)
pm2 logs slack-cv-bot
pm2 restart slack-cv-bot
pm2 status
```

## File Structure
```
slack-cv-bot-demo/
├── app.js                    # Main entry
├── src/
│   ├── listeners/            # Event handlers
│   ├── services/             # API calls
│   ├── ui/                   # UI templates
│   └── utils/                # Helpers
└── .env                      # Your secrets
```

## Environment Variables
```bash
SLACK_BOT_TOKEN=xoxb-...      # From OAuth & Permissions
SLACK_APP_TOKEN=xapp-...      # From Socket Mode
SLACK_SIGNING_SECRET=...      # From Basic Info
MOCK_API_ENABLED=true         # Use mock for testing
```

## Key Endpoints

### Slack App Settings
- https://api.slack.com/apps
- Your App → Settings

### Important Pages
- **OAuth & Permissions** → Get bot token
- **Socket Mode** → Get app token
- **Event Subscriptions** → Add events
- **Install App** → Install to workspace

## Testing Checklist
- [ ] Bot invited to channel: `/invite @CV Scorer Bot`
- [ ] Drop PDF file
- [ ] See loading message
- [ ] See score card (2-3 seconds)
- [ ] Verify UI looks good

## Common Issues

| Problem | Solution |
|---------|----------|
| Bot doesn't respond | Check bot is in channel, verify tokens |
| "Invalid token" | Check .env file, no spaces in tokens |
| Socket error | Enable Socket Mode in Slack settings |
| File ignored | Only PDFs are processed, check file type |

## Score Card Format
```
┌─────────────────────────────┐
│ 📄 Resume Analysis Complete │
├─────────────────────────────┤
│ File: resume.pdf            │
│ Overall Score: 85/100       │
├─────────────────────────────┤
│ ✅ Key Strengths            │
│ 1. Strong technical skills  │
│ 2. Relevant experience      │
│ 3. Good communication       │
├─────────────────────────────┤
│ ⚠️  Areas for Improvement   │
│ 1. Limited cloud experience │
│ 2. No agile methodology     │
├─────────────────────────────┤
│ 🎯 Skills Match: 87%        │
├─────────────────────────────┤
│ [View Report] [Download]    │
└─────────────────────────────┘
```

## API Response Format
```json
{
  "score": 85,
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "..."],
  "skills_match": 0.87,
  "report_id": "rpt_123"
}
```

## Useful Links
- [Slack Bolt Docs](https://slack.dev/bolt-js/)
- [Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Slack API](https://api.slack.com/)

## Deployment Quick Commands

### Railway
```bash
git push origin main  # Auto-deploys
```

### Heroku
```bash
git push heroku main
heroku logs --tail
```

### DigitalOcean (PM2)
```bash
pm2 start app.js
pm2 save
pm2 startup
```

## Emergency Commands
```bash
# Restart everything
pm2 restart slack-cv-bot

# Clear logs
pm2 flush

# Check what's wrong
pm2 logs slack-cv-bot --err

# Nuclear option
pm2 delete slack-cv-bot
pm2 start app.js --name slack-cv-bot
```

## Mock API Settings
```bash
MOCK_API_ENABLED=true    # Use mock
MOCK_API_DELAY=2000      # 2 second delay
```

## Real API Settings
```bash
MOCK_API_ENABLED=false
TEAMTHER_API_URL=https://api.teamther.ai/v1/score
TEAMTHER_API_KEY=your-key
```

## Performance Targets
- Response time: < 5 seconds
- Success rate: > 99%
- Memory usage: < 200MB
- CPU usage: < 10%

## When Things Break

1. **Check logs first** - 90% of issues show here
2. **Restart the service** - Fixes most issues
3. **Verify environment variables** - Common mistake
4. **Test with mock API** - Isolate the problem
5. **Check Slack API status** - Sometimes it's them

## Success Metrics
- Files processed per hour
- Average response time
- Error rate
- User satisfaction

## Remember
- ✅ Always test in dev first
- ✅ Keep backups of .env
- ✅ Monitor logs regularly
- ✅ Update dependencies monthly
- ✅ Rotate secrets quarterly

---

**Keep this card handy! 📌**
