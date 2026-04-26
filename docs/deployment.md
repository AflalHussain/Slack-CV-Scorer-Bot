# 🚀 Deployment Guide

This guide covers deploying the Slack CV Bot to production environments.

---

## Deployment Options Comparison

| Option | Cost | Difficulty | Scale | Best For |
|--------|------|-----------|-------|----------|
| **Railway** | $5-20/mo | ⭐ Easy | Good | Quick deploy |
| **Heroku** | $7-25/mo | ⭐ Easy | Good | Teams familiar with Heroku |
| **DigitalOcean** | $6-20/mo | ⭐⭐ Medium | Excellent | Full control |
| **AWS EC2** | $8-50/mo | ⭐⭐⭐ Hard | Excellent | Enterprise |
| **AWS Lambda** | $0-10/mo | ⭐⭐⭐ Hard | Unlimited | Serverless preference |

---

## Option 1: Railway (Recommended for Quick Start)

**Time: 10 minutes**

### Prerequisites
- GitHub account
- Railway account (free to start)

### Steps

#### 1. Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/slack-cv-bot.git
git push -u origin main
```

#### 2. Deploy on Railway
1. Go to https://railway.app/
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize GitHub and select your repo
5. Railway auto-detects Node.js

#### 3. Add Environment Variables
In Railway dashboard:
```
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
SLACK_SIGNING_SECRET=your-secret
MOCK_API_ENABLED=false
TEAMTHER_API_URL=https://api.teamther.ai/v1/score
TEAMTHER_API_KEY=your-api-key
```

#### 4. Deploy
Railway automatically deploys on push.

**Done! Bot is live.** ✅

---

## Option 2: Heroku

**Time: 15 minutes**

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

#### 1. Create Heroku App
```bash
heroku login
heroku create slack-cv-bot
```

#### 2. Add Buildpack
```bash
heroku buildpacks:set heroku/nodejs
```

#### 3. Set Environment Variables
```bash
heroku config:set SLACK_BOT_TOKEN=xoxb-your-token
heroku config:set SLACK_APP_TOKEN=xapp-your-token
heroku config:set SLACK_SIGNING_SECRET=your-secret
heroku config:set MOCK_API_ENABLED=false
```

#### 4. Create Procfile
```bash
echo "worker: node app.js" > Procfile
```

#### 5. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 6. Scale Worker
```bash
heroku ps:scale worker=1
```

**Done! Bot is live.** ✅

---

## Option 3: DigitalOcean Droplet

**Time: 30 minutes**

### Prerequisites
- DigitalOcean account
- Basic Linux knowledge

### Steps

#### 1. Create Droplet
1. Go to DigitalOcean dashboard
2. Create Droplet:
   - **OS:** Ubuntu 22.04 LTS
   - **Size:** Basic $6/month (1GB RAM)
   - **Region:** Nearest to you
3. Add SSH key
4. Create

#### 2. SSH into Server
```bash
ssh root@your-droplet-ip
```

#### 3. Install Node.js
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify
node --version  # Should show v18.x
npm --version
```

#### 4. Install PM2 (Process Manager)
```bash
npm install -g pm2
```

#### 5. Clone Your Code
```bash
# Install git if needed
apt install -y git

# Clone repo
cd /opt
git clone https://github.com/yourusername/slack-cv-bot.git
cd slack-cv-bot

# Install dependencies
npm install --production
```

#### 6. Create .env File
```bash
nano .env
```

Paste your environment variables:
```bash
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_APP_TOKEN=xapp-your-token
SLACK_SIGNING_SECRET=your-secret
MOCK_API_ENABLED=false
TEAMTHER_API_URL=https://api.teamther.ai/v1/score
TEAMTHER_API_KEY=your-api-key
PORT=3000
```

Save: `Ctrl+X`, then `Y`, then `Enter`

#### 7. Start with PM2
```bash
pm2 start app.js --name slack-cv-bot
pm2 save
pm2 startup
```

#### 8. Setup Auto-Restart on Reboot
```bash
# PM2 will show a command like this - run it:
# sudo env PATH=$PATH:/usr/bin...
```

