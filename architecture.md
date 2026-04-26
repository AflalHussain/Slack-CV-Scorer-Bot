# 🏗️ Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          SLACK CLIENT                            │
│                    (User Interface Layer)                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 1. User drops PDF
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SLACK EVENT API                             │
│                   (WebSocket Connection)                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 2. file_shared event
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SLACK BOLT APP (Node.js)                      │
│                     Our Application Layer                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  EVENT LISTENER                                            │ │
│  │  - Receives file_shared event                             │ │
│  │  - Validates file (PDF, size, etc.)                       │ │
│  │  - Posts loading message                                  │ │
│  └───────┬────────────────────────────────────────────────────┘ │
│          │                                                        │
│          │ 3. Download file                                      │
│          ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SLACK SERVICE                                             │ │
│  │  - Downloads PDF from Slack CDN                           │ │
│  │  - Manages Slack API calls                               │ │
│  └───────┬────────────────────────────────────────────────────┘ │
│          │                                                        │
│          │ 4. Send to API (binary data)                         │
│          ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API SERVICE                                               │ │
│  │  - Routes to mock or real API                            │ │
│  │  - Handles retries and timeouts                          │ │
│  └───────┬────────────────────────────────────────────────────┘ │
│          │                                                        │
└──────────┼────────────────────────────────────────────────────────┘
           │
           │ 5. HTTP POST
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              TEAMTHER API / MOCK API                             │
│                  (Scoring Service)                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Receives PDF binary                                     │ │
│  │  - Performs ML analysis                                    │ │
│  │  - Returns JSON score                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 6. Return JSON
                 │ {score, strengths, weaknesses, ...}
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SLACK BOLT APP (Node.js)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  BLOCK KIT UI BUILDER                                      │ │
│  │  - Receives score data                                     │ │
│  │  - Builds beautiful card                                   │ │
│  │  - Formats with colors, emojis                            │ │
│  └───────┬────────────────────────────────────────────────────┘ │
│          │                                                        │
│          │ 7. Update message                                     │
│          ▼                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SLACK SERVICE                                             │ │
│  │  - Updates loading message                                │ │
│  │  - Posts final card                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ 8. Display result
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SLACK CLIENT                            │
│                   (Shows beautiful card)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Slack Event API (External)
**What:** Slack's WebSocket-based event delivery system
**Purpose:** Sends real-time events to our app
**Connection:** Socket Mode (no public URL needed)
**Events we subscribe to:**
- `file_shared` - File uploaded
- `app_home_opened` - User visits bot
- `file_change` - File edited (optional)
- `file_deleted` - File removed (optional)

---

### 2. Event Listener (`src/listeners/file-events.js`)
**What:** Entry point for all file-related events
**Responsibilities:**
- Receive `file_shared` events
- Validate file type and size
- Orchestrate processing flow
- Handle errors gracefully

**Flow:**
```javascript
file_shared event → 
  validate file → 
    post loading message → 
      download file → 
        call API → 
          build UI → 
            update message
```

**Error handling:**
- Invalid file type → Silent ignore or warning
- Download failure → Show error card
- API timeout → Show error with retry option
- Any exception → Log and show generic error

---

### 3. Slack Service (`src/services/slack-service.js`)
**What:** Abstraction layer for Slack API calls
**Responsibilities:**
- Download files from Slack CDN
- Post/update messages
- Add reactions
- Get user info

**Key methods:**
```javascript
downloadFile(url, token)      // Get PDF binary
getFileInfo(client, fileId)   // Get file metadata
postMessage(client, channel, content)  // Send message
updateMessage(client, channel, ts, content)  // Edit message
addReaction(client, channel, ts, emoji)  // Add emoji
```

**Why separate service?**
- Reusable across features
- Easier to mock for testing
- Centralized error handling
- Single place to add retries/logging

---

### 4. API Service (`src/services/api-service.js`)
**What:** Handles communication with scoring API
**Responsibilities:**
- Route to mock or real API
- Format requests correctly
- Parse responses
- Handle API errors

**Configuration:**
```javascript
if (MOCK_API_ENABLED === 'true') {
  return mockScoreResume(file, userId);
} else {
  return realAPI(file, userId);
}
```

**Real API format:**
```
POST https://api.teamther.ai/v1/score
Headers:
  Authorization: Bearer {key}
  Content-Type: application/pdf
  X-User-ID: {slack_user_id}
Body: <binary PDF data>
```

---

### 5. Mock API Service (`src/services/mock-api.js`)
**What:** Simulates real API for testing/demos
**Responsibilities:**
- Generate realistic scores (65-95)
- Randomize strengths/weaknesses
- Simulate processing delay
- Return proper JSON format

**Mock response structure:**
```json
{
  "score": 85,
  "strengths": [
    "Strong technical background with 5+ years",
    "Excellent communication skills",
    "Relevant certifications"
  ],
  "weaknesses": [
    "Limited cloud experience",
    "No agile methodology"
  ],
  "skills_match": 0.87,
  "report_id": "mock_1234567890_abc",
  "metadata": {
    "total_experience_years": 5,
    "education_level": "Master"
  }
}
```

