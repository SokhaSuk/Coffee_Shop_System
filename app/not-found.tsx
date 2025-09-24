export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
        <a className="text-sm underline" href="/">Back to home</a>
      </div>
    </div>
  )
}