#### 9. Monitor
```bash
pm2 logs slack-cv-bot  # View logs
pm2 status             # Check status
pm2 restart slack-cv-bot  # Restart if needed
```

**Done! Bot is live.** ✅

### Updating Code
```bash
cd /opt/slack-cv-bot
git pull
npm install
pm2 restart slack-cv-bot
```

---

## Option 4: AWS Lambda (Serverless)

**Time: 1 hour** (Complex but powerful)

### Why Lambda?
- Pay only for actual usage
- Auto-scales infinitely
- No server management
- ~$0 for development usage

### High-Level Steps

1. **Convert to Lambda handler**
   - Wrap Bolt app in Lambda-compatible format
   - Use `@slack/bolt` Lambda adapter

2. **Package deployment**
   ```bash
   npm install
   zip -r function.zip .
   ```

3. **Create Lambda function**
   - Runtime: Node.js 18.x
   - Upload function.zip
   - Set environment variables
   - Configure timeout: 30 seconds
   - Memory: 512 MB

4. **Setup API Gateway**
   - Create HTTP API
   - Point to Lambda
   - Get URL for Slack

5. **Update Slack App**
   - Disable Socket Mode
   - Add Request URL (API Gateway URL)
   - Re-verify endpoints

**Note:** Socket Mode doesn't work with Lambda. Must use HTTP mode.

---

## Option 5: Docker + Any Cloud

**Time: 45 minutes**

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "app.js"]
```

### Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

### Build and Run Locally
```bash
# Build image
docker build -t slack-cv-bot .

# Run with env file
docker run --env-file .env slack-cv-bot
```

### Deploy to Cloud

**Docker Hub + Any Cloud:**
```bash
# Push to Docker Hub
docker tag slack-cv-bot yourusername/slack-cv-bot
docker push yourusername/slack-cv-bot

# Pull and run on server
docker pull yourusername/slack-cv-bot
docker run -d --restart always --env-file .env yourusername/slack-cv-bot
```

---

## Post-Deployment Checklist

### ✅ Immediate Testing
- [ ] Bot responds to file uploads
- [ ] Loading messages appear
- [ ] Score cards display correctly
- [ ] Error handling works
- [ ] Reactions are added

### ✅ Configuration
- [ ] All environment variables set
- [ ] API keys are valid
- [ ] Mock API disabled (if using real API)
- [ ] Correct API endpoint URL

### ✅ Monitoring Setup
- [ ] Error logging configured
- [ ] Uptime monitoring enabled
- [ ] Alert notifications set up
- [ ] Resource usage tracking

### ✅ Security
- [ ] Environment variables not in code
- [ ] Tokens rotated from development
- [ ] Access logs enabled
- [ ] HTTPS enforced (if applicable)

### ✅ Performance
- [ ] Response time < 5 seconds
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] CPU usage reasonable

---

## Monitoring & Logging

### PM2 Monitoring (DigitalOcean)
```bash
pm2 monit              # Real-time monitoring
pm2 logs               # View all logs
pm2 logs --err         # Error logs only
pm2 flush              # Clear logs
```

### Log Rotation (DigitalOcean)
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Railway Monitoring
Built-in dashboard shows:
- CPU usage
- Memory usage
- Network traffic
- Logs (real-time)

### Heroku Monitoring
```bash
heroku logs --tail              # Live logs
heroku ps                       # Process status
heroku restart                  # Restart app
```

---

## Scaling Strategies

### Vertical Scaling (More Power)
```
Basic Server     → Better Server
1GB RAM, 1 CPU   → 4GB RAM, 2 CPU
$6/month         → $20/month
~100 resumes/hr  → ~500 resumes/hr
```

### Horizontal Scaling (More Instances)
```
Single Instance → Load Balanced
1 server        → 3 servers
$6/month        → $18/month
~100 resumes/hr → ~300 resumes/hr
```

Socket Mode automatically distributes across instances.

### Database Optimization
Add PostgreSQL for:
- User mapping cache
- Results history
- Analytics data
- Credit tracking

### CDN for Assets
If adding web dashboard:
- Cloudflare for static assets
- Edge caching for API responses
- DDoS protection

---

## Backup & Disaster Recovery

### Code Backup
```bash
# GitHub is primary backup
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

