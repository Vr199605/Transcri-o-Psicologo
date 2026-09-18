import React, { useState, useMemo } from 'react';
import type { Patient, SessionRecord } from '../types';
import { LineChart, Calendar, TrendingDown, TrendingUp, Sparkles, X, Activity } from 'lucide-react';

interface PatientEvolutionViewProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  sessions: SessionRecord[];
  selectedPatientId?: string;
  onSelectSession?: (session: SessionRecord) => void;
}

export const PatientEvolutionView: React.FC<PatientEvolutionViewProps> = ({
  isOpen,
  onClose,
  patients,
  sessions,
  selectedPatientId,
  onSelectSession,
}) => {
  const [activePatientId, setActivePatientId] = useState<string>(
    selectedPatientId || (patients[0]?.id ?? '')
  );

  // Filter and sort sessions for this patient chronologically (oldest to newest for charting)
  const patientSessions = useMemo(() => {
    return sessions
      .filter((s) => s.patientId === activePatientId)
      .sort((a, b) => {
        if (a.sessionNumber !== b.sessionNumber) {
          return a.sessionNumber - b.sessionNumber;
        }
        return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
      });
  }, [sessions, activePatientId]);

  // Scores progression
  const scoredSessions = patientSessions.filter(
    (s) => s.anxietyScore !== undefined || s.moodScore !== undefined
  );

  const firstSession = scoredSessions[0];
  const lastSession = scoredSessions[scoredSessions.length - 1];

  const anxietyDelta =
    firstSession?.anxietyScore !== undefined && lastSession?.anxietyScore !== undefined
      ? lastSession.anxietyScore - firstSession.anxietyScore
      : null;

  const moodDelta =
    firstSession?.moodScore !== undefined && lastSession?.moodScore !== undefined
      ? lastSession.moodScore - firstSession.moodScore
      : null;

  if (!isOpen) return null;

  // Chart coordinates calculation (SVG)
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Generate points for anxiety and mood
  const pointsCount = scoredSessions.length;
  const getX = (index: number) => {
    if (pointsCount <= 1) return chartWidth / 2;
    return paddingX + (index / (pointsCount - 1)) * usableWidth;
  };

  const getY = (score: number) => {
    // Score 1 to 10. 10 is top (paddingY), 1 is bottom (chartHeight - paddingY)
    const normalized = (score - 1) / 9; // 0 to 1
    return chartHeight - paddingY - normalized * usableHeight;
  };

  const anxietyPath = scoredSessions
    .map((s, idx) => {
      if (s.anxietyScore === undefined) return null;
      const x = getX(idx);
      const y = getY(s.anxietyScore);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .filter(Boolean)
    .join(' ');

  const moodPath = scoredSessions
    .map((s, idx) => {
      if (s.moodScore === undefined) return null;
      const x = getX(idx);
      const y = getY(s.moodScore);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .filter(Boolean)
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                Linha do Tempo & Evolução Clínica
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
                  CFP Compliant
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhamento longitudinal de sintomas, intervenções e marcos terapêuticos
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

        {/* Patient Selection & Summary Banner */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paciente:
            </label>
            <select
              value={activePatientId}
              onChange={(e) => setActivePatientId(e.target.value)}
              className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics */}
          {scoredSessions.length >= 2 && anxietyDelta !== null && moodDelta !== null && (
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  anxietyDelta <= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>
                  Ansiedade:{' '}
                  {anxietyDelta > 0 ? `+${anxietyDelta}` : `${anxietyDelta}`}{' '}
                  pts ({firstSession.anxietyScore} → {lastSession.anxietyScore})
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  moodDelta >= 0
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  Humor:{' '}
                  {moodDelta > 0 ? `+${moodDelta}` : `${moodDelta}`}{' '}
                  pts ({firstSession.moodScore} → {lastSession.moodScore})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Chart Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Curva de Sintomas & Bem-Estar (Escala 1 a 10)
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Nível de Ansiedade
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Humor / Bem-Estar
                </span>
              </div>
            </div>

            {scoredSessions.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48 select-none"
                >
                  {/* Grid Lines */}
                  {[1, 3, 5, 7, 10].map((level) => {
                    const y = getY(level);
                    return (
                      <g key={level}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="currentColor"
                          strokeDasharray="4 4"
                          className="text-slate-200 dark:text-slate-700"
                        />
                        <text
                          x={paddingX - 12}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] fill-slate-400 dark:fill-slate-500 font-mono"
                        >
                          {level}
                        </text>
                      </g>
                    );
                  })}

                  {/* Anxiety Line */}
                  {anxietyPath && (
                    <path
                      d={anxietyPath}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Mood Line */}
                  {moodPath && (
                    <path
                      d={moodPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Nodes & Tooltips */}
                  {scoredSessions.map((s, idx) => {
                    const x = getX(idx);
                    const anxY = s.anxietyScore !== undefined ? getY(s.anxietyScore) : null;
                    const moodY = s.moodScore !== undefined ? getY(s.moodScore) : null;

                    return (
                      <g key={s.id}>
                        {/* Vertical session guide line */}
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={chartHeight - paddingY}
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-slate-100 dark:text-slate-800"
                        />

                        {/* Anxiety point */}
                        {anxY !== null && (
                          <circle
                            cx={x}
                            cy={anxY}
                            r="5"
                            className="fill-white stroke-rose-500 stroke-[3] transition-transform hover:scale-125"
                          />
                        )}

                        {/* Mood point */}
                        {moodY !== null && (
                          <circle
                            cx={x}
                            cy={moodY}
                            r="5"
                            className="fill-white stroke-emerald-500 stroke-[3] transition-transform hover:scale-125"
                          />
                        )}

                        {/* X-Axis Session Label */}
                        <text
                          x={x}
                          y={chartHeight - paddingY + 16}
                          textAnchor="middle"
                          className="text-[10px] fill-slate-500 dark:fill-slate-400 font-semibold"
                        >
                          S{s.sessionNumber}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Ainda não há pontuações de ansiedade/humor cadastradas para este paciente. Ao registrar
                novas sessões com a IA, as métricas serão traçadas aqui automaticamente.
              </div>
            )}
          </div>

          {/* Chronological Timeline */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Marcos & Registro Longitudinal das Sessões ({patientSessions.length})
            </h4>

            {patientSessions.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-sm">
                Nenhuma sessão registrada para este paciente ainda.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {patientSessions
                  .slice()
                  .reverse()
                  .map((session) => (
                    <div
                      key={session.id}
                      className="relative bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
                      onClick={() => {
                        if (onSelectSession) {
                          onSelectSession(session);
                          onClose();
                        }
                      }}
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-[27px] top-6 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></span>

                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                            Sessão #{session.sessionNumber}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {new Date(session.sessionDate).toLocaleDateString('pt-BR')} •{' '}
                            {session.sessionTime} ({session.durationMinutes} min)
                          </span>
                          <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            {session.approach}
                          </span>
                        </div>

                        {/* Session Score Badges */}
                        <div className="flex items-center gap-2">
                          {session.anxietyScore !== undefined && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-medium">
                              Ansiedade: {session.anxietyScore}/10
                            </span>
                          )}
                          {session.moodScore !== undefined && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
                              Humor: {session.moodScore}/10
                            </span>
                          )}
                        </div>
                      </div>

                      <h5 className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {session.structuredNote?.demandaPrincipal || 'Atendimento Clínico Regular'}
                      </h5>

                      {session.structuredNote?.insightsPaciente && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              Insight / Conquista:{' '}
                            </span>
                            {session.structuredNote.insightsPaciente}
                          </div>
                        </div>
                      )}

                      {session.structuredNote?.intervencoes &&
                        session.structuredNote.intervencoes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {session.structuredNote.intervencoes.map((itv, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                              >
                                {itv}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/60 dark:bg-slate-800/40">
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
