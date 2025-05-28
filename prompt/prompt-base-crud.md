// para todos os checklists adicionar pedindo para que sejam mocadas todas as funcionalidades realacionadas com breadcrumb

1. voce deve criar Tipos TypeScript para a model EntradaRecurso, segue documentacao do swagger:
    [Documentacao de rotas]
    [Documentacao de formato do dado retornado pela api] // nao entregar o formato correto aqui pode gerar erros no codigo no futuro
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/types/obra.types.ts
    checklist:
    - [ ] Criar arquivo `src/types/[entidade].types.ts`
    - [ ] Definir interface da entidade principal (`[Entidade]`)
    - [ ] Definir interface do formulário (`[Entidade]Form`)
    - [ ] Definir interface de filtros (`[Entidade]Filter`)
    - [ ] Definir tipos de paginação (`PaginatedResponse`, `PaginationLinks`, `PaginationMeta`)
    - [ ] Definir tipo para autocomplete (`[Entidade]Autocomplete`)


2. Implementar Service para EntradaRecurso
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/services/obrasService.ts
    checklist:
    - [ ] Criar `src/services/[entidade]Service.ts`
    - [ ] Implementar método `get[Entidades]()` com suporte a paginação e filtros
    - [ ] Implementar método `get[Entidade]ById(id: number)`
    - [ ] Implementar método `create[Entidade](data: Partial<[Entidade]>)`
    - [ ] Implementar método `update[Entidade](id: number, data: Partial<[Entidade]>)`
    - [ ] Implementar método `delete[Entidade](id: number)`
    - [ ] Implementar método autocomplete  `getEntradaRecursoAutocomplete`
    - [ ] Definir interface de parâmetros para busca com filtros e paginação
    - [ ] Implementar tratamento de erros consistente
    deve ser implementado de forma a nao perder nenhuma funcionalidade do exemplo fornecido de obras


3. Implementar Store Pinia para EntradaRecurso
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/stores/obrasStore.ts
    checklist:
    - [ ] Criar `src/stores/[entidade]Store.ts`
    - [ ] Implementar estado reativo (entidades, loading, error, pagination, filtros, ordenação)
    - [ ] Implementar getters computados
    - [ ] Implementar actions para todas as operações CRUD
    - [ ] Implementar gerenciamento de filtros e ordenação
    - [ ] Implementar limpeza de erros
    deve ser implementado de forma a nao perder nenhuma funcionalidade do exemplo fornecido de obras


4. Criar Componente de Filtro para EntradaRecurso em src/components/entradaRecurso/EntradaRecursoFilter.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/components/obras/ObrasFilter.vue
    Checklist:

    Implementar src/components/entradaRecurso/EntradaRecursoFilter.vue
    Criar campo de busca geral
    Implementar filtros avançados colapsáveis
    Implementar botões de aplicar e limpar filtros
    Implementar botão de adicionar nova entrada de recurso
    Tornar responsivo para mobile
    Emitir eventos: filter, clear, add-entrada-recurso

    Garantia de Consistência:
    O componente EntradaRecursoFilter deve manter exatamente a mesma estrutura de template (incluindo classes CSS, hierarquia de elementos e layout responsivo), as mesmas funcionalidades no script (reatividade, computed properties, métodos de filtro e limpeza), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas os campos específicos de filtro conforme as propriedades da entidade EntradaRecurso e ajustando os textos e labels para o contexto apropriado.
    4.1 Na tela de EntradaRecursoFilter, adicone o select de obra e fonte pagadora utilizando a biblioteca Multiselect. 
        Utilize o as rotas de autocomplete para buscar as obras e fontes pagadoras.
        ObrasAutocompleteService e FontesPagadorasAutocompleteService

        siga o exemplo na tela de CategoriaGastoFormView.vue para a implementação do select de obras e fontes pagadoras.

        Checklist para Select com Autocomplete
        1. Setup Inicial

        Instalar e importar @vueform/multiselect
        Declarar variáveis: entidades, entidadesOptions, selectedEntidade

        2. Template

        Configurar Multiselect: v-model, options, searchable, valueProp="id", label="nome"
        Adicionar handlers: @search, @change
        Configurar slots: #noOptions, #noResults
        Adicionar classe de erro condicional

        3. Métodos

        Criar searchEntidades(): buscar dados e mapear para formato {id, nome}
        Criar handleEntidadeChange(): atualizar form e limpar erros
        Chamar busca inicial no onMounted
        Sincronizar seleção em modo edição

        4. Integração

        Adicionar validação no validateForm()
        Configurar estilização CSS com :deep(.multiselect)
        Integrar com objeto form reativo
    4.2 Adicao de filtros especificos: 
        Na tela de EntradaRecursoFilter, adicone filtros por range de valor
        if (isset($filters['valor_min']) && isset($filters['valor_max'])) {
            $query->whereBetween('valor', [
                $filters['valor_min'], 
                $filters['valor_max']
            ]);
        }


