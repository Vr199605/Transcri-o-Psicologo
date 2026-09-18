import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { CLINICAL_DEMO_CASES } from '../services/aiService';
import type { AIProcessingResult } from '../services/aiService';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, duration: number) => void;
  onSelectDemoCase: (demoKey: string, demoResult: AIProcessingResult) => void;
  isProcessing: boolean;
}

// Detecta o melhor formato de áudio suportado pelo navegador/celular
const getSupportedAudioMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return '';
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return ''; // Deixa o navegador usar o padrão nativo (essencial para Safari iOS)
};

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioReady,
  onSelectDemoCase,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeRecordInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.8;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#34d399');
        gradient.addColorStop(1, '#059669');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 1.5, Math.max(4, barHeight), 2);
        ctx.fill();

        x += barWidth;
      }
    };

    render();
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setShowPermissionGuide(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setSelectedFileName(null);
    audioChunksRef.current = [];

    // Verificação de ambiente seguro (HTTPS / Localhost)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        'Seu navegador precisa de conexão segura (HTTPS) ou permissão para capturar áudio.'
      );
      setShowPermissionGuide(true);
      return;
    }

    try {
      // Solicita acesso ao microfone com restrições otimizadas para celulares
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Inicializa Web Audio API (com tratamento específico para Safari iOS)
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;
          drawWaveform();
        }
      } catch (audioCtxErr) {
        console.warn('Visualizador de ondas não suportado neste celular, gravando normalmente:', audioCtxErr);
      }

      const mimeType = getSupportedAudioMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMime = mediaRecorder.mimeType || mimeType || 'audio/mp4';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      // Usa intervalos menores para compatibilidade móvel
      mediaRecorder.start(500);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      const error = err as Error;
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError' ||
        error.message?.includes('Permission')
      ) {
        setErrorMsg('Permissão de microfone negada. Toque abaixo para saber como liberar no celular.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMsg('Nenhum microfone foi detectado neste dispositivo.');
      } else {
        setErrorMsg('Não foi possível iniciar a gravação. Você também pode usar o gravador do celular.');
      }
      setShowPermissionGuide(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = window.setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setSelectedFileName(null);
    setErrorMsg(null);
    setShowPermissionGuide(false);
    audioChunksRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (nativeRecordInputRef.current) nativeRecordInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetRecording();
    setSelectedFileName(file.name);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));

    const tempAudio = new Audio(URL.createObjectURL(file));
    tempAudio.onloadedmetadata = () => {
      setDuration(Math.round(tempAudio.duration) || 60);
    };
  };

  const handleConfirmAndProcess = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, duration);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-4 sm:p-6 md:p-8 transition-all">
      {/* Cabeçalho da Seção de Gravação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Gravação de Voz
            </span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-stone-800 mt-1">
            Grave suas impressões clínicas
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Fale naturalmente pelo celular ou computador. Sem erros e com terminologia psicológica precisa.
          </p>
        </div>

        {/* Casos Clínicos de Demonstração (Toque rápido) */}
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Casos de Exemplo (1 toque):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectDemoCase('ansiedade', CLINICAL_DEMO_CASES.ansiedade)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200/60 transition cursor-pointer"
            >
              Ansiedade
            </button>
            <button
              onClick={() => onSelectDemoCase('burnout', CLINICAL_DEMO_CASES.burnout)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 border border-amber-200/60 transition cursor-pointer"
            >
              Burnout
            </button>
            <button
              onClick={() => onSelectDemoCase('relacionamento', CLINICAL_DEMO_CASES.relacionamento)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200/60 transition cursor-pointer"
            >
              Vínculo
            </button>
          </div>
        </div>
      </div>

      {/* Alerta e Guia para Desbloquear Microfone no Celular */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
          </div>

          {showPermissionGuide && (
            <div className="mt-2 pt-2 border-t border-amber-200/70 text-xs text-amber-800 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                Como liberar o microfone no celular sem bloqueio:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>No Chrome (Android):</strong> Toque no ícone de opções/cadeado ao lado de <em>https://</em> na barra de endereço &gt; <strong>Permissões</strong> &gt; Ative o <strong>Microfone</strong>.
                </li>
                <li>
                  <strong>No Safari (iPhone):</strong> Toque no botão <strong>"aA"</strong> na barra de endereço &gt; <strong>Ajustes do Site</strong> &gt; <strong>Microfone: Permitir</strong>.
                </li>
              </ul>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => nativeRecordInputRef.current?.click()}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold text-xs shadow-xs hover:bg-amber-700"
                >
                  Usar Gravador Nativo do Celular (Sem Bloqueio)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Área Central: Visualizador e Timer */}
      <div className="mt-5 flex flex-col items-center justify-center min-h-[190px] sm:min-h-[220px] bg-stone-50/70 rounded-2xl border border-dashed border-stone-200 p-4 sm:p-6 relative overflow-hidden">
        {isRecording && (
          <div className="w-full max-w-sm h-16 sm:h-20 mb-3 flex items-center justify-center">
            <canvas ref={canvasRef} width={340} height={80} className="w-full h-full rounded-lg" />
          </div>
        )}

        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-mono font-medium tracking-tight text-stone-800">
            {formatTime(duration)}
          </div>
          <div className="text-xs font-medium text-stone-400 mt-1">
            {isRecording
              ? isPaused
                ? 'Gravação pausada'
                : 'Gravando áudio da sessão...'
              : audioBlob
              ? selectedFileName
                ? `Arquivo: ${selectedFileName}`
                : 'Áudio gravado pronto para transcrição'
              : 'Toque no microfone para iniciar ou envie áudio do WhatsApp'}
          </div>
        </div>

        {audioUrl && !isRecording && (
          <div className="mt-3 w-full max-w-md bg-white p-2.5 rounded-xl shadow-xs border border-stone-200 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <audio src={audioUrl} controls className="w-full h-9" />
          </div>
        )}

        {/* Botões de Ação Adaptados para Touch/Celular */}
        <div className="mt-5 flex items-center gap-3 flex-wrap justify-center w-full">
          {!isRecording && !audioBlob && (
            <>
              {/* Botão Principal: Gravação Direta no Navegador */}
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer text-sm sm:text-base touch-manipulation disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
                <span>Gravar com Microfone</span>
              </button>

              {/* Botão Secundário: Gravador Nativo do Celular (100% livre de bloqueios) */}
              <button
                onClick={() => nativeRecordInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full font-medium shadow-2xs transition cursor-pointer text-xs sm:text-sm touch-manipulation disabled:opacity-50"
                title="Abre o app de gravador nativo do seu celular"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Gravar pelo Celular</span>
              </button>
              <input
                ref={nativeRecordInputRef}
                type="file"
                accept="audio/*"
                capture="user"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload de Áudio de WhatsApp / Arquivo */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-full font-medium shadow-2xs transition cursor-pointer text-xs sm:text-sm touch-manipulation disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-stone-500" />
                <span>Enviar Áudio / WhatsApp</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.opus,.m4a,.mp3,.ogg,.wav"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}

          {isRecording && (
            <div className="flex items-center gap-3 w-full justify-center">
              <button
                onClick={pauseRecording}
                className={`p-3.5 rounded-full border transition cursor-pointer touch-manipulation ${
                  isPaused
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                }`}
                title={isPaused ? 'Continuar' : 'Pausar'}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium shadow-md shadow-rose-600/20 transition cursor-pointer text-sm sm:text-base touch-manipulation"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Concluir Gravação</span>
              </button>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="flex items-center gap-3 w-full flex-wrap justify-center">
              <button
                onClick={resetRecording}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Gravar Novamente</span>
              </button>

              <button
                onClick={handleConfirmAndProcess}
                disabled={isProcessing}
                className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 hover:shadow-lg transition cursor-pointer text-sm touch-manipulation disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transcrevendo com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Transcrever & Gerar Prontuário</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dicas de compatibilidade mobile */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-stone-400 gap-1 text-center sm:text-left">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Áudio 100% autorizado no celular (iOS Safari, Android Chrome e WhatsApp)
        </span>
        <button
          type="button"
          onClick={() => setShowPermissionGuide(!showPermissionGuide)}
          className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Dúvidas com permissão no celular?</span>
        </button>
      </div>
    </div>
  );
};
