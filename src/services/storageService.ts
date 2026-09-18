import type { Patient, PsychologistProfile, SessionRecord } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'aurapsi_profile_v1',
  PATIENTS: 'aurapsi_patients_v1',
  SESSIONS: 'aurapsi_sessions_v1',
  DARK_MODE: 'aurapsi_dark_mode_v1',
};

export const DEFAULT_PROFILE: PsychologistProfile = {
  name: 'Dra. Carolina Mendes',
  crp: 'CRP 06/158.420',
  title: 'Psicóloga Clínica • Especialista em Saúde Mental Integrada',
  approach: 'Terapia Cognitivo-Comportamental (TCC) & Terapias de 3ª Onda',
  defaultApproach: 'tcc',
  clinicName: 'Espaço Integrar de Psicologia & Saúde Mental',
  email: 'carolina.mendes@aurapsi.com.br',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1800 - Conjunto 142, São Paulo - SP',
  signatureText: 'Dra. Carolina Mendes • CRP 06/158.420',
  geminiApiKey: (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY || '',
  selectedModel: 'gemini-3.6-flash',
  themeColor: 'emerald',
};

export const DEFAULT_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Mariana Duarte Silva',
    birthDate: '1992-05-14',
    phone: '(11) 97123-4567',
    notes: 'Acompanhamento focado em ansiedade generalizada e transição de carreira.',
    initialDemand: 'Crises de ansiedade recorrentes com taquicardia e insônia.',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'pat-2',
    name: 'Lucas Henrique de Almeida',
    birthDate: '1988-11-23',
    phone: '(11) 99876-1234',
    notes: 'Queixa de burnout profissional e sobrecarga familiar.',
    initialDemand: 'Exaustão emocional no trabalho e anedonia.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'pat-3',
    name: 'Beatriz Vasconcelos',
    birthDate: '2001-08-30',
    phone: '(11) 98111-2233',
    notes: 'Insegurança afetiva vincular e dificuldades acadêmicas.',
    initialDemand: 'Ciúmes obsessivo e medo de abandono.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const DEFAULT_SESSIONS: SessionRecord[] = [
  {
    id: 'sess-mariana-8',
    patientId: 'pat-1',
    patientName: 'Mariana Duarte Silva',
    sessionNumber: 8,
    sessionDate: '2026-09-18',
    sessionTime: '14:00',
    sessionType: 'presencial',
    durationMinutes: 50,
    approach: 'tcc',
    anxietyScore: 3,
    moodScore: 8,
    rawTranscription:
      'Terminamos agora a 8ª sessão com a Mariana. Ela chegou muito mais tranquila, relatando que conseguiu apresentar o projeto na reunião sem entrar em pânico. Usou o RPD e a respiração diafragmática 4-7-8.',
    structuredNote: {
      demandaPrincipal: 'Avaliação da apresentação corporativa e consolidação da autonomia emocional.',
      estadoMentalHumor: 'Humor eutímico, afeto vívido e congruente, postura corporal relaxada.',
      temasAbordados: [
        'Apresentação de metas no trabalho com sucesso',
        'Uso autônomo do Registro de Pensamentos Disfuncionais',
        'Redução drástica de sintomas psicossomáticos',
      ],
      intervencoes: [
        'Reforço positivo de autoeficácia e autonomia',
        'Revisão de ganhos terapêuticos desde a primeira sessão',
        'Prevenção de recaídas em momentos de alta demanda',
      ],
      insightsPaciente:
        'Mariana percebeu que a ansiedade não a define e que pode tolerar o desconforto inicial sem catastrofizar.',
      tarefasAcordadas: [
        'Manter rotina matinal de respiração consciente',
        'Comemorar a conquista profissional com o parceiro',
      ],
      planejamentoProximaSessao: 'Iniciar espaçamento quinzenal dos atendimentos.',
      observacoesSigilosas: 'Evolução clínica exemplar. Alta planejada para os próximos meses.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sess-mariana-6',
    patientId: 'pat-1',
    patientName: 'Mariana Duarte Silva',
    sessionNumber: 6,
    sessionDate: '2026-09-04',
    sessionTime: '14:00',
    sessionType: 'presencial',
    durationMinutes: 50,
    approach: 'tcc',
    anxietyScore: 5,
    moodScore: 6,
    rawTranscription:
      'Sessão focada na relação com a liderança e início do questionamento socrático sobre perfeccionismo.',
    structuredNote: {
      demandaPrincipal: 'Insegurança perante reuniões de feedback com o gestor.',
      estadoMentalHumor: 'Leve inquietação psicomotora, discurso articulado e colaborativo.',
      temasAbordados: ['Distorção de filtro mental', 'Medo de errar perante a equipe'],
      intervencoes: ['Role-playing de comunicação assertiva', 'Exame das evidências'],
      insightsPaciente: 'Identificou que a autocrítica excessiva foi aprendida no ambiente escolar.',
      tarefasAcordadas: ['Escrever 3 qualidades profissionais reais antes da reunião'],
      planejamentoProximaSessao: 'Acompanhar a reação do gestor.',
    },
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'sess-mariana-3',
    patientId: 'pat-1',
    patientName: 'Mariana Duarte Silva',
    sessionNumber: 3,
    sessionDate: '2026-08-14',
    sessionTime: '14:00',
    sessionType: 'online',
    durationMinutes: 50,
    approach: 'tcc',
    anxietyScore: 7,
    moodScore: 5,
    rawTranscription:
      'Paciente com queixa de palpitações noturnas. Realizada psicoeducação sobre o sistema nervoso autônomo.',
    structuredNote: {
      demandaPrincipal: 'Sintomas somáticos de ansiedade e insônia inicial.',
      estadoMentalHumor: 'Humor ansioso, queixas frequentes de fadiga e hipervigilância.',
      temasAbordados: ['Ciclo do pânico', 'Higiene do sono e desconexão de telas'],
      intervencoes: ['Treino de respiração diafragmática', 'Psicoeducação sobre adrenalina'],
      insightsPaciente: 'Compreendeu que a taquicardia não significa infarto iminente.',
      tarefasAcordadas: ['Praticar respiração 2x ao dia', 'Desligar celular às 21h30'],
      planejamentoProximaSessao: 'Introduzir o diário de pensamentos.',
    },
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'sess-mariana-1',
    patientId: 'pat-1',
    patientName: 'Mariana Duarte Silva',
    sessionNumber: 1,
    sessionDate: '2026-07-25',
    sessionTime: '14:00',
    sessionType: 'presencial',
    durationMinutes: 50,
    approach: 'tcc',
    anxietyScore: 9,
    moodScore: 4,
    rawTranscription:
      'Primeira sessão de anamnese. Paciente relata histórico de 6 meses de ansiedade aguda após mudança de cargo.',
    structuredNote: {
      demandaPrincipal: 'Crises de pânico no trabalho e choro fácil.',
      estadoMentalHumor: 'Choro catártico frequente, inquietação, queixa de desamparo.',
      temasAbordados: ['Histórico de vida', 'Início dos sintomas ansiosos', 'Metas terapêuticas'],
      intervencoes: ['Acolhimento empático', 'Aliança terapêutica', 'Contrato de trabalho'],
      insightsPaciente: 'Alívio por poder falar sem julgamentos.',
      tarefasAcordadas: ['Registro simples de momentos de crise na semana'],
      planejamentoProximaSessao: 'Mapear crenças intermediárias.',
    },
    createdAt: new Date(Date.now() - 55 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 55 * 86400000).toISOString(),
  },
];

export const getProfile = (): PsychologistProfile => {
  try {
    const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY || '';
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE, geminiApiKey: envKey };
    const parsed = JSON.parse(raw);
    const selectedModel =
      parsed.selectedModel === 'gemini-2.5-flash' || !parsed.selectedModel
        ? 'gemini-3.6-flash'
        : parsed.selectedModel;

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      selectedModel,
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
    if (!raw) {
      saveSessions(DEFAULT_SESSIONS);
      return DEFAULT_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler sessões:', e);
    return DEFAULT_SESSIONS;
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

export const getDarkMode = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
  } catch {
    return false;
  }
};

export const saveDarkMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Erro ao salvar modo escuro:', e);
  }
};
