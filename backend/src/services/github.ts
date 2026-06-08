import axios, { AxiosInstance } from 'axios';
import {
  GitHubCommitItem,
  GitHubCommitComment,
  CommitResponse,
  AuthorResponse,
  CommitCommentResponse,
} from '../types/github';

const BASE_URL = 'https://api.github.com';

function createGitHubClient(): AxiosInstance {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return axios.create({
    baseURL: BASE_URL,
    headers,
    timeout: 30000,
  });
}

const client = createGitHubClient();

/**
 * Fetch all pages of a GitHub API endpoint (handles pagination automatically)
 */
async function fetchAllPages<T>(url: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await client.get<T[]>(url, {
      params: { ...params, per_page: perPage, page },
    });

    const data = response.data;
    results.push(...data);

    // If we got fewer than perPage results, we've reached the last page
    if (data.length < perPage) {
      break;
    }

    page++;

    // Safety cap: max 20 pages (2000 commits) to avoid rate limiting
    if (page > 20) {
      break;
    }
  }

  return results;
}

/**
 * Endpoint 1: Get all commits with author/committer details, title, and comment count
 */
export async function getCommits(owner: string, repo: string): Promise<CommitResponse[]> {
  const commits = await fetchAllPages<GitHubCommitItem>(
    `/repos/${owner}/${repo}/commits`
  );

  return commits.map((item) => {
    const messageParts = item.commit.message.split('\n');
    const title = messageParts[0].trim();

    return {
      sha: item.sha,
      title,
      message: item.commit.message,
      htmlUrl: item.html_url,
      author: {
        name: item.commit.author.name,
        email: item.commit.author.email,
        date: item.commit.author.date,
        login: item.author?.login ?? null,
        avatarUrl: item.author?.avatar_url ?? null,
        htmlUrl: item.author?.html_url ?? null,
      },
      committer: {
        name: item.commit.committer.name,
        email: item.commit.committer.email,
        date: item.commit.committer.date,
        login: item.committer?.login ?? null,
        avatarUrl: item.committer?.avatar_url ?? null,
        htmlUrl: item.committer?.html_url ?? null,
      },
      commentCount: item.commit.comment_count,
    };
  });
}

/**
 * Endpoint 2: Get unique commit authors with commit counts
 */
export async function getAuthors(owner: string, repo: string): Promise<AuthorResponse[]> {
  const commits = await fetchAllPages<GitHubCommitItem>(
    `/repos/${owner}/${repo}/commits`
  );

  // Build a map of unique authors keyed by login (or email as fallback)
  const authorMap = new Map<string, AuthorResponse>();

  for (const item of commits) {
    const key = item.author?.login ?? item.commit.author.email;

    if (authorMap.has(key)) {
      authorMap.get(key)!.commitCount++;
    } else {
      authorMap.set(key, {
        login: item.author?.login ?? item.commit.author.email,
        name: item.commit.author.name,
        email: item.commit.author.email,
        avatarUrl: item.author?.avatar_url ?? `https://www.gravatar.com/avatar/${Buffer.from(item.commit.author.email.trim().toLowerCase()).toString('hex')}?d=identicon`,
        htmlUrl: item.author?.html_url ?? `https://github.com/${item.author?.login ?? ''}`,
        commitCount: 1,
      });
    }
  }

  // Sort by commit count descending
  return Array.from(authorMap.values()).sort((a, b) => b.commitCount - a.commitCount);
}

/**
 * Endpoint 3: Get all commit comments for the repo
 */
export async function getCommitComments(owner: string, repo: string): Promise<CommitCommentResponse[]> {
  const comments = await fetchAllPages<GitHubCommitComment>(
    `/repos/${owner}/${repo}/comments`
  );

  return comments.map((comment) => ({
    id: comment.id,
    commitSha: comment.commit_id,
    htmlUrl: comment.html_url,
    body: comment.body,
    createdAt: comment.created_at,
    commenter: {
      login: comment.user.login,
      avatarUrl: comment.user.avatar_url,
      htmlUrl: comment.user.html_url,
    },
  }));
}
