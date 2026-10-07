import React from 'react';

const Pagination = ({ total = 0, limit = 6, offset = 0, onPageChange }) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange((currentPage - 2) * limit);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage * limit);
    }
  };

  return (
    <div className="pagination-container" aria-label="Hotel Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous Page"
        id="pagination-prev-btn"
      >
        ← Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange((page - 1) * limit)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
          id={`pagination-page-${page}`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
        id="pagination-next-btn"
      >
        Next →
      </button>

      <span className="pagination-info">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} hotels
      </span>
    </div>
  );
};

export default Pagination;
