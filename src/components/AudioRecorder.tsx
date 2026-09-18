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
  AlertCircle
} from 'lucide-react';
import { CLINICAL_DEMO_CASES } from '../services/aiService';
import type { AIProcessingResult } from '../services/aiService';

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, duration: number) => void;
  onSelectDemoCase: (demoKey: string, demoResult: AIProcessingResult) => void;
  isProcessing: boolean;
}

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Formata segundos para mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Desenha o visualizador de onda sonoro
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

        // Gradiente suave verde esmeralda / sálvia
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
    setAudioBlob(null);
    setAudioUrl(null);
    setSelectedFileName(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Configura Web Audio API para o visualizador
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Para os tracks de áudio do microfone
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setErrorMsg('Não foi possível acessar seu microfone. Verifique as permissões do navegador ou faça o upload de um arquivo de áudio.');
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
    audioChunksRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetRecording();
    setSelectedFileName(file.name);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));

    // Estima duração via elemento de áudio
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
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 md:p-8 transition-all">
      {/* Cabeçalho da Seção de Gravação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Relato da Sessão
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mt-1">
            Grave suas impressões clínicas
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Fale naturalmente sobre o atendimento. A IA transcreverá sem erros e organizará os tópicos do prontuário.
          </p>
        </div>

        {/* Casos Clínicos de Exemplo para Teste Imediato */}
        <div className="flex flex-col items-start sm:items-end">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Casos de Demonstração (1 clique):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectDemoCase('ansiedade', CLINICAL_DEMO_CASES.ansiedade)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200/60 transition"
              title="Sessão focada em crise de ansiedade e técnicas de TCC"
            >
              Ansiedade & Pânico
            </button>
            <button
              onClick={() => onSelectDemoCase('burnout', CLINICAL_DEMO_CASES.burnout)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 border border-amber-200/60 transition"
              title="Sessão sobre esgotamento no trabalho e autocompaixão"
            >
              Burnout & Limites
            </button>
            <button
              onClick={() => onSelectDemoCase('relacionamento', CLINICAL_DEMO_CASES.relacionamento)}
              disabled={isProcessing || isRecording}
              className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200/60 transition"
              title="Sessão de insegurança vincular e ciúmes"
            >
              Vínculo & Afeto
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Área Central: Visualizador ou Controles */}
      <div className="mt-6 flex flex-col items-center justify-center min-h-[220px] bg-stone-50/70 rounded-2xl border border-dashed border-stone-200 p-6 relative overflow-hidden">
        {/* Visualizador de Áudio (Canvas) durante gravação */}
        {isRecording && (
          <div className="w-full max-w-md h-24 mb-4 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={380}
              height={90}
              className="w-full h-full rounded-lg"
            />
          </div>
        )}

        {/* Timer Principal */}
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-mono font-medium tracking-tight text-stone-800">
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
                : 'Áudio gravado pronto para análise'
              : 'Clique no microfone para iniciar ou envie um áudio'}
          </div>
        </div>

        {/* Pré-escuta do áudio gravado ou carregado */}
        {audioUrl && !isRecording && (
          <div className="mt-4 w-full max-w-md bg-white p-3 rounded-xl shadow-xs border border-stone-200 flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <audio src={audioUrl} controls className="w-full h-9" />
          </div>
        )}

        {/* Botões de Ação do Gravador */}
        <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
          {!isRecording && !audioBlob && (
            <>
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-medium shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-5 h-5" />
                <span>Iniciar Gravação</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-full font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-stone-500" />
                <span>Enviar Áudio / WhatsApp</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}

          {isRecording && (
            <>
              <button
                onClick={pauseRecording}
                className={`p-3.5 rounded-full border transition cursor-pointer ${
                  isPaused
                    ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                    : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                }`}
                title={isPaused ? 'Continuar Gravação' : 'Pausar'}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-medium shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Concluir Gravação</span>
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={resetRecording}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl text-sm font-medium transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Gravar Novamente</span>
              </button>

              <button
                onClick={handleConfirmAndProcess}
                disabled={isProcessing}
                className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md shadow-emerald-600/20 hover:shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transcrevendo com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Transcrever & Estruturar Prontuário</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dicas de uso para o psicólogo */}
      <div className="mt-4 flex items-center justify-between text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Gravação com redução automática de ruído e voz otimizada
        </span>
        <span className="hidden sm:inline">Formatos aceitos: microfone, .mp3, .m4a, .ogg, .wav</span>
      </div>
    </div>
  );
};
