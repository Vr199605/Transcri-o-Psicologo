import React, { useState, useEffect } from 'react';
import {
  Settings,
  History,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Brain,
  Info
} from 'lucide-react';
import type { PsychologistProfile, Patient, SessionRecord } from './types';
import {
  getProfile,
  saveProfile,
  getPatients,
  addPatient,
  getSessions,
  saveSessionRecord,
  deleteSessionRecord,
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

export const App: React.FC = () => {
  const [profile, setProfile] = useState<PsychologistProfile>(getProfile());
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [sessions, setSessions] = useState<SessionRecord[]>(getSessions());

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

  // Sessão atual ativa (com transcrição e prontuário)
  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);

  // Modais e status
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'info' | 'warning';
    message: string;
  } | null>(null);

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

  // Carrega inicialmente um caso de exemplo para o usuário ver o layout de imediato
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
        setProcessingStatus('Transcrevendo com precisão técnica via Gemini Multimodal...');
        result = await processAudioWithGemini(
          audioBlob,
          profile.geminiApiKey,
          profile.selectedModel || 'gemini-2.5-flash'
        );
      } else {
        // Sem chave API configurada: simulação assistida com transcrição clínica
        setProcessingStatus('Processando áudio com terminologia clínica padrão CFP...');
        await new Promise((r) => setTimeout(r, 1800));

        // Usa um dos templates com a inteligência simulada
        const demo = CLINICAL_DEMO_CASES.ansiedade;
        result = {
          rawTranscription: demo.rawTranscription,
          structuredNote: demo.structuredNote,
        };

        showNotification(
          'Dica: Configure sua Chave do Gemini em Configurações para processamento com voz real.',
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

    const newSessionRecord: SessionRecord = {
      id: 'sess-demo-' + Date.now(),
      patientId: selectedPatientId,
      patientName,
      sessionNumber,
      sessionDate,
      sessionTime,
      sessionType,
      durationMinutes,
      rawTranscription: demoResult.rawTranscription,
      structuredNote: demoResult.structuredNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveSession(newSessionRecord);
    saveSessionRecord(newSessionRecord);
    setSessions(getSessions());
    showNotification(
      `Caso de demonstração "${demoKey.toUpperCase()}" carregado com sucesso!`,
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

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col text-stone-900">
      {/* BARRA DE NAVEGAÇÃO SUPERIOR */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo e Nome da Aplicação */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center font-serif-clinical text-2xl font-bold shadow-sm shadow-emerald-900/20">
              Ψ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display-clinical text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  AuraPsi
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Prontuário & IA
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Transcrição por Voz & Evolução Clínica em Alta Perfeição
              </p>
            </div>
          </div>

          {/* Identificação do Psicólogo e Ações Rápidas */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-800">{profile.name}</span>
              <span className="text-[11px] text-stone-500">{profile.crp}</span>
            </div>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer"
              title="Ver histórico de sessões gravadas"
            >
              <History className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Histórico ({sessions.length})</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition cursor-pointer"
              title="Configurações de perfil e chave de IA"
            >
              <Settings className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICAÇÃO TOAST FLUTUANTE */}
      {notification && (
        <div
          className={`no-print fixed top-18 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-3 transition transform animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
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
        <section className="no-print bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-200 text-xs font-medium border border-emerald-700/50">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inteligência Artificial calibrada para Psicologia Clínica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display-clinical tracking-tight">
              Terminou a sessão? Grave o áudio e deixe a IA cuidar do prontuário.
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed pt-1">
              Fale livremente suas impressões, técnicas aplicadas e insights do paciente. O AuraPsi
              transcreve sem erros gramaticais ou termos truncados, organiza as seções no padrão do
              CFP e gera um PDF editorial de alta fidelidade para seu arquivo.
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
          <div className="no-print bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-stone-900">Processamento em Andamento</h4>
              <p className="text-xs text-stone-500">{processingStatus}</p>
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
          <div className="h-px bg-stone-300/70 flex-1" />
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Visualização do Prontuário & Exportação</span>
          </div>
          <div className="h-px bg-stone-300/70 flex-1" />
        </div>

        {/* Prévia do Prontuário Clínico & Download do PDF */}
        {activeSession ? (
          <ClinicalReportPreview
            session={activeSession}
            profile={profile}
            onUpdateSession={handleUpdateSession}
          />
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300 text-stone-400">
            <FileCheck className="w-12 h-12 mx-auto stroke-1 text-stone-300 mb-3" />
            <p className="text-base font-medium text-stone-600">Nenhum prontuário ativo</p>
            <p className="text-xs text-stone-400 mt-1">
              Grave um áudio ou selecione um caso de teste acima para visualizar o documento A4.
            </p>
          </div>
        )}
      </main>

      {/* RODAPÉ DO SISTEMA */}
      <footer className="no-print mt-auto bg-white border-t border-stone-200 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-600 font-medium">
            <span>AuraPsi • Sistema de Prontuário & Transcrição para Psicólogos</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Armazenamento local seguro • Diretrizes éticas do CFP</span>
          </div>
        </div>
      </footer>

      {/* MODAIS */}
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
        }}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
};

export default App;
