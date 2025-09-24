// Centralized theme system for the Coffee Shop System

export const theme = {
  colors: {
    // Coffee shop color palette
    coffee: {
      primary: "oklch(0.29 0.04 45)", // Rich coffee brown
      secondary: "oklch(0.82 0.06 55)", // Warm beige
      accent: "oklch(0.35 0.04 45)", // Medium brown
      light: "oklch(0.95 0.01 50)", // Very light brown
      dark: "oklch(0.15 0.02 40)", // Dark brown
    },
    // Semantic colors
    success: "oklch(0.65 0.15 142)", // Green
    warning: "oklch(0.75 0.15 85)", // Yellow
    error: "oklch(0.577 0.245 27.325)", // Red
    info: "oklch(0.62 0.15 240)", // Blue
  },
  gradients: {
    primary: "linear-gradient(135deg, oklch(0.29 0.04 45), oklch(0.35 0.04 45))",
    secondary: "linear-gradient(135deg, oklch(0.82 0.06 55), oklch(0.88 0.06 55))",
    warm: "linear-gradient(135deg, oklch(0.82 0.06 55) 0%, oklch(0.88 0.06 55) 50%, oklch(0.82 0.06 55) 100%)",
    coffee: "linear-gradient(135deg, oklch(0.29 0.04 45) 0%, oklch(0.35 0.04 45) 50%, oklch(0.29 0.04 45) 100%)",
  },
  shadows: {
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
} as const

// Utility functions for theme usage
export const getThemeColor = (colorKey: keyof typeof theme.colors) => {
  return theme.colors[colorKey]
}

export const getGradient = (gradientKey: keyof typeof theme.gradients) => {
  return theme.gradients[gradientKey]
}

export const getShadow = (shadowKey: keyof typeof theme.shadows) => {
  return theme.shadows[shadowKey]
}

// CSS custom properties for runtime theme switching
export const themeCSSVariables = {
  "--coffee-primary": theme.colors.coffee.primary,
  "--coffee-secondary": theme.colors.coffee.secondary,
  "--coffee-accent": theme.colors.coffee.accent,
  "--coffee-light": theme.colors.coffee.light,
  "--coffee-dark": theme.colors.coffee.dark,
  "--gradient-primary": theme.gradients.primary,
  "--gradient-secondary": theme.gradients.secondary,
  "--gradient-warm": theme.gradients.warm,
  "--gradient-coffee": theme.gradients.coffee,
} as const

// Common component styles
export const componentStyles = {
  card: "surface-elevated rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm",
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  },
  input: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  table: {
    header: "border-b bg-muted/50 font-medium text-muted-foreground",
    cell: "border-b border-border",
    row: "hover:bg-muted/50 transition-colors",
  },
} as const
