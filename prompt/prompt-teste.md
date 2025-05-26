Implementação de View Base para Obras

## Arquivos Existentes

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

### Criar a View Principal de Obras

**Arquivo a criar:** `src/views/obras/ObrasView.vue`

**Atividades:**
- Usar `ClientsView.vue` como template base
- Implementar mesma estrutura: filter-section, loading, error, empty-state
- Chamar `ObrasFilter` e `ObrasTable`, `ObrasCards` ja eh chamado no obras table portanto nao ha necessidade de gerenciar o comportamento de cards.
- Implementar handlers para paginação, filtros e ordenação
- Usar `useObrasStore` para gerenciamento de estado
- Configurar navegação para formulário, detalhes e edição

### 2. Atualize o Sistema de Roteamento

**Arquivo a modificar:** `src/router/index.ts`

**Atividades:**
- Adicionar rota para `/obras` apontando para `ObrasView.vue`

Atualize a Sidebar de Navegação

**Arquivo a modificar:** `src/components/layout/AppSidebar.vue`

**Atividades:**
- Adicionar item de menu "Obras" na lista `menuItems`
- Configurar ícone apropriado para obras
- Definir rota de navegação `/obras`
- Ajustar ordem dos itens de menu para que obras seja o segundo item