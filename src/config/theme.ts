// GuardX Theme Configuration - Dark-First, Inspired by Lit Protocol Vincent Dashboard
export const theme = {
  colors: {
    // Primary - Darkened blue for dark mode contrast
    primary: {
      DEFAULT: '#1e40af',  // Darker blue default for dark UI
      dark: '#1e3a8a',
      light: '#2563eb',
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

    // Secondary - Dark grays for nav/borders in dark theme
    secondary: {
      DEFAULT: '#334155',  // Darker gray default for dark UI
      dark: '#0f172a',
      light: '#64748b',
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

    // Accent - Orange-red for highlights (e.g., Help button)
    accent: {
      DEFAULT: '#f97316', 
      dark: '#ea580c',
      light: '#fb923c',
      50: '#ffedd5',
      100: '#fed7aa',
      200: '#fdba74',
      300: '#fb923c',
      400: '#f97316',
      500: '#ea580c',
      600: '#c2410c',
      700: '#9a3412',
      800: '#7c2d12',
      900: '#652f1b',
    },

    // New: Red for actions
    red: {
      DEFAULT: '#ef4444',
      dark: '#dc2626',
      light: '#f87171',
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Background - Dark black/gray for dashboard-like UI
    background: {
      DEFAULT: '#0a0a0a',  // Near-black default for dark theme
      dark: '#000000',
      light: '#f8fafc',
      card: '#1a1a1a',     // Darker for cards/sections
      'card-dark': '#111111',
      'card-light': '#ffffff',
    },

    // Text - White primary for dark mode readability
    text: {
      DEFAULT: '#ffffff',  // White default for dark UI
      light: '#a0a0a0',    // Light gray for muted (matching secondary labels)
      muted: '#71717a',
      inverse: '#000000',  // Black for light mode
    },

    // Status colors (adjusted for dark contrast)
    success: '#10b981',
    warning: '#f97316',  // Matches accent for warnings
    error: '#ef4444',    // Matches red for errors/deletes
    info: '#1e40af',     // Dark blue for info
  },

  // Spacing scale (unchanged)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // Border radius (unchanged)
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows (slightly adjusted for dark mode subtlety)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',  // Darker drop for black BGs
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
  },

  // Typography (unchanged; Inter for modern dashboard feel)
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

// CSS custom properties for dynamic theming (dark-first defaults)
export const cssVariables = `
  :root {
    /* Dark defaults */
    --color-primary: ${theme.colors.primary.DEFAULT};
    --color-primary-dark: ${theme.colors.primary.dark};
    --color-primary-light: ${theme.colors.primary.light};
    
    --color-secondary: ${theme.colors.secondary.DEFAULT};
    --color-secondary-dark: ${theme.colors.secondary.dark};
    --color-secondary-light: ${theme.colors.secondary.light};
    
    --color-accent: ${theme.colors.accent.DEFAULT};
    --color-accent-dark: ${theme.colors.accent.dark};
    --color-accent-light: ${theme.colors.accent.light};
    
    --color-red: ${theme.colors.red.DEFAULT};
    --color-red-dark: ${theme.colors.red.dark};
    --color-red-light: ${theme.colors.red.light};
    
    --color-background: ${theme.colors.background.DEFAULT};
    --color-background-dark: ${theme.colors.background.dark};
    --color-background-light: ${theme.colors.background.light};
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

  /* Light mode override (toggle via class) */
  .light {
    --color-primary: ${theme.colors.primary.light};
    --color-secondary: ${theme.colors.secondary.light};
    --color-accent: ${theme.colors.accent.light};
    --color-red: ${theme.colors.red.light};
    --color-background: ${theme.colors.background.light};
    --color-background-card: ${theme.colors.background['card-light']};
    --color-text: ${theme.colors.text.inverse};
    --color-text-light: ${theme.colors.text.DEFAULT};
    --color-text-muted: ${theme.colors.text.light};
  }
`;

export default theme;