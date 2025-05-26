# Passo a Passo: Implementação de View Base para Obras

## Análise dos Arquivos Existentes

Após analisar o sistema, identifiquei que você já possui:

### Arquivos CRUD de Obras Existentes (Para Reutilização):
- `src/components/obras/ObrasFilter.vue` - Filtros para obras
- `src/components/obras/ObrasTable.vue` - Tabela/Cards responsivos
- `src/stores/obrasStore.ts` - Store Pinia para obras
- `src/services/obrasService.ts` - Serviços de API
- `src/types/obra.types.ts` - Tipos TypeScript

### Views Existentes de Obras:
- `src/views/obras/ObraFormView.vue` - Formulário de obra
- `src/views/obras/ObraDetailsView.vue` - Detalhes da obra

### Padrão a Seguir:
- `src/views/clients/ClientsView.vue` - Template base para estrutura
- `src/components/clients/ClientsFilter.vue` - Referência para filtros
- `src/components/clients/ClientsTable.vue` - Referência para tabela
- `src/components/clients/ClientsCards.vue` - Referência para cards

## Passo a Passo para Implementar View Base de Obras

### 1. Criar a View Principal de Obras

**Arquivo a criar:** `src/views/obras/ObrasView.vue`

**Atividades:**
- Usar `ClientsView.vue` como template base
- Implementar mesma estrutura: filter-section, loading, error, empty-state
- Chamar `ObrasFilter`, `ObrasTable` e `ObrasCards` diretamente
- Implementar handlers para paginação, filtros e ordenação
- Usar `useObrasStore` para gerenciamento de estado
- Configurar navegação para formulário, detalhes e edição

### 2. Atualizar o Sistema de Roteamento

**Arquivo a modificar:** `src/router/index.ts`

**Atividades:**
- Adicionar rota para `/obras` apontando para `ObrasView.vue`
- Configurar meta informações (título, breadcrumb)
- Definir parâmetros de autenticação necessários
- Configurar rotas aninhadas se necessário

### 3. Criar Cards Component para Mobile

**Arquivo a criar:** `src/components/obras/ObrasCards.vue`

**Atividades:**
- Usar `ClientsCards.vue` como template base
- Adaptar para mostrar dados específicos de obras (nome, cliente, status, valor)
- Implementar menu de ações (visualizar, editar, excluir)
- Incluir modal de confirmação de exclusão
- Configurar paginação responsiva
- Adicionar informações do cliente em cada card

### 4. Atualizar a Sidebar de Navegação

**Arquivo a modificar:** `src/components/layout/AppSidebar.vue`

**Atividades:**
- Adicionar item de menu "Obras" na lista `menuItems`
- Configurar ícone apropriado para obras (sugestão: IconCube ou novo ícone)
- Definir rota de navegação `/obras`
- Ajustar ordem dos itens de menu conforme necessário

### 5. Adaptar ObrasFilter para Contexto Geral

**Arquivo a modificar:** `src/components/obras/ObrasFilter.vue`

**Atividades:**
- Seguir estrutura do `ClientsFilter.vue`
- Adicionar filtro por cliente (dropdown/autocomplete) nos filtros avançados
- Manter filtros existentes (status, data início, prazo estimado, etc.)
- Implementar botão "Adicionar Obra" seguindo padrão dos clientes
- Ajustar layout para incluir busca geral e filtros avançados
- Garantir responsividade para mobile

### 6. Atualizar ObrasTable para Mostrar Cliente

**Arquivo a modificar:** `src/components/obras/ObrasTable.vue`

**Atividades:**
- Seguir estrutura do `ClientsTable.vue`
- Adicionar coluna "Cliente" na tabela desktop
- Remover visualização de cards mobile (será responsabilidade do ObrasCards)
- Implementar ordenação por cliente
- Manter funcionalidades existentes de ações
- Incluir modal de confirmação de exclusão
- Ajustar larguras das colunas para incluir cliente

### 7. Modificar ObrasStore para Contexto Geral

**Arquivo a modificar:** `src/stores/obrasStore.ts`

**Atividades:**
- Seguir estrutura do `clientsStore.ts`
- Ajustar `fetchObras` para funcionar sem `clienteId` obrigatório
- Manter compatibilidade com uso atual (filtragem por cliente opcional)
- Implementar mesmos padrões de state management (activeFilters, sortBy, sortDirection)
- Ajustar getters para retornar dados de paginação consistentes
- Manter métodos de clearFilters e clearError

