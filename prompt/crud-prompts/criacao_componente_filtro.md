4. Criar Componente de Filtro para [Entidade] em src/components/[Entidade]/[Entidade]Filter.vue
    Ver exemplo na entidade de Exemplo nos arquivos abaixo:
    - src/components/exemplos/ExemploFilter.vue
    Checklist:

    Implementar src/components/[Entidade]/[Entidade]Filter.vue
    Criar campo de busca geral
    Implementar filtros avançados colapsáveis com os campos conforme a interface [Entidade]Filter definida no arquivo [Entidade].types.ts
    Implementar botões de aplicar e limpar filtros
    Tornar responsivo para mobile
    Emitir eventos: applyFilters

    Garantia de Consistência:
    O componente [Entidade]Filter deve manter exatamente a mesma estrutura de template (incluindo classes CSS, hierarquia de elementos e layout responsivo), as mesmas funcionalidades no script (reatividade, computed properties, métodos de filtro e limpeza), e o mesmo conjunto de estilos CSS do componente de referência, adaptando apenas os campos específicos de filtro conforme as propriedades da entidade [Entidade] e ajustando os textos e labels para o contexto apropriado.
    
    4.1 Na tela de [Entidade]Filter, adicone o select de obra e fonte pagadora utilizando a biblioteca Multiselect. 
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
        Na tela de [Entidade]Filter, adicone filtros por range de valor
        if (isset($filters['valor_min']) && isset($filters['valor_max'])) {
            $query->whereBetween('valor', [
                $filters['valor_min'], 
                $filters['valor_max']
            ]);
        }
