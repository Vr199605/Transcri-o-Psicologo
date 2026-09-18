import React, { useState, useRef } from 'react';
import { X, FileText, Download, Printer, UserCheck, Stethoscope, FileSpreadsheet } from 'lucide-react';
import type { PsychologistProfile, SessionRecord, Patient, CFPDocumentType } from '../types';
import { exportElementToPdf, printDocumentDirectly } from '../services/pdfService';

interface CFPDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: SessionRecord | null;
  profile: PsychologistProfile;
  patients?: Patient[];
  sessions?: SessionRecord[];
  selectedPatientId?: string;
}

export const CFPDocumentsModal: React.FC<CFPDocumentsModalProps> = ({
  isOpen,
  onClose,
  session,
  profile,
  sessions,
  selectedPatientId,
}) => {
  const [docType, setDocType] = useState<CFPDocumentType>('declaracao');
  const [isExporting, setIsExporting] = useState(false);

  // Determina a sessão ativa para compor o documento
  const activeSession: SessionRecord =
    session ||
    (selectedPatientId ? sessions?.find((s) => s.patientId === selectedPatientId) : undefined) ||
    sessions?.[0] || {
      id: 'default',
      patientId: 'pat-1',
      patientName: 'Mariana Duarte Silva',
      sessionNumber: 1,
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '14:00',
      sessionType: 'presencial',
      durationMinutes: 50,
      approach: 'tcc',
      rawTranscription: '',
      structuredNote: {
        demandaPrincipal: 'Acompanhamento psicológico clínico regular.',
        estadoMentalHumor: 'Humor estável, discurso articulado e colaborativo.',
        temasAbordados: ['Rotina', 'Manejo do estresse'],
        intervencoes: ['Escuta técnica', 'Psicoeducação'],
        insightsPaciente: 'Reconhecimento dos fatores precipitantes.',
        tarefasAcordadas: ['Registro semanal'],
        planejamentoProximaSessao: 'Continuidade do plano terapêutico.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  // Campos para Declaração
  const [declTimeStart, setDeclTimeStart] = useState(activeSession.sessionTime || '14:00');
  const [declTimeEnd, setDeclTimeEnd] = useState('14:50');
  const [declPurpose, setDeclPurpose] = useState('justificativa de ausência laboral/acadêmica');

  // Campos para Encaminhamento
  const [encSpecialty, setEncSpecialty] = useState('Psiquiatria / Saúde Mental');
  const [encDoctorName, setEncDoctorName] = useState('Dr(a). Médico(a) Psiquiatra');
  const [encReason, setEncReason] = useState(
    'Avaliação médica especializada para consideração de suporte farmacológico complementar ao tratamento psicoterápico em andamento.'
  );

  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const formatDateLong = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${day} de ${months[parseInt(month, 10) - 1]} de ${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleDownload = async () => {
    if (!documentRef.current) return;
    try {
      setIsExporting(true);
      const safePatient = activeSession.patientName.replace(/\s+/g, '_').toLowerCase();
      const filename = `${docType}_${safePatient}_${activeSession.sessionDate}.pdf`;
      await exportElementToPdf(documentRef.current, filename);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 dark:border-slate-800 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Cabeçalho do Modal */}
        <div className="no-print p-5 bg-stone-50 dark:bg-slate-800/60 border-b border-stone-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                Documentos Psicológicos Oficiais (Res. CFP nº 06/2019)
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Gere declarações, encaminhamentos e relatórios padronizados com 1 clique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Seleção de Tipo de Documento */}
        <div className="no-print p-4 bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-stone-100 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700">
            <button
              onClick={() => setDocType('declaracao')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                docType === 'declaracao'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Declaração de Comparecimento</span>
            </button>

            <button
              onClick={() => setDocType('encaminhamento')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                docType === 'encaminhamento'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Encaminhamento Médico / Psiquiátrico</span>
            </button>

            <button
              onClick={() => setDocType('relatorio')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                docType === 'relatorio'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Relatório Psicológico CFP</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printDocumentDirectly()}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Gerando...' : 'Baixar PDF A4'}</span>
            </button>
          </div>
        </div>

        {/* Ajustes Específicos do Documento Selecionado */}
        <div className="no-print p-4 bg-stone-50/70 dark:bg-slate-800/40 border-b border-stone-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {docType === 'declaracao' && (
            <>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Horário Início:</label>
                <input
                  type="time"
                  value={declTimeStart}
                  onChange={(e) => setDeclTimeStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Horário Término:</label>
                <input
                  type="time"
                  value={declTimeEnd}
                  onChange={(e) => setDeclTimeEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Finalidade:</label>
                <input
                  type="text"
                  value={declPurpose}
                  onChange={(e) => setDeclPurpose(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </>
          )}

          {docType === 'encaminhamento' && (
            <>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Destinatário:</label>
                <input
                  type="text"
                  value={encDoctorName}
                  onChange={(e) => setEncDoctorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                  placeholder="Dr(a). Médico(a) Psiquiatra"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Especialidade:</label>
                <input
                  type="text"
                  value={encSpecialty}
                  onChange={(e) => setEncSpecialty(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 dark:text-slate-400 block mb-1">Motivo do Encaminhamento:</label>
                <input
                  type="text"
                  value={encReason}
                  onChange={(e) => setEncReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </>
          )}

          {docType === 'relatorio' && (
            <div className="sm:col-span-3 text-stone-600 dark:text-slate-300 text-[11px] flex items-center justify-between">
              <span>
                Estrutura oficial obrigatória (Art. 13 da Resolução CFP 06/2019): Identificação, Descrição da Demanda, Procedimentos, Análise e Conclusão.
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">100% CFP Compliant</span>
            </div>
          )}
        </div>

        {/* ÁREA DE PRÉVIA DO DOCUMENTO (FORMATO A4 IDÊNTICO AO PDF EXPORTADO) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-200/60 dark:bg-slate-950 flex justify-center">
          <div
            ref={documentRef}
            id="aurapsi-cfp-doc-container"
            style={{
              width: '794px',
              minHeight: '1123px',
              backgroundColor: '#ffffff',
              padding: '60px 65px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
              fontFamily: '"Merriweather", "Georgia", "Cambria", serif',
              color: '#1c1917',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* CABEÇALHO DO TIMBRADO */}
            <div
              style={{
                borderBottom: '2px solid #047857',
                paddingBottom: '20px',
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#047857', letterSpacing: '-0.3px' }}>
                  {profile.name}
                </h1>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', marginTop: '3px' }}>
                  {profile.crp} &bull; {profile.title}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  {profile.clinicName}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748b', lineHeight: '1.4' }}>
                <div>{profile.phone}</div>
                <div>{profile.email}</div>
                <div>{profile.address}</div>
              </div>
            </div>

            {/* CONTEÚDO: DECLARAÇÃO */}
            {docType === 'declaracao' && (
              <div style={{ padding: '20px 10px', lineHeight: '2.0' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#0f172a' }}>
                    DECLARAÇÃO
                  </h2>
                  <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Conforme Resolução CFP nº 06/2019 (Art. 9º)
                  </span>
                </div>

                <p style={{ fontSize: '14px', textAlign: 'justify', textIndent: '40px', color: '#1e293b' }}>
                  Declaro, para os devidos fins e a pedido da parte interessada, que o(a) Sr(a).{' '}
                  <strong>{activeSession.patientName}</strong> compareceu a atendimento psicológico individual no dia{' '}
                  <strong>{formatDateLong(activeSession.sessionDate)}</strong>, no período das{' '}
                  <strong>{declTimeStart}</strong> às <strong>{declTimeEnd}</strong> (duração de {activeSession.durationMinutes} minutos), para fins de{' '}
                  <strong>{declPurpose}</strong>.
                </p>

                <p style={{ fontSize: '12px', textAlign: 'justify', color: '#64748b', marginTop: '30px', fontStyle: 'italic' }}>
                  Nota Ética: Em estrito cumprimento ao Código de Ética Profissional do Psicólogo e à Resolução CFP nº 06/2019, este documento limita-se a atestar a presença do(a) declarante, sem conter registros de sintomas, hipóteses diagnósticas ou informações resguardadas pelo sigilo profissional.
                </p>
              </div>
            )}

            {/* CONTEÚDO: ENCAMINHAMENTO */}
            {docType === 'encaminhamento' && (
              <div style={{ padding: '10px', lineHeight: '1.7' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
                    ENCAMINHAMENTO MULTIDISCIPLINAR
                  </h2>
                  <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Resolução CFP nº 06/2019 (Art. 10º) &bull; Caráter Estritamente Confidencial
                  </span>
                </div>

                <div style={{ marginBottom: '24px', fontSize: '13px', color: '#1e293b' }}>
                  <div><strong>Ao(À):</strong> {encDoctorName}</div>
                  <div><strong>Especialidade:</strong> {encSpecialty}</div>
                  <div><strong>Paciente:</strong> {activeSession.patientName}</div>
                  <div><strong>Data:</strong> {formatDateLong(activeSession.sessionDate)}</div>
                </div>

                <div style={{ fontSize: '13px', textAlign: 'justify', color: '#334155' }}>
                  <p style={{ marginBottom: '14px' }}>
                    Prezado(a) colega,
                  </p>
                  <p style={{ textIndent: '30px', marginBottom: '14px' }}>
                    Encaminho o(a) paciente <strong>{activeSession.patientName}</strong>, atualmente em acompanhamento psicoterápico sob minha condução profissional (Sessão #{activeSession.sessionNumber}), para avaliação médica especializada.
                  </p>

                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      SÍNTESE CLÍNICA OBSERVADA EM SESSÃO:
                    </div>
                    <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#334155' }}>
                      "{activeSession.structuredNote.demandaPrincipal} {activeSession.structuredNote.estadoMentalHumor}"
                    </div>
                  </div>

                  <p style={{ textIndent: '30px', marginBottom: '14px' }}>
                    <strong>Finalidade do Encaminhamento:</strong> {encReason}
                  </p>
                  <p style={{ textIndent: '30px' }}>
                    Coloco-me à disposição para alinhamento conjunto de conduta terapêutica multidisciplinar.
                  </p>
                </div>
              </div>
            )}

            {/* CONTEÚDO: RELATÓRIO PSICOLÓGICO */}
            {docType === 'relatorio' && (
              <div style={{ padding: '10px', fontSize: '12px', lineHeight: '1.7', color: '#334155' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
                    RELATÓRIO PSICOLÓGICO
                  </h2>
                  <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Resolução CFP nº 06/2019 &bull; Artigo 13º
                  </span>
                </div>

                {/* 1. Identificação */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                    1. IDENTIFICAÇÃO
                  </div>
                  <div><strong>Paciente:</strong> {activeSession.patientName}</div>
                  <div><strong>Psicólogo(a) Responsável:</strong> {profile.name} &bull; {profile.crp}</div>
                  <div><strong>Finalidade:</strong> Acompanhamento e registro da evolução do processo psicoterápico</div>
                </div>

                {/* 2. Descrição da Demanda */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                    2. DESCRIÇÃO DA DEMANDA
                  </div>
                  <p style={{ textAlign: 'justify', margin: 0 }}>
                    O(A) paciente buscou atendimento psicoterápico apresentando como queixa central: {activeSession.structuredNote.demandaPrincipal}. Observou-se manifestação clínica caracterizada por: {activeSession.structuredNote.estadoMentalHumor}.
                  </p>
                </div>

                {/* 3. Procedimento */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                    3. PROCEDIMENTO
                  </div>
                  <p style={{ textAlign: 'justify', margin: 0 }}>
                    Foram realizadas sessões clínicas individuais com duração média de {activeSession.durationMinutes} minutos na abordagem de {profile.approach}. Utilizou-se escuta psicológica técnica, reestruturação e as seguintes intervenções: {activeSession.structuredNote.intervencoes?.join('; ')}.
                  </p>
                </div>

                {/* 4. Análise */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                    4. ANÁLISE PSICOLÓGICA
                  </div>
                  <p style={{ textAlign: 'justify', margin: 0 }}>
                    Durante o percurso terapêutico, destacaram-se os temas: {activeSession.structuredNote.temasAbordados?.join(', ')}. O paciente demonstrou evolução significativa em sua capacidade de auto-observação: "{activeSession.structuredNote.insightsPaciente}".
                  </p>
                </div>

                {/* 5. Conclusão */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#047857', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px', marginBottom: '6px' }}>
                    5. CONCLUSÃO
                  </div>
                  <p style={{ textAlign: 'justify', margin: 0 }}>
                    Recomenda-se a continuidade do processo psicoterápico com planejamento direcionado para: {activeSession.structuredNote.planejamentoProximaSessao}. O presente relatório reflete a síntese das sessões até a data presente.
                  </p>
                </div>
              </div>
            )}

            {/* ASSINATURA E RODAPÉ PADRÃO CFP */}
            <div
              style={{
                marginTop: '60px',
                textAlign: 'center',
                paddingTop: '20px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '40px' }}>
                São Paulo, {formatDateLong(activeSession.sessionDate)}.
              </div>

              <div
                style={{
                  display: 'inline-block',
                  borderTop: '1px solid #94a3b8',
                  paddingTop: '8px',
                  minWidth: '280px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                  {profile.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {profile.crp}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Assinatura do(a) Psicólogo(a) Responsável
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
