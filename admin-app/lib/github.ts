
const baseUrl = () => {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const dataDir = process.env.DATA_DIR ?? 'data';
  if (!owner || !repo) {
    throw new Error('Variables GITHUB_OWNER et GITHUB_REPO obligatoires');
  }
  return `https://api.github.com/repos/${owner}/${repo}/contents/${dataDir}`;
};

async function githubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN non défini');
  }

  const response = await fetch(`${baseUrl()}/${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('GitHub API error', response.status, text);
    throw new Error(`Erreur GitHub ${response.status}: ${text}`);
  }

  return response.json();
}

export async function readJsonFile<T>(path: string): Promise<{ data: T; sha: string }>
{
  const branch = process.env.BRANCH ?? 'main';
  const payload = await githubFetch<{ content: string; sha: string }>(
    `${path}?ref=${branch}`
  );
  const decoded = Buffer.from(payload.content, 'base64').toString('utf-8');
  return { data: JSON.parse(decoded) as T, sha: payload.sha };
}

export async function writeJsonFile(
  path: string,
  data: unknown,
  sha: string,
  message: string
): Promise<string> {
  const branch = process.env.BRANCH ?? 'main';
  const body = {
    message,
    content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
    sha,
    branch
  };

  const response = await githubFetch<{ content: { sha: string } }>(path, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return response.content.sha;
}

export async function fetchSha(path: string): Promise<string> {
  const { sha } = await githubFetch<{ sha: string }>(path);
  return sha;
}
