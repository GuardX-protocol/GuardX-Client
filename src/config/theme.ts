export const theme = {
  colors: {
    primary: {
      DEFAULT: '#ff4206',
      dark: '#e63900',
      light: '#ff6633',
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
    error: '#ff4206',
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