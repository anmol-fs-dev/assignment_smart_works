import type { Author } from '../types/api';

interface AuthorFilterProps {
  authors: Author[];
  selectedAuthor: string;
  onAuthorChange: (login: string) => void;
}

export function AuthorFilter({ authors, selectedAuthor, onAuthorChange }: AuthorFilterProps) {
  return (
    <div className="author-filter">
      <label htmlFor="author-select" className="filter-label">
        Filter by Author
      </label>
      <div className="select-wrapper">
        <select
          id="author-select"
          className="author-select"
          value={selectedAuthor}
          onChange={(e) => onAuthorChange(e.target.value)}
        >
          <option value="">All Authors ({authors.length})</option>
          {authors.map((author) => (
            <option key={author.login} value={author.login}>
              @{author.login} — {author.commitCount} commit{author.commitCount !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>

      {selectedAuthor && (
        <div className="selected-author-badge">
          {(() => {
            const author = authors.find((a) => a.login === selectedAuthor);
            if (!author) return null;
            return (
              <>
                <img src={author.avatarUrl} alt={author.login} className="badge-avatar" />
                <span className="badge-text">
                  <strong>@{author.login}</strong>
                  <span className="badge-count">{author.commitCount} commits</span>
                </span>
                <button
                  className="badge-clear"
                  onClick={() => onAuthorChange('')}
                  title="Clear filter"
                  aria-label="Clear author filter"
                >
                  ✕
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
