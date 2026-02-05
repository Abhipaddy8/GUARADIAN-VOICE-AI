export const BRAND = {
  primary: '#0066FF',
  accent: '#00D9A0',
  background: {
    light: '#FFFFFF',
    subtle: '#F8F9FC',
    medium: '#E8EBF3'
  },
  text: {
    primary: '#1A1D2E',
    secondary: '#6B7280',
    tertiary: '#9CA3AF'
  },
  gradients: {
    subtle: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
  }
};

export const TYPO = {
  heading: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: '-0.02em'
  },
  body: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 400,
    letterSpacing: '-0.01em'
  },
  ui: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.01em',
    textTransform: 'uppercase' as const
  }
};

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  xxxl: 96
};

export const SHADOWS = {
  soft: '0 4px 24px rgba(0,0,0,0.06)',
  lift: '0 12px 36px rgba(0,0,0,0.08)'
};
