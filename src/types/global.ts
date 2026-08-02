export type ModuleCategory = 'dashboard' | 'electromagnetismo' | 'resistencia' | 'numericos' | 'termodinamica' | 'fluidos';

export interface CourseModuleInfo {
  id: ModuleCategory;
  code: string;
  name: string;
  shortDesc: string;
  icon: string;
  color: string; // Tailwind color string, e.g. "from-amber-500 to-yellow-600"
  badge: string;
  toolsCount: number;
  available: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  gridSnap: boolean;
}
