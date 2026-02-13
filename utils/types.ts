
export interface HomeworkAnalysis {
  subject: string;
  topic: string;
  explanation: string;
  keyPoints: string[];
  visualPrompt: string;
  videoPrompt: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
  resultUrl: string | null;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  VISUALIZE = 'VISUALIZE',
  LIVE_TUTOR = 'LIVE_TUTOR'
}

declare global {
  interface Window {
    // Relying on the globally defined AIStudio type to avoid conflicts
    aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
