// GuardX Theme Configuration - Inspired by Lit Protocol Vincent
export const theme = {
  colors: {
    // Primary - Main brand blue
    primary: {
      DEFAULT: '#2563eb',
      dark: '#1d4ed8',
      light: '#3b82f6',
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary - Neutral grays
    secondary: {
      DEFAULT: '#64748b',
      dark: '#475569',
      light: '#94a3b8',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    
    // Accent - Warm amber
    accent: {
      DEFAULT: '#f59e0b',
      dark: '#d97706',
      light: '#fbbf24',
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Background
    background: {
      DEFAULT: '#f8fafc',
      dark: '#1e293b',
      card: '#ffffff',
      'card-dark': '#334155',
    },
    
    // Text
    text: {
      DEFAULT: '#0f172a',
      light: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Spacing scale
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  
  // Border radius
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
} as const;

// CSS custom properties for dynamic theming
export const cssVariables = `
  :root {
    --color-primary: ${theme.colors.primary.DEFAULT};
    --color-primary-dark: ${theme.colors.primary.dark};
    --color-primary-light: ${theme.colors.primary.light};
    
    --color-secondary: ${theme.colors.secondary.DEFAULT};
    --color-secondary-dark: ${theme.colors.secondary.dark};
    --color-secondary-light: ${theme.colors.secondary.light};
    
    --color-accent: ${theme.colors.accent.DEFAULT};
    --color-accent-dark: ${theme.colors.accent.dark};
    --color-accent-light: ${theme.colors.accent.light};
    
    --color-background: ${theme.colors.background.DEFAULT};
    --color-background-dark: ${theme.colors.background.dark};
    --color-background-card: ${theme.colors.background.card};
    
    --color-text: ${theme.colors.text.DEFAULT};
    --color-text-light: ${theme.colors.text.light};
    --color-text-muted: ${theme.colors.text.muted};
    
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --color-info: ${theme.colors.info};
    
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --shadow-xl: ${theme.shadows.xl};
  }
`;

export default theme;