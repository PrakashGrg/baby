export const colors = {
  primary: '#5B8DEF',      // Soft Blue
  primaryDark: '#3D6FD9',
  secondary: '#8ED1C6',    // Mint Green
  accent: '#B8A1FF',       // Lavender
  success: '#5CB85C',
  warning: '#F4B400',
  danger: '#E57373',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
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