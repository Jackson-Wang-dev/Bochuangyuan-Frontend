export interface PersonalityData {
  subject: string;
  value: number;
  fullMark: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'certificate' | 'award' | 'milestone';
  icon: string;
}

export interface BusinessPlan {
  id: string;
  title: string;
  lastModified: string;
  previewText: string;
  isLinked?: boolean;
}

export interface GrowthDataPoint {
  date: string;
  technical: number;
  market: number;
  health: number;
  aiAdoption: number;
  riskControl: number;
}

export interface Project {
  id: string;
  name: string;
  competition: string;
  deadline: string;
  status: 'pending' | 'reviewing' | 'completed';
  bpLink: string;
  remainingDays?: number;
}
