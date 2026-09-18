import React, { useState } from 'react';
import { X, Key, Shield, User, Building, Award, Check, ExternalLink } from 'lucide-react';
import type { PsychologistProfile, ThemeColor } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PsychologistProfile;
  onSaveProfile: (profile: PsychologistProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<PsychologistProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Cabeçalho do Modal */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              Ψ
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Configurações do Profissional & IA
              </h3>
              <p className="text-xs text-stone-500">
                Personalize os dados do cabeçalho do PDF e sua chave de IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Seção 1: Chave de API da IA */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                Chave da API Google Gemini
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline flex items-center gap-1"
              >
                <span>Obter chave gratuita</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-emerald-800/80 leading-relaxed">
              O modelo multimodal do Gemini transcreve seu áudio com altíssima fidelidade e sem erros de português. Sua chave fica salva exclusivamente na memória local do seu navegador.
            </p>
            <input
              type="password"
              placeholder="Cole sua chave aqui (ex: AIzaSy...)"
              value={formData.geminiApiKey}
              onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs md:text-sm font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center justify-between text-[11px] text-emerald-800">
              <span>Modelo de Transcrição:</span>
              <select
                value={formData.selectedModel}
                onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                className="bg-white border border-emerald-300 rounded-lg px-2 py-1 font-sans text-xs"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recomendado - Mais recente)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Máxima densidade clínica)</option>
              </select>
            </div>
          </div>

          {/* Seção 2: Identificação do Psicólogo */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-stone-400" />
              Dados do Profissional (Cabeçalho do PDF)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Registro Profissional (CRP)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CRP 06/158.420"
                  value={formData.crp}
                  onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Abordagem Teórica
                </label>
                <input
                  type="text"
                  placeholder="Ex: Terapia Cognitivo-Comportamental (TCC)"
                  value={formData.approach}
                  onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Titulação / Especialidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Especialista em Neuropsicologia"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Dados do Consultório / Clínica */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-stone-400" />
              Consultório & Contato
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Nome do Consultório / Clínica
                </label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Telefone / WhatsApp Profissional
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  E-mail Profissional
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Endereço do Consultório
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-sm text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 4: Cor de Identidade Visual */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-stone-400" />
              Cor de Destaque Padrão do Prontuário
            </h4>
            <div className="flex items-center gap-3">
              {(
                [
                  { id: 'emerald', label: 'Esmeralda', color: 'bg-emerald-700' },
                  { id: 'slate', label: 'Ardósia', color: 'bg-slate-800' },
                  { id: 'burgundy', label: 'Borgonha', color: 'bg-rose-900' },
                  { id: 'navy', label: 'Marinho', color: 'bg-blue-900' },
                  { id: 'amber', label: 'Âmbar', color: 'bg-amber-800' },
                ] as const
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setFormData({ ...formData, themeColor: item.id as ThemeColor })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    formData.themeColor === item.id
                      ? 'border-stone-900 bg-stone-100 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rodapé e Botão de Salvar */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              Conformidade com Sigilo CFP (Res. 010/2005)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-sm font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Salvo com Sucesso!</span>
                  </>
                ) : (
                  <span>Salvar Configurações</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
