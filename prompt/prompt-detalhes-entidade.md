# Guia para Criação de Tela de Detalhes de Entidade Base

Este guia descreve o processo para implementar uma tela de visualização de detalhes para uma entidade base do sistema. Usaremos a tela de detalhes de "Cliente" (`ClientDetailsView.vue`) como principal referência.

O objetivo é criar uma view que exiba as informações de uma instância específica de uma entidade, organizada inicialmente com uma aba "Dados Gerais".

## Entidade Envolvida

*   **Entidade Base:** Qualquer entidade principal do sistema para a qual se deseja uma página de detalhes dedicada (e.g., `Cliente`, `Produto`, `Fornecedor`).

## Estrutura Geral e Fluxo de Navegação

1.  **Acesso à View:** O usuário navega para a página de detalhes geralmente a partir de uma lista da entidade (e.g., clicando em um item na tabela de clientes) ou após criar/editar um item.
2.  **Exibição de Dados:** A view carrega e exibe os dados da instância da entidade selecionada, identificada por um ID na URL.
3.  **Organização em Abas:** As informações são organizadas em abas, começando com uma aba padrão "Dados Gerais". Outras abas (como CRUDS aninhados ou informações relacionadas) podem ser adicionadas posteriormente.
4.  **Ações:** A view fornece ações comuns como "Editar" e "Excluir" para a entidade visualizada.

## Componentes e Arquivos Chave

### 1. View de Detalhes da Entidade

*   **Arquivo Base para Início Rápido (Recomendado):** `src/views/examples/ExampleDetailView.vue`
    *   **Instrução:** Para criar uma nova tela de detalhes, **comece copiando o conteúdo de `ExampleDetailView.vue`**. Este arquivo serve como um template genérico com dados mockados, estrutura de abas e layout responsivo já configurados. Adapte e expanda este template conforme as necessidades da nova entidade.
*   **Arquivo de Referência para Funcionalidades Reais:** `src/views/clients/ClientDetailsView.vue`
    *   Utilize este arquivo como referência para ver a integração com dados reais, stores e funcionalidades mais complexas, após iniciar com o `ExampleDetailView.vue`.
*   **Nomeação Sugerida:** `src/views/[nome_entidade_plural]/[NomeEntidadeSingular]DetailsView.vue` (e.g., `src/views/produtos/ProdutoDetailsView.vue`)
*   **Responsabilidades Principais:**
    *   **Receber ID da Entidade:** Obter o ID da instância da entidade a ser exibida a partir dos parâmetros da rota (e.g., `route.params.id`).
    *   **Buscar Dados da Entidade:** Ao ser montada, utilizar o ID para buscar os dados completos da entidade através do serviço ou store correspondente (e.g., `clientsService.getClient(id)`).
    *   **Gerenciar Estado de Carregamento e Erro:** Exibir um indicador de carregamento (`LoadingSpinner`) enquanto os dados estão sendo buscados e uma mensagem de erro (`ErrorMessage`) caso a busca falhe ou a entidade não seja encontrada.
    *   **Layout Principal:**
        *   **Cabeçalho da View:** Exibir o nome/título da entidade (e.g., "Detalhes do Cliente: [Nome do Cliente]") e botões de ação principais (Editar, Excluir).
        *   **Sistema de Abas:** Implementar um controle de abas. A primeira aba deve ser "Dados Gerais".
            *   A aba ativa pode ser controlada por uma variável local (e.g., `activeTab = ref('dados-gerais')`).
            *   Para persistência e links diretos, considerar controlar a aba ativa via query parameter na URL (e.g., `?active_tab=dados-gerais`), como feito em `ClientDetailsView.vue`.
    *   **Conteúdo da Aba "Dados Gerais":**
        *   Exibir os campos mais importantes da entidade em um formato claro e legível (e.g., usando pares de label/valor).
        *   Formatar dados conforme necessário (e.g., datas, valores monetários).
    *   **Botões de Ação no Cabeçalho da View:** A área do cabeçalho da view de detalhes é o local ideal para os botões de ação primários relacionados à entidade sendo visualizada. Devem ser estilizados de forma consistente com o restante da aplicação.
        *   **Novo:**
            *   **Comportamento Típico:** Embora a criação de uma nova entidade geralmente ocorra a partir da view de listagem, se um botão "Novo" for incluído no cabeçalho da tela de detalhes, ele deve navegar para o formulário de criação da *mesma entidade*.
            *   **Navegação:** `router.push({ name: '[nome_entidade_singular]-create' })` (e.g., `client-create`, `produto-create`).
            *   **Consideração:** Avaliar a necessidade deste botão na tela de detalhes, pois pode ser redundante se a navegação principal para criação já existir na tela de listagem. Geralmente, o botão "Novo" é mais proeminente na tela de listagem da entidade.
        *   **Editar:**
            *   **Comportamento:** Navega para o formulário de edição da entidade atualmente visualizada, pré-preenchendo o formulário com os dados existentes.
            *   **Navegação:** `router.push({ name: '[nome_entidade_singular]-edit', params: { id: entity.id } })` (e.g., `client-edit`, `produto-edit`).
            *   **Disponibilidade:** Deve estar visível apenas se o usuário tiver permissão para editar a entidade.
        *   **Excluir:**
            *   **Comportamento:** Inicia o processo de exclusão da entidade atual. É crucial exibir um modal de confirmação (`ConfirmationModal`) antes de prosseguir com a exclusão definitiva para evitar ações acidentais.
            *   **Ação Pós-Confirmação:** Chama o serviço/store para deletar a entidade (e.g., `store.deleteEntity(entity.id)`).
            *   **Navegação Pós-Exclusão:** Após a exclusão bem-sucedida, redirecionar o usuário para a view de listagem da entidade (e.g., `router.push({ name: '[nome_entidade_plural]' })` - ex: `clients`, `produtos`).
            *   **Disponibilidade:** Deve estar visível apenas se o usuário tiver permissão para excluir a entidade.
        *   **Voltar:**
            *   **Comportamento:** Permite ao usuário retornar à tela anterior de forma intuitiva. Geralmente, isso significa voltar para a view de listagem da entidade de onde o usuário navegou para os detalhes.
            *   **Navegação:** `router.back()` pode ser usado para um retorno simples à página anterior no histórico do navegador. Para um destino explícito e mais controlado, como a lista principal da entidade, usar `router.push({ name: '[nome_entidade_plural]' })`.
            *   **Posicionamento:** Pode ser um botão com ícone (e.g., seta para a esquerda) e/ou texto, geralmente posicionado à esquerda do título da view ou como uma das primeiras ações no cabeçalho.
