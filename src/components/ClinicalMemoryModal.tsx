import React, { useState, useEffect } from 'react';
import type { Patient, SessionRecord } from '../types';
import { generateClinicalMemorySummary } from '../services/aiService';
import { BrainCircuit, Sparkles, Copy, Check, RefreshCw, X, FileText, AlertCircle } from 'lucide-react';

interface ClinicalMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  sessions: SessionRecord[];
  apiKey?: string;
  selectedPatientId?: string;
}

export const ClinicalMemoryModal: React.FC<ClinicalMemoryModalProps> = ({
  isOpen,
  onClose,
  patients,
  sessions,
  apiKey,
  selectedPatientId,
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || (patients[0]?.id ?? '')
  );
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const activePatient = patients.find((p) => p.id === activePatientId);
  const patientSessions = sessions.filter((s) => s.patientId === activePatientId);

  const loadMemory = async (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    const targetSessions = sessions.filter((s) => s.patientId === patientId);

    setLoading(true);
    setError(null);
    try {
      const res = await generateClinicalMemorySummary(patient.name, targetSessions, apiKey);
      setSummary(res);
    } catch (err) {
      console.error(err);
      setError('Não foi possível sintetizar a memória clínica no momento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activePatientId) {
      loadMemory(activePatientId);
    }
  }, [isOpen, activePatientId]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                Memória Clínica & Briefing Pré-Sessão
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> IA Aura
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumo executivo de 1 minuto para ler antes do paciente entrar no consultório
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paciente:
            </label>
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMemory(activePatientId)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Recalcular
            </button>
            <button
              onClick={handleCopy}
              disabled={!summary || loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>
              Base de conhecimento:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {patientSessions.length} atendimento(s)
              </strong>{' '}
              analisados para {activePatient?.name || 'este paciente'}.
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Analisando prontuários e extraindo memórias clínicas...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cruzando queixas recentes, acordos pendentes e evolução de sintomas.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Erro ao consultar memória</div>
                <div>{error}</div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans text-[13.5px]">
                {summary}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Sigilo garantido: os dados são processados pontualmente e armazenados localmente.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
