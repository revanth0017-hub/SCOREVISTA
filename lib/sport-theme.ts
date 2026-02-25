/**
 * Sport-based theming: unique primary, secondary, icon.
 * Colors are vibrant but elegant (20–30% accent, 70–80% neutral).
 * Theme assignments per spec:
 * Cricket → Blue | Basketball → Orange | Tennis → Green | Shuttle → Yellow
 * Football → Black & white / grey | Kabaddi → Deep maroon | Volleyball → Warm amber
 */

export type SportId = 'cricket' | 'basketball' | 'tennis' | 'shuttle' | 'football' | 'kabaddi' | 'volleyball' | 'all';

export interface SportTheme {
  id: SportId;
  name: string;
  icon: string; // emoji or icon name for minimal vector style
  /** Primary accent - used for headers, active tab, badges, highlights */
  primary: string;
  /** Light mode: soft secondary background */
  primaryLight: string;
  /** Dark mode: slightly brighter for visibility */
  primaryDark: string;
  /** Hover tint (often primary with opacity) */
  primaryHover: string;
}

export const SPORT_THEMES: Record<SportId, SportTheme> = {
  cricket: {
    id: 'cricket',
    name: 'Cricket',
    icon: '🏏',
    primary: '#2563EB',       // blue - vibrant but elegant
    primaryLight: '#EFF6FF',
    primaryDark: '#3B82F6',
    primaryHover: 'rgba(37, 99, 235, 0.15)',
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    primary: '#EA580C',       // orange
    primaryLight: '#FFF7ED',
    primaryDark: '#F97316',
    primaryHover: 'rgba(234, 88, 12, 0.15)',
  },
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    icon: '🎾',
    primary: '#16A34A',       // green
    primaryLight: '#ECFDF5',
    primaryDark: '#22C55E',
    primaryHover: 'rgba(22, 163, 74, 0.15)',
  },
  shuttle: {
    id: 'shuttle',
    name: 'Shuttle',
    icon: '🏸',
    primary: '#CA8A04',       // yellow / gold
    primaryLight: '#FEFCE8',
    primaryDark: '#EAB308',
    primaryHover: 'rgba(202, 138, 4, 0.15)',
  },
  football: {
    id: 'football',
    name: 'Football',
    icon: '⚽',
    primary: '#171717',       // black & white with grey accent
    primaryLight: '#F5F5F5',
    primaryDark: '#E5E5E5',
    primaryHover: 'rgba(23, 23, 23, 0.08)',
  },
  kabaddi: {
    id: 'kabaddi',
    name: 'Kabaddi',
    icon: '🤼',
    primary: '#7F1D1D',       // deep maroon
    primaryLight: '#FEF2F2',
    primaryDark: '#991B1B',
    primaryHover: 'rgba(127, 29, 29, 0.15)',
  },
  volleyball: {
    id: 'volleyball',
    name: 'Volleyball',
    icon: '🏐',
    primary: '#B45309',       // warm amber
    primaryLight: '#FFFBEB',
    primaryDark: '#D97706',
    primaryHover: 'rgba(180, 83, 9, 0.15)',
  },
  all: {
    id: 'all',
    name: 'All Sports',
    icon: '🏆',
    primary: '#475569',
    primaryLight: '#F1F5F9',
    primaryDark: '#64748B',
    primaryHover: 'rgba(71, 85, 105, 0.12)',
  },
};

export function getSportTheme(sport: string): SportTheme {
  const key = (sport?.toLowerCase() || 'all') as SportId;
  return SPORT_THEMES[key] ?? SPORT_THEMES.all;
}

export function getSportIds(): SportId[] {
  return ['cricket', 'basketball', 'tennis', 'shuttle', 'football', 'kabaddi', 'volleyball'];
}
