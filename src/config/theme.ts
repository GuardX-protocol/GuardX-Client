export const theme = {
  colors: {
    primary: {
      DEFAULT: '#f97316', // Orange-500
      dark: '#ea580c',    // Orange-600
      light: '#fb923c',   // Orange-400
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    accent: {
      DEFAULT: '#ef4444', // Red-500
      dark: '#dc2626',    // Red-600
      light: '#f87171',   // Red-400
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
      950: '#450a0a',
    },
    secondary: {
      DEFAULT: '#1f2937',
      dark: '#111827',
      light: '#374151',
    },
    background: {
      DEFAULT: '#030812',
      card: '#0f1419',
      hover: '#1a1f2e',
    },
    text: {
      DEFAULT: '#ffffff',
      muted: '#94a3b8',
      light: '#cbd5e1',
    },
    border: '#1a1f2e',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
} as const;

export default theme;