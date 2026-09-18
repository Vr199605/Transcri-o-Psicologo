export type ThemeColor = 'emerald' | 'slate' | 'burgundy' | 'navy' | 'amber';

export interface PsychologistProfile {
  name: string;
  crp: string;
  title: string;
  approach: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  signatureText: string;
  geminiApiKey: string;
  selectedModel: string;
  themeColor: ThemeColor;
}

export interface Patient {
  id: string;
  name: string;
  birthDate?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface StructuredClinicalNote {
  demandaPrincipal: string;
  estadoMentalHumor: string;
  temasAbordados: string[];
  intervencoes: string[];
  insightsPaciente: string;
  tarefasAcordadas: string[];
  planejamentoProximaSessao: string;
  observacoesSigilosas?: string;
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName: string;
  sessionNumber: number;
  sessionDate: string;
  sessionTime: string;
  sessionType: 'presencial' | 'online';
  durationMinutes: number;
  rawTranscription: string;
  structuredNote: StructuredClinicalNote;
  audioDurationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}
