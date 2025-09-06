"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "admin" | "cashier"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  logoutWithConfirmation: () => Promise<boolean>
  isLoading: boolean
  users: User[]
  addUser: (userData: Omit<User, "id">) => void
  updateUser: (id: string, userData: Partial<User>) => void
  deleteUser: (id: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialUsers: User[] = [
  {
    id: "1",
    email: "admin@darkcoffee.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "cashier@darkcoffee.com",
    name: "Cashier User",
    role: "cashier",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>(initialUsers)

  useEffect(() => {
    const storedUser = localStorage.getItem("darkCoffeeUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    const foundUser = users.find((u) => u.email === email)

    if (foundUser && password === "password123") {
      setUser(foundUser)
      localStorage.setItem("darkCoffeeUser", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("darkCoffeeUser")
  }

  const logoutWithConfirmation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm("Are you sure you want to logout? Any unsaved changes will be lost.")
      if (confirmed) {
        logout()
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  const addUser = (userData: Omit<User, "id">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...userData } : user)))
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        logoutWithConfirmation,
        isLoading,
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
