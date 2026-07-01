export const colors = {
  primary: '#1E5EFF',      // bleu principal
  primaryDark: '#123FBF',  // bleu profond (pressed, accents)
  primaryLight: '#EAF0FF', // bleu très pâle (fonds, champs)
  background: '#FFFFFF',
  surface: '#F7F9FC',
  text: '#101828',
  textSecondary: '#667085',
  border: '#E4E7EC',
  error: '#E4362F',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
};
