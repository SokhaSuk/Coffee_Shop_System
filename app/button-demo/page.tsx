"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Trash2, CheckCircle, AlertTriangle, Info, LogOut } from "lucide-react"
import { useState } from "react"

export default function ButtonDemoPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLoadingDemo = () => {
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 3000)
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-primary">Button Component Demo</h1>
                    <p className="text-muted-foreground">Showcasing all button variants with best practices</p>
                </div>

                {/* Button Variants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Button Variants</CardTitle>
                        <CardDescription>All available button styles with color swap hover effect</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Default (Primary)</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default">Primary Button</Button>
                                <Button variant="default" size="sm">Small</Button>
                                <Button variant="default" size="lg">Large</Button>
                                <Button variant="default" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Destructive</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="destructive">
                                    <Trash2 />
                                    Delete
                                </Button>
                                <Button variant="destructive" size="sm">Delete</Button>
                                <Button variant="destructive" size="lg">Delete Item</Button>
                                <Button variant="destructive" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Success</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="success">
                                    <CheckCircle />
                                    Confirm
                                </Button>
                                <Button variant="success" size="sm">Save</Button>
                                <Button variant="success" size="lg">Complete Order</Button>
                                <Button variant="success" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Warning</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="warning">
                                    <AlertTriangle />
                                    Warning
                                </Button>
                                <Button variant="warning" size="sm">Alert</Button>
                                <Button variant="warning" size="lg">Proceed with Caution</Button>
                                <Button variant="warning" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Info</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="info">
                                    <Info />
                                    Information
                                </Button>
                                <Button variant="info" size="sm">Details</Button>
                                <Button variant="info" size="lg">View Information</Button>
                                <Button variant="info" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Outline</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline">
                                    <LogOut />
                                    Logout
                                </Button>
                                <Button variant="outline" size="sm">Cancel</Button>
                                <Button variant="outline" size="lg">Outline Large</Button>
                                <Button variant="outline" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Secondary</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="secondary" size="sm">Small</Button>
                                <Button variant="secondary" size="lg">Large</Button>
                                <Button variant="secondary" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Ghost</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="ghost">Ghost Button</Button>
                                <Button variant="ghost" size="sm">Small</Button>
                                <Button variant="ghost" size="lg">Large</Button>
                                <Button variant="ghost" disabled>Disabled</Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground">Link</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="link">Link Button</Button>
                                <Button variant="link" size="sm">Small Link</Button>
                                <Button variant="link" size="lg">Large Link</Button>
                                <Button variant="link" disabled>Disabled</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Icon Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Icon Buttons</CardTitle>
                        <CardDescription>Square icon-only buttons</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default" size="icon">
                                <Download />
                            </Button>
                            <Button variant="destructive" size="icon">
                                <Trash2 />
                            </Button>
                            <Button variant="success" size="icon">
                                <CheckCircle />
                            </Button>
                            <Button variant="warning" size="icon">
                                <AlertTriangle />
                            </Button>
                            <Button variant="info" size="icon">
                                <Info />
                            </Button>
                            <Button variant="outline" size="icon">
                                <LogOut />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading States */}
                <Card>
                    <CardHeader>
                        <CardTitle>Loading States</CardTitle>
                        <CardDescription>Buttons with loading spinner and disabled state</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default" isLoading>
                                Processing
                            </Button>
                            <Button variant="success" isLoading>
                                Saving
                            </Button>
                            <Button variant="destructive" isLoading>
                                Deleting
                            </Button>
                            <Button variant="outline" isLoading>
                                Loading
                            </Button>
                        </div>
                        <div>
                            <Button onClick={handleLoadingDemo} isLoading={isLoading}>
                                {isLoading ? "Loading..." : "Click to Test Loading (3s)"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* With Icons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buttons with Icons</CardTitle>
                        <CardDescription>Combining text and icons</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default">
                                <Download />
                                Download
                            </Button>
                            <Button variant="destructive">
                                <Trash2 />
                                Delete
                            </Button>
                            <Button variant="success">
                                <CheckCircle />
                                Confirm
                            </Button>
                            <Button variant="warning">
                                <AlertTriangle />
                                Warning
                            </Button>
                            <Button variant="info">
                                <Info />
                                Info
                            </Button>
                            <Button variant="outline">
                                <LogOut />
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
