export enum StudyMode {
  EXPLAIN = 'EXPLAIN',
  SUMMARIZE = 'SUMMARIZE',
  QUIZ = 'QUIZ'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  mode: StudyMode;
}
