import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  FileText,
  Palette,
  Eye,
  EyeOff,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PsychologistProfile, SessionRecord, ThemeColor } from '../types';
import { exportElementToPdf, sharePdfIfAvailable, printDocumentDirectly } from '../services/pdfService';

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
    accent: string;
    textHeader: string;
  }
> = {
  emerald: {
    primary: '#065f46',
    primaryLight: '#f0fdf4',
    border: '#bbf7d0',
    accent: '#059669',
    textHeader: '#064e3b',
  },
  slate: {
    primary: '#1e293b',
    primaryLight: '#f8fafc',
    border: '#cbd5e1',
    accent: '#334155',
    textHeader: '#0f172a',
  },
  burgundy: {
    primary: '#701a31',
    primaryLight: '#fff1f2',
    border: '#fecdd3',
    accent: '#9f1239',
    textHeader: '#4c0519',
  },
  navy: {
    primary: '#1e3a8a',
    primaryLight: '#eff6ff',
    border: '#bfdbfe',
    accent: '#2563eb',
    textHeader: '#172554',
  },
  amber: {
    primary: '#78350f',
    primaryLight: '#fffbeb',
    border: '#fde68a',
    accent: '#d97706',
    textHeader: '#451a03',
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

  const [editedNote, setEditedNote] = useState(session.structuredNote);
  const [editedRaw, setEditedRaw] = useState(session.rawTranscription);

  const reportRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEME_STYLES[selectedTheme];

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

      confetti({
        particleCount: 70,
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

  const handleSharePdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsExporting(true);
      const safePatient = session.patientName.replace(/\s+/g, '_').toLowerCase();
      const filename = `prontuario_${safePatient}_sessao_${session.sessionNumber}.pdf`;

      const shared = await sharePdfIfAvailable(reportRef.current, filename, (status) => {
        setExportStatus(status);
      });

      if (shared) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399'],
        });
      } else {
        await handleDownloadPdf();
      }
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
      {/* BARRA DE AÇÕES SUPERIOR / TOOLBAR */}
      <div className="no-print bg-white p-4 rounded-2xl shadow-xs border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm sm:text-base">
              Prontuário & Relatório Editorial
            </h3>
            <p className="text-xs text-stone-500">
              Padrão A4 oficial em conformidade com as diretrizes do CFP
            </p>
          </div>
        </div>

        {/* Paletas de cores e botões de ação */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de Tema */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 rounded-xl border border-stone-200">
            <Palette className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500 mr-1 hidden sm:inline">Cor:</span>
            <button
              onClick={() => setSelectedTheme('emerald')}
              className={`w-5 h-5 rounded-full bg-emerald-700 transition cursor-pointer ${
                selectedTheme === 'emerald' ? 'ring-2 ring-emerald-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Esmeralda Clínico"
            />
            <button
              onClick={() => setSelectedTheme('slate')}
              className={`w-5 h-5 rounded-full bg-slate-800 transition cursor-pointer ${
                selectedTheme === 'slate' ? 'ring-2 ring-slate-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Ardósia Minimalista"
            />
            <button
              onClick={() => setSelectedTheme('burgundy')}
              className={`w-5 h-5 rounded-full bg-rose-900 transition cursor-pointer ${
                selectedTheme === 'burgundy' ? 'ring-2 ring-rose-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Borgonha Clássico"
            />
            <button
              onClick={() => setSelectedTheme('navy')}
              className={`w-5 h-5 rounded-full bg-blue-900 transition cursor-pointer ${
                selectedTheme === 'navy' ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Azul Sereno"
            />
            <button
              onClick={() => setSelectedTheme('amber')}
              className={`w-5 h-5 rounded-full bg-amber-800 transition cursor-pointer ${
                selectedTheme === 'amber' ? 'ring-2 ring-amber-500 ring-offset-1' : 'opacity-60'
              }`}
              title="Ouro Nobre"
            />
          </div>

          <button
            onClick={() => setShowRawTranscription(!showRawTranscription)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
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
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
            <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden md:inline">Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={printDocumentDirectly}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
            title="Imprimir direto ou Salvar como PDF nativo"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={handleSharePdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Compartilhar PDF no WhatsApp ou Arquivos"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compartilhar</span>
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
                <span>Baixar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor rápido antes de baixar */}
      {isEditing && (
        <div className="no-print bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              Edição da Evolução Clínica
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
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

      {/* CONTAINER DO DOCUMENTO A4 CLÍNICO EDITORIAL */}
      <div className="flex justify-center overflow-x-auto pb-12 px-0">
        <div
          ref={reportRef}
          className="a4-document bg-white shadow-2xl border border-stone-200/90 print:border-none print:shadow-none font-sans text-stone-800 relative"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            padding: '44px 48px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            color: '#1e293b',
          }}
        >
          {/* Marca d'água sutil com símbolo grego da Psicologia (Ψ) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0.022,
              fontSize: '360px',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              color: currentTheme.primary,
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            Ψ
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* CABEÇALHO CLÍNICO EXECUTIVO (TABELA INQUEBRÁVEL) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: `2px solid ${currentTheme.primary}`, paddingBottom: '20px', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  {/* Lado Esquerdo: Identidade do Profissional */}
                  <td style={{ verticalAlign: 'top', width: '62%', paddingBottom: '16px' }}>
                    <table style={{ borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: 'middle', paddingRight: '14px', width: '52px' }}>
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: currentTheme.primary,
                                color: '#ffffff',
                                borderRadius: '12px',
                                textAlign: 'center',
                                lineHeight: '48px',
                                fontSize: '26px',
                                fontWeight: 'bold',
                                fontFamily: 'Cormorant Garamond, Georgia, serif',
                              }}
                            >
                              Ψ
                            </div>
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <div
                              style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                fontFamily: 'Cormorant Garamond, Georgia, serif',
                                color: currentTheme.textHeader,
                                lineHeight: '1.15',
                              }}
                            >
                              {profile.name}
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '11px', color: '#475569' }}>
                              <span
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#0f172a',
                                  fontWeight: 'bold',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  marginRight: '8px',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                {profile.crp}
                              </span>
                              <span style={{ fontWeight: '500' }}>
                                {profile.approach}
                              </span>
                            </div>
                            <div style={{ marginTop: '3px', fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                              {profile.title}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Lado Direito: Clínica, Contatos e Selo CFP */}
                  <td style={{ verticalAlign: 'top', width: '38%', textAlign: 'right', paddingBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '3px' }}>
                      {profile.clinicName}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                      {profile.address}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px' }}>
                      {profile.phone} &bull; {profile.email}
                    </div>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: currentTheme.primary,
                          backgroundColor: currentTheme.primaryLight,
                          border: `1px solid ${currentTheme.border}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Prontuário Sigiloso &bull; CFP
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* FAIXA DE IDENTIFICAÇÃO DA SESSÃO (TABELA INQUEBRÁVEL) */}
            <div
              style={{
                backgroundColor: currentTheme.primaryLight,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '26px',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    {/* Paciente */}
                    <td style={{ width: '38%', verticalAlign: 'middle', borderRight: '1px solid rgba(0,0,0,0.06)', paddingRight: '14px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Paciente Atendido(a)
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.2' }}>
                        {session.patientName}
                      </div>
                    </td>

                    {/* Data */}
                    <td style={{ width: '22%', verticalAlign: 'middle', paddingLeft: '14px', borderRight: '1px solid rgba(0,0,0,0.06)', paddingRight: '10px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Data da Sessão
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                        {formatDateFormal(session.sessionDate)}
                      </div>
                    </td>

                    {/* Horário e Duração */}
                    <td style={{ width: '20%', verticalAlign: 'middle', paddingLeft: '12px', borderRight: '1px solid rgba(0,0,0,0.06)', paddingRight: '10px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Horário / Duração
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>
                        {session.sessionTime || '14:00'} ({session.durationMinutes || 50} min)
                      </div>
                    </td>

                    {/* Sessão e Modalidade */}
                    <td style={{ width: '20%', verticalAlign: 'middle', paddingLeft: '14px', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' }}>
                          Atendimento
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>
                          Sessão #{session.sessionNumber} &bull; <span style={{ textTransform: 'capitalize' }}>{session.sessionType}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CORPO CLÍNICO DO PRONTUÁRIO */}
            <div style={{ fontSize: '13px', lineHeight: '1.65', color: '#1e293b' }}>
              {/* 1. Demanda Principal */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    1. Queixa Principal & Demanda do Encontro
                  </span>
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155', fontFamily: 'Newsreader, Georgia, serif', fontSize: '14px' }}>
                  {session.structuredNote.demandaPrincipal}
                </div>
              </div>

              {/* 2. Exame do Estado Mental e Humor */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    2. Exame do Estado Mental & Expressão Emocional
                  </span>
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155', fontFamily: 'Newsreader, Georgia, serif', fontSize: '14px' }}>
                  {session.structuredNote.estadoMentalHumor}
                </div>
              </div>

              {/* 3. Temas Abordados */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    3. Conteúdos & Temas Centrais Abordados
                  </span>
                </div>
                <div style={{ paddingLeft: '14px' }}>
                  {session.structuredNote.temasAbordados.map((tema, idx) => (
                    <div key={idx} style={{ marginBottom: '4px', color: '#334155' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold', marginRight: '6px' }}>&bull;</span>
                      <span>{tema}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Intervenções Técnicas */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    4. Intervenções Técnicas & Conduta Psicoterápica
                  </span>
                </div>
                <div style={{ paddingLeft: '14px' }}>
                  {session.structuredNote.intervencoes.map((intervencao, idx) => (
                    <div key={idx} style={{ marginBottom: '4px', color: '#334155' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: currentTheme.accent,
                          marginRight: '8px',
                          verticalAlign: 'middle',
                        }}
                      />
                      <span>{intervencao}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Insights e Resposta do Paciente */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    5. Insights, Elaboração & Receptividade do(a) Paciente
                  </span>
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155', fontFamily: 'Newsreader, Georgia, serif', fontSize: '14px' }}>
                  {session.structuredNote.insightsPaciente}
                </div>
              </div>

              {/* 6. Tarefas e Acordos */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    6. Acordos Inter-Sessão & Prescrições Comportamentais
                  </span>
                </div>
                <div style={{ paddingLeft: '14px' }}>
                  {session.structuredNote.tarefasAcordadas.map((tarefa, idx) => (
                    <div key={idx} style={{ marginBottom: '4px', color: '#334155' }}>
                      <span style={{ color: '#059669', fontWeight: 'bold', marginRight: '6px' }}>✓</span>
                      <span>{tarefa}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Planejamento Próxima Sessão */}
              <div data-pdf-block="true" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '4px',
                      height: '13px',
                      backgroundColor: currentTheme.primary,
                      marginRight: '8px',
                      verticalAlign: 'middle',
                      borderRadius: '2px',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#334155' }}>
                    7. Planejamento & Direcionamento da Próxima Sessão
                  </span>
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155', fontFamily: 'Newsreader, Georgia, serif', fontSize: '14px' }}>
                  {session.structuredNote.planejamentoProximaSessao}
                </div>
              </div>

              {/* 8. Observações Sigilosas */}
              {session.structuredNote.observacoesSigilosas && (
                <div
                  data-pdf-block="true"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Anotações Restritas de Acompanhamento Clínico
                  </div>
                  <div style={{ fontStyle: 'italic', color: '#64748b' }}>
                    {session.structuredNote.observacoesSigilosas}
                  </div>
                </div>
              )}

              {/* 9. Transcrição Literal Polida */}
              {showRawTranscription && session.rawTranscription && (
                <div data-pdf-block="true" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b' }}>
                      Registro Fiel do Áudio da Sessão (Transcrição Literal)
                    </span>
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>
                      Processado via IA Multimodal
                    </span>
                  </div>
                  <blockquote
                    style={{
                      borderLeft: `2px solid ${currentTheme.primary}`,
                      paddingLeft: '12px',
                      margin: 0,
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: '#475569',
                      lineHeight: '1.6',
                      backgroundColor: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    "{session.rawTranscription}"
                  </blockquote>
                </div>
              )}
            </div>

            {/* CARIMBO PROFISSIONAL & ASSINATURA */}
            <div data-pdf-block="true" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                <div style={{ height: '1px', backgroundColor: '#94a3b8', width: '220px', margin: '0 auto 10px auto' }} />
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    color: currentTheme.textHeader,
                  }}
                >
                  {profile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', fontWeight: '500', marginTop: '2px' }}>
                  {profile.crp}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                  {profile.clinicName}
                </div>
              </div>

              {/* AVISO LEGAL CFP */}
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '8.5px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: '1.5',
                }}
              >
                Documento emitido para fins de registro e prontuário psicológico individual, em estrita observância ao Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005) e Resolução CFP nº 01/2009. Sigilo profissional resguardado por lei.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