5. Criar Componente de Tabela EntradaRecurso em src/components/entradaRecurso/EntradaRecursoTable.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/components/obras/ObrasTable.vue 
    Checklist:

    Implementar src/components/entradaRecurso/EntradaRecursoTable.vue
    Criar estrutura de tabela desktop com colunas ordenáveis
    Nao deve implementar view mobile com cards responsivos isto sera responsabilidade de outro componente
    Adicionar formatação de dados (datas, valores monetários, status)
    Implementar badges de status com cores diferenciadas
    Criar botões de ação (visualizar, editar, excluir)
    Implementar indicação visual para registros inativos
    Adicionar funcionalidade de ordenação por colunas
    Implementar estado vazio (nenhum registro encontrado)
    Emitir eventos: view, edit, delete, sort

    Garantia de Consistência:
    O componente EntradaRecursoTable deve manter exatamente a mesma estrutura de template (incluindo apenas a tabela desktop), as mesmas funcionalidades no script (métodos de formatação, ordenação, manipulação de eventos), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas os campos das colunas e propriedades conforme a estrutura da entidade EntradaRecurso e ajustando os labels, tipos de dados e mapeamentos de status para o contexto apropriado.

6. Criar Componente de Cards para EntradaRecurso em src/components/entradaRecurso/EntradaRecursoCards.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/components/obras/ObrasCards.vue
    Checklist:

    Implementar src/components/entradaRecurso/EntradaRecursoCards.vue
    Criar estrutura de cards responsivos em grid vertical
    Implementar cabeçalho do card com título e badge de status
    Criar corpo do card com campos em layout label/valor
    Adicionar formatação de dados (datas, valores monetários, status)
    Implementar badges de status com cores diferenciadas
    Criar seção de ações com botões horizontais
    Implementar indicação visual para registros inativos
    Adicionar estado vazio (nenhum registro encontrado)
    Emitir eventos: view, edit, delete

    Garantia de Consistência:
    O componente EntradaRecursoCards deve manter exatamente a mesma estrutura de template (incluindo layout de cards, cabeçalho, corpo e ações), as mesmas funcionalidades no script (métodos de formatação, manipulação de eventos), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas os campos exibidos no corpo do card conforme as propriedades da entidade EntradaRecurso e ajustando os labels, tipos de dados e mapeamentos de status para o contexto apropriado.

7. Criar COMPONENTE CRUD PRINCIPAL para EntradaRecurso em src/components/entradaRecurso/EntradaRecursoCrud.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/components/obras/ObrasCrud.vue

    Checklist:

    Implementar src/components/entradaRecurso/EntradaRecursoCrud.vue
    Criar estrutura de layout principal com filtros e ações
    Implementar botão de adicionar nova entrada de recurso
    Integrar componente EntradaRecursoFilter com handlers de filtro
    Integrar componente EntradaRecursoTable com todas as funcionalidades
    Implementar sistema de paginação com utilizando o componente Pagination
    Criar estados de loading, erro e empty state
    Implementar modal de confirmação de exclusão
    Adicionar funcionalidades de ordenação e filtros
    Implementar navegação para páginas de visualização e edição
    Integrar com store do Pinia para gerenciamento de estado
    Adicionar responsividade mobile para layout

    Garantia de Consistência:
    O componente EntradaRecursoCrud deve manter exatamente a mesma estrutura de template (incluindo layout de filtros, tabela, paginação e modais), as mesmas funcionalidades no script (métodos de carregamento, filtros, ordenação, paginação, CRUD operations), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas as referências de store, tipos de dados, rotas de navegação e componentes filhos para o contexto da entidade EntradaRecurso, mantendo toda a lógica de estado e interações do usuário.


8. Criar EntradaRecursoView.vue em src/views/entradaRecurso/EntradaRecursoView.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/views/obras/ObrasView.vue
    Checklist:

    Implementar src/views/entradaRecurso/EntradaRecursoView.vue
    Criar estrutura de template principal com container da view
    Implementar elemento main com classe de conteúdo da página
    Importar e usar componente EntradaRecursoCrud
    Configurar script setup com imports necessários

    Garantia de Consistência:
    O componente EntradaRecursoView deve manter exatamente a mesma estrutura de template (incluindo div container e main content), a mesma configuração de script setup, e o mesmo padrão de importação e uso de componentes do componente de referência, adaptando apenas o import do componente EntradaRecursoCrud no lugar de ObrasCrud e ajustando as classes CSS se necessário para manter consistência visual com outras views do sistema.


