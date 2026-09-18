import type { StructuredClinicalNote } from '../types';

export interface AIProcessingResult {
  rawTranscription: string;
  structuredNote: StructuredClinicalNote;
}

// Exemplos de demonstração clínica hiper-realistas para psicólogos
export const CLINICAL_DEMO_CASES: Record<string, AIProcessingResult> = {
  ansiedade: {
    rawTranscription:
      'Terminamos agora a 8ª sessão com a Mariana. Ela chegou um pouco mais ansiosa do que na semana passada, relatando que teve um episódio agudo de ansiedade na terça-feira à noite após receber um e-mail do gestor com cobrança de metas. Ela identificou palpitação, sudorese fria nas mãos e um pensamento automático imediato de "eu serei demitida e não conseguirei outro emprego", caracterizando uma nítida distorção cognitiva de catastrofização combinada com leitura mental. Nós aplicamos a técnica do Registro de Pensamentos Disfuncionais (RPD) e fizemos o exame das evidências favoráveis e contrárias a essa crença. Ela percebeu que seu histórico de entregas é elogiado e que a cobrança foi geral para toda a equipe. Realizamos também um treino breve de respiração diafragmática com contagem 4-7-8, observando relaxamento muscular evidente e redução subjetiva da ansiedade de 8 para 3 na escala visual analógica. Como tarefa para a semana, combinamos que ela manterá o preenchimento do diário de pensamentos automáticos caso surjam novas cobranças no trabalho e praticará a respiração 5 minutos pela manhã. Para a próxima sessão, vamos trabalhar a assertividade na comunicação com a liderança.',
    structuredNote: {
      demandaPrincipal:
        'Crise aguda de ansiedade deflagrada por cobrança profissional e ativação de esquemas de incompetência e catastrofização.',
      estadoMentalHumor:
        'Paciente orientada no tempo e espaço, vigil, com humor ansioso no início da sessão e afeto congruente. Demonstrou reatividade neurovegetativa (relato de taquicardia prévia), com redução sensível da tensão corporal após intervenções.',
      temasAbordados: [
        'Episódio agudo de ansiedade vivenciado na terça-feira após demanda de trabalho',
        'Pensamentos automáticos de demissão e ruína financeira',
        'Distorções cognitivas: Catastrofização e Leitura Mental',
        'Relação com a figura de autoridade no ambiente corporativo',
      ],
      intervencoes: [
        'Registro de Pensamentos Disfuncionais (RPD) focado no evento ativador do trabalho',
        'Exame de evidências e busca por respostas cognitivas alternativas realistas',
        'Psicoeducação sobre o ciclo do medo e ativação simpática',
        'Treino prático de respiração diafragmática (técnica 4-7-8) para regulação vagal',
      ],
      insightsPaciente:
        'Mariana reconheceu que sua mente tende a antecipar cenários de catástrofe sem base fática real, projetando inseguranças antigas de desvalorização profissional. Pontuou alívio ao perceber que o e-mail não era um ataque pessoal.',
      tarefasAcordadas: [
        'Preenchimento do Registro de Pensamentos Disfuncionais (RPD) ao notar elevação de ansiedade',
        'Prática diária de 5 minutos de respiração diafragmática pela manhã',
        'Evitar checagem de e-mails corporativos após as 20h00',
      ],
      planejamentoProximaSessao:
        'Investigar a assertividade na comunicação corporativa e mapear crenças intermediárias sobre perfeccionismo e vulnerabilidade.',
      observacoesSigilosas:
        'Atenção ao padrão de autosabotagem e hiperexigência. Não há ideação de risco. Manter monitoramento da qualidade do sono.',
    },
  },
  burnout: {
    rawTranscription:
      'Sessão com o Lucas, 14º encontro. O paciente compareceu com aspecto de esgotamento e fadiga crônica, postura curvada e lentificação no ritmo da fala. Relatou sensação profunda de despersonalização no trabalho e anedonia nas horas de lazer com a família, dizendo que no fim de semana mal conseguiu sair da cama. Exploramos a dinâmica de limites no trabalho e ele verbalizou culpa intensa sempre que pensa em dizer "não" a novas demandas extras. Trabalhamos a técnica de clarificação de valores e o desmantelamento da crença central de que "meu valor como ser humano depende exclusivamente da minha produtividade incessante". O Lucas se emocionou bastante durante o exercício de autocompaixão ao recordar as cobranças paternas na infância. Estabelecemos um plano gradual de delimitação de horário de trabalho e agendamento de atividades de domínio e prazer. Na próxima sessão, vamos revisar a evolução da rotina de sono e introduzir limites com os pares.',
    structuredNote: {
      demandaPrincipal:
        'Quadro compatível com Síndrome de Burnout / Esgotamento Profissional Crônico com sintomas de despersonalização e anedonia.',
      estadoMentalHumor:
        'Humor deprimido/disfórico, afeto embotado inicialmente, fáceis de fadiga perceptível. Choro catártico congruente durante o resgate de memórias. Discurso coerente com ritmo lentificado.',
      temasAbordados: [
        'Exaustão emocional e sobrecarga no ambiente de trabalho',
        'Dificuldade de estabelecimento de limites e culpa associada à recusa',
        'Crença nuclear de valor pessoal atrelado à hiperprodutividade',
        'Impacto do esgotamento nas relações conjugais e familiares',
      ],
      intervencoes: [
        'Clarificação de valores fundamentais vs. demandas externas de validação',
        'Técnicas de Autocompaixão e reestruturação de diálogos internos autocríticos',
        'Psicoeducação sobre os estágios fisiológicos e psicológicos do Burnout',
        'Prescrição comportamental de Micro-Pausas Restaurativas e restrição de sobrejornada',
      ],
      insightsPaciente:
        'Lucas verbalizou com clareza a correlação entre a busca incansável por aprovação e as exigências parentais da infância. Concluiu que a exaustão atual é um preço insustentável para manter uma imagem de invulnerabilidade.',
      tarefasAcordadas: [
        'Definir horário fixo de desligamento do computador do trabalho (impreterivelmente às 18h30)',
        'Caminhada matinal ao ar livre de 20 minutos sem fones de notícias ou trabalho',
        'Anotar momentos da semana em que sentiu vontade de dizer "não" e qual emoção emergiu',
      ],
      planejamentoProximaSessao:
        'Avaliar adesão ao plano de pausas, monitorar sintomas depressivos secundários e treinar comunicação assertiva para delegação de tarefas.',
      observacoesSigilosas:
        'Caso os sintomas de despersonalização e anedonia persistam nas próximas duas semanas, considerar encaminhamento psiquiátrico conjunto para avaliação de suporte farmacológico.',
    },
  },
  relacionamento: {
    rawTranscription:
      'Beatriz compareceu para a 5ª sessão pontualmente. Hoje ela trouxe uma questão central de insegurança no relacionamento afetivo com o namorado. Relatou que sentiu ciúmes intenso quando ele saiu com amigos na sexta-feira e que passou o sábado inteiro remoendo o fato dele ter demorado 30 minutos para responder a uma mensagem. Notamos a ativação de um esquema de abandono/instabilidade afetiva. Fizemos a diferenciação entre "fato" e "interpretação", e trabalhamos a tolerância ao mal-estar emocional sem recurso a comportamentos de checagem compulsiva no WhatsApp e redes sociais. Ela conseguiu identificar que o medo não era sobre o namorado em si, mas sim o medo arcaico de ser esquecida e trocada, herdado do divórcio conflituoso dos pais. Como combinado, ela se comprometeu a não monitorar o status online dele durante a semana e a praticar a escrita terapêutica quando a angústia de separação se manifestar.',
    structuredNote: {
      demandaPrincipal:
        'Insegurança vincular nos relacionamentos íntimos com ativação de pensamentos automáticos de rejeição e comportamentos de hipervigilância.',
      estadoMentalHumor:
        'Vigil, orientada, humor angustiado com oscilações de vergonha e irritabilidade. Boa capacidade introspectiva e alta aliança de trabalho.',
      temasAbordados: [
        'Crise de ciúmes e ansiedade de separação desencadeada por atraso em mensagens',
        'Comportamentos de controle e checagem compulsiva em redes sociais',
        'Esquema precoce desadaptativo de Abandono/Instabilidade',
        'Ressonância do divórcio parental na construção de vínculos atuais',
      ],
      intervencoes: [
        'Diferenciação cognitiva entre Realidade Fática vs. Projeção Emocional',
        'Prevenção de resposta para impulsos de checagem virtual (WhatsApp/Instagram)',
        'Técnica da Cadeira Vazia adaptada para acolhimento da "Criança Vulnerável"',
        'Prescrição de escrita expressiva terapêutica para autorregulação',
      ],
      insightsPaciente:
        'Beatriz compreendeu que as checagens online funcionavam como um alívio momentâneo que retroalimentava a ansiedade a longo prazo. Percebeu a repetição do sentimento de desamparo vivenciado na infância.',
      tarefasAcordadas: [
        'Desativar confirmações de leitura e abster-se de monitorar horário de "visto por último"',
        'Aplicar a pausa de 15 minutos e escrita reflexiva antes de enviar mensagens impulsivas de cobrança',
        'Leitura do texto psicoeducativo sobre estilos de apego fornecido em sessão',
      ],
      planejamentoProximaSessao:
        'Trabalhar estratégias de fortalecimento da individuação e autoafirmação afetiva.',
      observacoesSigilosas:
        'Excelente prognóstico terapêutico. Boa permeabilidade aos questionamentos reflexivos.',
    },
  },
};

