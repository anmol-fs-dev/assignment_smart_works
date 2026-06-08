import { useState } from 'react';
import type { Commit } from '../types/api';
import { CommentsModal } from './CommentsModal';

interface CommitsTableProps {
  commits: Commit[];
  owner: string;
  repo: string;
  isLoading: boolean;
}

const PAGE_SIZE = 20;

export function CommitsTable({ commits, owner, repo, isLoading }: CommitsTableProps) {
  const [page, setPage] = useState(1);
  const [modalCommit, setModalCommit] = useState<Commit | null>(null);
  const [sortField, setSortField] = useState<'date' | 'comments'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...commits].sort((a, b) => {
    if (sortField === 'date') {
      const diff = new Date(a.author.date).getTime() - new Date(b.author.date).getTime();
      return sortDir === 'asc' ? diff : -diff;
    } else {
      const diff = a.commentCount - b.commentCount;
      return sortDir === 'asc' ? diff : -diff;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentCommits = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: 'date' | 'comments') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="table-skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-sub"></div>
              </div>
              <div className="skeleton-badge"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="table-empty">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No commits found</h3>
          <p>Try a different repository or author filter</p>
        </div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: 'date' | 'comments' }) => (
    <span className={`sort-icon ${sortField === field ? 'sort-active' : ''}`}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <>
      <div className="table-meta">
        <span className="results-count">
          Showing <strong>{currentCommits.length}</strong> of <strong>{commits.length}</strong> commits
        </span>
      </div>

      <div className="table-container">
        <table className="commits-table">
          <thead>
            <tr>
              <th className="th-author">Author</th>
              <th className="th-commit">Commit Title</th>
              <th className="th-sha">SHA</th>
              <th
                className="th-date th-sortable"
                onClick={() => toggleSort('date')}
              >
                Date <SortIcon field="date" />
              </th>
              <th
                className="th-comments th-sortable"
                onClick={() => toggleSort('comments')}
              >
                Comments <SortIcon field="comments" />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCommits.map((commit) => (
              <tr key={commit.sha} className="commit-row">
                {/* Author cell */}
                <td className="td-author">
                  <div className="author-cell">
                    {commit.author.avatarUrl ? (
                      <img
                        src={commit.author.avatarUrl}
                        alt={commit.author.login ?? commit.author.name}
                        className="row-avatar"
                      />
                    ) : (
                      <div className="row-avatar-placeholder">
                        {(commit.author.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="author-info">
                      {commit.author.login ? (
                        <a
                          href={commit.author.htmlUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="author-login"
                        >
                          @{commit.author.login}
                        </a>
                      ) : (
                        <span className="author-name">{commit.author.name}</span>
                      )}
                      <span className="author-email">{commit.author.email}</span>
                    </div>
                  </div>
                </td>

                {/* Commit title cell */}
                <td className="td-commit">
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="commit-title"
                    title={commit.message}
                  >
                    {commit.title}
                  </a>
                </td>

                {/* SHA cell */}
                <td className="td-sha">
                  <a
                    href={commit.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sha-chip"
                    title={commit.sha}
                  >
                    {commit.sha.slice(0, 7)}
                  </a>
                </td>

                {/* Date cell */}
                <td className="td-date">
                  <span title={new Date(commit.author.date).toLocaleString()} className="date-text">
                    {formatDate(commit.author.date)}
                  </span>
                </td>

                {/* Comments cell */}
                <td className="td-comments">
                  {commit.commentCount > 0 ? (
                    <button
                      className="comment-badge comment-badge-active"
                      onClick={() => setModalCommit(commit)}
                      title="View comments"
                      aria-label={`View ${commit.commentCount} comments`}
                    >
                      💬 {commit.commentCount}
                    </button>
                  ) : (
                    <span className="comment-badge comment-badge-zero">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            «
          </button>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i + 1;
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                className={`page-btn ${page === pageNum ? 'page-btn-active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
          <button
            className="page-btn"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>
      )}

      {/* Comments Modal */}
      {modalCommit && (
        <CommentsModal
          owner={owner}
          repo={repo}
          sha={modalCommit.sha}
          commitTitle={modalCommit.title}
          onClose={() => setModalCommit(null)}
        />
      )}
    </>
  );
}
