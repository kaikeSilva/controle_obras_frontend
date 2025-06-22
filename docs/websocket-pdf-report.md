# Documentação: WebSocket para Relatórios PDF

## Escopo da Funcionalidade

Esta documentação descreve a implementação de um sistema de monitoramento em tempo real para geração de relatórios PDF utilizando WebSockets. A funcionalidade substitui o mecanismo anterior baseado em polling, proporcionando uma experiência mais responsiva e eficiente para o usuário durante a geração de relatórios PDF.

## Descrição da Feature

O sistema de relatórios PDF com WebSocket permite:

1. **Monitoramento em tempo real** do progresso de geração de relatórios PDF
2. **Feedback visual** através de um modal de progresso com informações detalhadas
3. **Cancelamento** de relatórios em andamento
4. **Notificações** sobre o status da geração (iniciado, em progresso, concluído, falha)
5. **Download automático** após a conclusão bem-sucedida

A implementação utiliza o Laravel Echo com Reverb como broadcaster WebSocket, integrado ao Vue 3 com TypeScript e Pinia para gerenciamento de estado.

## Fluxo de Funcionamento

1. O usuário solicita a geração de um relatório PDF
2. O sistema inicia a geração assíncrona no backend
3. O WebSocket estabelece uma conexão para monitorar o progresso
4. Eventos em tempo real são recebidos e processados:
   - `pdf.generation.started`: Quando a geração é iniciada
   - `pdf.generation.progress`: Atualizações de progresso durante a geração
   - `pdf.generation.completed`: Quando o PDF está pronto para download
   - `pdf.generation.failed`: Quando ocorre um erro na geração
5. Um modal de progresso exibe o status atual e opções relevantes
6. O usuário pode cancelar, baixar ou fechar o modal conforme o estado do relatório

## Configuração do Ambiente

Para o correto funcionamento, as seguintes variáveis de ambiente devem estar configuradas:

```
VITE_REVERB_APP_KEY=demo_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8087
VITE_REVERB_SCHEME=ws
```

Nota: Foi confirmado que o servidor WebSocket está acessível na porta 8087 com a chave "demo_key".

## Arquivos Envolvidos na Implementação

### Configuração e Tipos
- `/src/services/websocket/config.ts` - Configuração do WebSocket com Reverb
- `/src/types/pdf-events.types.ts` - Interfaces e tipos para eventos de PDF

### Lógica de Negócio
- `/src/composables/usePdfWebSocket.ts` - Composable para gerenciamento de eventos WebSocket de PDF
- `/src/services/pdfReportService.ts` - Serviço para solicitação e gerenciamento de relatórios PDF

### Interface do Usuário
- `/src/components/pdf/PdfProgressModal.vue` - Componente de modal para exibição de progresso
- `/src/views/obras/ObraReportView.vue` - View refatorada para usar WebSocket em vez de polling

### Stores e Serviços Relacionados
- `/src/stores/websocket.ts` - Store Pinia para gerenciamento de estado do WebSocket
- `/src/stores/auth.ts` - Store de autenticação para obtenção do canal do usuário
- `/src/services/api.ts` - Serviço base para requisições HTTP

## Uso do Composable

O composable `usePdfWebSocket` fornece uma API simples para integração em qualquer componente:

```typescript
const pdfWebSocket = usePdfWebSocket();

// Inicializar listeners
pdfWebSocket.initializePdfListeners();

// Iniciar monitoramento de um job
pdfWebSocket.startMonitoring(jobId);

// Parar monitoramento
pdfWebSocket.stopMonitoring();

// Estados reativos disponíveis
pdfWebSocket.isGenerating;    // Se há um PDF sendo gerado
pdfWebSocket.isCompleted;     // Se o PDF foi concluído com sucesso
pdfWebSocket.hasFailed;       // Se houve falha na geração
pdfWebSocket.pdfJobState;     // Estado detalhado do job atual
```

## Integração com Componentes

Para integrar o sistema de WebSocket para PDF em um componente Vue:

1. Importe o composable e o componente modal
2. Inicialize os listeners do WebSocket
3. Solicite a geração do PDF via serviço
4. Inicie o monitoramento com o ID do job retornado
5. Exiba o modal de progresso
6. Gerencie eventos de cancelamento, download e fechamento

## Considerações de Segurança

- O canal WebSocket é específico para o usuário autenticado
- As operações de cancelamento verificam a propriedade do job
- Tokens de download são validados no servidor

## Manutenção e Extensão

Para adicionar novos tipos de relatórios PDF:

1. Adicione novos métodos no `pdfReportService.ts`
2. Estenda as interfaces em `pdf-events.types.ts` se necessário
3. Utilize o mesmo padrão de eventos no backend
