import { FileNode, RepoMeta } from '@/store/useStore';
import { getExtension, getLanguageFromExt, isBinaryExtension } from './fileIcons';

interface GitHubUrlParts {
  owner: string;
  repo: string;
  branch?: string;
  subpath?: string;
}

export function parseGitHubUrl(url: string): GitHubUrlParts | { error: string } {
  const trimmed = url.trim().replace(/\/$/, '');

  if (/gist\.github\.com/i.test(trimmed)) return { error: 'Gists are not supported. Please use a repository URL.' };
  if (/github\.com\/[^/]+\/[^/]+\/blob\//i.test(trimmed)) return { error: "That's a link to a single file, not a repository.\nPaste the repo root URL: github.com/owner/repo" };
  if (/github\.com\/[^/]+\/[^/]+\/(pull|issues)\//i.test(trimmed)) return { error: "That's a PR/issue link. Please paste the repository URL." };

  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/tree\/([^/]+)(?:\/(.+))?)?$/i);
  if (!match) return { error: "That doesn't look like a GitHub URL.\nPlease paste a link like: github.com/username/repo" };

  return { owner: match[1], repo: match[2], branch: match[3], subpath: match[4] };
}

async function tryBranch(owner: string, repo: string, branch: string): Promise<boolean> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);
  return res.ok;
}

export async function fetchRepo(
  owner: string, repo: string, branch: string | undefined,
  onProgress: (msg: string, pct: number) => void
): Promise<{ files: FileNode[]; description: string; branch: string; repoMeta: RepoMeta }> {
  onProgress('Checking repository...', 5);

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (repoRes.status === 403) {
    const headers = repoRes.headers;
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    if (remaining === '0' && reset) {
      const resetTime = parseInt(reset) * 1000;
      throw new Error(`RATE_LIMIT:${resetTime}`);
    }
    throw new Error('PRIVATE');
  }
  if (repoRes.status === 404) throw new Error('NOT_FOUND');
  if (!repoRes.ok) throw new Error('API_ERROR');

  const repoData = await repoRes.json();
  const description = repoData.description || '';

  // Build repo metadata
  const repoMeta: RepoMeta = {
    owner: repoData.owner?.login || owner,
    ownerAvatar: repoData.owner?.avatar_url || '',
    repoName: repoData.name || repo,
    fullName: repoData.full_name || `${owner}/${repo}`,
    description: repoData.description || '',
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    watchers: repoData.watchers_count || 0,
    openIssues: repoData.open_issues_count || 0,
    license: repoData.license?.spdx_id || repoData.license?.name || 'None',
    topics: repoData.topics || [],
    language: repoData.language || '',
    createdAt: repoData.created_at || '',
    updatedAt: repoData.updated_at || '',
    size: repoData.size || 0,
    defaultBranch: repoData.default_branch || 'main',
    isFork: repoData.fork || false,
    parentFullName: repoData.parent?.full_name,
    homepage: repoData.homepage || '',
    htmlUrl: repoData.html_url || `https://github.com/${owner}/${repo}`,
  };

  // Fetch languages
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    if (langRes.ok) {
      repoMeta.languages = await langRes.json();
    }
  } catch { /* skip */ }

  if (!branch) {
    branch = repoData.default_branch || 'main';
  }

  onProgress(`Fetching file tree (${branch})...`, 15);

  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  if (treeRes.status === 404) {
    if (branch === 'main') {
      const masterOk = await tryBranch(owner, repo, 'master');
      if (masterOk) {
        branch = 'master';
        const retry = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
        if (!retry.ok) throw new Error('NO_BRANCH');
        const treeData = await retry.json();
        return { ...await fetchFiles(owner, repo, branch, treeData, description, onProgress), repoMeta };
      }
    }
    throw new Error('NO_BRANCH');
  }
  if (!treeRes.ok) throw new Error('API_ERROR');

  const treeData = await treeRes.json();
  return { ...await fetchFiles(owner, repo, branch, treeData, description, onProgress), repoMeta };
}

async function fetchFiles(
  owner: string, repo: string, branch: string,
  treeData: any, description: string,
  onProgress: (msg: string, pct: number) => void
): Promise<{ files: FileNode[]; description: string; branch: string }> {
  const blobs = (treeData.tree || []).filter((item: any) => item.type === 'blob');

  if (blobs.length === 0) throw new Error('EMPTY');

  const textFiles = blobs.filter((b: any) => {
    const ext = getExtension(b.path);
    return !isBinaryExtension(ext);
  });

  const toFetch = textFiles.slice(0, 200);
  const files: FileNode[] = [];

  const cacheKey = `rg_cache_${owner}_${repo}_${branch}`;
  const cached = sessionStorage.getItem(cacheKey);
  const cacheMap: Record<string, string> = cached ? JSON.parse(cached) : {};

  for (let i = 0; i < toFetch.length; i++) {
    const item = toFetch[i];
    const pct = 20 + Math.round((i / toFetch.length) * 70);
    onProgress(`Fetching: ${item.path}`, pct);

    let content = cacheMap[item.path] || '';
    if (!content) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`);
        if (res.ok) {
          content = await res.text();
          cacheMap[item.path] = content;
        }
      } catch { /* skip */ }
    }

    const ext = getExtension(item.path);
    const name = item.path.split('/').pop() || item.path;
    files.push({
      path: item.path, name, content,
      size: item.size || content.length,
      extension: ext,
      language: getLanguageFromExt(ext),
      lineCount: content.split('\n').length,
      isEntryPoint: false, isBinary: false, isGitignored: false,
    });
  }

  const binaryFiles = blobs.filter((b: any) => isBinaryExtension(getExtension(b.path)));
  for (const item of binaryFiles) {
    const ext = getExtension(item.path);
    const name = item.path.split('/').pop() || item.path;
    files.push({
      path: item.path, name, content: '', size: item.size || 0,
      extension: ext, language: getLanguageFromExt(ext), lineCount: 0,
      isEntryPoint: false, isBinary: true, isGitignored: false,
    });
  }

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(cacheMap));
  } catch { /* quota exceeded */ }

  onProgress('Processing...', 95);
  return { files, description, branch };
}
