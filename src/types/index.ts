export type ThemeColor = 'emerald' | 'slate' | 'burgundy' | 'navy' | 'amber';

export type TheoreticalApproach = 'tcc' | 'psicanalise' | 'humanista' | 'sistemica';

export interface PsychologistProfile {
  name: string;
  crp: string;
  title: string;
  approach: string;
  defaultApproach: TheoreticalApproach;
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
  initialDemand?: string;
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
  // Campos específicos de abordagem
  conceitosAbordagem?: string[]; // ex: transferencias na psicanálise, distorções na TCC
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
  approach: TheoreticalApproach;
  anxietyScore?: number; // 1 a 10
  moodScore?: number; // 1 a 10
  rawTranscription: string;
  structuredNote: StructuredClinicalNote;
  audioDurationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export type CFPDocumentType = 'declaracao' | 'encaminhamento' | 'relatorio';

export interface CFPDocumentData {
  type: CFPDocumentType;
  patientName: string;
  date: string;
  timeStart?: string;
  timeEnd?: string;
  purpose?: string;
  destinationDoctor?: string;
  doctorSpecialty?: string;
  symptomsReported?: string;
  reasonForReferral?: string;
  demandDescription?: string;
  proceduresDescription?: string;
  clinicalAnalysis?: string;
  conclusion?: string;
}