### 8. Adaptar ObraFormView para Contexto Geral

**Arquivo a modificar:** `src/views/obras/ObraFormView.vue`

**Atividades:**
- Adicionar seleção de cliente quando não vier por parâmetro (usar AutocompleteSelect)
- Implementar lógica para determinar origem da navegação
- Ajustar validações para incluir cliente obrigatório quando necessário
- Modificar navegação de retorno baseada no contexto (geral vs. cliente específico)
- Manter compatibilidade com uso atual via ClientDetailsView

### 9. Atualizar ObraDetailsView para Navegação Geral

**Arquivo a modificar:** `src/views/obras/ObraDetailsView.vue`

**Atividades:**
- Ajustar breadcrumb para funcionar em contexto geral de obras
- Modificar navegação de volta (usar breadcrumbStore para determinar origem)
- Adicionar informação/link do cliente na seção de dados gerais
- Manter funcionalidades existentes de edição/exclusão
- Implementar redirecionamento inteligente após exclusão

### 10. Atualizar Breadcrumb Store

**Arquivo a modificar:** `src/stores/breadcrumbStore.ts`

**Atividades:**
- Adicionar propriedade para contexto de origem (cliente vs. geral)
- Implementar métodos para definir contexto de navegação
- Manter compatibilidade com uso atual
- Adicionar lógica para breadcrumb de obras gerais

### 11. Configurar AutoComplete de Clientes

**Atividades:**
- Verificar se `autocompleteService.ts` possui método para clientes
- Se não existir, adicionar método `getClientes()` no serviço
- Atualizar `autocompleteStore.ts` para incluir opções de clientes
- Implementar seleção de cliente nos filtros e formulários usando AutocompleteSelect existente

### 12. Ajustar Tipos TypeScript

**Arquivo a verificar:** `src/types/obra.types.ts`

**Atividades:**
- Verificar se tipos existentes incluem dados do cliente nas obras
- Adicionar interface para cliente relacionado se necessário
- Manter compatibilidade com código existente
- Adicionar tipos para filtros que incluem cliente se necessário

### 13. Testes e Validação

**Atividades:**
- Testar view de obras independente (`/obras`)
- Verificar que funcionalidade em `ClientDetailsView` não foi quebrada
- Validar navegação entre diferentes contextos (geral → cliente → obra)
- Testar responsividade (ObrasTable desktop, ObrasCards mobile)
- Verificar filtros, paginação e ordenação
- Validar criação/edição/exclusão de obras em ambos contextos

## Considerações Importantes

### Padrão de Componentes
- Seguir exatamente o padrão do ClientsView: Filter, Table, Cards como componentes separados
- Não reutilizar ObrasCrud.vue - implementar chamadas diretas na view
- Manter separação de responsabilidades entre componentes

### Responsive Design
- ObrasTable: apenas para desktop (display: none no mobile)
- ObrasCards: apenas para mobile (display: none no desktop)
- Mesma estratégia usada em ClientsView

### Estado e Navegação
- Usar storeToRefs para reatividade do estado
- Implementar handlers na view principal para todas as ações
- Gerenciar contexto de navegação via breadcrumbStore

### Compatibilidade
- Manter funcionamento atual do ObrasTable dentro do ClientDetailsView
- Adaptar componentes para funcionar em ambos contextos
- Preservar todas as funcionalidades existentes

## Ordem de Implementação Recomendada

1. **ObrasView.vue** - View principal seguindo padrão do ClientsView
2. **ObrasCards.vue** - Componente de cards para mobile
3. **Router** - Configuração de rotas
4. **Sidebar** - Adicionar menu de obras
5. **ObrasFilter** - Adaptações para contexto geral + botão adicionar
6. **ObrasTable** - Coluna de cliente + remover responsividade mobile
7. **ObrasStore** - Suporte a contexto geral seguindo padrão clientsStore
8. **AutoComplete** - Seleção de clientes se necessário
9. **ObraFormView** - Seleção de cliente quando necessário
10. **Breadcrumb** - Sistema de contexto de navegação
11. **ObraDetailsView** - Navegação contextual
12. **Testes** - Validação completa de ambos contextos

Seguindo este passo a passo, você terá uma view base de obras que segue exatamente o padrão estabelecido pelo ClientsView, com componentes separados e responsabilidades bem definidas.