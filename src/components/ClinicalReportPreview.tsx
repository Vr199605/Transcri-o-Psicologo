import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Activity,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PsychologistProfile, SessionRecord, ThemeColor } from '../types';
import { exportElementToPdf, printDocumentDirectly } from '../services/pdfService';

interface ClinicalReportPreviewProps {
  session: SessionRecord;
  profile: PsychologistProfile;
  onUpdateSession: (updated: SessionRecord) => void;
}

const THEME_STYLES: Record<
  ThemeColor,
  {
    primary: string;
    primaryLight: string;
    border: string;
    badge: string;
    accent: string;
    headerBg: string;
  }
> = {
  emerald: {
    primary: '#065f46',
    primaryLight: '#ecfdf5',
    border: '#a7f3d0',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accent: '#059669',
    headerBg: 'from-emerald-950 via-emerald-900 to-teal-950',
  },
  slate: {
    primary: '#1e293b',
    primaryLight: '#f8fafc',
    border: '#cbd5e1',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    accent: '#475569',
    headerBg: 'from-slate-950 via-slate-900 to-zinc-900',
  },
  burgundy: {
    primary: '#701a31',
    primaryLight: '#fff1f2',
    border: '#fecdd3',
    badge: 'bg-rose-50 text-rose-900 border-rose-200',
    accent: '#9f1239',
    headerBg: 'from-rose-950 via-zinc-900 to-rose-950',
  },
  navy: {
    primary: '#1e3a8a',
    primaryLight: '#eff6ff',
    border: '#bfdbfe',
    badge: 'bg-blue-50 text-blue-900 border-blue-200',
    accent: '#2563eb',
    headerBg: 'from-blue-950 via-slate-900 to-indigo-950',
  },
  amber: {
    primary: '#78350f',
    primaryLight: '#fffbeb',
    border: '#fde68a',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    accent: '#d97706',
    headerBg: 'from-amber-950 via-stone-900 to-amber-950',
  },
};

