import axios from 'axios';
import type { CommitsResponse, AuthorsResponse, CommentsResponse } from '../types/api';

// In Docker, frontend talks to backend via /api proxy (nginx) or direct URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

export async function fetchCommits(owner: string, repo: string): Promise<CommitsResponse> {
  const { data } = await client.get<CommitsResponse>(`/${owner}/${repo}/commits`);
  return data;
}

export async function fetchAuthors(owner: string, repo: string): Promise<AuthorsResponse> {
  const { data } = await client.get<AuthorsResponse>(`/${owner}/${repo}/authors`);
  return data;
}

export async function fetchComments(owner: string, repo: string): Promise<CommentsResponse> {
  const { data } = await client.get<CommentsResponse>(`/${owner}/${repo}/comments`);
  return data;
}

export async function fetchCommitComments(
  owner: string,
  repo: string,
  sha: string
): Promise<CommentsResponse> {
  const all = await fetchComments(owner, repo);
  return {
    ...all,
    comments: all.comments.filter((c) => c.commitSha === sha),
    totalComments: all.comments.filter((c) => c.commitSha === sha).length,
  };
}
