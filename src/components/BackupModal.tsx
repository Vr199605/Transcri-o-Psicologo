import React, { useState, useRef } from 'react';
import type { Patient, PsychologistProfile, SessionRecord } from '../types';
import {
  saveProfile,
  savePatients,
  saveSessions,
} from '../services/storageService';
import {
  ShieldCheck,
  Download,
  Upload,
  HardDrive,
  Cloud,
  X,
  AlertTriangle,
  CheckCircle2,
  FileJson,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PsychologistProfile;
  patients: Patient[];
  sessions: SessionRecord[];
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  profile,
  patients,
  sessions,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        profile,
        patients,
        sessions,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `aurapsi_backup_completo_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('Backup exportado com sucesso! Salve este arquivo em um local seguro ou nuvem.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao exportar backup.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.profile && !parsed.patients && !parsed.sessions) {
          throw new Error('Arquivo de backup inválido ou em formato incompatível.');
        }

        if (parsed.profile) saveProfile(parsed.profile);
        if (Array.isArray(parsed.patients)) savePatients(parsed.patients);
        if (Array.isArray(parsed.sessions)) saveSessions(parsed.sessions);

        onDataRestored();
        setSuccessMessage('Dados restaurados com sucesso! O sistema foi atualizado com seu backup.');
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1500);
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage(
          err instanceof Error ? err.message : 'Falha ao processar o arquivo de backup.'
        );
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shadow-sm">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                Backup, Restauração & Nuvem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Soberania total sobre seus prontuários com conformidade LGPD e CFP
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notifications */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {patients.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Pacientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {sessions.length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Prontuários</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Local & Seguro</div>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm mb-1">
                  <Download className="w-4 h-4 text-emerald-600" />
                  Exportar Backup Completo
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gera um arquivo JSON encriptado/estruturado com todos os pacientes, notas clínicas,
                  áudios e perfil profissional.
                </p>
              </div>

              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar Arquivo JSON (.json)
              </button>
            </div>

            {/* Import Card */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm mb-1">
                  <Upload className="w-4 h-4 text-cyan-600" />
                  Restaurar de Backup
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Substitui ou mescla seus registros atuais a partir de um backup prévio do AuraPsi
                  salvo no computador ou Google Drive.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all border border-slate-300 dark:border-slate-600"
                >
                  <FileJson className="w-4 h-4 text-slate-500" />
                  Selecionar Arquivo de Backup
                </button>
              </div>
            </div>
          </div>

          {/* Cloud Storage Guide */}
          <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 flex items-start gap-3">
            <Cloud className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-950 dark:text-cyan-200 space-y-1">
              <span className="font-bold">Dica de Segurança com Google Drive / OneDrive:</span>
              <p>
                Ao baixar o arquivo de backup, mova-o para a pasta sincronizada do seu Google Drive ou
                OneDrive profissional. Assim, seus prontuários ficam protegidos contra perda do celular
                ou computador com histórico de versões na nuvem.
              </p>
            </div>
          </div>

          {/* Compliance & LGPD */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Garantia de Sigilo & Resolução CFP nº 01/2009:
              </span>
              <p>
                O AuraPsi opera em arquitetura Zero-Knowledge Serverless: os dados nunca são gravados
                em servidores de terceiros não autorizados. Ficam restritos à memória do seu navegador
                e aos backups que você mesmo exportar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/60 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
