"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coffee } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()

  const validateForm = useCallback(() => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!password.trim()) {
      setError("Password is required")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }, [email, password])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)
      try {
        const success = await login(email, password)
        if (!success) {
          setError("Invalid email or password. Please try again.")
        }
      } catch (err) {
        setError("An error occurred. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, login, validateForm],
  )

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value)
      if (error) setError("") // Clear error when user starts typing
    },
    [error],
  )

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value)
      if (error) setError("") // Clear error when user starts typing
    },
    [error],
  )

  const isFormDisabled = isLoading || isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-50 p-4">
      <Card className="w-full max-w-md border-coffee-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-coffee-600 rounded-full p-3">
              <Coffee className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-coffee-900">DARK COFFEE</CardTitle>
          <CardDescription className="text-coffee-700">Management System Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-coffee-800">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                required
                disabled={isFormDisabled}
                className="border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-coffee-800">
                Password
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                required
                disabled={isFormDisabled}
                className="border-coffee-200 focus:border-coffee-500 focus:ring-coffee-500 text-base sm:text-sm"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            {error && (
              <Alert variant="destructive" id="error-message" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-coffee-600 hover:bg-coffee-700 text-primary"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo accounts section */}
          <div className="mt-6 p-4 bg-coffee-100 rounded-lg border border-coffee-200">
            <h3 className="text-sm font-medium text-coffee-900 mb-2">Demo Accounts:</h3>
            <div className="space-y-2 text-xs text-coffee-700">
              <div>
                <strong>Admin:</strong> admin@darkcoffee.com / password123
              </div>
              <div>
                <strong>Cashier:</strong> cashier@darkcoffee.com / password123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
