import { useQuery } from '@tanstack/react-query';
import { fetchCommits, fetchAuthors } from '../api/client';
import type { CommitsResponse, AuthorsResponse } from '../types/api';

export function useCommits(owner: string, repo: string) {
  return useQuery<CommitsResponse, Error>({
    queryKey: ['commits', owner, repo],
    queryFn: () => fetchCommits(owner, repo),
    enabled: Boolean(owner && repo),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useAuthors(owner: string, repo: string) {
  return useQuery<AuthorsResponse, Error>({
    queryKey: ['authors', owner, repo],
    queryFn: () => fetchAuthors(owner, repo),
    enabled: Boolean(owner && repo),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
