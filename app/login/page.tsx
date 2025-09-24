"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  return <LoginForm />
}
