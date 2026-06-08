import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CommitComment } from '../types/api';
import { fetchComments } from '../api/client';

interface CommentsModalProps {
  owner: string;
  repo: string;
  sha: string;
  commitTitle: string;
  onClose: () => void;
}

export function CommentsModal({ owner, repo, sha, commitTitle, onClose }: CommentsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['comments', owner, repo, sha],
    queryFn: async () => {
      const all = await fetchComments(owner, repo);
      return all.comments.filter((c: CommitComment) => c.commitSha === sha);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Commit comments"
    >
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon">💬</div>
            <div>
              <h2 className="modal-title">Commit Comments</h2>
              <p className="modal-subtitle">{commitTitle}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-sha">
          <span className="sha-label">SHA</span>
          <a
            href={`https://github.com/${owner}/${repo}/commit/${sha}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sha-value"
          >
            {sha.slice(0, 12)}...
          </a>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Loading comments...</p>
            </div>
          )}

          {isError && (
            <div className="modal-error">
              <span>⚠️</span>
              <p>Failed to load comments. Please try again.</p>
            </div>
          )}

          {data && data.length === 0 && (
            <div className="modal-empty">
              <span className="empty-icon">🔍</span>
              <p>No comments found for this commit.</p>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="comments-list">
              {data.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <a
                      href={comment.commenter.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="commenter-link"
                    >
                      <img
                        src={comment.commenter.avatarUrl}
                        alt={comment.commenter.login}
                        className="commenter-avatar"
                      />
                      <span className="commenter-name">@{comment.commenter.login}</span>
                    </a>
                    <div className="comment-meta">
                      <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      <a
                        href={comment.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comment-link"
                        title="View on GitHub"
                      >
                        ↗
                      </a>
                    </div>
                  </div>
                  <div className="comment-body">
                    <p>{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
