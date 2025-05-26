# Guia: Reutilizando Estrutura de CRUD Aninhável para Views de Listagem Base

Este guia descreve como criar uma view de listagem principal para uma entidade (e.g., `ObrasView.vue`) reutilizando um componente CRUD já existente (e.g., `ObrasCrud.vue`) que foi inicialmente projetado para ser aninhável (conforme `prompt-nested-crud.md`).

O objetivo é maximizar a reutilização de código e manter uma UI consistente, adaptando o componente CRUD aninhável para que também funcione de forma autônoma.

## Cenário

Você já possui:
1.  Um componente CRUD aninhável, como `src/components/obras/ObrasCrud.vue`, que lida com listagem, filtros, paginação e ações para "Obras" quando exibido dentro de `ClientDetailsView.vue` (recebendo um `clienteId`).
2.  Um guia para criar CRUDs base, como `prompt-base-crud.md`, que define a estrutura de uma view de listagem principal (e.g., `ClientsView.vue`).

Agora, você quer criar uma view de listagem principal para "Obras" (e.g., `ObrasView.vue` em `/obras`) que mostre **todas** as obras, reutilizando a maior parte da lógica e UI de `ObrasCrud.vue`.

## Princípio Chave

O componente `[Entidade]Crud.vue` (e.g., `ObrasCrud.vue`) deve ser tornado flexível para operar em dois modos:
*   **Modo Aninhado:** Quando recebe um `parentId` (e.g., `clienteId`), filtra e opera no contexto desse pai.
*   **Modo Autônomo:** Quando **não** recebe um `parentId`, lista todas as entidades ou permite filtros globais.

## Passos para Implementação

### 1. Adaptar o Componente CRUD Aninhável (`[Entidade]Crud.vue`)

Refira-se ao seu componente existente (e.g., `src/components/obras/ObrasCrud.vue`).

*   **Propriedade `parentId` Opcional:**
    *   Modifique a prop `parentId` (e.g., `clienteId`, `produtoId`) para que seja opcional.
    *   Exemplo em `ObrasCrud.vue`:
        ```typescript
        const props = defineProps<{
          clienteId?: string | number // Tornar opcional
        }>()
        ```

*   **Lógica de Carregamento de Dados Flexível:**
    *   No método que carrega os dados (e.g., `loadObras`), verifique a presença do `props.parentId`.
    *   Se `parentId` existir, chame a ação do store para buscar entidades relacionadas (e.g., `obrasStore.fetchObrasByCliente(props.clienteId, currentPage.value)`).
    *   Se `parentId` **não** existir, chame uma ação do store para buscar todas as entidades (e.g., `obrasStore.fetchAllObras(currentPage.value, currentFilters.value)`). O store precisará suportar essa busca global e filtros globais.

*   **Botão "Adicionar Novo":**
    *   A navegação do botão "Adicionar" dentro de `[Entidade]Crud.vue` (e.g., `router.push({ name: 'new-obra', ... })`) precisa ser considerada:
        *   Se `props.parentId` estiver presente, o `params` da rota deve incluir o `parentId` (e.g., `params: { cliente_id: props.clienteId }`).
        *   Se `props.parentId` **não** estiver presente, a rota de destino (e.g., `ObraFormView.vue`) deve permitir que o usuário selecione o `Pai` necessário (e.g., um campo `select` para escolher o Cliente ao criar uma Obra a partir da listagem geral de Obras).
        *   O `ObraFormView.vue` já deve estar preparado para lidar com a ausência do `cliente_id` nos parâmetros da rota, exigindo sua seleção no formulário.

*   **Filtros:**
    *   Os componentes de filtro (e.g., `ObrasFilter.vue`) já devem ser genéricos. Se eles aplicam filtros específicos do contexto do pai, pode ser necessário ajustá-los ou ter diferentes conjuntos de filtros para o modo autônomo.
    *   A ação de filtrar no store também deve distinguir entre filtros contextuais (com `parentId`) e globais.

### 2. Criar a View de Listagem Principal (`[Entidade]View.vue`)

Siga a estrutura geral de uma view de listagem conforme `prompt-base-crud.md` (e.g., `ClientsView.vue`), mas com as seguintes adaptações:

*   **Arquivo Exemplo:** `src/views/obras/ObrasView.vue`
*   **Conteúdo Principal:**
    *   Em vez de recriar tabelas, cards, e lógica de filtro/paginação, **importe e utilize diretamente o componente `[Entidade]Crud.vue` adaptado**.
    *   **Não passe** a prop `parentId` para ele, para que opere em modo autônomo.
    *   Exemplo em `ObrasView.vue`:
        ```vue
        <template>
          <div class="obras-view page-container">
            <h1 class="page-title">Gerenciar Obras</h1>
            <!-- Pode haver um botão "Adicionar Obra" de nível superior aqui, se desejado -->
            <!-- ou confiar no botão dentro de ObrasCrud -->
            <ObrasCrud /> <!-- Sem passar clienteId -->
          </div>
        </template>

        <script setup lang="ts">
        import ObrasCrud from '@/components/obras/ObrasCrud.vue'
        // Lógica de breadcrumb específica para esta view
        </script>
        ```

*   **Título da Página e Cabeçalho:** Defina o título padrão da página (e.g., "Gerenciar Obras", "Catálogo de Produtos").

*   **Botão "Adicionar Novo" (Nível da View - Opcional):**
    *   A `[Entidade]View.vue` pode ter seu próprio botão "Adicionar Novo" no topo da página, que navegaria para o formulário de criação (e.g., `router.push({ name: 'new-obra' })`).
    *   Alternativamente, pode-se confiar apenas no botão "Adicionar" já existente dentro do componente `[Entidade]Crud.vue` reutilizado.

*   **Breadcrumbs:**
    *   Defina a meta da rota para a `[Entidade]View.vue` com o breadcrumb apropriado para a listagem principal.
    *   Exemplo para `ObrasView.vue` (`/obras`):
        *   `Home > Obras`
        *   A lógica em `AppContent.vue` gerará isso com base na meta da rota.

### 3. Configuração de Rotas (Vue Router)

*   Adicione uma nova rota para a view de listagem principal.
*   Exemplo para `ObrasView.vue`:
    ```typescript
    {
      path: '/obras',
      name: 'obras-list', // ou simplesmente 'obras'
      component: () => import('@/views/obras/ObrasView.vue'),
      meta: {
        title: 'Obras',
        breadcrumb: [
          { title: 'Home', path: '/' },
          { title: 'Obras' }
        ],
        requiresAuth: true
      }
    }
    ```

### 4. Ajustes no Store (`[Entidade]Store.ts`)

*   Garanta que o store da entidade (e.g., `obrasStore.ts`) tenha ações para:
    *   Buscar todas as entidades, com suporte a paginação e filtros globais (e.g., `fetchAllObras(page, filters)`).
    *   A ação existente de busca por `parentId` (e.g., `fetchObrasByCliente(clienteId, page, filters)`) continua sendo usada no modo aninhado.

## Benefícios

*   **Redução Significativa de Duplicação de Código:** A UI e a lógica de listagem, filtro, paginação e ações são mantidas em um único lugar (`[Entidade]Crud.vue`).
*   **Consistência Visual e Funcional:** A forma de gerenciar a entidade é a mesma, seja ela aninhada ou em sua listagem principal.
*   **Manutenção Simplificada:** Alterações na apresentação ou lógica do CRUD são feitas em um só componente.

Ao seguir este guia, você pode efetivamente transformar componentes CRUD aninháveis em blocos de construção versáteis para diferentes partes da sua aplicação.