*   **Design Responsivo:**
    *   O cabeçalho e os botões de ação devem se ajustar bem em telas menores.
    *   O conteúdo das abas deve ser legível e bem organizado em todos os dispositivos.
    *   Em telas menores, as abas podem se transformar em um menu dropdown ou um layout de acordeão, se houver muitas abas.

### 2. Store da Entidade (Pinia)

*   **Arquivo Exemplo:** `src/stores/clientStore.ts` (se aplicável, ou diretamente via `clientsService.ts`)
*   **Responsabilidades:**
    *   Fornecer uma ação para buscar uma instância específica da entidade por seu ID (e.g., `fetchClient(id)`).
    *   Fornecer uma ação para deletar uma instância da entidade por seu ID (e.g., `deleteClient(id)`).

### 3. Configuração de Rotas (Vue Router)

*   **Arquivo Exemplo:** `src/router/index.ts`
*   **Rota Necessária:**
    *   `path: '/[nome_entidade_plural]/:id'` (e.g., `/clientes/:id`, `/produtos/:id`)
    *   `name: '[nome_entidade_singular]-details'` (e.g., `client-details`, `produto-details`)
    *   `component: [NomeEntidadeSingular]DetailsView`
    *   **Meta para Breadcrumb:** Definir a meta da rota para gerar o breadcrumb apropriado.
        *   Exemplo: `meta: { title: 'Detalhes do [Nome da Entidade]', breadcrumb: [ { title: 'Home', path: '/' }, { title: '[Nome da Entidade Plural]', path: '/[nome_entidade_plural]' }, { title: 'Detalhes' } ] }`
        *   O título do breadcrumb final pode ser dinamicamente atualizado para incluir o nome da entidade após o carregamento dos dados.

## Navegação e Breadcrumbs

*   **Exemplo de Breadcrumb para Detalhes do Cliente:**
    *   `Home > Clientes > [Nome do Cliente]`
*   A view `AppContent.vue` é responsável por renderizar os breadcrumbs com base nas metas das rotas.
*   O último item do breadcrumb (representando a própria página de detalhes) deve ser o nome da entidade ou um identificador principal, que pode ser definido dinamicamente após o carregamento dos dados da entidade.

## Consistência de Estilo e CSS

É crucial manter a consistência visual com o restante da aplicação, conforme detalhado no `prompt-nested-crud.md`:

*   **Cores, Fontes, Espaçamentos:** Seguir os padrões já estabelecidos.
*   **Classes CSS e Componentes Base:** Reutilizar o máximo possível para garantir uniformidade e eficiência.
*   **Responsividade:** Assegurar que a tela de detalhes seja totalmente responsiva.

## Próximos Passos (Após a Aba "Dados Gerais")

Uma vez que a estrutura base da tela de detalhes com a aba "Dados Gerais" esteja funcional, podem-se adicionar novas abas para:

*   **CRUDs Aninhados:** Como a aba "Obras" dentro de `ClientDetailsView.vue`. Seguir o `prompt-nested-crud.md` para isso.
*   **Informações Relacionadas:** Outras listas ou detalhes de entidades que se relacionam com a entidade principal.
*   **Histórico de Alterações**, etc.

Este guia fornece uma base sólida para criar telas de detalhes informativas e consistentes em toda a aplicação.
