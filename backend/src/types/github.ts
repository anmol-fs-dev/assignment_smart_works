// Shared TypeScript interfaces for GitHub API responses

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface GitHubCommitDetail {
  author: GitHubCommitAuthor;
  committer: GitHubCommitAuthor;
  message: string;
  comment_count: number;
  tree: { sha: string; url: string };
  url: string;
}

export interface GitHubCommitItem {
  sha: string;
  commit: GitHubCommitDetail;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  html_url: string;
  comments_url: string;
}

export interface GitHubCommitComment {
  id: number;
  html_url: string;
  url: string;
  body: string;
  commit_id: string;
  created_at: string;
  updated_at: string;
  user: GitHubUser;
}

// API response shapes
export interface CommitResponse {
  sha: string;
  title: string;
  message: string;
  htmlUrl: string;
  author: {
    name: string;
    email: string;
    date: string;
    login: string | null;
    avatarUrl: string | null;
    htmlUrl: string | null;
  };
  committer: {
    name: string;
    email: string;
    date: string;
    login: string | null;
    avatarUrl: string | null;
    htmlUrl: string | null;
  };
  commentCount: number;
}

export interface AuthorResponse {
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  htmlUrl: string;
  commitCount: number;
}

export interface CommitCommentResponse {
  id: number;
  commitSha: string;
  htmlUrl: string;
  body: string;
  createdAt: string;
  commenter: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
}
