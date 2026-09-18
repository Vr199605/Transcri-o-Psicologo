import React, { useState } from 'react';
import { X, History, Calendar, Trash2, Eye, FileText } from 'lucide-react';
import type { SessionRecord } from '../types';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionRecord[];
  onSelectSession: (session: SessionRecord) => void;
  onDeleteSession: (id: string) => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(
    (s) =>
      s.patientName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.sessionDate.includes(filterQuery) ||
      s.structuredNote.demandaPrincipal.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Histórico de Sessões</h3>
              <p className="text-xs text-stone-500">
                {sessions.length} atendimentos registrados localmente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="p-4 border-b border-stone-100 bg-white">
          <input
            type="text"
            placeholder="Buscar por paciente, data ou queixa..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Lista de Sessões */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <FileText className="w-10 h-10 mx-auto mb-2 stroke-1 text-stone-300" />
              <p className="text-sm font-medium">Nenhum atendimento encontrado</p>
              <p className="text-xs text-stone-400 mt-1">
                Grave ou processe uma nova sessão para visualizá-la aqui.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">
                      {session.patientName}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                      Sessão #{session.sessionNumber}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {session.sessionType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {session.sessionDate} às {session.sessionTime || '14:00'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1 italic mt-1">
                    "{session.structuredNote.demandaPrincipal}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Abrir Prontuário</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente remover o registro de ${session.patientName}?`)) {
                        onDeleteSession(session.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Excluir do histórico local"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
