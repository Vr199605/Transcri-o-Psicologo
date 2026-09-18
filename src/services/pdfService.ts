import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Dimensões A4 perfeitas em 96 DPI (padrão web):
// 210mm = 793.7px (~794px), 297mm = 1122.5px (~1123px)
const A4_WIDTH_PX = 794;

export const generatePdfBlob = async (
  element: HTMLElement,
  onProgress?: (progressText: string) => void
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  if (onProgress) onProgress('Preparando layout editorial A4 em alta resolução...');

  const originalScrollTop = window.scrollY;
  window.scrollTo(0, 0);

  if (onProgress) onProgress('Renderizando tipografia e diagramação (300 DPI)...');

  // Forçamos largura A4 fixa (794px) para garantir que no celular o layout NÃO venha comprimido ou distorcido!
  const canvas = await html2canvas(element, {
    scale: 2.0, // Resolução nítida para impressão gráfica
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: A4_WIDTH_PX,
    windowWidth: A4_WIDTH_PX,
    onclone: (_clonedDoc, clonedElement) => {
      // Garante que o elemento clonado mantenha proporções exatas de folha A4
      clonedElement.style.width = `${A4_WIDTH_PX}px`;
      clonedElement.style.minWidth = `${A4_WIDTH_PX}px`;
      clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
      clonedElement.style.margin = '0 auto';
      clonedElement.style.padding = '36px 44px';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.borderRadius = '0px';
    },
  });

  window.scrollTo(0, originalScrollTop);

  if (onProgress) onProgress('Gerando documento vetorial A4...');

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

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

  // Páginas subsequentes com quebra limpa
  while (heightLeft > 4) {
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

    if (onProgress) onProgress('Iniciando download do arquivo...');

    // Download universal via Blob URL
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 4000);
    } catch {
      pdf.save(fileName);
    }
  } catch (error) {
    console.error('Erro ao gerar PDF via canvas:', error);
    printDocumentDirectly();
    throw new Error(
      'Não foi possível gerar o arquivo diretamente. Abrindo a tela de impressão do navegador para salvar como PDF.'
    );
  }
};

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
    if ((err as Error).name !== 'AbortError') {
      console.warn('Falha no Web Share:', err);
    }
  }
  return false;
};

export const printDocumentDirectly = (): void => {
  window.print();
};
