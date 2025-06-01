11. Adicionar roteamento adequado para a entidade [nome da entidade]
    Checklist para Rotas (router/index.ts):
    seguir exemplo do roteamento da entidade example no arquivo router/index.ts

    Adicionar rota principal /[nome da entidade] para visualização da lista deve levar para a [nome da entidade]View
    Adicionar rota /[nome da entidade]/novo para criação de nova entrada deve levar para a [nome da entidade]FormView
    Adicionar rota /[nome da entidade]/:id/editar para edição deve levar para a [nome da entidade]FormView
    Adicionar rota /[nome da entidade]/:id para visualização de detalhes deve levar para a [nome da entidade]DetailsView
    Definir meta tags com name, breadcrumb e description
    Adicionar meta de autenticação requerida

    Checklist para Sidebar (components/layout/AppSidebar.vue):
    seguir exemplo do roteamento da entidade example no arquivo components/layout/AppSidebar.vue

    Adicionar item "[nome da entidade]" no array menuItems
    Configurar ícone apropriado para o menu
        - criar icone na pasta src/components/icons chamado Icon[nome da entidade]Sidebar.vue seguindo o exemplo do IconExampleSidebar.vue
        - importar icone no arquivo components/layout/AppSidebar.vue
        - adicionar icone no iconMap no arquivo components/layout/AppSidebar.vue
    Definir rota /[nome da entidade] para navegação deve levar para a [nome da entidade]View
    Posicionar o item no menu conforme hierarquia desejada