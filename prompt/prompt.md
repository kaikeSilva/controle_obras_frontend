# 📋 Guia de Implementação - [Entidade]Crud.vue

## Visão Geral
Este guia fornece um passo a passo completo para implementar qualquer componente CRUD no sistema, baseado na análise do `ObrasCrud.vue` e suas integrações.

## **FASE 1: PREPARAÇÃO DA INFRAESTRUTURA**

### **1.1 Criar Tipos TypeScript** 
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/types/obra.types.ts
checklist:
- [ ] Criar arquivo `src/types/[entidade].types.ts`
- [ ] Definir interface da entidade principal (`[Entidade]`)
- [ ] Definir interface do formulário (`[Entidade]Form`)
- [ ] Definir interface de filtros (`[Entidade]Filter`)
- [ ] Definir tipos de paginação (`PaginatedResponse`, `PaginationLinks`, `PaginationMeta`)

### **1.2 Implementar Service**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/services/obrasService.ts
checklist:
- [ ] Criar `src/services/[entidade]Service.ts`
- [ ] Implementar método `get[Entidades]()` com suporte a paginação e filtros
- [ ] Implementar método `get[Entidade]ById(id: number)`
- [ ] Implementar método `create[Entidade](data: Partial<[Entidade]>)`
- [ ] Implementar método `update[Entidade](id: number, data: Partial<[Entidade]>)`
- [ ] Implementar método `delete[Entidade](id: number)`
- [ ] Definir interface de parâmetros para busca com filtros e paginação
- [ ] Implementar tratamento de erros consistente

### **1.3 Implementar Store Pinia**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/stores/obrasStore.ts
checklist:
- [ ] Criar `src/stores/[entidade]Store.ts`
- [ ] Implementar estado reativo (entidades, loading, error, pagination, filtros, ordenação)
- [ ] Implementar getters computados
- [ ] Implementar actions para todas as operações CRUD
- [ ] Implementar gerenciamento de filtros e ordenação
- [ ] Implementar limpeza de erros

---

## **FASE 2: COMPONENTES DE INTERFACE**

### **2.1 Criar Componente de Filtro**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasFilter.vue
checklist:
- [ ] Implementar `src/components/[entidades]/[Entidades]Filter.vue`
- [ ] Criar campo de busca geral
- [ ] Implementar filtros avançados colapsáveis
- [ ] Implementar botões de aplicar e limpar filtros
- [ ] Implementar botão de adicionar nova entidade
- [ ] Tornar responsivo para mobile
- [ ] Emitir eventos: `filter`, `clear`, `add-[entidade]`

### **2.2 Criar Componente de Tabela**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasTable.vue
checklist:
- [ ] Implementar `src/components/[entidades]/[Entidades]Table.vue`
- [ ] Implementar cabeçalhos ordenáveis com ícones de direção
- [ ] Implementar componente de paginação integrado
- [ ] Implementar menu de ações (visualizar, editar, excluir)
- [ ] Implementar controle de menu dropdown com clique fora
- [ ] Tornar visível apenas em desktop (min-width: 768px)
- [ ] Implementar formatação de dados (datas, moeda, status)

### **2.3 Criar Componente de Cards**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasCards.vue
checklist:
- [ ] Implementar `src/components/[entidades]/[Entidades]Cards.vue`
- [ ] Criar visualização em cards para mobile
- [ ] Implementar mesmo menu de ações da tabela
- [ ] Implementar paginação
- [ ] Tornar visível apenas em mobile (max-width: 767px)
- [ ] Implementar layout responsivo para cards

## **FASE 3: COMPONENTE CRUD PRINCIPAL**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasCrud.vue
checklist:
### **3.1 Estrutura Base do CRUD**
- [ ] Criar `src/components/[entidades]/[Entidades]Crud.vue`
- [ ] Implementar props necessárias (ex: clienteId para entidades filhas)
- [ ] Importar e configurar store da entidade
- [ ] Importar todos os componentes necessários
- [ ] Configurar refs e estado local

