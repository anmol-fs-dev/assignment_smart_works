// API response types matching backend output

export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
  login: string | null;
  avatarUrl: string | null;
  htmlUrl: string | null;
}

export interface Commit {
  sha: string;
  title: string;
  message: string;
  htmlUrl: string;
  author: CommitAuthor;
  committer: CommitAuthor;
  commentCount: number;
}

export interface CommitsResponse {
  repository: string;
  totalCommits: number;
  commits: Commit[];
}

export interface Author {
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  htmlUrl: string;
  commitCount: number;
}

export interface AuthorsResponse {
  repository: string;
  totalAuthors: number;
  authors: Author[];
}

export interface CommitComment {
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

export interface CommentsResponse {
  repository: string;
  totalComments: number;
  comments: CommitComment[];
}
