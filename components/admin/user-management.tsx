"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useAuth, type User, type UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Edit, Plus, Users, Mail, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser } = useAuth()
  const { toast } = useToast()
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "cashier" as UserRole,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    } else {
      // Check for duplicate email (excluding current user if editing)
      const existingUser = users.find((u) => u.email === formData.email && u.id !== editingUser?.id)
      if (existingUser) {
        errors.email = "This email is already in use"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, users, editingUser])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      try {
        if (editingUser) {
          updateUser(editingUser.id, formData)
          toast({
            title: "Success",
            description: "User updated successfully",
          })
          setEditingUser(null)
        } else {
          addUser(formData)
          toast({
            title: "Success",
            description: "User added successfully",
          })
          setIsAddingUser(false)
        }

        setFormData({
          name: "",
          email: "",
          role: "cashier" as UserRole,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setFormErrors({})
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save user. Please try again.",
          variant: "destructive",
        })
      }
    },
    [formData, editingUser, addUser, updateUser, toast, validateForm],
  )

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    setFormErrors({})
    setIsAddingUser(true)
  }, [])

  const handleDelete = useCallback(
    (userId: string) => {
      if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
        try {
          deleteUser(userId)
          toast({
            title: "Success",
            description: "User deleted successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            variant: "destructive",
          })
        }
      }
    },
    [deleteUser, toast],
  )

  const handleCancel = useCallback(() => {
    setIsAddingUser(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      role: "cashier" as UserRole,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setFormErrors({})
  }, [])

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, name: e.target.value }))
      if (formErrors.name) {
        setFormErrors((prev) => ({ ...prev, name: "" }))
      }
    },
    [formErrors.name],
  )

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, email: e.target.value }))
      if (formErrors.email) {
        setFormErrors((prev) => ({ ...prev, email: "" }))
      }
    },
    [formErrors.email],
  )

  const handleRoleChange = useCallback((value: UserRole) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-coffee-600" />
          <h2 className="text-2xl font-bold text-coffee-900">User Management</h2>
        </div>
        <Button onClick={() => setIsAddingUser(true)} className="bg-coffee-600 hover:bg-coffee-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {isAddingUser && (
        <Card className="border-coffee-200">
          <CardHeader className="bg-coffee-50">
            <CardTitle className="text-coffee-900">{editingUser ? "Edit User" : "Add New User"}</CardTitle>
            <CardDescription className="text-coffee-700">
              {editingUser ? "Update user information" : "Create a new user account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-coffee-800">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter full name"
                    required
                    className={`border-coffee-200 focus:border-coffee-500 ${formErrors.name ? "border-red-500" : ""}`}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <Alert variant="destructive" id="name-error">
                      <AlertDescription>{formErrors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-coffee-800">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="Enter email address"
                    required
                    className={`border-coffee-200 focus:border-coffee-500 ${formErrors.email ? "border-red-500" : ""}`}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <Alert variant="destructive" id="email-error">
                      <AlertDescription>{formErrors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-coffee-800">
                  Role *
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="border-coffee-200 focus:border-coffee-500">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin - Full access
                      </div>
                    </SelectItem>
                    <SelectItem value="cashier">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cashier - POS access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-coffee-600 hover:bg-coffee-700">
                  {editingUser ? "Update User" : "Add User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-coffee-300 text-coffee-700 hover:bg-coffee-100 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="border-coffee-200 hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-coffee-100 flex items-center justify-center">
                  {user.role === "admin" ? (
                    <Shield className="h-6 w-6 text-coffee-600" />
                  ) : (
                    <Users className="h-6 w-6 text-coffee-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-coffee-900">{user.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-coffee-600">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                  className={user.role === "admin" ? "bg-coffee-600 text-white" : "bg-coffee-100 text-coffee-800"}
                >
                  {user.role === "admin" ? "Admin" : "Cashier"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="border-coffee-300 text-coffee-700 hover:bg-coffee-100"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card className="border-coffee-200">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-coffee-900 mb-2">No users found</h3>
              <p className="text-coffee-600 mb-4">Get started by adding your first user.</p>
              <Button onClick={() => setIsAddingUser(true)} className="bg-coffee-600 hover:bg-coffee-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
