# Developer Guide - Coffee Shop System

## 🏗 Component Architecture

### Shared Components
Located in `components/ui/` for maximum reusability across the application.

#### DashboardCard
**Location**: `components/ui/dashboard-card.tsx`

**Purpose**: Reusable KPI/metrics display component

**Props**:
```typescript
interface DashboardCardProps {
  title: string
  description?: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  children?: React.ReactNode
}
```

**Usage**:
```tsx
<DashboardCard
  title="Total Revenue"
  value="$12,847"
  icon={DollarSign}
  trend={{ value: 12, label: "vs last month", isPositive: true }}
/>
```

#### DataTable
**Location**: `components/ui/data-table.tsx`

**Purpose**: Generic data table with search, pagination, and actions

**Props**:
```typescript
interface DataTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  title?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  pagination?: PaginationMeta & {
    onPageChange: (page: number) => void
  }
  actions?: (record: T) => React.ReactNode
  emptyMessage?: string
  className?: string
}
```

**Usage**:
```tsx
const columns: TableColumn<Order>[] = [
  { key: "id", label: "Order ID", sortable: true },
  { key: "customer", label: "Customer", sortable: true },
  {
    key: "total",
    label: "Total",
    render: (value) => `$${Number(value).toFixed(2)}`
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={value === "completed" ? "default" : "secondary"}>
        {value}
      </Badge>
    )
  }
]

<DataTable
  data={orders}
  columns={columns}
  title="Recent Orders"
  searchPlaceholder="Search orders..."
  actions={(order) => (
    <>
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="ghost" size="sm">View</Button>
    </>
  )}
/>
```

#### ErrorBoundary
**Location**: `components/error-boundary.tsx`

**Purpose**: Global error handling and recovery

**Usage**:
```tsx
// Wrap any component with error boundary
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Or use HOC pattern
const SafeComponent = withErrorBoundary(MyComponent)
```

### Custom Hooks

#### useAsync
**Location**: `hooks/use-async.ts`

**Purpose**: Handle async data fetching with loading/error states

**Usage**:
```tsx
const { data, loading, error, refetch } = useAsync(
  () => fetch('/api/orders').then(res => res.json()),
  [], // dependencies
  true // immediate execution
)
```

#### usePagination
**Location**: `hooks/use-pagination.ts`

**Purpose**: Manage pagination state and logic

**Usage**:
```tsx
const pagination = usePagination({
  initialPage: 1,
  initialLimit: 10,
  total: 100
})

return {
  page: pagination.page,
  hasNext: pagination.hasNext,
  nextPage: pagination.nextPage,
  // ... other pagination methods
}
```

## 🎨 Styling Guidelines

### Design System Usage
```tsx
// Use semantic color tokens
<Card className="surface-elevated">
  <CardContent className="text-foreground">
    <h3 className="text-primary font-semibold">Title</h3>
  </CardContent>
</Card>

// Consistent spacing
<div className="space-y-4"> {/* Use Tailwind spacing scale */}
  <div className="p-4">Content</div>
</div>

// Interactive elements
<Button className="interactive-scale coffee-gradient">
  Click me
</Button>
```

### Component Styling Patterns
1. **Always use semantic color tokens** (primary, secondary, muted, etc.)
2. **Apply surface elevation** for cards and containers
3. **Use consistent spacing** from the design system
4. **Implement hover states** for interactive elements
5. **Add transition animations** for smooth interactions

## 🔧 TypeScript Best Practices

### Type Definitions
**Location**: `lib/types.ts`

Always use the centralized type definitions:
```typescript
import { Order, Product, User, TableColumn } from "@/lib/types"

// ✅ Correct - using centralized types
const orders: Order[] = []
const products: Product[] = []

// ❌ Wrong - defining inline types
interface MyOrder { id: string; ... } // Don't do this
```

### Component Props
```typescript
// ✅ Correct - explicit prop types
interface MyComponentProps {
  title: string
  onClick: (id: string) => void
  variant: 'primary' | 'secondary'
  disabled?: boolean
}

// ❌ Wrong - implicit any types
interface MyComponentProps {
  title: any
  onClick: any
  variant: any
}
```

### API Response Types
```typescript
// ✅ Correct - typed API responses
interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Usage
const fetchOrders = async (): Promise<ApiResponse<Order[]>> => {
  const response = await fetch('/api/orders')
  return response.json()
}
```

## 📁 File Organization

### Component Structure
```
components/
├── admin/           # Admin-specific components
│   ├── admin-dashboard.tsx
│   ├── admin-sidebar.tsx
│   └── [feature]-management.tsx
├── cashier/         # Cashier-specific components
│   ├── cashier-dashboard.tsx
│   ├── cashier-pos.tsx
│   └── [feature]-component.tsx
└── ui/              # Shared UI components
    ├── dashboard-card.tsx
    ├── data-table.tsx
    ├── [component].tsx
```

### Hook Structure
```
hooks/
├── use-async.ts      # Generic async data fetching
├── use-pagination.ts # Generic pagination logic
└── use-[feature].ts  # Feature-specific hooks
```

