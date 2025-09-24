import { useState, useEffect, useCallback } from "react"
import { UseAsyncReturn } from "@/lib/types"

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  immediate = true
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setData(result)
      return result
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err))
      setError(errorInstance)
      throw errorInstance
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  const refetch = useCallback(() => execute(), [execute])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  return { data, loading, error, refetch }
}