**Why mock?**
- Demo without real API
- Faster development
- Predictable testing
- No API costs during dev

---

### 6. Block Kit UI Builder (`src/ui/blocks.js`)
**What:** Creates Slack message layouts
**Responsibilities:**
- Build loading messages
- Create score cards
- Format error messages
- Apply colors and emojis

**Block Kit structure:**
```javascript
[
  { type: "header", text: "Resume Analysis" },
  { type: "section", text: "Score: 85/100" },
  { type: "divider" },
  { type: "section", text: "✅ Strengths..." },
  { type: "section", text: "⚠️ Weaknesses..." },
  { type: "actions", elements: [buttons] },
  { type: "context", elements: [footer] }
]
```

**Design principles:**
- Color-coded by score (green/orange/red)
- Emoji for quick scanning
- Hierarchical information
- Action buttons for next steps
- Context footer with metadata

---

### 7. Validators (`src/utils/validators.js`)
**What:** Input validation utilities
**Checks:**
- File type (must be PDF)
- File size (< 10MB)
- File metadata exists

**Why validate?**
- Prevent processing errors
- Save API costs
- Better user experience
- Security (don't process malicious files)

---

### 8. Logger (`src/utils/logger.js`)
**What:** Colored console logging
**Levels:**
- `info` - General information (cyan)
- `success` - Successful operations (green)
- `warn` - Warnings (yellow)
- `error` - Errors (red)
- `debug` - Debugging info (magenta)

**Example output:**
```
[INFO] 📄 Processing resume: john_doe.pdf
[SUCCESS] File downloaded successfully (145678 bytes)
[INFO] 🧪 Mock API: Processing resume for user U123
[SUCCESS] ✅ Resume processed successfully in 2347ms
[INFO] 📊 Score: 85/100
```

---

## Data Flow Diagram

### Successful Processing Flow

```
Time  | Component          | Action
------|-------------------|------------------------------------------
T=0s  | User              | Drops resume.pdf in #hiring
T=0.1s| Slack Event API   | Fires file_shared webhook
T=0.2s| Event Listener    | Validates file (PDF, <10MB)
T=0.3s| Event Listener    | Posts "🔄 Analyzing..."
T=0.4s| Slack Service     | Downloads file from Slack CDN
T=0.6s| API Service       | Sends PDF to scoring API
T=2.5s| API               | Returns score JSON
T=2.6s| Block Kit Builder | Constructs UI card
T=2.7s| Slack Service     | Updates message with card
T=2.8s| User              | Sees result! ✅
```

**Total time: ~2.8 seconds**

### Error Flow

```
Time  | Component       | Action
------|----------------|-------------------------------------------
T=0s  | User           | Drops document.docx
T=0.1s| Event Listener | Receives event
T=0.2s| Validator      | Checks file type → NOT PDF
T=0.2s| Event Listener | Returns early (ignore)
```

**Total time: ~0.2 seconds, no API call made**

---

## Technology Stack

### Core Framework
- **Slack Bolt SDK** (v3.17.1)
  - Official Slack framework
  - Handles all webhook/event plumbing
  - Built-in error handling
  - Socket Mode support

### Runtime
- **Node.js** (v18+)
  - Async/await support
  - Fast startup time
  - Excellent npm ecosystem

### Dependencies
```json
{
  "@slack/bolt": "^3.17.1",  // Slack SDK
  "axios": "^1.6.5",         // HTTP client
  "dotenv": "^16.4.1"        // Environment variables
}
```

### Development Tools
```json
{
  "nodemon": "^3.0.3"  // Auto-restart on changes
}
```

---

## Security Architecture

### Token Management
```
SLACK_BOT_TOKEN (xoxb-*)
├─ Stored in .env (not committed)
├─ Used for Slack API calls
└─ Scoped to: chat:write, files:read, reactions:write, users:read

SLACK_APP_TOKEN (xapp-*)
├─ Stored in .env
├─ Used for Socket Mode connection
└─ Regeneratable in Slack settings

SLACK_SIGNING_SECRET
├─ Stored in .env
├─ Validates webhook authenticity
└─ Prevents replay attacks
```

### Request Validation
1. **Signature verification** - All webhooks verified
2. **File validation** - Type, size, metadata
3. **Channel restrictions** - Optional whitelist
4. **Rate limiting** - Prevent abuse

### Data Handling
- PDFs downloaded over HTTPS
- Files not persisted to disk
- Binary data in memory only
- No logging of file contents
- Slack handles data at rest

---

## Performance Characteristics

### Timing Breakdown
```
File upload detected:     0.1s
File validation:          0.1s
Loading message posted:   0.2s
File download:            0.3s
API call (mock):          2.0s
UI construction:          0.1s
Message update:           0.1s
────────────────────────────────
Total:                    2.9s
```

### Bottlenecks
1. **API processing** (2s) - Largest component
2. **File download** (0.3s) - Depends on file size
3. **Network latency** (0.2s) - Slack API calls

### Optimization Opportunities
- Parallel API calls for batch processing
- Caching for repeated files
- Compression for file transfer
- CDN for faster downloads

---

## Scalability Considerations

### Current Capacity (Single Instance)
- **Concurrent requests:** ~10-20
- **Throughput:** ~100 resumes/hour
- **Memory usage:** ~50MB base + 10MB per file
- **CPU usage:** <5% during processing

### Horizontal Scaling
```
Load Balancer
├─ Instance 1
├─ Instance 2
├─ Instance 3
└─ Instance N
```

Each instance handles own Socket Mode connection.
Slack distributes events across connections.

### Vertical Scaling
- Increase memory for larger files
- More CPU for parallel processing
- SSD for temporary file caching

### Database (Future)
```
PostgreSQL
├─ users (Slack ID → Teamther ID)
├─ files (processed files history)
├─ scores (results cache)
└─ credits (usage tracking)
```

---

## Deployment Architecture

### Development (Current)
```
Local Machine
├─ Node.js process
├─ Socket Mode connection
└─ Console logs
```

### Staging
```
Cloud VM (DigitalOcean/AWS)
├─ PM2 process manager
├─ Socket Mode connection
├─ Log aggregation (Winston → CloudWatch)
└─ Health checks
```

### Production
```
Container (Docker)
├─ Multiple replicas (K8s/ECS)
├─ Socket Mode per replica
├─ Centralized logging (ELK stack)
├─ Metrics (Prometheus)
├─ Alerts (PagerDuty)
└─ Auto-scaling
```

---

## Error Handling Strategy

### Levels of Error Handling

**1. Input Validation (Preventive)**
```javascript
if (!isPDF(file)) return;  // Silent ignore
if (fileTooLarge) showError("File must be < 10MB");
```

**2. Network Errors (Retryable)**
```javascript
try {
  await downloadFile();
} catch (err) {
  retry(3 times, exponential backoff);
}
```

**3. API Errors (User-facing)**
```javascript
try {
  await scoreAPI();
} catch (err) {
  showError("Scoring failed. Please try again.");
}
```

**4. System Errors (Alert)**
```javascript
try {
  await processResume();
} catch (err) {
  logger.error(err);
  alertOps();
}
```

### Error Recovery
- Automatic retries for transient failures
- Graceful degradation (show partial results)
- User feedback for actionable errors
- Ops alerts for systemic issues

---

## Testing Strategy

### Unit Tests (Future)
```javascript
describe('validators', () => {
  test('isPDF returns true for PDFs', () => {
    expect(isPDF({mimetype: 'application/pdf'})).toBe(true);
  });
});
```

### Integration Tests
```javascript
describe('API Service', () => {
  test('mock API returns valid score', async () => {
    const result = await mockScoreResume(buffer, userId);
    expect(result.score).toBeGreaterThan(0);
  });
});
```

### E2E Tests
1. Drop test PDF in Slack
2. Verify loading message appears
3. Verify result card appears
4. Verify score is valid
5. Verify UI is formatted correctly

---

## Monitoring & Observability

### Metrics to Track
- **Throughput:** Files processed per hour
- **Latency:** Time from upload to result
- **Error rate:** % of failed processing
- **API health:** Success rate of API calls
- **User engagement:** Active users per day

### Logging
```
[INFO] Resume processing started
[DEBUG] File downloaded: 145KB
[INFO] API call initiated
[SUCCESS] Score received: 85/100
[INFO] Message updated successfully
[SUCCESS] Total time: 2.3s
```

### Alerts
- API error rate > 5%
- Average latency > 10s
- Bot disconnected > 1 minute
- Out of memory
- Disk space < 10%

---

## Future Enhancements

### Phase 2
- [ ] User authentication/mapping
- [ ] Credit tracking system
- [ ] Usage analytics dashboard
- [ ] Batch processing (multiple files)

### Phase 3
- [ ] ATS integrations (Greenhouse, Lever)
- [ ] Custom scoring models per company
- [ ] A/B testing for UI improvements
- [ ] Multi-language support

### Phase 4
- [ ] Slack workflow builder blocks
- [ ] Mobile app notifications
- [ ] Email integration
- [ ] Video resume analysis

---

## Cost Analysis

### Infrastructure (Development)
- **Server:** $0 (local)
- **Slack:** $0 (free workspace)
- **API:** $0 (mock)
**Total: $0/month**

### Infrastructure (Production - 1000 resumes/day)
- **Server:** $20/month (DigitalOcean)
- **Slack:** Included in company plan
- **API calls:** $150/month ($0.15/resume)
- **Logs/Monitoring:** $10/month
**Total: $180/month**

### ROI Calculation
```
Recruiter time saved: 5 min/resume
At 1000 resumes/month: 5000 minutes saved
At $50/hr recruiter rate: $4,167 saved
ROI: 2211% ($4,167 / $180)
Break-even: ~1 hour
```

---

## References

- [Slack Bolt SDK Docs](https://slack.dev/bolt-js/)
- [Slack Block Kit Builder](https://app.slack.com/block-kit-builder/)
- [Socket Mode Guide](https://api.slack.com/apis/connections/socket)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Architecture reviewed and approved for V1 demo** ✅
