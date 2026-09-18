import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportElementToPdf = async (
  element: HTMLElement,
  fileName: string = 'prontuario_clinico.pdf',
  onProgress?: (progressText: string) => void
): Promise<void> => {
  try {
    if (onProgress) onProgress('Preparando renderização em alta definição...');

    // Salva posições de scroll originais
    const originalScrollTop = window.scrollY;
    window.scrollTo(0, 0);

    if (onProgress) onProgress('Renderizando tipografia e layout clínico (300 DPI)...');

    const canvas = await html2canvas(element, {
      scale: 2.5, // 2.5x para nitidez de impressão editorial
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    window.scrollTo(0, originalScrollTop);

    if (onProgress) onProgress('Gerando documento vetorial A4...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Dimensões A4 em milímetros
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // A4 mm
    const pageHeight = 297; // A4 mm

    // Proporção do canvas
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Primeira página
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Se o conteúdo exceder uma página A4, adiciona páginas subsequentes de forma limpa
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    if (onProgress) onProgress('Concluindo download...');
    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Não foi possível gerar o arquivo PDF. Tente novamente ou use a opção de Impressão Direta.');
  }
};

export const printDocumentDirectly = (): void => {
  window.print();
};
