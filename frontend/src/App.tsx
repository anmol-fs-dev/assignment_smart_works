import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommitsTable } from './components/CommitsTable';
import { AuthorFilter } from './components/AuthorFilter';
import { useCommits, useAuthors } from './hooks/useCommits';
import type { Commit } from './types/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function GitHubExplorer() {
  const [repoInput, setRepoInput] = useState('octocat/Spoon-Knife');
  const [activeRepo, setActiveRepo] = useState('octocat/Spoon-Knife');
  const [selectedAuthor, setSelectedAuthor] = useState('');

  const [owner, repo] = activeRepo.split('/');

  const {
    data: commitsData,
    isLoading: commitsLoading,
    isError: commitsError,
    error: commitsErrorObj,
  } = useCommits(owner, repo);

  const {
    data: authorsData,
    isLoading: authorsLoading,
  } = useAuthors(owner, repo);

  // Reset author filter when repo changes
  useEffect(() => {
    setSelectedAuthor('');
  }, [activeRepo]);

  const handleSearch = useCallback(() => {
    const trimmed = repoInput.trim();
    if (!trimmed.includes('/') || trimmed.split('/').length !== 2) {
      alert('Please enter a valid repository in owner/repo format (e.g. octocat/Spoon-Knife)');
      return;
    }
    setActiveRepo(trimmed);
  }, [repoInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Filter commits by selected author
  const filteredCommits: Commit[] = commitsData?.commits.filter((commit) => {
    if (!selectedAuthor) return true;
    return (
      commit.author.login === selectedAuthor ||
      commit.committer?.login === selectedAuthor
    );
  }) ?? [];

  const isLoading = commitsLoading || authorsLoading;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <div>
              <h1 className="logo-title">GitHub Commits Explorer</h1>
              <p className="logo-subtitle">Explore commits, authors & comments</p>
            </div>
          </div>

          {commitsData && (
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">{commitsData.totalCommits}</span>
                <span className="stat-label">Commits</span>
              </div>
              <div className="stat">
                <span className="stat-value">{authorsData?.totalAuthors ?? '—'}</span>
                <span className="stat-label">Authors</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {commitsData.commits.reduce((sum, c) => sum + c.commentCount, 0)}
                </span>
                <span className="stat-label">Comments</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {/* Search + filter controls */}
        <section className="controls-section">
          <div className="controls-card">
            {/* Repo input */}
            <div className="repo-input-group">
              <label htmlFor="repo-input" className="filter-label">
                Repository
              </label>
              <div className="repo-input-wrapper">
                <span className="repo-icon">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                    <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                  </svg>
                </span>
                <input
                  id="repo-input"
                  type="text"
                  className="repo-input"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="owner/repository (e.g. facebook/react)"
                  spellCheck={false}
                />
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  disabled={isLoading}
                  id="search-button"
                >
                  {isLoading ? (
                    <span className="btn-spinner"></span>
                  ) : (
                    'Explore →'
                  )}
                </button>
              </div>
              <p className="input-hint">
                Currently viewing: <strong>{activeRepo}</strong>
              </p>
            </div>

            {/* Author filter */}
            {authorsData && authorsData.authors.length > 0 && (
              <AuthorFilter
                authors={authorsData.authors}
                selectedAuthor={selectedAuthor}
                onAuthorChange={setSelectedAuthor}
              />
            )}
          </div>

          {/* API endpoint docs */}
          <div className="api-links">
            <p className="api-links-label">API Endpoints</p>
            <div className="api-chips">
              <a
                href={`/api/${activeRepo}/commits`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-chip"
              >
                <span className="chip-method">GET</span> /commits
              </a>
              <a
                href={`/api/${activeRepo}/authors`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-chip"
              >
                <span className="chip-method">GET</span> /authors
              </a>
              <a
                href={`/api/${activeRepo}/comments`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-chip"
              >
                <span className="chip-method">GET</span> /comments
              </a>
            </div>
          </div>
        </section>

        {/* Error state */}
        {commitsError && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Failed to load commits</strong>
              <p>
                {(commitsErrorObj as Error & { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ?? commitsErrorObj?.message ?? 'Unknown error'}
              </p>
              <p className="error-hint">
                Make sure the repository exists and is public. If you're hitting rate limits, set a GITHUB_TOKEN in backend/.env
              </p>
            </div>
          </div>
        )}

        {/* Commits table */}
        <section className="table-section">
          {selectedAuthor && (
            <div className="filter-badge-bar">
              <span className="filter-badge-label">
                Filtered: showing commits by <strong>@{selectedAuthor}</strong>
                {' '}({filteredCommits.length} result{filteredCommits.length !== 1 ? 's' : ''})
              </span>
              <button className="clear-filter" onClick={() => setSelectedAuthor('')}>
                Clear filter ✕
              </button>
            </div>
          )}

          <CommitsTable
            commits={filteredCommits}
            owner={owner}
            repo={repo}
            isLoading={commitsLoading}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Data from{' '}
          <a href="https://docs.github.com/en/rest/commits/commits" target="_blank" rel="noopener noreferrer">
            GitHub REST API
          </a>
          {' '}· Built with React + TypeScript + Node.js
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GitHubExplorer />
    </QueryClientProvider>
  );
}
