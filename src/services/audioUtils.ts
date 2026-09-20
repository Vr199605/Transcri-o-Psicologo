/**
 * Utilitários de áudio para gravação, conversão e normalização compatível com Gemini Multimodal.
 */

// Grava string no DataView
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Codifica amostras de ponto flutuante Float32 em um buffer WAV 16-bit PCM Linear padrão.
 * Produz um arquivo .wav canônico de 44 bytes de cabeçalho aceito universalmente por todas as IAs.
 */
export function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  /* fmt sub-chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 para PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 para PCM linear)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (ex: 16000)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  /* data sub-chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  /* Escrita dos dados PCM (amostras com clamp -1.0 a 1.0) */
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

/**
 * Converte qualquer Blob de áudio (WebM do Chrome, MP4 do iPhone/Safari, OGG, WhatsApp)
 * em um Blob WAV 16-bit Mono 16kHz limpo diretamente no navegador via Web Audio API.
 * 
 * Vantagens críticas:
 * 1. 100% livre de incompatibilidade de MIME type ou codecs no Google Gemini.
 * 2. Reduz o tamanho do áudio em até 70% (16kHz mono), agilizando o upload.
 * 3. Máxima fidelidade na transcrição da fala e dos termos psicológicos.
 */
export async function convertAudioBlobToWav(audioBlob: Blob): Promise<{ wavBlob: Blob; mimeType: string }> {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      // Se Web Audio não estiver disponível, limpa o MIME type e envia o original
      const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0].trim();
      return { wavBlob: audioBlob, mimeType: cleanMime };
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const tempAudioCtx = new AudioContextClass();

    let decodedAudio: AudioBuffer;
    try {
      decodedAudio = await tempAudioCtx.decodeAudioData(arrayBuffer);
    } finally {
      if (tempAudioCtx.state !== 'closed') {
        await tempAudioCtx.close().catch(() => {});
      }
    }

    // Reamostra para 16kHz mono (padrão ouro para transcrição em IA)
    const targetSampleRate = 16000;
    const duration = decodedAudio.duration;
    const targetLength = Math.max(1, Math.ceil(duration * targetSampleRate));

    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = decodedAudio;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start(0);

    const renderedAudio = await offlineCtx.startRendering();
    const pcmData = renderedAudio.getChannelData(0);

    const wavArrayBuffer = encodeWAV(pcmData, targetSampleRate);
    const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });

    return { wavBlob, mimeType: 'audio/wav' };
  } catch (err) {
    console.warn('Conversão para WAV falhou ou formato não decodificável, usando fallback:', err);
    const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0].trim();
    return { wavBlob: audioBlob, mimeType: cleanMime };
  }
}