export const ClinicalReportPreview: React.FC<ClinicalReportPreviewProps> = ({
  session,
  profile,
  onUpdateSession,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(profile.themeColor || 'emerald');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRawTranscription, setShowRawTranscription] = useState(true);

  // Estados locais para edição
  const [editedNote, setEditedNote] = useState(session.structuredNote);
  const [editedRaw, setEditedRaw] = useState(session.rawTranscription);

  const reportRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEME_STYLES[selectedTheme];

  // Data formatada elegante (ex: 17 de Setembro de 2026)
  const formatDateFormal = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const mIdx = parseInt(month, 10) - 1;
      return `${day} de ${months[mIdx] || month} de ${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      const safePatient = session.patientName.replace(/\s+/g, '_').toLowerCase();
      const filename = `prontuario_${safePatient}_sessao_${session.sessionNumber}_${session.sessionDate}.pdf`;

      await exportElementToPdf(reportRef.current, filename, (status) => {
        setExportStatus(status);
      });

      // Dispara confetes comemorativos pela geração perfeita
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsExporting(false);
      setExportStatus('');
    }
  };

  const handleCopyText = () => {
    const note = session.structuredNote;
    const text = `
PRONTUÁRIO CLÍNICO DE PSICOLOGIA
Profissional: ${profile.name} (${profile.crp})
Paciente: ${session.patientName} | Sessão nº: ${session.sessionNumber}
Data: ${session.sessionDate} (${session.sessionType.toUpperCase()})

1. DEMANDA PRINCIPAL
${note.demandaPrincipal}

2. ESTADO MENTAL E HUMOR OBSERVADO
${note.estadoMentalHumor}

3. TEMAS ABORDADOS
${note.temasAbordados.map((t) => `• ${t}`).join('\n')}

4. INTERVENÇÕES REALIZADAS
${note.intervencoes.map((i) => `• ${i}`).join('\n')}

5. INSIGHTS DO PACIENTE
${note.insightsPaciente}

6. TAREFAS ACORDADAS
${note.tarefasAcordadas.map((t) => `• ${t}`).join('\n')}

7. PLANEJAMENTO PARA PRÓXIMA SESSÃO
${note.planejamentoProximaSessao}

${note.observacoesSigilosas ? `8. OBSERVAÇÕES SIGILOSAS\n${note.observacoesSigilosas}\n` : ''}
---
Transcrição literal arquivada:
"${session.rawTranscription}"
    `.trim();

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveChanges = () => {
    const updated = {
      ...session,
      rawTranscription: editedRaw,
      structuredNote: editedNote,
    };
    onUpdateSession(updated);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Ações Superior / Toolbar */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-xs border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm md:text-base">
              Prontuário & Relatório de Sessão
            </h3>
            <p className="text-xs text-stone-500">
              Layout diagramado no padrão editorial A4 com conformidade ética do CFP
            </p>
          </div>
        </div>

        {/* Seleção de Paleta do Documento e Ações */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de Tema / Cor do Cabeçalho */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 rounded-xl border border-stone-200">
            <Palette className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500 mr-1 hidden sm:inline">Estilo:</span>
            <button
              onClick={() => setSelectedTheme('emerald')}
              className={`w-5 h-5 rounded-full bg-emerald-700 transition ${
                selectedTheme === 'emerald' ? 'ring-2 ring-emerald-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Esmeralda Terapêutico"
            />
            <button
              onClick={() => setSelectedTheme('slate')}
              className={`w-5 h-5 rounded-full bg-slate-800 transition ${
                selectedTheme === 'slate' ? 'ring-2 ring-slate-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Ardósia Minimalista"
            />
            <button
              onClick={() => setSelectedTheme('burgundy')}
              className={`w-5 h-5 rounded-full bg-rose-900 transition ${
                selectedTheme === 'burgundy' ? 'ring-2 ring-rose-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Borgonha Clássico"
            />
            <button
              onClick={() => setSelectedTheme('navy')}
              className={`w-5 h-5 rounded-full bg-blue-900 transition ${
                selectedTheme === 'navy' ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Azul Sereno"
            />
            <button
              onClick={() => setSelectedTheme('amber')}
              className={`w-5 h-5 rounded-full bg-amber-800 transition ${
                selectedTheme === 'amber' ? 'ring-2 ring-amber-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Ouro Nobre"
            />
          </div>

          <button
            onClick={() => setShowRawTranscription(!showRawTranscription)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            title={showRawTranscription ? 'Ocultar transcrição literal no PDF' : 'Incluir transcrição literal no PDF'}
          >
            {showRawTranscription ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Transcrição: Visível</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Transcrição: Oculta</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEditing ? 'Cancelar Edição' : 'Editar Conteúdo'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={printDocumentDirectly}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            title="Imprimir direto ou salvar via navegador"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-md shadow-emerald-600/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{exportStatus || 'Gerando PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar PDF Perfeito</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor rápido caso o psicólogo queira fazer ajustes finos antes de baixar */}
      {isEditing && (
        <div className="no-print bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Edição Rápida da Evolução Clínica
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Demanda Principal:</label>
              <textarea
                value={editedNote.demandaPrincipal}
                onChange={(e) =>
                  setEditedNote({ ...editedNote, demandaPrincipal: e.target.value })
                }
                rows={3}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Estado Mental & Humor:
              </label>
              <textarea
                value={editedNote.estadoMentalHumor}
                onChange={(e) =>
                  setEditedNote({ ...editedNote, estadoMentalHumor: e.target.value })
                }
                rows={3}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Insights do Paciente:</label>
              <textarea
                value={editedNote.insightsPaciente}
                onChange={(e) =>
                  setEditedNote({ ...editedNote, insightsPaciente: e.target.value })
                }
                rows={3}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Planejamento Próxima Sessão:
              </label>
              <textarea
                value={editedNote.planejamentoProximaSessao}
                onChange={(e) =>
                  setEditedNote({ ...editedNote, planejamentoProximaSessao: e.target.value })
                }
                rows={3}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">
                Transcrição Literal Polida:
              </label>
              <textarea
                value={editedRaw}
                onChange={(e) => setEditedRaw(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTO A4 CLÍNICO DE ALTA PERFEIÇÃO ("LAYOUT LINDO E PERFEITO") */}
      <div className="flex justify-center overflow-x-auto pb-12">
        <div
          ref={reportRef}
          className="a4-document bg-white rounded-lg shadow-xl p-8 sm:p-12 md:p-16 border border-stone-200/90 print:border-none print:shadow-none font-sans text-stone-800 relative"
          style={{ minHeight: '297mm', width: '100%', maxWidth: '210mm' }}
        >
          {/* Marca d'água sutil de fundo do símbolo Ψ (Psi) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025] z-0"
            aria-hidden="true"
          >
            <span className="font-serif-clinical text-[320px] font-light">Ψ</span>
          </div>

          <div className="relative z-10">
            {/* CABEÇALHO CLÍNICO EXECUTIVO */}
            <header className="border-b-2 pb-6" style={{ borderColor: currentTheme.primary }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Dados da Psicóloga */}
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif-clinical font-bold text-2xl shadow-sm"
                      style={{ backgroundColor: currentTheme.primary }}
                    >
                      Ψ
                    </div>
                    <div>
                      <h1
                        className="font-display-clinical text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ color: currentTheme.primary }}
                      >
                        {profile.name}
                      </h1>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold tracking-wider text-stone-700 uppercase bg-stone-100 px-2 py-0.5 rounded">
                          {profile.crp}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {profile.approach}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mt-2 italic">
                    {profile.title}
                  </p>
                </div>

                {/* Dados da Clínica / Contato */}
                <div className="sm:text-right text-xs text-stone-500 space-y-0.5">
                  <p className="font-semibold text-stone-700 text-sm">{profile.clinicName}</p>
                  <p>{profile.address}</p>
                  <p>{profile.phone} • {profile.email}</p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Prontuário Sigiloso • CFP
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* FAIXA DE IDENTIFICAÇÃO DA SESSÃO */}
            <section
              className="mt-6 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4"
              style={{
                backgroundColor: currentTheme.primaryLight,
                borderColor: currentTheme.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Paciente
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                    {session.patientName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-xs text-stone-700 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <div>
                    <span className="text-[9px] block text-stone-400 uppercase font-semibold">Data</span>
                    <span className="font-semibold">{formatDateFormal(session.sessionDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <div>
                    <span className="text-[9px] block text-stone-400 uppercase font-semibold">Horário / Duração</span>
                    <span className="font-semibold">{session.sessionTime || '14:00'} ({session.durationMinutes || 50} min)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-stone-400" />
                  <div>
                    <span className="text-[9px] block text-stone-400 uppercase font-semibold">Modalidade</span>
                    <span className="font-semibold capitalize">{session.sessionType}</span>
                  </div>
                </div>

                <div className="bg-white px-3 py-1 rounded-lg border border-stone-200 text-center">
                  <span className="text-[9px] block text-stone-400 uppercase font-bold">Atendimento</span>
                  <span className="font-bold text-stone-900">Sessão #{session.sessionNumber}</span>
                </div>
              </div>
            </section>

            {/* CORPO CLÍNICO DO PRONTUÁRIO */}
            <main className="mt-8 space-y-6 text-stone-800 leading-relaxed text-sm">
              {/* 1. Demanda Principal */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    1. Queixa Principal & Demanda do Encontro
                  </h3>
                </div>
                <p className="pl-3.5 text-stone-700 leading-normal font-serif-clinical text-[15px]">
                  {session.structuredNote.demandaPrincipal}
                </p>
              </div>

              {/* 2. Exame do Estado Mental e Humor */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    2. Exame do Estado Mental & Expressão Emocional
                  </h3>
                </div>
                <p className="pl-3.5 text-stone-700 leading-normal font-serif-clinical text-[15px]">
                  {session.structuredNote.estadoMentalHumor}
                </p>
              </div>

              {/* 3. Temas Abordados */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    3. Conteúdos & Temas Centrais Abordados
                  </h3>
                </div>
                <ul className="pl-3.5 space-y-1.5">
                  {session.structuredNote.temasAbordados.map((tema, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-stone-700">
                      <span className="text-stone-400 font-bold">•</span>
                      <span>{tema}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Intervenções Realizadas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    4. Intervenções Técnicas & Conduta Psicoterápica
                  </h3>
                </div>
                <ul className="pl-3.5 space-y-1.5">
                  {session.structuredNote.intervencoes.map((intervencao, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-stone-700">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: currentTheme.accent }}
                      />
                      <span>{intervencao}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Insights e Reação do Paciente */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    5. Insights, Elaboração & Receptividade
                  </h3>
                </div>
                <p className="pl-3.5 text-stone-700 leading-normal font-serif-clinical text-[15px]">
                  {session.structuredNote.insightsPaciente}
                </p>
              </div>

              {/* 6. Tarefas e Prescrições */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    6. Acordos Inter-Sessão & Prescrições Comportamentais
                  </h3>
                </div>
                <ul className="pl-3.5 space-y-1.5">
                  {session.structuredNote.tarefasAcordadas.map((tarefa, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-stone-700">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{tarefa}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 7. Planejamento Próxima Sessão */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: currentTheme.primary }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
                    7. Planejamento & Direcionamento da Próxima Sessão
                  </h3>
                </div>
                <p className="pl-3.5 text-stone-700 leading-normal font-serif-clinical text-[15px]">
                  {session.structuredNote.planejamentoProximaSessao}
                </p>
              </div>

              {/* 8. Observações Sigilosas (se houver) */}
              {session.structuredNote.observacoesSigilosas && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Anotações Restritas de Acompanhamento Clínico
                  </div>
                  <p className="text-stone-600 italic">
                    {session.structuredNote.observacoesSigilosas}
                  </p>
                </div>
              )}

              {/* 9. Transcrição Literal Integral da Fala (Opcional no Documento) */}
              {showRawTranscription && session.rawTranscription && (
                <div className="pt-4 border-t border-dashed border-stone-200 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                      Registro Fiel do Áudio da Sessão (Transcrição Literal)
                    </h4>
                    <span className="text-[10px] text-stone-400">Processado via IA Multimodal</span>
                  </div>
                  <blockquote className="pl-3 border-l-2 border-stone-300 text-xs text-stone-600 italic leading-relaxed bg-stone-50/50 p-2.5 rounded-r-lg">
                    "{session.rawTranscription}"
                  </blockquote>
                </div>
              )}
            </main>

            {/* ASSINATURA & CARIMBO PROFISSIONAL */}
            <footer className="mt-14 pt-8 border-t border-stone-200 text-center">
              <div className="max-w-xs mx-auto space-y-1">
                <div className="h-0.5 bg-stone-300 w-48 mx-auto mb-3" />
                <p
                  className="font-bold text-stone-900 text-sm font-display-clinical"
                  style={{ color: currentTheme.primary }}
                >
                  {profile.name}
                </p>
                <p className="text-xs text-stone-600 font-medium tracking-wide">
                  {profile.crp}
                </p>
                <p className="text-[11px] text-stone-400">
                  {profile.clinicName}
                </p>
              </div>

              {/* AVISO LEGAL CFP */}
              <div className="mt-8 pt-4 border-t border-stone-100 text-[9px] text-stone-400 uppercase tracking-wider leading-relaxed">
                Documento emitido para fins de registro e prontuário psicológico individual, em
                estrita observância ao Código de Ética Profissional do Psicólogo (Resolução CFP nº
                010/2005) e Resolução CFP nº 01/2009. Sigilo profissional resguardado por lei.
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