### Database Backup (If using DB)
```bash
# Daily automated backups
pg_dump dbname > backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://backups/
```

### Environment Variables Backup
Store securely:
- 1Password / LastPass
- AWS Secrets Manager
- HashiCorp Vault

---

## Updating Production

### Zero-Downtime Deploy (PM2)
```bash
# On server
cd /opt/slack-cv-bot
git pull
npm install
pm2 reload slack-cv-bot  # Graceful reload
```

### Railway Auto-Deploy
- Push to GitHub main branch
- Railway auto-deploys
- Zero downtime

### Heroku Deploy
```bash
git push heroku main
# Automatic zero-downtime deploy
```

---

## Troubleshooting Production Issues

### Bot Not Responding
```bash
# Check if running
pm2 status

# Check logs
pm2 logs slack-cv-bot --lines 100

# Restart
pm2 restart slack-cv-bot
```

### High Memory Usage
```bash
# Check memory
pm2 status
free -h

# Restart to clear
pm2 restart slack-cv-bot
```

### API Timeout Errors
```bash
# Check API health
curl -X GET https://api.teamther.ai/health

# Increase timeout in code
timeout: 60000  // 60 seconds
```

### Socket Mode Disconnects
```bash
# Check logs for disconnect reason
pm2 logs --lines 200 | grep -i "disconnect"

# Usually auto-reconnects
# If not, restart
pm2 restart slack-cv-bot
```

---

## Security Best Practices

### 1. Environment Variables
- Never commit .env
- Use secrets manager in production
- Rotate tokens quarterly

### 2. Access Control
```bash
# Limit SSH access
ufw allow 22/tcp
ufw enable

# Use SSH keys only
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
```

### 3. Keep Updated
```bash
# Update system
apt update && apt upgrade

# Update dependencies
npm audit
npm audit fix
```

### 4. Rate Limiting
Add to code:
```javascript
const rateLimiter = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Remove old requests (> 1 hour)
  const recentRequests = userRequests.filter(
    time => now - time < 3600000
  );
  
  if (recentRequests.length >= 100) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

---

## Cost Optimization

### Development
- Use mock API (free)
- Single small instance ($5-6/mo)
- Free tier services where possible

### Production (1000 resumes/day)
```
Server:           $20/month (DigitalOcean 4GB)
API calls:        $150/month ($0.15/resume × 1000)
Monitoring:       $0 (free tier)
Logging:          $0 (free tier)
────────────────────────────────────────
Total:            $170/month
Per resume:       $0.17
```

### Optimization Tips
- Cache common results
- Batch API calls
- Use CDN for static content
- Optimize file transfers
- Monitor and alert on spikes

---

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs every few hours
   - Verify all features work
   - Test error scenarios

2. **Soft launch**
   - Start with one team
   - Gather feedback
   - Fix issues

3. **Full rollout**
   - Announce to company
   - Create documentation
   - Train power users

4. **Iterate**
   - Collect usage data
   - Identify pain points
   - Add requested features

---

## Support & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Verify API health

### Weekly
- Review usage metrics
- Update dependencies
- Check disk space

### Monthly
- Rotate secrets
- Review costs
- Plan improvements

### Quarterly
- Security audit
- Performance review
- User feedback session

---

## Emergency Contacts

### If Bot Goes Down
1. Check server status
2. Check Slack API status
3. Check logs for errors
4. Restart service
5. Escalate if needed

### Escalation Path
1. Check logs (5 min)
2. Restart service (5 min)
3. Check external dependencies (5 min)
4. Roll back recent changes (10 min)
5. Contact Teamther API support
6. Post incident report

---

**You're now ready to deploy! 🚀**

Choose your deployment option and follow the steps carefully.

Remember: Start small, test thoroughly, scale gradually.