### **3.2 Implementar Estados de Interface**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasCrud.vue
checklist:
- [ ] Implementar estado de loading com `LoadingSpinner`
- [ ] Implementar estado de erro com `ErrorMessage` e retry
- [ ] Implementar estado vazio quando não há dados
- [ ] Implementar container principal quando há dados
- [ ] Implementar transições suaves entre estados

### **3.3 Implementar Integração com Componentes**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasCrud.vue
checklist:
- [ ] Conectar `[Entidades]Filter` com handlers de filtro
- [ ] Conectar `[Entidades]Table` com handlers de paginação e ordenação
- [ ] Conectar `[Entidades]Cards` com mesmos handlers
- [ ] Implementar handler para adicionar nova entidade
- [ ] Sincronizar estado entre tabela e cards

### **3.4 Implementar Operações CRUD**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/components/obras/ObrasCrud.vue
checklist:
- [ ] Implementar `load[Entidades]()` com suporte a filtros
- [ ] Implementar `handlePageChange(page: number)`
- [ ] Implementar `handlePerPageChange(perPage: number)`
- [ ] Implementar `handleFilter(filters: Record<string, string>)`
- [ ] Implementar `handleClearFilters()`
- [ ] Implementar `handleSort(field: string)`
- [ ] Implementar operações de criar, editar e excluir

---

## **FASE 4: INTEGRAÇÃO COM SISTEMA**

### **4.1 Configurar Rotas**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/router/index.ts
checklist:
- [ ] Adicionar rotas no `src/router/index.ts`
- [ ] Configurar rota para listagem (`/[entidades]`)
- [ ] Configurar rota para criação (`/[entidades]/novo`)
- [ ] Configurar rota para edição (`/[entidades]/:id/editar`)
- [ ] Configurar rota para detalhes (`/[entidades]/:id`)
- [ ] Implementar breadcrumbs com meta apropriada
- [ ] Configurar parâmetros de rota e validação

### **4.2 Criar Views**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/views/obras/ObrasView.vue
- src/views/obras/ObrasFormView.vue
- src/views/obras/ObrasDetailsView.vue
checklist:
- [ ] Implementar `src/views/[entidades]/[Entidades]View.vue` para listagem
- [ ] Implementar `src/views/[entidades]/[Entidade]FormView.vue` para formulário
- [ ] Implementar `src/views/[entidades]/[Entidade]DetailsView.vue` para detalhes
- [ ] Configurar layout consistente com o sistema
- [ ] Implementar navegação entre views

### **4.3 Implementar Notificações**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/views/obras/ObrasView.vue
checklist:
- [ ] Integrar `useNotificationStore` em todas as operações
- [ ] Implementar mensagens de sucesso para criar/editar/excluir
- [ ] Implementar mensagens de erro com tratamento apropriado
- [ ] Configurar durações e tipos de notificação consistentes
- [ ] Implementar feedback visual durante operações

### **4.4 Configurar Navegação**
Ver exemplo na entidade de obras nos arquivos abaixo:
- src/views/obras/ObrasView.vue
checklist:
- [ ] Implementar navegação entre listagem e formulários
- [ ] Configurar redirecionamentos após operações CRUD
- [ ] Implementar breadcrumbs contextuais
- [ ] Configurar botões de ação no sidebar (se aplicável)
- [ ] Implementar navegação de volta consistente

---

## **FASE 5: REFINAMENTOS E RESPONSIVIDADE**

### **5.1 Implementar Responsividade**
- [ ] Garantir que tabela só apareça em desktop (≥768px)
- [ ] Garantir que cards só apareçam em mobile (<768px)
- [ ] Implementar breakpoints apropriados para todos os componentes
- [ ] Testar comportamento em diferentes tamanhos de tela
- [ ] Implementar navegação mobile-friendly

