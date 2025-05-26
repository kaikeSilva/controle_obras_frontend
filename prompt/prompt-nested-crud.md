# Guia para Criação de CRUD Aninhado em Vue 3 com Pinia e Vue Router

Este guia descreve o processo para implementar uma funcionalidade de CRUD (Create, Read, Update, Delete) para uma entidade "Filha" que está aninhada dentro de uma entidade "Pai". Usaremos o exemplo existente de "Obras" (Filha) aninhadas em "Clientes" (Pai) como referência.

## Entidades Envolvidas

*   **Entidade Pai:** A entidade principal que conterá o CRUD da entidade filha. Ex: `Cliente`.
*   **Entidade Filha:** A entidade cujas operações de CRUD serão gerenciadas dentro do contexto de uma instância da Entidade Pai. Ex: `Obra` (onde cada obra pertence a um cliente específico).

## Estrutura Geral e Fluxo de Navegação

1.  **Visualização de Detalhes do Pai:** O usuário navega para a página de detalhes de uma instância da Entidade Pai (e.g., `ClientDetailsView.vue`).
2.  **Seção da Entidade Filha:** Dentro desta página, haverá uma seção dedicada (geralmente uma aba) para listar e gerenciar as Entidades Filhas associadas.
3.  **Navegação para Formulário da Filha:** A partir da seção da Entidade Filha, o usuário pode navegar para um formulário para criar uma nova Entidade Filha ou editar uma existente.
4.  **Retorno para Detalhes do Pai:** Após salvar ou cancelar o formulário da Entidade Filha, o usuário é redirecionado de volta para a página de Detalhes do Pai, com a aba da Entidade Filha apropriada ativa.

## Componentes e Arquivos Chave

### 1. View de Detalhes da Entidade Pai

*   **Arquivo Exemplo:** `src/views/clientes/ClientDetailsView.vue`
*   **Responsabilidades:**
    *   Exibir os dados da instância da Entidade Pai selecionada.
    *   Implementar um sistema de abas (ou seções) para organizar diferentes informações, incluindo uma aba para o CRUD da Entidade Filha.
    *   Receber o ID da Entidade Pai via parâmetro de rota (e.g., `/clientes/:id`).
    *   Gerenciar a aba ativa, preferencialmente através de um query parameter na URL (e.g., `?active_tab=obras`), para permitir links diretos e manter o estado na navegação.
    *   Incorporar o Componente CRUD da Entidade Filha (descrito abaixo), passando o ID da Entidade Pai como prop.
*   **Design Responsivo:**
    *   Em telas menores, as abas podem se transformar em um menu dropdown ou um layout de acordeão para economizar espaço.

### 2. Componente CRUD da Entidade Filha

*   **Arquivo Exemplo:** `src/components/obras/ObrasCrud.vue`
*   **Responsabilidades:**
    *   Ser incorporado na View de Detalhes da Entidade Pai.
    *   Receber o `parentId` (e.g., `clienteId`) como uma prop obrigatória.
    *   Listar as Entidades Filhas associadas ao `parentId` fornecido. A listagem pode ser em formato de tabela, cards, etc.
    *   Fornecer um botão/link para "Adicionar Nova Entidade Filha", que navegará para o Formulário da Entidade Filha, passando o `parentId`.
    *   Para cada item listado, fornecer ações como "Editar" e "Excluir".
        *   A ação "Editar" navegará para o Formulário da Entidade Filha, pré-preenchido com os dados da filha selecionada.
        *   A ação "Excluir" geralmente envolverá um modal de confirmação.
    *   Interagir com o Store da Entidade Filha para buscar, criar, atualizar e deletar dados.
*   **Design Responsivo:**
    *   Se usar uma tabela, colunas menos importantes podem ser ocultadas em telas menores, ou a tabela pode se transformar em um layout de cards.
    *   Cards devem se ajustar ao tamanho da tela, possivelmente empilhando verticalmente.

### 3. View de Formulário da Entidade Filha (Create/Edit)

