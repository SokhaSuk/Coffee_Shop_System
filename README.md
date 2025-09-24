# DARK COFFEE - Coffee Shop Management System

A modern, full-featured coffee shop management system built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### For Cashiers
- **Point of Sale (POS)**: Intuitive order management with sugar level selection
- **Order History**: Complete transaction history with search and filtering
- **Product Catalog**: Visual product browsing with pricing and availability
- **Receipt Generation**: Professional receipts with merchant and customer copies

### For Administrators
- **Dashboard Overview**: Real-time analytics and KPIs
- **Order Management**: Complete order lifecycle management
- **Product Management**: Inventory control and product catalog management
- **User Management**: Staff account management and permissions
- **Analytics & Reports**: Sales analytics with interactive charts
- **System Settings**: Configuration management

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts (ready for implementation)
- **PDF Generation**: jsPDF with html2canvas

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── cashier/           # Cashier pages
│   ├── login/             # Authentication
│   └── docs/              # Documentation
├── components/            # React Components
│   ├── admin/             # Admin-specific components
│   ├── cashier/           # Cashier-specific components
│   ├── ui/                # Reusable UI components
│   └── error-boundary.tsx # Global error handling
├── hooks/                 # Custom React hooks
│   ├── use-async.ts       # Async data fetching
│   └── use-pagination.ts  # Pagination logic
├── lib/                   # Utility libraries
│   ├── auth-context.tsx   # Authentication context
│   ├── order-context.tsx  # Order management context
│   ├── product-context.tsx # Product management context
│   ├── theme.ts           # Design system and theming
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── pdf.ts             # PDF generation utilities
├── scripts/               # Build and development scripts
└── styles/                # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Coffee brown (`oklch(0.29 0.04 45)`)
- **Secondary**: Warm beige (`oklch(0.82 0.06 55)`)
- **Accent**: Medium brown (`oklch(0.35 0.04 45)`)
- **Success**: Green (`oklch(0.65 0.15 142)`)
- **Warning**: Yellow (`oklch(0.75 0.15 85)`)
- **Error**: Red (`oklch(0.577 0.245 27.325)`)

### Typography
- **Font Family**: Geist Sans (Inter-inspired)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: 0.75rem to 2.25rem with semantic naming

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem

### Components
All UI components follow consistent patterns:
- **Surface Elevation**: Custom shadow system for depth
- **Interactive States**: Hover, focus, and active states
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## 🔧 Development Best Practices

### Code Organization
1. **Separation of Concerns**: Clear separation between UI, business logic, and data
2. **Component Composition**: Small, reusable components
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Error Boundaries**: Graceful error handling

### Naming Conventions
- **Components**: PascalCase (e.g., `DashboardCard`, `DataTable`)
- **Hooks**: camelCase prefixed with "use" (e.g., `useAsync`, `usePagination`)
- **Utils**: camelCase (e.g., `formatCurrency`, `validateEmail`)
- **Types**: PascalCase (e.g., `Order`, `Product`, `User`)

### State Management
- **Local State**: React `useState` for component-specific state
- **Global State**: Context API for app-wide state
- **Server State**: Custom hooks with loading/error states

### API Patterns
- **RESTful Endpoints**: Standard HTTP methods
- **Error Handling**: Consistent error response format
- **Loading States**: UI feedback for async operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
git clone <repository-url>
cd coffee-shop-system
npm install
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant ratios
- **Reduced Motion**: Respects user preferences

## 🔒 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Server-side and client-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Built-in Next.js protection

## 📊 Performance

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Strategic caching layers
- **Bundle Analysis**: Optimized bundle sizes
- **Lazy Loading**: Components and routes

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📚 Documentation

- **Component Documentation**: Storybook (planned)
- **API Documentation**: OpenAPI/Swagger (planned)
- **Developer Guide**: In-code comments and READMEs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for coffee lovers everywhere! ☕