### **5.2 Implementar Formatação de Dados**
- [ ] Implementar formatadores para datas usando `formatDate()`
- [ ] Implementar formatadores para moeda usando `formatCurrency()`
- [ ] Implementar badges de status com cores apropriadas
- [ ] Implementar formatação de campos específicos da entidade
- [ ] Implementar truncamento de texto longo

### **5.3 Implementar Validações**
- [ ] Implementar validação no frontend para formulários
- [ ] Implementar feedback visual para campos inválidos
- [ ] Implementar mensagens de erro específicas por campo
- [ ] Implementar validação de relacionamentos (se aplicável)
- [ ] Implementar validação de dados antes de envio

### **5.4 Testes e Polimento**
- [ ] Testar todas as operações CRUD (criar, ler, atualizar, excluir)
- [ ] Testar filtros e paginação em diferentes cenários
- [ ] Testar responsividade em dispositivos móveis e desktop
- [ ] Testar tratamento de erros e conexão perdida
- [ ] Implementar loading states apropriados para todas as operações
- [ ] Verificar acessibilidade básica (labels, aria-labels)
- [ ] Testar navegação por teclado

---

## **PADRÕES E CONVENÇÕES**

### **Nomenclatura**
- **Componentes**: PascalCase (`ClientesCrud.vue`, `ClientesTable.vue`)
- **Métodos**: camelCase (`handlePageChange`, `loadClientes`)
- **Arquivos**: kebab-case para pastas, PascalCase para componentes
- **Props/Events**: camelCase (`clienteId`, `@page-change`)

### **Estrutura de Arquivos**
```
src/
├── components/
│   └── [entidades]/
│       ├── [Entidades]Crud.vue
│       ├── [Entidades]Filter.vue
│       ├── [Entidades]Table.vue
│       ├── [Entidades]Cards.vue
├── services/
│   └── [entidade]Service.ts
├── stores/
│   └── [entidade]Store.ts
├── types/
│   └── [entidade].types.ts
└── views/
    └── [entidades]/
        ├── [Entidades]View.vue
        ├── [Entidade]FormView.vue
        └── [Entidade]DetailsView.vue
```

### **Estilos e Design**
- [ ] Usar SCSS com variáveis do sistema (`$primary-color`, `$spacing-md`, etc.)
- [ ] Implementar hover states e transições suaves
- [ ] Usar box-shadow e border-radius consistentes
- [ ] Implementar estados de focus para acessibilidade
- [ ] Usar cores semânticas para ações (verde para sucesso, vermelho para exclusão)

### **Estados e Feedback**
- [ ] Sempre implementar loading, error e empty states
- [ ] Implementar skeleton loading quando apropriado
- [ ] Usar spinners consistentes com o sistema
- [ ] Implementar feedback imediato para ações do usuário
- [ ] Implementar confirmações para ações destrutivas

### **Performance**
- [ ] Implementar paginação para grandes conjuntos de dados
- [ ] Implementar debounce em campos de busca
- [ ] Usar lazy loading quando apropriado
- [ ] Minimizar re-renders desnecessários
- [ ] Implementar cache local quando apropriado

### **Acessibilidade**
- [ ] Usar labels apropriados para todos os inputs
- [ ] Implementar aria-labels para botões de ação
- [ ] Garantir navegação por teclado funcional
- [ ] Usar estrutura semântica adequada (headings, nav, main)
- [ ] Implementar contraste de cores adequado

---

## **CHECKLIST FINAL**

### **Funcionalidades Essenciais**
- [ ] ✅ CRUD completo (Create, Read, Update, Delete)
- [ ] ✅ Paginação funcional
- [ ] ✅ Filtros e busca
- [ ] ✅ Ordenação por colunas
- [ ] ✅ Responsividade (mobile + desktop)
- [ ] ✅ Estados de loading e erro
- [ ] ✅ Notificações de feedback
- [ ] ✅ Modais de confirmação

