# 🌿 AuraPsi — Prontuário Clínico & Transcrição por Voz com IA para Psicólogos

Sistema web de alta fidelidade desenvolvido especificamente para psicólogos clínicos. Permite gravar ou anexar áudios relatando as sessões de psicoterapia, transcrever sem erros de vocabulário técnico através de Inteligência Artificial Multimodal, estruturar automaticamente a evolução clínica conforme os padrões do Conselho Federal de Psicologia (CFP) e exportar um prontuário em PDF com diagramação editorial milimétrica ("perfeição real").

---

## ✨ Recursos Principais

- 🎙️ **Gravação Integrada & Visualizador**: Gravação no navegador com cancelamento de ruído e visualizador de ondas sonoras em tempo real via Web Audio API.
- 📱 **Suporte a Áudios de WhatsApp**: Aceita arquivos `.opus`, `.m4a`, `.mp3`, `.ogg`, `.wav`.
- 🧠 **Transcrição Inteligente com Gemini Flash**: Vocabulário clínico calibrado (TCC, psicanálise, DSM-5, anedonia, etc.) e remoção de cacoetes da fala coloquial.
- 📋 **Estruturação Padrão CFP (Resoluções nº 010/2005 e 01/2009)**:
  1. Queixa Principal & Demanda do Encontro
  2. Exame do Estado Mental & Expressão Emocional
  3. Conteúdos & Temas Abordados
  4. Intervenções Psicoterápicas
  5. Insights & Receptividade do Paciente
  6. Acordos & Tarefas Inter-Sessão
  7. Planejamento para a Próxima Sessão
  8. Anotações Sigilosas de Acompanhamento
- 📄 **Exportação de PDF A4 de Alta Definição (300 DPI)**:
  - Marca d'água sutil com o monograma grego da Psicologia (**Ψ**).
  - Cabeçalho executivo com CRP, contatos e dados da clínica.
  - 5 paletas de cores refinadas (Esmeralda, Ardósia, Borgonha, Azul, Ouro).
  - Carimbo digital com linha de assinatura profissional.
- 🔒 **Privacidade & Sigilo**: Dados salvos localmente no dispositivo (`localStorage`).
- ⚡ **Casos de Demonstração Rápidos**: 3 casos clínicos integrados para testar em 1 clique.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS v4, Lucide React
- **Áudio**: Web Audio API, MediaRecorder API
- **IA**: Google Gemini API (Gemini 2.5 / 1.5 Flash Multimodal)
- **Documentos & PDF**: jsPDF, html2canvas

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/SEU-USUARIO/aurapsi.git
cd aurapsi
```

2. Instale as dependências:
```bash
npm install
```

3. (Opcional) Configure sua chave do Google Gemini no arquivo `.env`:
```env
VITE_GEMINI_API_KEY=sua_chave_do_google_ai_studio
```
*(Você também pode inserir a chave diretamente pela interface em Configurações).*

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Abra no navegador:
```
http://localhost:5173
```
