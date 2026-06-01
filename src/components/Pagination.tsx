interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function getPageNumbers(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 1) return [1]
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total])

  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) {
      pages.add(i)
    }
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []

  for (let index = 0; index < sorted.length; index++) {
    const value = sorted[index]
    const previous = sorted[index - 1]

    if (index > 0 && value - previous > 1) {
      result.push('ellipsis')
    }

    result.push(value)
  }

  return result
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)
  const pages = getPageNumbers(page, totalPages)

  return (
    <nav className="pagination" aria-label="Water body list pagination">
      <p className="pagination-summary">
        Showing {start}–{end} of {totalItems}
        <span className="pagination-summary-sep"> · </span>
        Page {page} of {totalPages}
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="First page"
        >
          First
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>

        <ul className="pagination-pages">
          {pages.map((pageNumber, index) =>
            pageNumber === 'ellipsis' ? (
              <li
                key={`ellipsis-${index}`}
                className="pagination-ellipsis"
                aria-hidden="true"
              >
                …
              </li>
            ) : (
              <li key={pageNumber}>
                <button
                  type="button"
                  className={`pagination-btn pagination-btn--page${pageNumber === page ? ' pagination-btn--active' : ''}`}
                  onClick={() => onPageChange(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              </li>
            ),
          )}
        </ul>

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn--nav"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
        >
          Last
        </button>
      </div>
    </nav>
  )
}