### **Integração com Sistema**
- [ ] ✅ Rotas configuradas
- [ ] ✅ Breadcrumbs funcionais
- [ ] ✅ Store Pinia integrado
- [ ] ✅ Serviços API funcionais
- [ ] ✅ Tipos TypeScript definidos
- [ ] ✅ Navegação consistente

### **Qualidade e Manutenibilidade**
- [ ] ✅ Código limpo e bem estruturado
- [ ] ✅ Comentários em pontos complexos
- [ ] ✅ Tratamento de erros robusto
- [ ] ✅ Performance otimizada
- [ ] ✅ Acessibilidade básica
- [ ] ✅ Testes manuais realizados

---

## Problemas Frequentes e Soluções

Esta seção documenta problemas comuns encontrados durante a implementação de CRUDs e suas soluções, baseados na experiência com o CRUD de Categorias de Gastos.

### **1. Problemas de Compatibilidade com Bibliotecas**

- **Problema**: Bibliotecas de terceiros podem não ser compatíveis com a versão do Vue utilizada no projeto.
- **Solução**: 
  - Sempre verifique a compatibilidade da biblioteca com Vue 3 antes de instalar
  - Prefira bibliotecas com suporte ativo e boa documentação
  - Use a flag `--legacy-peer-deps` apenas como último recurso
  - Para componentes de seleção/autocomplete, considere usar `@vueform/multiselect` que é compatível com Vue 3

### **2. Problemas com Importações de Tipos**

- **Problema**: Erros de importação como `import { App } from 'vue'` quando App é apenas um tipo.
- **Solução**: 
  - Use a palavra-chave `type` nas importações de tipos: `import type { App } from 'vue'`
  - Mantenha tipos e valores separados nas importações

### **3. Problemas com Chamadas de API**

- **Problema**: Endpoints de API não são chamados ou não aparecem nos logs de rede.
- **Solução**: 
  - Adicione logs detalhados para rastrear o fluxo de execução
  - Verifique se o método é chamado no hook `onMounted`
  - Certifique-se de que o caminho do endpoint está correto
  - Verifique se o serviço está sendo importado corretamente

### **4. Problemas de Layout e Espaçamento**

- **Problema**: Componentes não ocupam todo o espaço disponível ou têm margens/paddings inesperados.
- **Solução**: 
  - Siga exatamente a estrutura CSS dos componentes existentes
  - Evite adicionar propriedades flex desnecessárias
  - Mantenha a estrutura HTML simples e consistente com outros componentes
  - Use as mesmas unidades de medida (rem, px) que já são usadas no projeto

### **5. Problemas de Contraste e Acessibilidade**

- **Problema**: Texto com contraste insuficiente, especialmente em componentes de formulário.
- **Solução**: 
  - Use cores mais escuras para texto (ex: #1a202c em vez de #718096)
  - Adicione font-weight: 500 ou 600 para melhorar a legibilidade
  - Teste o contraste em diferentes tamanhos de tela
  - Personalize os componentes de terceiros para seguir o padrão de design do projeto

### **6. Problemas de Duplicação de Serviços**

- **Problema**: Criação de serviços redundantes (ex: clientesService vs clientsService).
- **Solução**: 
  - Verifique se já existe um serviço para a entidade antes de criar um novo
  - Mantenha a nomenclatura consistente (português ou inglês)
  - Adicione novos métodos a serviços existentes em vez de criar novos arquivos

### **7. Problemas de criacao de modais**

- **Problema**: Criação de modais sem a necessidade, em nenhum momento foi dito que deveria ter uma modal para cadastros e edicao, se isso nunca for pedido, nao crie.
- **Solução**: 
  - Ao criar uma modal verifique se foi pedido
---


**💡 Dica**: Use este guia como checklist durante a implementação. Cada item deve ser completado e testado antes de prosseguir para o próximo. A ordem das fases é importante para manter a consistência e evitar retrabalho.