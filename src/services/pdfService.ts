import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePdfBlob = async (
  element: HTMLElement,
  onProgress?: (progressText: string) => void
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  if (onProgress) onProgress('Preparando renderização em alta definição...');

  const originalScrollTop = window.scrollY;
  window.scrollTo(0, 0);

  if (onProgress) onProgress('Renderizando tipografia e layout clínico (300 DPI)...');

  // Ajuste de escala para mobile: 2x para rapidez e memória estável em celulares
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const scale = isMobile ? 2.0 : 2.5;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  window.scrollTo(0, originalScrollTop);

  if (onProgress) onProgress('Gerando documento vetorial A4...');

  const imgData = canvas.toDataURL('image/jpeg', 0.96);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210; // A4 mm
  const pageHeight = 297; // A4 mm

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Primeira página
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  // Páginas subsequentes
  while (heightLeft > 5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  const blob = pdf.output('blob');
  return { pdf, blob };
};

export const exportElementToPdf = async (
  element: HTMLElement,
  fileName: string = 'prontuario_clinico.pdf',
  onProgress?: (progressText: string) => void
): Promise<void> => {
  try {
    const { pdf, blob } = await generatePdfBlob(element, onProgress);

    if (onProgress) onProgress('Concluindo download...');

    // No celular, downloads diretos podem ser bloqueados por popups.
    // Usamos um elemento <a> com blob URL e clique programático, garantindo que não haja bloqueio no Safari/Chrome Mobile.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2000);
    } else {
      pdf.save(fileName);
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(
      'Não foi possível gerar o arquivo PDF. Tente a opção de Imprimir ou Compartilhar.'
    );
  }
};

// Compartilhamento nativo para celular (WhatsApp, Arquivos, E-mail, etc.)
export const sharePdfIfAvailable = async (
  element: HTMLElement,
  fileName: string = 'prontuario_clinico.pdf',
  onProgress?: (progressText: string) => void
): Promise<boolean> => {
  if (!navigator.canShare) {
    return false;
  }

  try {
    const { blob } = await generatePdfBlob(element, onProgress);
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Prontuário Clínico Psicológico',
        text: 'Documento confidencial de evolução psicológica emitido pelo AuraPsi.',
        files: [file],
      });
      return true;
    }
  } catch (err) {
    // Usuário cancelou o compartilhamento ou erro
    if ((err as Error).name !== 'AbortError') {
      console.warn('Falha no Web Share:', err);
    }
  }
  return false;
};

export const printDocumentDirectly = (): void => {
  window.print();
};
