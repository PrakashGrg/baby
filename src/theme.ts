export const lightColors = {
  primary: '#5B8DEF',
  primaryDark: '#3D6FD9',
  secondary: '#8ED1C6',
  accent: '#B8A1FF',
  success: '#5CB85C',
  warning: '#F4B400',
  danger: '#E57373',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
};

export const darkColors = {
  primary: '#7BA5F5',
  primaryDark: '#5B8DEF',
  secondary: '#8ED1C6',
  accent: '#C4B3FF',
  success: '#6FCF6F',
  warning: '#F5C244',
  danger: '#EF8A8A',
  background: '#0F1420',
  card: '#1A2233',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#2D3748',
};

export const gradients = {
  primary: ['#5B8DEF', '#7BA5F5'] as const,
  hero: ['#5B8DEF', '#8B7EF0'] as const,
  mint: ['#8ED1C6', '#6FC0B3'] as const,
  lavender: ['#B8A1FF', '#9C7FF5'] as const,
  sunrise: ['#F4B400', '#F5A623'] as const,
  coral: ['#E57373', '#EF8080'] as const,
  night: ['#3D4E81', '#5753C9', '#6E7FF3'] as const,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '600' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

export const shadow = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

// Backward-compatible default export (light mode) for any file not yet migrated
export const colors = lightColors;