*   **Arquivo Exemplo:** `src/views/obras/ObraFormView.vue`
*   **Responsabilidades:**
    *   Fornecer campos para criar ou editar uma Entidade Filha.
    *   No modo de criação, precisa saber a qual Entidade Pai a nova Filha pertencerá. O `parentId` (e.g., `cliente_id`) deve ser obtido (e.g., via parâmetro de rota, props, ou do `breadcrumbStore` se a navegação partir do Pai).
    *   No modo de edição, carregar os dados da Entidade Filha existente com base no seu ID (e.g., `obraId` via parâmetro de rota `/obras/:id/editar`).
    *   Validar os dados do formulário.
    *   Ao salvar, interagir com o Store da Entidade Filha (ações `create` ou `update`).
    *   Após salvar ou cancelar, redirecionar o usuário de volta para a View de Detalhes da Entidade Pai, garantindo que a aba correta da Entidade Filha esteja ativa (e.g., `router.push({ name: 'client-details', params: { id: parentId }, query: { active_tab: 'obras' } })`).
*   **Design Responsivo:**
    *   O formulário deve ser de coluna única em telas menores para melhor usabilidade.
    *   Agrupamentos de campos podem ser organizados para fluir bem em diferentes larguras.

### 4. Modal da Entidade Filha (Opcional)

*   **Arquivo Exemplo:** `src/components/obras/ObraModal.vue`
*   **Responsabilidades:**
    *   Fornecer uma visualização rápida dos detalhes de uma Entidade Filha sem sair da View de Detalhes do Pai.
    *   Pode ser usado para edições rápidas ou apenas para exibição.

### 5. Stores (Pinia)

*   **Store da Entidade Pai (Exemplo: `clientStore.ts`)**
    *   Gerencia o estado e as operações CRUD para a Entidade Pai.
    *   Pode ter uma ação para buscar uma Entidade Pai específica por ID.
*   **Store da Entidade Filha (Exemplo: `obrasStore.ts`)**
    *   Gerencia o estado e as operações CRUD para a Entidade Filha.
    *   Ações como `fetchObras(parentId)`, `createObra(obraData, parentId)`, `updateObra(obraId, obraData)`, `deleteObra(obraId)`.
    *   Muitas de suas ações precisarão do `parentId` para interagir corretamente com a API.
*   **Store de Breadcrumb/Navegação (Exemplo: `breadcrumbStore.ts`)**
    *   Armazena o `currentClienteId` quando se navega para o formulário de obra a partir dos detalhes do cliente.
    *   Armazena a `activeTab` desejada para ser usada ao construir links de breadcrumb e ao redirecionar de volta para a view de detalhes do pai.

### 6. Configuração de Rotas (Vue Router)

*   **Arquivo Exemplo:** `src/router/index.ts`
*   **Rotas Necessárias:**
    *   **Detalhes do Pai:**
        *   `path: '/clientes/:id'`
        *   `name: 'client-details'`
        *   `component: ClientDetailsView`
        *   Meta para breadcrumb: `meta: { title: 'Detalhes do Cliente', breadcrumb: [...] }`
    *   **Criação da Filha:**
        *   `path: '/obras/nova'` (ou `/clientes/:cliente_id/obras/nova` se preferir passar o ID do cliente pela rota diretamente para o formulário)
        *   `name: 'obra-create'`
        *   `component: ObraFormView`
        *   Meta para breadcrumb dinâmico: `meta: { title: 'Nova Obra', breadcrumb: [ { title: 'Home', path: '/' }, { title: 'Clientes', path: '/clientes' }, { title: 'Detalhes do Cliente', dynamic: true, getPath: (params, store) => `/clientes/${store.currentClienteId}?active_tab=obras` }, { title: 'Nova Obra' } ] }`
    *   **Edição da Filha:**
        *   `path: '/obras/:id/editar'`
        *   `name: 'obra-edit'`
        *   `component: ObraFormView`
        *   Meta para breadcrumb dinâmico similar ao de criação, mas com título "Editar Obra".

## Navegação e Breadcrumbs Detalhados

A navegação de breadcrumb deve refletir claramente a hierarquia e permitir um retorno fácil.

1.  **Lista de Pais:**
    *   `Home > Clientes`
