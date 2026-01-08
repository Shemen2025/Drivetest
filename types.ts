
export type Category = 
  | 'Alertness' 
  | 'Attitude' 
  | 'Safety and Your Vehicle' 
  | 'Safety Margins' 
  | 'Hazard Awareness' 
  | 'Vulnerable Road Users' 
  | 'Other Types of Vehicle' 
  | 'Vehicle Handling' 
  | 'Motorway Rules' 
  | 'Rules of the Road' 
  | 'Road and Traffic Signs' 
  | 'Essential Documents' 
  | 'Incidents, Accidents and Emergencies' 
  | 'Vehicle Loading';

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  imageUrl?: string;
}

export interface UserProgress {
  totalQuestionsAttempted: number;
  correctAnswers: number;
  categoryScores: Record<string, number>;
  testHistory: TestResult[];
}

export interface TestResult {
  date: string;
  score: number;
  total: number;
  passed: boolean;
  timeTaken: number; // in seconds
}

export enum AppMode {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  MOCK_TEST = 'MOCK_TEST',
  REVIEW = 'REVIEW',
  DASHBOARD = 'DASHBOARD'
}
