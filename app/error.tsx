"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <a className="text-sm underline" href="/">Go home</a>
        </div>
      </div>
    </div>
  )
}
