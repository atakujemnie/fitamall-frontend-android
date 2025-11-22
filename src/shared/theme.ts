export const colors = {
  background: '#0A0A0A',
  surface: '#121212',
  primary: '#3FB6BA',
  text: '#FFFFFF',
  mutedText: '#A4A4A4',
  border: '#1F1F1F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
};

export const theme: Theme = {
  colors,
  spacing,
};
