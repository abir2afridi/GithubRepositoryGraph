━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SECTION — SECURITY ISSUES SCANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a "🔐 Security Issues" section to the LEFT SIDEBAR.
This feature scans ALL files in the loaded repo/folder
for exposed secrets, credentials, and sensitive data.
Runs entirely in the browser — no data sent to any server.
Runs inside a Web Worker alongside the dependency parser.

──────────────────────────────
 WHAT TO DETECT
──────────────────────────────

Scan every file's content using regex patterns for:

API KEYS & TOKENS:
  OpenAI API Key:
    /sk-[a-zA-Z0-9]{32,}/g
  
  OpenRouter API Key:
    /sk-or-[a-zA-Z0-9\-]{20,}/g
  
  Google API Key:
    /AIza[0-9A-Za-z\-_]{35}/g
  
  Google OAuth Client Secret:
    /[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com/g
  
  GitHub Personal Access Token:
    /gh[pousr]_[A-Za-z0-9_]{36,}/g
  
  GitHub OAuth Token:
    /gho_[A-Za-z0-9_]{36}/g
  
  Anthropic / Claude API Key:
    /sk-ant-[a-zA-Z0-9\-]{90,}/g
  
  Stripe Secret Key:
    /sk_live_[0-9a-zA-Z]{24}/g
  
  Stripe Publishable Key (warn, not critical):
    /pk_live_[0-9a-zA-Z]{24}/g
  
  AWS Access Key ID:
    /AKIA[0-9A-Z]{16}/g
  
  AWS Secret Access Key:
    /[0-9a-zA-Z\/+]{40}/g  (contextual — near "aws_secret")
  
  Firebase Config Key:
    /AIza[0-9A-Za-z\-_]{35}/g
  
  Supabase Service Role Key:
    /eyJ[a-zA-Z0-9\-_]{100,}/g  (JWT format, long)
  
  Supabase Anon Key:
    /eyJ[a-zA-Z0-9\-_]{50,}/g
  
  JWT Tokens (generic):
    /eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g
  
  Twilio API Key:
    /SK[0-9a-fA-F]{32}/g
  
  Sendgrid API Key:
    /SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}/g
  
  Mailgun API Key:
    /key-[0-9a-zA-Z]{32}/g
  
  HuggingFace Token:
    /hf_[a-zA-Z0-9]{34}/g
  
  Replicate API Token:
    /r8_[a-zA-Z0-9]{36}/g
  
  Mapbox Token:
    /pk\.eyJ1[a-zA-Z0-9\-_\.]+/g
  
  Slack Bot Token:
    /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g
  
  Slack Webhook URL:
    /https:\/\/hooks\.slack\.com\/services\/[^\s"']+/g
  
  Discord Bot Token:
    /[MN][a-zA-Z0-9]{23}\.[a-zA-Z0-9\-_]{6}\.[a-zA-Z0-9\-_]{27}/g
  
  Discord Webhook:
    /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[^\s"']+/g

PASSWORDS & CREDENTIALS:
  Hardcoded password patterns:
    /password\s*[:=]\s*['"][^'"]{6,}['"]/gi
    /passwd\s*[:=]\s*['"][^'"]{6,}['"]/gi
    /pwd\s*[:=]\s*['"][^'"]{6,}['"]/gi
    /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi
    /api_key\s*[:=]\s*['"][^'"]{8,}['"]/gi
    /auth_token\s*[:=]\s*['"][^'"]{8,}['"]/gi
    /access_token\s*[:=]\s*['"][^'"]{8,}['"]/gi
    /private_key\s*[:=]\s*['"][^'"]{8,}['"]/gi

DATABASE CONNECTION STRINGS:
  MongoDB URI:
    /mongodb(\+srv)?:\/\/[^\s"'<>]+/g
  
  PostgreSQL / MySQL URL:
    /postgres(ql)?:\/\/[^\s"'<>]+/g
    /mysql:\/\/[^\s"'<>]+/g
  
  Redis URL:
    /redis:\/\/[^\s"'<>]+/g
  
  Generic DB with credentials:
    /[a-zA-Z]+:\/\/\w+:[^@\s]+@[^\s"']+/g

PRIVATE KEYS & CERTIFICATES:
  RSA Private Key:
    /-----BEGIN RSA PRIVATE KEY-----/g
  
  Private Key (generic):
    /-----BEGIN PRIVATE KEY-----/g
  
  PEM Certificate:
    /-----BEGIN CERTIFICATE-----/g
  
  SSH Private Key:
    /-----BEGIN OPENSSH PRIVATE KEY-----/g

EMAIL CREDENTIALS:
  Email + password in same context:
    /email\s*[:=]\s*['"][^'"]+@[^'"]+['"]/gi
    (flag if nearby lines also contain password pattern)

SENSITIVE FILES (flag entire file, not just line):
  .env files containing real values (not just KEY=)
  id_rsa, id_ed25519 (private key files)
  _.pem,_.key, _.p12,_.pfx files
  credentials.json (Google service account)
  serviceAccountKey.json (Firebase)
  secrets.yaml / secrets.json

SKIP / IGNORE (reduce false positives):
  Lines starting with # (comments in some languages)
  Lines inside code blocks in .md files that show
    EXAMPLE values like: YOUR_API_KEY, xxxx, ****,
    <your-key>, [API_KEY], PASTE_HERE
  Values that are clearly placeholders (all same chars,
    very short, or match common example patterns)
  Files inside node_modules/, vendor/, .git/ folders
  Test files (*_test.go, *.test.js) with obvious
    fake/mock credentials

──────────────────────────────
 SEVERITY LEVELS
──────────────────────────────

  🔴 CRITICAL — immediate action required:
    Live API keys (OpenAI, AWS, Stripe live, etc.)
    Database connection strings with credentials
    Private keys / certificates
    OAuth client secrets

  🟠 HIGH — action required soon:
    JWT tokens (long-lived)
    Hardcoded passwords
    Supabase service role keys
    GitHub personal access tokens

  🟡 MEDIUM — review recommended:
    Supabase anon keys (public but still)
    Slack/Discord webhooks
    Email addresses in code
    Stripe publishable keys

  🟢 INFO — awareness only:
    Example/test credentials that look real
    Comments mentioning sensitive info

──────────────────────────────
 SIDEBAR SECURITY PANEL
──────────────────────────────

Section title: "🔐 Security Issues"
Shows total count badge: "🔴 3  🟠 1  🟡 2"

If no issues found:
  ✅ "No security issues detected"
  Small note: "Always use .env files for sensitive data"

If issues found, group by severity then file:

  🔴 CRITICAL (2)
  ├── src/config.ts          [1 issue]
  │     → OpenAI API Key exposed
  └── .env.local             [1 issue — FILE WARNING]
        → .env file committed to repo

  🟠 HIGH (1)
  └── src/api/client.ts      [1 issue]
        → Hardcoded password detected

  🟡 MEDIUM (2)
  └── README.md              [2 issues]
        → Discord webhook URL exposed
        → Supabase anon key exposed

Each file row is clickable.

──────────────────────────────
 FILE CLICK → CODE VIEW
──────────────────────────────

Clicking a file in security panel:

  1. Opens file in code view panel (right side)
  2. ALL sensitive lines highlighted in RED:
       - Red background on the entire line
       - Red left border (thick, 4px)
       - Red gutter dot icon: 🔴
  3. Each red line has a hover tooltip:
       ┌─────────────────────────────────────────────┐
       │ 🔴 CRITICAL: OpenAI API Key Detected        │
       │                                             │
       │ Secret type: OpenAI API Key                 │
       │ Pattern matched: sk-[...]{32,}              │
       │ Risk: Anyone with this key can use your     │
       │ OpenAI account and incur charges.           │
       │                                             │
       │ [🤖 Get AI Fix Prompt]                      │
       │ [📖 Manual Fix Guide]                       │
       └─────────────────────────────────────────────┘
  4. Top of code view shows a red warning banner:
       "⚠️ X security issues found in this file.
        Scroll down or click the red lines to see them."
  5. Navigation arrows cycle through security lines:
       [← prev issue]  Issue 1 of 3  [next issue →]

──────────────────────────────
 TWO TABS PER ISSUE
──────────────────────────────

When user clicks [Get AI Fix Prompt] or [Manual Fix Guide]:
Opens a modal/panel with two tabs:

TAB 1: 🤖 AI Fix Prompt
  (pre-written prompt, one-click copy button)
  User copies this and pastes into Cursor/Copilot/etc.

TAB 2: 📖 Manual Fix Guide
  Step-by-step instructions written in plain English
  Technical but beginner-friendly

Both tabs are described in full detail below in
PART 2 and PART 3 of this document.

──────────────────────────────
 SECURITY SUMMARY PAGE
──────────────────────────────

"View Full Security Report" button at bottom of panel.
Opens a dedicated full-page security report showing:

  Header:
    🔐 Security Scan Report
    Scanned: 47 files | Found: 6 issues | Scan time: 1.2s
    [Export as PDF] [Export as Markdown]

  Summary table:
  ┌──────┬──────────────────────┬────────────┬────────┬──────────┐
  │ Sev. │ Secret Type          │ File       │ Line   │ Status   │
  ├──────┼──────────────────────┼────────────┼────────┼──────────┤
  │ 🔴   │ OpenAI API Key       │ config.ts  │ 14     │ Exposed  │
  │ 🔴   │ .env committed       │ .env.local │ —      │ Exposed  │
  │ 🟠   │ Hardcoded Password   │ client.ts  │ 89     │ Exposed  │
  │ 🟡   │ Discord Webhook      │ README.md  │ 23     │ Exposed  │
  └──────┴──────────────────────┴────────────┴────────┴──────────┘

  Each row clickable → jump to that file + line

  At bottom of report:
    ✅ General Best Practices (always shown):
      • Never commit .env files — add to .gitignore
      • Use environment variables for all secrets
      • Rotate any key that was ever committed

      • Use GitHub Secret Scanning alerts
      • Consider tools: GitGuardian, truffleHog, gitleaks
