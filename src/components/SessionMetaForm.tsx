import React from 'react';
import { User, Video, MapPin, UserPlus, Compass } from 'lucide-react';
import type { Patient, TheoreticalApproach } from '../types';

interface SessionMetaFormProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  sessionNumber: number;
  onChangeSessionNumber: (num: number) => void;
  sessionDate: string;
  onChangeSessionDate: (date: string) => void;
  sessionTime: string;
  onChangeSessionTime: (time: string) => void;
  sessionType: 'presencial' | 'online';
  onChangeSessionType: (type: 'presencial' | 'online') => void;
  durationMinutes: number;
  onChangeDuration: (mins: number) => void;
  approach: TheoreticalApproach;
  onChangeApproach: (app: TheoreticalApproach) => void;
  onOpenNewPatientModal: () => void;
}

export const SessionMetaForm: React.FC<SessionMetaFormProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  sessionNumber,
  onChangeSessionNumber,
  sessionDate,
  onChangeSessionDate,
  sessionTime,
  onChangeSessionTime,
  sessionType,
  onChangeSessionType,
  durationMinutes,
  onChangeDuration,
  approach,
  onChangeApproach,
  onOpenNewPatientModal,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-slate-800 p-5 mb-6 transition-colors">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Dados da Sessão & Paciente
        </h3>
        <button
          onClick={onOpenNewPatientModal}
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Seleção do Paciente */}
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1.5">
            Paciente Atendido(a)
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Abordagem Teórica da IA */}
        <div className="lg:col-span-1">
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Abordagem CFP
          </label>
          <select
            value={approach}
            onChange={(e) => onChangeApproach(e.target.value as TheoreticalApproach)}
            className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="tcc">TCC (Cognitivo-Comportamental)</option>
            <option value="psicanalise">Psicanálise Clínica</option>
            <option value="humanista">Humanista / Fenomenológica</option>
            <option value="sistemica">Terapia Sistêmica Familiar</option>
          </select>
        </div>

        {/* Data & Horário da Sessão */}
        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1.5">
            Data & Horário
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => onChangeSessionDate(e.target.value)}
              className="flex-1 px-2.5 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-xs text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => onChangeSessionTime(e.target.value)}
              className="w-20 px-2 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-xs text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              title="Horário do início da sessão"
            />
          </div>
        </div>

        {/* Número da Sessão e Duração */}
        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1.5">
            Sessão Nº / Duração
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={sessionNumber}
              onChange={(e) => onChangeSessionNumber(parseInt(e.target.value, 10) || 1)}
              className="w-20 px-3 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-center font-bold text-stone-800 dark:text-stone-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
              title="Número da sessão"
            />
            <select
              value={durationMinutes}
              onChange={(e) => onChangeDuration(parseInt(e.target.value, 10) || 50)}
              className="flex-1 px-2 py-2 bg-stone-50 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-100"
            >
              <option value={45}>45 min</option>
              <option value={50}>50 min</option>
              <option value={60}>60 min</option>
              <option value={80}>80 min</option>
            </select>
          </div>
        </div>

        {/* Modalidade (Presencial vs Online) */}
        <div>
          <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1.5">
            Modalidade
          </label>
          <div className="flex bg-stone-100 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onChangeSessionType('presencial')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                sessionType === 'presencial'
                  ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Presencial</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeSessionType('online')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                sessionType === 'online'
                  ? 'bg-white dark:bg-slate-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Video className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Online</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
