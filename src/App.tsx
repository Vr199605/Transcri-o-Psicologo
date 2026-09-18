import React, { useState, useEffect } from 'react';
import {
  Settings,
  History,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Brain,
  Info,
  Moon,
  Sun,
  Activity,
  BrainCircuit,
  FileText,
  HardDrive,
} from 'lucide-react';
import type {
  PsychologistProfile,
  Patient,
  SessionRecord,
  TheoreticalApproach,
} from './types';
import {
  getProfile,
  saveProfile,
  getPatients,
  addPatient,
  getSessions,
  saveSessionRecord,
  deleteSessionRecord,
  getDarkMode,
  saveDarkMode,
} from './services/storageService';
import {
  processAudioWithGemini,
  CLINICAL_DEMO_CASES,
} from './services/aiService';
import type { AIProcessingResult } from './services/aiService';
import { AudioRecorder } from './components/AudioRecorder';
import { SessionMetaForm } from './components/SessionMetaForm';
import { ClinicalReportPreview } from './components/ClinicalReportPreview';
import { SettingsModal } from './components/SettingsModal';
import { PatientModal } from './components/PatientModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { CFPDocumentsModal } from './components/CFPDocumentsModal';
import { PatientEvolutionView } from './components/PatientEvolutionView';
import { ClinicalMemoryModal } from './components/ClinicalMemoryModal';
import { BackupModal } from './components/BackupModal';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PsychologistProfile>(getProfile());
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [sessions, setSessions] = useState<SessionRecord[]>(getSessions());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getDarkMode());

  // Estado da sessão em criação
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || 'pat-1'
  );
  const [sessionNumber, setSessionNumber] = useState<number>(8);
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionTime, setSessionTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [sessionType, setSessionType] = useState<'presencial' | 'online'>('presencial');
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [sessionApproach, setSessionApproach] = useState<TheoreticalApproach>(
    profile.defaultApproach || 'tcc'
  );

  // Sessão atual ativa (com transcrição e prontuário)
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);

  // Modais e status
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCFPDocsOpen, setIsCFPDocsOpen] = useState(false);
  const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

  // Gerenciamento de Tema Escuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Atualiza número da sessão com base no histórico do paciente selecionado
  useEffect(() => {
    const patientSessions = sessions.filter((s) => s.patientId === selectedPatientId);
    if (patientSessions.length > 0) {
      const maxNumber = Math.max(...patientSessions.map((s) => s.sessionNumber));
      setSessionNumber(maxNumber + 1);
    } else {
      setSessionNumber(1);
    }
  }, [selectedPatientId, sessions]);

  // Carrega inicialmente a última sessão ou um caso de exemplo
  useEffect(() => {
    if (!activeSession && sessions.length === 0) {
      const initialPatient = patients[0] || { id: 'pat-1', name: 'Mariana Duarte Silva' };
      const demo = CLINICAL_DEMO_CASES.ansiedade;
      const initialSession: SessionRecord = {
        id: 'sess-demo-initial',
        patientId: initialPatient.id,
        patientName: initialPatient.name,
        sessionNumber: 8,
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: '14:00',
        sessionType: 'presencial',
        durationMinutes: 50,
        approach: 'tcc',
        anxietyScore: demo.anxietyScore,
        moodScore: demo.moodScore,
        rawTranscription: demo.rawTranscription,
        structuredNote: demo.structuredNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveSession(initialSession);
    } else if (!activeSession && sessions.length > 0) {
      setActiveSession(sessions[0]);
    }
  }, []);

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'info'
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveProfile = (newProfile: PsychologistProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
    if (newProfile.defaultApproach) {
      setSessionApproach(newProfile.defaultApproach);
    }
    showNotification('Configurações profissionais atualizadas com sucesso!', 'success');
  };

  const handleAddPatient = (newPatientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const created = addPatient(newPatientData);
    const updatedPatients = getPatients();
    setPatients(updatedPatients);
    setSelectedPatientId(created.id);
    showNotification(`Paciente ${created.name} cadastrado com sucesso!`, 'success');
  };

  const handleAudioReady = async (audioBlob: Blob, duration: number) => {
    const currentPatient = patients.find((p) => p.id === selectedPatientId);
    const patientName = currentPatient ? currentPatient.name : 'Paciente';

    setIsProcessing(true);
    setProcessingStatus('Enviando áudio para processamento com Inteligência Artificial...');

    try {
      let result: AIProcessingResult;

      if (profile.geminiApiKey && profile.geminiApiKey.trim() !== '') {
        setProcessingStatus(`Transcrevendo e calibrando para ${sessionApproach.toUpperCase()}...`);
        result = await processAudioWithGemini(
          audioBlob,
          profile.geminiApiKey,
          profile.selectedModel || 'gemini-3.6-flash',
          sessionApproach,
          (status) => setProcessingStatus(status)
        );
      } else {
        // Sem chave API configurada: simulação assistida com transcrição clínica
        setProcessingStatus(`Processando áudio na abordagem ${sessionApproach.toUpperCase()}...`);
        await new Promise((r) => setTimeout(r, 1600));

        const demoKey =
          sessionApproach === 'psicanalise'
            ? 'psicanalise'
            : sessionApproach === 'humanista'
            ? 'humanista'
            : sessionApproach === 'sistemica'
            ? 'sistemica'
            : 'ansiedade';

        const demo = CLINICAL_DEMO_CASES[demoKey];
        result = {
          rawTranscription: demo.rawTranscription,
          structuredNote: demo.structuredNote,
          anxietyScore: demo.anxietyScore,
          moodScore: demo.moodScore,
        };

        showNotification(
          'Dica: Adicione sua Chave do Gemini em Configurações para processar sua voz real.',
          'info'
        );
      }

      const newSessionRecord: SessionRecord = {
        id: 'sess-' + Date.now(),
        patientId: selectedPatientId,
        patientName,
        sessionNumber,
        sessionDate,
        sessionTime,
        sessionType,
        durationMinutes,
        approach: sessionApproach,
        anxietyScore: result.anxietyScore ?? 5,
        moodScore: result.moodScore ?? 6,
        rawTranscription: result.rawTranscription,
        structuredNote: result.structuredNote,
        audioDurationSeconds: duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveSessionRecord(newSessionRecord);
      setSessions(getSessions());
      setActiveSession(newSessionRecord);

      showNotification('Áudio transcrito e prontuário gerado com sucesso!', 'success');

      // Rola suavemente até o prontuário
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 300);
    } catch (err) {
      console.error('Erro no processamento do áudio:', err);
      showNotification(
        `Falha ao transcrever: ${(err as Error).message}. Verifique sua chave de API nas Configurações.`,
        'warning'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleSelectDemoCase = (demoKey: string, demoResult: AIProcessingResult) => {
    const currentPatient = patients.find((p) => p.id === selectedPatientId);
    const patientName = currentPatient ? currentPatient.name : 'Mariana Duarte Silva';

    const approach: TheoreticalApproach =
      demoKey === 'psicanalise'
        ? 'psicanalise'
        : demoKey === 'humanista'
        ? 'humanista'
        : demoKey === 'sistemica'
        ? 'sistemica'
        : 'tcc';

    setSessionApproach(approach);

    const newSessionRecord: SessionRecord = {
      id: 'sess-demo-' + Date.now(),
      patientId: selectedPatientId,
      patientName,
      sessionNumber,
      sessionDate,
      sessionTime,
      sessionType,
      durationMinutes,
      approach,
      anxietyScore: demoResult.anxietyScore ?? 5,
      moodScore: demoResult.moodScore ?? 6,
      rawTranscription: demoResult.rawTranscription,
      structuredNote: demoResult.structuredNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveSession(newSessionRecord);
    saveSessionRecord(newSessionRecord);
    setSessions(getSessions());
    showNotification(
      `Caso de demonstração "${approach.toUpperCase()}" carregado com sucesso!`,
      'success'
    );

    setTimeout(() => {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 200);
  };

  const handleUpdateSession = (updated: SessionRecord) => {
    saveSessionRecord(updated);
    setActiveSession(updated);
    setSessions(getSessions());
    showNotification('Alterações salvas no prontuário local!', 'success');
  };

  const handleDeleteSession = (id: string) => {
    deleteSessionRecord(id);
    const updated = getSessions();
    setSessions(updated);
    if (activeSession?.id === id) {
      setActiveSession(updated[0] || null);
    }
    showNotification('Registro removido do histórico.', 'info');
  };

  const handleDataRestored = () => {
    setProfile(getProfile());
    const pts = getPatients();
    setPatients(pts);
    const sess = getSessions();
    setSessions(sess);
    if (sess.length > 0) {
      setActiveSession(sess[0]);
    }
    showNotification('Dados e prontuários restaurados com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-slate-950 flex flex-col text-stone-900 dark:text-slate-100 transition-colors duration-200">
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <header className="no-print sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo e Nome da Aplicação */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-serif-clinical text-2xl font-bold shadow-sm shadow-emerald-900/20">
              Ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display-clinical text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
                  AuraPsi
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  CFP & IA
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:block">
                Transcrição por Voz & Evolução Clínica em Alta Perfeição
              </p>
            </div>
          </div>

          {/* Ferramentas de Produtividade Clínica */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {/* Memória Clínica */}
            <button
              onClick={() => setIsMemoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl transition cursor-pointer"
              title="Briefing pré-sessão de 1 minuto"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Memória Clínica</span>
            </button>

            {/* Linha do Tempo & Evolução */}
            <button
              onClick={() => setIsEvolutionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl transition cursor-pointer"
              title="Gráficos de ansiedade/humor e linha do tempo"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Evolução & Gráficos</span>
            </button>

            {/* Documentos CFP */}
            <button
              onClick={() => setIsCFPDocsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60 rounded-xl transition cursor-pointer"
              title="Declarações, Encaminhamentos e Relatórios Res. CFP 06/2019"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Docs CFP</span>
            </button>

            {/* Histórico */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-slate-200 bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 border border-stone-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
              title="Ver histórico de sessões gravadas"
            >
              <History className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Histórico ({sessions.length})</span>
            </button>

            {/* Backup & Nuvem */}
            <button
              onClick={() => setIsBackupOpen(true)}
              className="p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
              title="Backup, Restauração e Google Drive"
            >
              <HardDrive className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
              title={isDarkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Configurações */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl transition cursor-pointer"
              title="Configurações de perfil e chave de IA"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICAÇÃO TOAST FLUTUANTE */}
      {notification && (
        <div
          className={`no-print fixed top-18 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-3 transition transform animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              : 'bg-stone-900 text-white border-stone-800'
          }`}
        >
          {notification.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          {notification.type === 'warning' && (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          {notification.type === 'info' && (
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        {/* Banner de Boas-Vindas Terapêutico */}
        <section className="no-print bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-medium border border-emerald-700/50">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inteligência Artificial calibrada para Psicologia Clínica & CFP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display-clinical tracking-tight">
              Terminou a sessão? Grave o áudio e deixe a IA cuidar do prontuário.
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed pt-1">
              Fale livremente suas impressões, técnicas e comandos de voz ("Anotação sigilosa: ...", "Combinado: ...").
              O AuraPsi transcreve sem vícios de fala, ajusta ao seu referencial teórico (TCC, Psicanálise, Humanista ou Sistêmica)
              e formata em PDF editorial de alta precisão.
            </p>
          </div>

          <div
            className="absolute right-6 -bottom-8 opacity-10 text-[200px] font-serif-clinical pointer-events-none select-none"
            aria-hidden="true"
          >
            Ψ
          </div>
        </section>

        {/* Status de Processamento em Andamento */}
        {isProcessing && (
          <div className="no-print bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-sm flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Processamento em Andamento
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">{processingStatus}</p>
            </div>
          </div>
        )}

        {/* Formulário de Dados da Sessão */}
        <div className="no-print">
          <SessionMetaForm
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            sessionNumber={sessionNumber}
            onChangeSessionNumber={setSessionNumber}
            sessionDate={sessionDate}
            onChangeSessionDate={setSessionDate}
            sessionTime={sessionTime}
            onChangeSessionTime={setSessionTime}
            sessionType={sessionType}
            onChangeSessionType={setSessionType}
            durationMinutes={durationMinutes}
            onChangeDuration={setDurationMinutes}
            approach={sessionApproach}
            onChangeApproach={setSessionApproach}
            onOpenNewPatientModal={() => setIsNewPatientOpen(true)}
          />
        </div>

        {/* Gravador de Áudio & Visualizador */}
        <div className="no-print">
          <AudioRecorder
            onAudioReady={handleAudioReady}
            onSelectDemoCase={handleSelectDemoCase}
            isProcessing={isProcessing}
          />
        </div>

        {/* Divisor Elegante */}
        <div className="no-print flex items-center gap-4 my-8">
          <div className="h-px bg-stone-300/70 dark:bg-slate-800 flex-1" />
          <div className="flex items-center gap-2 text-stone-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Visualização do Prontuário & Exportação Editorial</span>
          </div>
          <div className="h-px bg-stone-300/70 dark:bg-slate-800 flex-1" />
        </div>

        {/* Prévia do Prontuário Clínico & Download do PDF */}
        {activeSession ? (
          <ClinicalReportPreview
            session={activeSession}
            profile={profile}
            onUpdateSession={handleUpdateSession}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-stone-300 dark:border-slate-800 text-stone-400">
            <FileCheck className="w-12 h-12 mx-auto stroke-1 text-stone-300 dark:text-slate-700 mb-3" />
            <p className="text-base font-medium text-stone-600 dark:text-slate-300">
              Nenhum prontuário ativo
            </p>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">
              Grave um áudio ou selecione um caso de teste acima para visualizar o documento A4.
            </p>
          </div>
        )}
      </main>

      {/* RODAPÉ DO SISTEMA */}
      <footer className="no-print mt-auto bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-stone-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-600 dark:text-slate-300 font-medium">
            <span>AuraPsi • Sistema de Prontuário & Transcrição Clínica para Psicólogos</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400 dark:text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Armazenamento local seguro • Resoluções CFP nº 01/2009 e 06/2019</span>
          </div>
        </div>
      </footer>

      {/* MODAIS DO SISTEMA */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <PatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={(s) => {
          setActiveSession(s);
          setSelectedPatientId(s.patientId);
          setSessionNumber(s.sessionNumber);
          setSessionDate(s.sessionDate);
          if (s.approach) setSessionApproach(s.approach);
        }}
        onDeleteSession={handleDeleteSession}
      />

      <CFPDocumentsModal
        isOpen={isCFPDocsOpen}
        onClose={() => setIsCFPDocsOpen(false)}
        profile={profile}
        patients={patients}
        sessions={sessions}
        selectedPatientId={selectedPatientId}
      />

      <PatientEvolutionView
        isOpen={isEvolutionOpen}
        onClose={() => setIsEvolutionOpen(false)}
        patients={patients}
        sessions={sessions}
        selectedPatientId={selectedPatientId}
        onSelectSession={(s) => {
          setActiveSession(s);
          setSelectedPatientId(s.patientId);
          setSessionNumber(s.sessionNumber);
          setSessionDate(s.sessionDate);
          if (s.approach) setSessionApproach(s.approach);
        }}
      />

      <ClinicalMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        patients={patients}
        sessions={sessions}
        apiKey={profile.geminiApiKey}
        selectedPatientId={selectedPatientId}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        profile={profile}
        patients={patients}
        sessions={sessions}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
};

export default App;
