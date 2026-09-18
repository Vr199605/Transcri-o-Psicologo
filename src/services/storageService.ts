import type { Patient, PsychologistProfile, SessionRecord } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'aurapsi_profile_v1',
  PATIENTS: 'aurapsi_patients_v1',
  SESSIONS: 'aurapsi_sessions_v1',
};

export const DEFAULT_PROFILE: PsychologistProfile = {
  name: 'Dra. Carolina Mendes',
  crp: 'CRP 06/158.420',
  title: 'Psicóloga Clínica • Especialista em Terapia Cognitivo-Comportamental',
  approach: 'Terapia Cognitivo-Comportamental (TCC) & Terapias de 3ª Onda',
  clinicName: 'Espaço Integrar de Psicologia & Saúde Mental',
  email: 'carolina.mendes@aurapsi.com.br',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1800 - Conjunto 142, São Paulo - SP',
  signatureText: 'Dra. Carolina Mendes • CRP 06/158.420',
  geminiApiKey: (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY || '',
  selectedModel: 'gemini-2.5-flash',
  themeColor: 'emerald',
};

export const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Mariana Duarte Silva',
    birthDate: '1992-05-14',
    phone: '(11) 97123-4567',
    notes: 'Acompanhamento focado em ansiedade generalizada e transição de carreira.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-2',
    name: 'Lucas Henrique de Almeida',
    birthDate: '1988-11-23',
    phone: '(11) 99876-1234',
    notes: 'Queixa de burnout profissional e sobrecarga familiar.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pat-3',
    name: 'Beatriz Vasconcelos',
    birthDate: '2001-08-30',
    phone: '(11) 98111-2233',
    notes: 'Fobia social e dificuldades em relações interpessoais acadêmicas.',
    createdAt: new Date().toISOString(),
  },
];

export const getProfile = (): PsychologistProfile => {
  try {
    const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY || '';
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE, geminiApiKey: envKey };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      geminiApiKey: parsed.geminiApiKey || envKey,
    };
  } catch (e) {
    console.error('Erro ao ler perfil do psicólogo:', e);
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: PsychologistProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Erro ao salvar perfil do psicólogo:', e);
  }
};

export const getPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!raw) {
      savePatients(DEFAULT_PATIENTS);
      return DEFAULT_PATIENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler pacientes:', e);
    return DEFAULT_PATIENTS;
  }
};

export const savePatients = (patients: Patient[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  } catch (e) {
    console.error('Erro ao salvar pacientes:', e);
  }
};

export const addPatient = (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: 'pat-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  savePatients([newPatient, ...patients]);
  return newPatient;
};

export const getSessions = (): SessionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler sessões:', e);
    return [];
  }
};

export const saveSessions = (sessions: SessionRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Erro ao salvar sessões:', e);
  }
};

export const saveSessionRecord = (record: SessionRecord): void => {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === record.id);
  if (index >= 0) {
    sessions[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    sessions.unshift(record);
  }
  saveSessions(sessions);
};

export const deleteSessionRecord = (id: string): void => {
  const sessions = getSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
};
