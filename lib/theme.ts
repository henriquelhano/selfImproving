import type { TextStyle } from 'react-native'

export const colors = {
  bg: '#101A20',
  surface: '#17252D',
  raised: '#1F313B',
  border: '#2B404C',
  text: '#E8E4DC',
  muted: '#9AA8B0',
  accent: '#D9A441',
  onAccent: '#1B1406',
  success: '#7FB69E',
}

// Mood scale: cool (1) to warm (5)
export const moodColors: Record<number, string> = {
  1: '#4E6A8A',
  2: '#5E8CA3',
  3: '#86AFA0',
  4: '#C9B677',
  5: '#E3A93F',
}

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
export const radius = { sm: 10, md: 14, lg: 20 }

export const typo = {
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: colors.text },
  heading: { fontSize: 20, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontSize: 15, lineHeight: 22, color: colors.muted },
  small: { fontSize: 13, lineHeight: 18, color: colors.muted },
} satisfies Record<string, TextStyle>