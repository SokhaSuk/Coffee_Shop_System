"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  showPasswordToggle?: boolean
  disabled?: boolean
  className?: string
  id?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  "aria-describedby"?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", showPasswordToggle = true, disabled = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword(prev => !prev)
    }, [])

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={`${showPasswordToggle ? "pr-10" : ""} ${className}`}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            disabled={disabled}
            className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-coffee-400 hover:text-coffee-600 focus:outline-none focus:text-coffee-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
            ) : (
              <Eye className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
            )}
          </button>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