// Converte Blob de áudio para Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const SYSTEM_PROMPT = `Você é um assistente de IA sênior especializado em Psicologia Clínica e Prontuários Psicológicos de Alto Padrão Técnico (conforme as diretrizes do Conselho Federal de Psicologia - CFP / Resolução CFP nº 01/2009 e Código de Ética Profissional).

Sua missão é ouvir o áudio gravado pela psicóloga após a sessão de psicoterapia e:
1. Gerar uma TRANSCRIÇÃO LIMPA E FIEL da fala da psicóloga:
   - Mantenha com total rigor o vocabulário clínico e as observações trazidas.
   - Elimine apenas vícios de linguagem naturais da fala coloquial (como "ééé", "tipo assim", "né", "tá entendendo", repetições acidentais).
   - Corrija a ortografia e pontuação para um português culto e impecável.
   - Garanta a grafia exata de termos técnicos (ex: TCC, DSM-5, anedonia, catastrofização, desfusão cognitiva, transferência, hipervigilância, etc.).

2. Estruturar a EVOLUÇÃO CLÍNICA DE PRONTUÁRIO em seções bem delimitadas:
   - demandaPrincipal: Síntese da queixa/motivo central deste encontro.
   - estadoMentalHumor: Descrição do humor, afeto, reatividade emocional, postura e discurso observados no(a) paciente.
   - temasAbordados: Array de tópicos trabalhados durante a sessão.
   - intervencoes: Array de técnicas, manejos clínicos e abordagens utilizadas pela psicóloga.
   - insightsPaciente: Reações, tomadas de consciência e engajamento do(a) paciente.
   - tarefasAcordadas: Array de tarefas inter-sessão, combinados ou exercícios acordados com o(a) paciente.
   - planejamentoProximaSessao: Metas, hipóteses e tópicos previstos para a sessão seguinte.
   - observacoesSigilosas: Observações de cautela, alertas ou considerações ético-clínicas.

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "rawTranscription": "...",
  "structuredNote": {
    "demandaPrincipal": "...",
    "estadoMentalHumor": "...",
    "temasAbordados": ["...", "..."],
    "intervencoes": ["...", "..."],
    "insightsPaciente": "...",
    "tarefasAcordadas": ["...", "..."],
    "planejamentoProximaSessao": "...",
    "observacoesSigilosas": "..."
  }
}`;

const normalizeModel = (name?: string): string => {
  if (!name || name === 'gemini-2.5-flash') return 'gemini-3.6-flash';
  return name;
};

export const processAudioWithGemini = async (
  audioBlob: Blob,
  apiKey: string,
  modelName: string = 'gemini-3.6-flash'
): Promise<AIProcessingResult> => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chave de API do Gemini não configurada.');
  }

  const activeModel = normalizeModel(modelName);
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey.trim()}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.includes('audio') ? mimeType : 'audio/webm',
              data: base64Audio,
            },
          },
          {
            text: 'Por favor, processe este áudio clínico de encerramento de sessão conforme suas instruções de sistema e retorne o JSON com a transcrição impecável e a evolução clínica estruturada.',
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message || `Falha na requisição: status ${response.status} (${response.statusText})`;
    throw new Error(message);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Nenhuma resposta foi gerada pelo modelo de IA.');
  }

  try {
    const parsed = JSON.parse(textOutput) as AIProcessingResult;
    return parsed;
  } catch (e) {
    console.error('Erro ao fazer parse do JSON retornado pelo Gemini:', textOutput, e);
    // Tenta extrair JSON com regex caso venha com markdown wrappers
    const match = textOutput.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as AIProcessingResult;
    }
    throw new Error('O modelo retornou uma resposta fora do padrão JSON esperado.');
  }
};

// Processa texto transcrito diretamente (caso o psicólogo queira colar ou usar speech recognition)
export const structureTranscriptionWithGemini = async (
  transcriptionText: string,
  apiKey: string,
  modelName: string = 'gemini-3.6-flash'
): Promise<AIProcessingResult> => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Chave de API do Gemini não configurada.');
  }

  const activeModel = normalizeModel(modelName);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey.trim()}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `Aqui está o relato da sessão falado pelo psicólogo:\n\n"${transcriptionText}"\n\nEstruture a evolução clínica e devolva a transcrição polida e a evolução estruturada em formato JSON.`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Erro ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) throw new Error('Nenhuma resposta gerada pela IA.');

  try {
    return JSON.parse(textOutput) as AIProcessingResult;
  } catch {
    const match = textOutput.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as AIProcessingResult;
    throw new Error('Formato retornado pela IA não é JSON válido.');
  }
};
