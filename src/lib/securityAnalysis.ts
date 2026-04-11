import { FileNode } from '@/store/useStore';

export interface SecurityIssue {
  file: string;
  line: number;
  pattern: string;
  secretType: string;
  severity: 'Critical' | 'Warning';
  content: string;
}

const SECRET_PATTERNS = [
  {
    type: 'OpenAI API Key',
    regex: /sk-[a-zA-Z0-9]{32,}/g,
    severity: 'Critical' as const,
  },
  {
    type: 'Google API Key',
    regex: /AIza[0-9A-Za-z-_]{35}/g,
    severity: 'Critical' as const,
  },
  {
    type: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'Critical' as const,
  },
  {
    type: 'Stripe API Key',
    regex: /sk_live_[0-9a-zA-Z]{24}/g,
    severity: 'Critical' as const,
  },
  {
    type: 'GitHub Personal Access Token',
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'Critical' as const,
  },
  {
    type: 'Generic Bearer Token',
    regex: /Bearer\s+[a-zA-Z0-9._-]{20,}/g,
    severity: 'Warning' as const,
  },
  {
    type: 'Hardcoded Password/Secret',
    regex: /(password|secret|apikey|token|auth|key|cred)\s*[:=]\s*["'][^"']{8,}["']/gi,
    severity: 'Critical' as const,
  },
  {
    type: 'Database URL',
    regex: /(postgres|mongo|mysql|redis):\/\/[^:]+:[^@]+@[^/]+/gi,
    severity: 'Critical' as const,
  }
];

export function scanForSecurityIssues(files: FileNode[]): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  files.forEach(file => {
    if (file.isBinary || !file.content) return;

    const lines = file.content.split('\n');
    lines.forEach((lineText, lineIdx) => {
      SECRET_PATTERNS.forEach(pattern => {
        const matches = lineText.match(pattern.regex);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              file: file.path,
              line: lineIdx + 1,
              pattern: match,
              secretType: pattern.type,
              severity: pattern.severity,
              content: lineText.trim()
            });
          });
        }
      });
    });
  });

  return issues;
}