2.  **Detalhes do Pai (Aba Dados Gerais Ativa):**
    *   `Home > Clientes > [Nome do Cliente]`
    *   URL: `/clientes/123`
3.  **Detalhes do Pai (Aba Obras Ativa):**
    *   `Home > Clientes > [Nome do Cliente]`
    *   URL: `/clientes/123?active_tab=obras`
    *   O componente `AppContent.vue` deve ler `route.query.active_tab` para construir o link do breadcrumb "[Nome do Cliente]" para incluir `?active_tab=obras` se a navegação originou da aba de obras.
4.  **Formulário de Criação de Obra (Acessado de Cliente 123):**
    *   `Home > Clientes > [Nome do Cliente] > Nova Obra`
    *   URL: `/obras/nova` (com `cliente_id=123` gerenciado internamente/store)
    *   O link do breadcrumb "[Nome do Cliente]" DEVE levar para `/clientes/123?active_tab=obras`.
    *   O `breadcrumbStore` (ou similar) é crucial aqui para saber o `currentClienteId` e `activeTab` ao construir o breadcrumb dinâmico em `AppContent.vue`.
5.  **Formulário de Edição de Obra (Obra XYZ pertencente ao Cliente 123):**
    *   `Home > Clientes > [Nome do Cliente] > Editar Obra [Nome/ID da Obra]`
    *   URL: `/obras/XYZ/editar`
    *   O link do breadcrumb "[Nome do Cliente]" DEVE levar para `/clientes/123?active_tab=obras`.
    *   Ao carregar `ObraFormView` para edição, o `cliente_id` da obra deve ser buscado e armazenado no `breadcrumbStore` para que o breadcrumb seja construído corretamente.

## Considerações Adicionais

*   **Consistência da UI/UX:** Manter um design consistente entre o CRUD da Entidade Pai e o CRUD aninhado da Entidade Filha.
*   **Feedback ao Usuário:** Usar notificações (como o `notificationStore`) para feedback sobre sucesso/erro nas operações CRUD.
*   **Tratamento de Erros:** Implementar tratamento de erros robusto para chamadas de API e lógica de componentes.
*   **Carregamento de Dados (Loading States):** Exibir indicadores de carregamento durante as chamadas de API para melhorar a experiência do usuário.

## Consistência de Estilo e CSS

Ao implementar novos CRUDs aninhados, é crucial manter a consistência visual e de experiência do usuário com o que já foi estabelecido no exemplo do CRUD de Obras dentro de Clientes. Isso inclui:

*   **Cores:** Utilizar a paleta de cores definida no projeto. Evitar cores que não sigam o padrão, especialmente para fontes (evitar cores muito claras que dificultem a leitura) e botões.
*   **Fontes:** Manter a mesma família tipográfica, tamanhos e pesos de fonte utilizados nos componentes existentes. Isso garante uma hierarquia visual clara e legibilidade.
*   **Espaçamentos:** Seguir os padrões de margens, paddings e espaçamento entre elementos já utilizados. Isso evita desperdício de espaço em tela e contribui para um layout equilibrado e profissional.
*   **Classes CSS:** Reutilizar as classes CSS globais e de componentes já existentes sempre que possível. O projeto possui classes bem construídas para botões, inputs, cards, tabelas, etc., que já lidam com responsividade e evitam problemas comuns de design. Antes de criar novas classes, verifique se uma existente pode ser aplicada ou estendida.
*   **Componentes Base:** Se houver componentes base (como `BaseButton`, `BaseInput`, `BaseCard`), priorize seu uso para garantir uniformidade.
*   **Responsividade:** Assegurar que todos os novos elementos sejam responsivos e se adaptem bem a diferentes tamanhos de tela, seguindo o comportamento dos componentes de exemplo.

Manter essa consistência não apenas melhora a estética geral da aplicação, mas também facilita a manutenção e o desenvolvimento futuro, pois cria um sistema de design coeso.

Seguindo estas diretrizes, você poderá criar CRUDs aninhados de forma organizada, mantendo uma boa experiência de usuário e uma base de código manutenível.