### Utility Structure
```
lib/
├── types.ts          # All TypeScript type definitions
├── theme.ts          # Design system and theming
├── utils.ts          # Generic utility functions
├── [context].tsx     # React context providers
└── [service].ts      # Business logic and services
```

## 🔄 State Management

### Local State
Use React `useState` for component-specific state:
```tsx
const [isOpen, setIsOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState("")
```

### Global State
Use Context API for app-wide state:
```tsx
// In context provider
const [orders, setOrders] = useState<Order[]>([])

// In consuming component
const { orders, setOrders } = useOrders()
```

### Server State
Use custom hooks for API data:
```tsx
const { data: orders, loading, error, refetch } = useAsync(
  () => fetchOrders(),
  [], // dependencies
  true // immediate
)
```

## 🚨 Error Handling

### Component-Level Error Boundaries
```tsx
// Wrap components with error boundaries
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### API Error Handling
```tsx
const { data, loading, error, refetch } = useAsync(
  async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    } catch (error) {
      // Log error and re-throw
      console.error('API Error:', error)
      throw error
    }
  }
)
```

### Form Validation
```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

// Validate form
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  if (!formData.name) newErrors.name = "Name is required"
  if (!formData.email) newErrors.email = "Email is required"

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

## 🎨 Theme System

### Using Theme Colors
```tsx
// ✅ Correct - use semantic tokens
<Card className="bg-card border-border">
  <div className="text-primary font-semibold">Title</div>
</Card>

// ❌ Wrong - use hardcoded colors
<Card className="bg-blue-500 border-blue-600">
  <div className="text-blue-700 font-semibold">Title</div>
</Card>
```

### Custom Gradients
```tsx
// Use predefined gradients
<div className="coffee-gradient">Coffee themed background</div>
<div className="warm-gradient">Warm accent background</div>
```

### Responsive Design
```tsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="p-4 sm:p-6">Responsive card</Card>
</div>
```

## 📱 Mobile Responsiveness

### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up

### Responsive Patterns
```tsx
// Hide/show elements based on screen size
<div className="hidden sm:block">Desktop only</div>
<div className="block sm:hidden">Mobile only</div>

// Responsive text sizes
<h1 className="text-xl sm:text-2xl lg:text-3xl">Responsive title</h1>

// Flexible layouts
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">Content</div>
  <div className="w-full sm:w-64">Sidebar</div>
</div>
```

## ♿ Accessibility Guidelines

### Semantic HTML
```tsx
// ✅ Correct
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li><a href="/orders" aria-current="page">Orders</a></li>
  </ul>
</nav>

// ❌ Wrong
<div>
  <div><a href="/orders">Orders</a></div>
</div>
```

### Keyboard Navigation
```tsx
// Ensure all interactive elements are keyboard accessible
<Button onClick={handleClick} onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}}>
  Click me
</Button>
```

### ARIA Labels
```tsx
// Provide meaningful labels for screen readers
<Button
  aria-label="Close dialog"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</Button>
```

## 🔒 Security Best Practices

### Input Validation
```tsx
// Always validate and sanitize inputs
const handleSubmit = (data: FormData) => {
  // Client-side validation
  if (!data.email || !isValidEmail(data.email)) {
    setError('Invalid email address')
    return
  }

  // Sanitize inputs
  const sanitizedData = {
    ...data,
    email: data.email.trim().toLowerCase(),
    name: data.name.trim()
  }

  // Submit to server
  submitToAPI(sanitizedData)
}
```

### Authentication Checks
```tsx
// Check authentication in components
const { user } = useAuth()
if (!user) return <LoginRequired />

// Check permissions
if (user.role !== 'admin') {
  return <AccessDenied />
}
```

## 📊 Performance Optimization

### Code Splitting
```tsx
// Dynamic imports for heavy components
const HeavyChart = lazy(() => import('./components/HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Memoization
```tsx
// Memoize expensive computations
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active')
}, [data])

// Memoize event handlers
const handleClick = useCallback(() => {
  doSomething(data)
}, [data])
```

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/images/coffee.jpg"
  alt="Coffee cup"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// Test component rendering
describe('DashboardCard', () => {
  it('renders with title and value', () => {
    render(<DashboardCard title="Test" value="123" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })
})
```

### Integration Tests
```typescript
// Test component interactions
describe('OrderManagement', () => {
  it('adds new order when form is submitted', async () => {
    render(<OrderManagement />)
    const submitButton = screen.getByRole('button', { name: 'Add Order' })
    fireEvent.click(submitButton)
    // Assert order was added
  })
})
```

### E2E Tests
```typescript
// Test complete user workflows
describe('Order Flow', () => {
  it('completes full order process', () => {
    cy.visit('/cashier')
    cy.get('[data-testid="add-product"]').click()
    cy.get('[data-testid="checkout"]').click()
    cy.get('[data-testid="receipt"]').should('exist')
  })
})
```

## 📚 Additional Resources

### Component Library
- **Storybook**: Component documentation (planned)
- **Figma**: Design system and prototypes

### API Documentation
- **Swagger/OpenAPI**: API endpoint documentation (planned)
- **Postman Collection**: API testing collection

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for code quality

---

Happy coding! ☕ If you have questions, check the component documentation or ask the team.
