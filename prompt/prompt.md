Adicionar EntradaRecursoCrud.vue aninhado em ObraDetailsView.vue
ver exemplo de aninhamento de ObrasCrud.vue em ClientDetailsView.vue
ver o arquivo em src/views/clients/ClientDetailsView.vue

Checklist para Adicionar Nova Aba com CRUD Aninhado
1. Template - Sistema de Abas

 Adicionar nova div.tab no container .tabs
 Configurar classe ativa condicional: :class="{ active: activeTab === 'nova-aba' }"
 Adicionar handler de clique: @click="activeTab = 'nova-aba'"
 Definir texto da aba apropriado

2. Template - Conteúdo da Aba

 Adicionar nova seção no .tab-content
 Configurar exibição condicional: v-if="activeTab === 'nova-aba'"
 Criar div com classe da seção: .nova-aba-section
 Importar e usar componente CRUD aninhado
 Passar ID da entidade pai como prop: :entidade-pai-id="entidade.id"

3. Script - Imports

 Importar componente CRUD da nova entidade
 Adicionar ao components (se não usando auto-import)

4. Script - Integração com Query Params

 Adicionar nova condição no watch do route.query.active_tab
 Adicionar verificação inicial para query param
 Garantir navegação correta para a nova aba

5. Estilos CSS

 Adicionar classe CSS para nova seção se necessário
 Configurar padding padrão: padding: $spacing-sm 0

Garantia de Consistência:
Todas as abas com CRUD aninhado devem seguir exatamente o mesmo padrão de nomenclatura (kebab-case), estrutura de template (div.tab + div.section), passagem de props (entidade-pai-id), integração com query params, e estilização CSS, mantendo consistência visual e funcional em todas as views de detalhes do sistema.