9. Criar View de Form para EntradaRecurso em src/views/entradaRecurso/EntradaRecursoFormView.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/views/obras/ObrasFormView.vue
    Checklist:

    Implementar src/views/entradaRecurso/EntradaRecursoFormView.vue
    Criar estrutura de template com container full-screen
    Implementar cabeçalho do formulário com título dinâmico (novo/editar)
    Criar formulário reativo com validação de campos
    Implementar campos específicos da EntradaRecurso (adaptar do modelo)
    Adicionar validação de campos obrigatórios
    Implementar toggle switch para campo ativo/inativo
    Criar botões de ação (cancelar e salvar/atualizar)
    Implementar estados de loading durante submissão
    Integrar com store do Pinia para operações CRUD
    Adicionar sistema de notificações de sucesso/erro
    Implementar navegação de retorno após salvar
    Configurar modo edição baseado em parâmetros da rota
    Adicionar responsividade mobile para o formulário
    Implementar população automática do formulário no modo edição
    Integrar com breadcrumb store para navegação

    Garantia de Consistência:
    O componente EntradaRecursoFormView deve manter exatamente a mesma estrutura de template (incluindo layout full-screen, cabeçalho, formulário e ações), as mesmas funcionalidades no script (validação, submissão, navegação, integração com stores), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas os campos do formulário conforme as propriedades da entidade EntradaRecurso, os tipos de dados correspondentes, as validações específicas e as rotas de navegação apropriadas para o contexto da nova entidade.

    9.1  Criacao de selects com autocomplete no form: Na tela de EntradaRecursoFormView, adicone o select de obra e fonte pagadora utilizando a biblioteca Multiselect. 
        Utilize o as rotas de autocomplete para buscar as obras e fontes pagadoras.
        ObrasAutocompleteService e FontesPagadorasAutocompleteService

        siga o exemplo na tela de CategoriaGastoFormView.vue para a implementação do select de obras e fontes pagadoras.

        Checklist para Select com Autocomplete
        1. Setup Inicial

        Instalar e importar @vueform/multiselect
        Declarar variáveis: entidades, entidadesOptions, selectedEntidade

        2. Template

        Configurar Multiselect: v-model, options, searchable, valueProp="id", label="nome"
        Adicionar handlers: @search, @change
        Configurar slots: #noOptions, #noResults
        Adicionar classe de erro condicional

        3. Métodos

        Criar searchEntidades(): buscar dados e mapear para formato {id, nome}
        Criar handleEntidadeChange(): atualizar form e limpar erros
        Chamar busca inicial no onMounted
        Sincronizar seleção em modo edição

        4. Integração

        Adicionar validação no validateForm()
        Configurar estilização CSS com :deep(.multiselect)
        Integrar com objeto form reativo


10. Criar View de Detalhes para EntradaRecurso em src/views/entradaRecurso/EntradaRecursoDetailsView.vue
    Ver exemplo na entidade de obras nos arquivos abaixo:
    - src/views/obras/ObrasDetailsView.vue
    Checklist:

    Implementar src/views/EntradaRecursoDetailsView.vue
    Criar estrutura de container principal com estados de loading/error
    Implementar sistema de abas de navegação (dados gerais apenas por enquanto)
    Criar cabeçalho com nome da entrada e botões de ação (editar/excluir)
    Implementar seção de metadados no cabeçalho
    Criar aba "Dados Gerais" com grid de informações
    Implementar formatação de dados (datas, valores, status)
    Adicionar badges de status com cores diferenciadas
    Criar modal de confirmação para exclusão
    Integrar com store do Pinia para operações CRUD
    Implementar navegação para edição e retorno
    Adicionar sistema de notificações de sucesso/erro
    Integrar com breadcrumb store para navegação
    Implementar busca e carregamento de dados por ID da rota
    Criar estados vazios e de erro com tratamento adequado
    Adicionar responsividade para diferentes tamanhos de tela

    Garantia de Consistência:   
    O componente EntradaRecursoDetailsView deve manter exatamente a mesma estrutura de template (incluindo container, abas, cabeçalho, grid de dados e modal), as mesmas funcionalidades no script (carregamento de dados, navegação, operações CRUD, formatação), e o mesmo conjunto de estilos SCSS do componente de referência, adaptando apenas os campos exibidos no grid de dados conforme as propriedades da entidade EntradaRecurso, os tipos de dados correspondentes, as rotas de navegação e as abas específicas necessárias para o contexto da nova entidade.

11. Adicionar roteamento adequado para a entidade EntradaRecurso

    Checklist para Rotas (router/index.ts):

    Adicionar rota principal /entrada-recursos para visualização da lista deve levar para a EntradaRecursoView
    Adicionar rota /entrada-recursos/novo para criação de nova entrada deve levar para a EntradaRecursoFormView
    Adicionar rota /entrada-recursos/:id/editar para edição deve levar para a EntradaRecursoFormView
    Adicionar rota /entrada-recursos/:id para visualização de detalhes deve levar para a EntradaRecursoDetailsView
    Configurar props para rotas que recebem parâmetros
    Definir meta tags com títulos e breadcrumbs apropriados
    Configurar lazy loading para os componentes
    Adicionar meta de autenticação requerida
    Configurar breadcrumbs dinâmicos para navegação entre entidades relacionadas

    Checklist para Sidebar (components/layout/AppSidebar.vue):

    Adicionar item "Entrada de Recursos" no array menuItems
    Configurar ícone apropriado para o menu
    Definir rota /entrada-recursos para navegação deve levar para a EntradaRecursoView
    Importar componente de ícone se necessário
    Adicionar mapeamento do ícone no iconMap
    Posicionar o item no menu conforme hierarquia desejada