export interface QuizItem {
  question: string;
  answer: string;
  category: 'Geral' | 'Rotina' | 'SOVI' | 'Segurança' | 'Visibilidade' | 'Institucional';
}

export interface SoviTarget {
  name: string;
  value: number;
  fill: string;
}

export interface BrandSovi {
  brand: string;
  target: string;
}

export interface ModuleProps {
  onComplete?: () => void;
}

export enum AppScreen {
  HOME = 'HOME',
  SAFETY = 'SAFETY',
  ROUTINE = 'ROUTINE',
  SCORING = 'SCORING',
  SOVI = 'SOVI',
  VISIBILITY = 'VISIBILITY',
  AUDIT_QUIZ = 'AUDIT_QUIZ',
  COMPANY = 'COMPANY'
}