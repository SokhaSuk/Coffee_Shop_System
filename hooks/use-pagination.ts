import { useState, useCallback, useMemo } from "react"

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
  total: number
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  total
}: UsePaginationOptions) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit])

  const hasNext = page < totalPages
  const hasPrev = page > 1

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1)
    }
  }, [hasNext])

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1)
    }
  }, [hasPrev])

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }, [])

  return {
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    offset: (page - 1) * limit
  }
}
