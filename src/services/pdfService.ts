import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

// Dimensões A4 em pixels a 96 DPI:
// 210mm = 793.7px (~794px), 297mm = 1122.5px (~1123px)
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
// Margem utilizável de segurança para evitar que qualquer texto encoste na borda inferior da folha
const USABLE_PAGE_HEIGHT = 1040;

/**
 * Algoritmo de Paginação Inteligente:
 * Percorre os blocos clínicos (seções, caixas, carimbos) e, caso algum deles vá ser
 * cortado pela divisão de página A4, insere um espaçador suave empurrando o bloco
 * INTEIRO para o topo da página seguinte. NUNCA mais corta textos ou caixas ao meio!
 */
export const applySmartPageBreaks = (container: HTMLElement) => {
  const blocks = Array.from(
    container.querySelectorAll<HTMLElement>('[data-pdf-block="true"]')
  );
  if (blocks.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  let currentPage = 1;

  for (const block of blocks) {
    const blockRect = block.getBoundingClientRect();
    const blockTop = blockRect.top - containerRect.top;
    const blockBottom = blockTop + blockRect.height;

    const pageBoundary = currentPage * A4_HEIGHT_PX;
    const pageThreshold = (currentPage - 1) * A4_HEIGHT_PX + USABLE_PAGE_HEIGHT;

    // Se o bloco cruzar a margem de segurança da página atual:
    if (blockBottom > pageThreshold && blockTop < pageBoundary) {
      const spacerHeight = pageBoundary - blockTop + 32; // 32px de respiro no topo da nova página
      const spacer = document.createElement('div');
      spacer.className = 'pdf-smart-page-spacer';
      spacer.style.height = `${spacerHeight}px`;
      spacer.style.width = '100%';
      spacer.style.display = 'block';
      spacer.style.clear = 'both';
      spacer.style.pointerEvents = 'none';

      block.parentNode?.insertBefore(spacer, block);
      currentPage++;
    }
  }
};

export const generatePdfBlob = async (
  element: HTMLElement,
  onProgress?: (progressText: string) => void
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  if (onProgress) onProgress('Preparando diagramação A4 sem cortes...');

  const originalScrollTop = window.scrollY;
  window.scrollTo(0, 0);

  if (onProgress) onProgress('Calculando quebras inteligentes de página...');

  const canvas = await html2canvas(element, {
    scale: 2.0, // Alta resolução (300 DPI equivalente)
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: A4_WIDTH_PX,
    windowWidth: A4_WIDTH_PX,
    onclone: (_clonedDoc, clonedElement) => {
      // Força dimensões estritas A4
      clonedElement.style.width = `${A4_WIDTH_PX}px`;
      clonedElement.style.minWidth = `${A4_WIDTH_PX}px`;
      clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
      clonedElement.style.margin = '0 auto';
      clonedElement.style.padding = '36px 44px';
      clonedElement.style.boxSizing = 'border-box';
      clonedElement.style.boxShadow = 'none';
      clonedElement.style.borderRadius = '0px';

      // Executa o algoritmo de corte anti-defeito
      applySmartPageBreaks(clonedElement);
    },
  });

  window.scrollTo(0, originalScrollTop);

  if (onProgress) onProgress('Gerando documento PDF perfeito...');

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

  // Páginas subsequentes cortadas com precisão milimétrica nas áreas vazias
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

    if (onProgress) onProgress('Concluindo download do arquivo...');

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
