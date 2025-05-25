preciso criar um crud para uma entidade aninha dentro de clientes, se trata da entidade: 
Obra.
segue a documentacao das rotas e dos dados:
openapi: 3.0.3
info:
  title: Obra API
  version: '1.0'
  description: |
    Endpoints para gerenciamento de obras (CRUD, filtros, busca, soft delete).
servers:
  - url: /api
paths:
  /obras:
    get:
      summary: Lista obras
      tags: [Obra]
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: cliente_id
          schema:
            type: integer
          description: Filtrar por cliente
        - in: query
          name: search
          schema:
            type: string
          description: Buscar por nome, descrição ou status
        - in: query
          name: status
          schema:
            type: string
            enum: [em_andamento, concluida, pausada]
          description: Filtrar por status
        - in: query
          name: ativo
          schema:
            type: boolean
          description: Filtrar por ativo/inativo
      responses:
        '200':
          description: Lista paginada de obras
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Obra'
                  links:
                    type: object
                  meta:
                    type: object
    post:
      summary: Criar obra
      tags: [Obra]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ObraInput'
      responses:
        '201':
          description: Obra criada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Obra'
  /obras/{id}:
    get:
      summary: Exibe detalhes da obra
      tags: [Obra]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Detalhes da obra
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Obra'
    put:
      summary: Atualiza obra
      tags: [Obra]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ObraInput'
      responses:
        '200':
          description: Obra atualizada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Obra'
    delete:
      summary: Remove (soft delete) obra
      tags: [Obra]
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Obra removida
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
  /autocomplete/obras:
    get:
      summary: Lista obras para autocomplete
      tags: [Autocomplete]
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: cliente_id
          schema:
            type: integer
          description: Filtrar obras por cliente
      responses:
        '200':
          description: Lista de obras (id, nome)
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/AutocompleteItem'
                  links:
                    type: object
                  meta:
                    type: object
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Obra:
      type: object
      properties:
        id:
          type: integer
        cliente_id:
          type: integer
        nome:
          type: string
        descricao:
          type: string
        endereco:
          type: string
        area_m2:
          type: number
          format: float
        data_inicio:
          type: string
          format: date
        prazo_estimado:
          type: string
          format: date
        valor_estimado:
          type: number
          format: float
        taxa_administracao:
          type: number
          format: float
        status:
          type: string
          enum: [em_andamento, concluida, pausada]
        ativo:
          type: boolean
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        deleted_at:
          type: string
          format: date-time
    ObraInput:
      type: object
      properties:
        cliente_id:
          type: integer
        nome:
          type: string
        descricao:
          type: string
        endereco:
          type: string
        area_m2:
          type: number
        data_inicio:
          type: string
          format: date
        prazo_estimado:
          type: string
          format: date
        valor_estimado:
          type: number
        taxa_administracao:
          type: number
        status:
          type: string
        ativo:
          type: boolean
    AutocompleteItem:
      type: object
      properties:
        id:
          type: integer
        nome:
          type: string

siga o passo a passo dado pelo seguinte guia:
# Guia Prático - CRUD Aninhado (Entidade Filha dentro de Entidade Pai)

Este guia mostra como criar um CRUD de entidade filha dentro da tela de visualização de uma entidade pai (exemplo: Fontes Pagadoras dentro de Clientes).

## CENÁRIO DE EXEMPLO
- **Entidade Pai:** Clientes
- **Entidade Filha:** Fontes Pagadoras
- **Local:** Aba "Fontes Pagadoras" dentro da tela de detalhes do cliente
- **Sistema de abas:** Já implementado em `ClientDetailsView.vue`

---

## ETAPA 1: PLANEJAMENTO DA ENTIDADE FILHA

### 📋 Checklist Etapa 1
- [ ] Definir nome da entidade filha (ex: "fontes-pagadoras", "enderecos", "contatos")
- [ ] Identificar relacionamento com entidade pai (cliente_id)
- [ ] Mapear campos específicos da entidade filha
- [ ] Definir se terá endpoints separados ou aninhados

### 📝 Ações
1. **Documentar** estrutura da entidade filha
2. **Identificar** se a API usa:
   - Endpoints aninhados: `/fontes-pagadoras`
   - Endpoints separados: `/fontes-pagadoras?cliente_id={id}`
3. **Mapear** campos obrigatórios e relacionamento

---

## ETAPA 2: CRIAÇÃO DOS TIPOS TYPESCRIPT

### 📋 Checklist Etapa 2
- [ ] Criar tipos da entidade filha
- [ ] Definir relacionamento com entidade pai

### 📝 Ações
1. **Criar** `src/types/fontePagadora.types.ts` (ou nome da entidade filha)
2. **Definir** interface base com campo FK obrigatório para entidade pai
3. **Incluir** interfaces para formulário, erros e filtros
4. **Reutilizar** tipos de paginação existentes se necessário

**Arquivo a criar:** `src/types/[entidadeFilha].types.ts`
**Base:** Usar estrutura similar a `client.types.ts` mas incluindo campo de relacionamento

---

## ETAPA 3: CRIAÇÃO DO SERVIÇO ESPECÍFICO

### 📋 Checklist Etapa 3
- [ ] Criar serviço para entidade filha
- [ ] Adaptar endpoints para relacionamento

### 📝 Ações
1. **Criar** `src/services/fontesPagadorasService.ts`
2. **Implementar** métodos específicos que incluem clienteId em todas as operações
3. **Adaptar** URLs conforme estrutura da API (aninhada ou com filtro)
4. **Manter** padrão de tratamento de erros e logs

**Arquivo base:** `src/services/clientsService.ts` (como referência de estrutura)
**Arquivo destino:** `src/services/[entidadeFilha]Service.ts`
**Diferença:** Todos os métodos recebem/usam ID da entidade pai

---

## ETAPA 4: CRIAÇÃO DO STORE ESPECÍFICO

### 📋 Checklist Etapa 4
- [ ] Criar store para entidade filha
- [ ] Integrar com ID da entidade pai

### 📝 Ações
1. **Copiar** `src/stores/clientsStore.ts`
2. **Renomear** para `src/stores/fontesPagadorasStore.ts`
3. **Adaptar** todas as funções para incluir `clienteId` como parâmetro obrigatório
4. **Manter** lógica de paginação, filtros e estados de loading/error
5. **Modificar** calls do service para incluir relacionamento

**Arquivo base:** `src/stores/clientsStore.ts`
**Arquivo destino:** `src/stores/[entidadeFilha]Store.ts`
**Diferença:** `clienteId` obrigatório em todas as operações

---

## ETAPA 5: ADIÇÃO DE NOVA ABA NA VIEW DE DETALHES

### 📋 Checklist Etapa 5
- [ ] Adicionar nova aba no sistema existente
- [ ] Integrar componente da entidade filha

### 📝 Ações
1. **Editar** `src/views/clients/ClientDetailsView.vue`
2. **Adicionar** nova aba no sistema existente de abas
3. **Incluir** componente CRUD da entidade filha na nova aba
4. **Passar** `cliente.id` como prop para o componente filha

**Arquivo para editar:** `src/views/clients/ClientDetailsView.vue`
**Seção:** Sistema de abas já implementado
**Adição:** Nova aba + componente CRUD aninhado

---

## ETAPA 6: CRIAÇÃO DO COMPONENTE CRUD PRINCIPAL

### 📋 Checklist Etapa 6
- [ ] Criar componente que orquestra todo CRUD da entidade filha
- [ ] Integrar filtros, listagem e formulário

### 📝 Ações
1. **Criar** `src/components/fontesPagadoras/FontesPagadorasCrud.vue`
2. **Implementar** componente que recebe `clienteId` como prop obrigatória
3. **Integrar** sub-componentes de filtro, tabela e modal
4. **Gerenciar** estados locais (modal aberto/fechado, item selecionado)
5. **Conectar** com store da entidade filha

**Arquivo a criar:** `src/components/[entidadeFilha]/[EntidadeFilha]Crud.vue`
**Função:** Orquestrador principal que integra todos os sub-componentes
**Props:** `clienteId` obrigatório

---

## ETAPA 7: CRIAÇÃO DOS COMPONENTES AUXILIARES

### 📋 Checklist Etapa 7
- [ ] Criar componente de filtros simplificado
- [ ] Criar componente de tabela adaptado
- [ ] Criar modal de formulário

### 📝 Ações

#### 7.1 Componente de Filtros
1. **Copiar** `src/components/clients/ClientsFilter.vue`
2. **Renomear** para `src/components/fontesPagadoras/FontesPagadorasFilter.vue`
3. **Simplificar** para filtros básicos necessários
4. **Remover** botão "Adicionar" (controlado pelo componente pai)
5. **Adaptar** campos específicos da entidade filha

#### 7.2 Componente de Tabela
1. **Copiar** `src/components/clients/ClientsTable.vue`
2. **Renomear** para `src/components/fontesPagadoras/FontesPagadorasTable.vue`
3. **Adaptar** colunas para campos da entidade filha
4. **Simplificar** ações (remover "visualizar", manter apenas editar/excluir)
5. **Receber** `clienteId` como prop
6. **Remover** paginação complexa se não necessária

#### 7.3 Modal de Formulário
1. **Criar** `src/components/fontesPagadoras/FontePagadoraModal.vue`
2. **Implementar** modal responsivo com overlay
3. **Incluir** formulário baseado em `ClientFormView.vue`
4. **Receber** `clienteId` e usar automaticamente no formulário
5. **Gerenciar** modo criação/edição
6. **Emitir** eventos de fechamento e salvamento

**Arquivos base:** Componentes equivalentes de clientes
**Arquivos destino:** Componentes específicos da entidade filha
**Adaptações:** Campos específicos, props adicionais, simplificações

---

## ETAPA 8: CONFIGURAÇÃO DE ESTILOS E RESPONSIVIDADE

### 📋 Checklist Etapa 8
- [ ] Adaptar estilos para contexto de aba
- [ ] Configurar modal responsivo
- [ ] Garantir consistência visual

### 📝 Ações
1. **Adaptar** estilos dos componentes copiados para funcionarem dentro de abas
2. **Configurar** estilos específicos do modal (overlay, responsividade)
3. **Ajustar** espaçamentos e paddings para contexto aninhado
4. **Manter** consistência com padrão visual do sistema

**Referência:** Estilos existentes nos componentes de clientes
**Adaptações:** Modal overlay, ajustes para contexto de aba

---

## ETAPA 9: INTEGRAÇÃO E COMUNICAÇÃO ENTRE COMPONENTES

### 📋 Checklist Etapa 9
- [ ] Conectar todos os componentes criados
- [ ] Implementar fluxo de dados
- [ ] Gerenciar estado do CRUD aninhado

### 📝 Ações
1. **Configurar** comunicação entre componente CRUD principal e sub-componentes
2. **Implementar** handlers para ações (criar, editar, excluir)
3. **Gerenciar** estado do modal (aberto/fechado, modo criação/edição)
4. **Configurar** recarregamento de dados após operações
5. **Integrar** com store da entidade filha

**Padrão:** Similar ao usado em `ClientsView.vue` mas adaptado para contexto aninhado

---

## ETAPA 10: OTIMIZAÇÕES PARA CONTEXTO ANINHADO

### 📋 Checklist Etapa 10
- [ ] Implementar carregamento sob demanda
- [ ] Otimizar performance
- [ ] Configurar cache específico

### 📝 Ações
1. **Implementar** lazy loading da aba (carregar dados apenas quando acessada)
2. **Configurar** cache para evitar recarregamentos desnecessários
3. **Otimizar** re-renders dos componentes
4. **Implementar** indicadores de loading específicos

**Objetivo:** Performance otimizada para CRUD aninhado sem impactar performance geral

---

## ETAPA 11: TESTES E VALIDAÇÃO

### 📋 Checklist Etapa 11
- [ ] Testar fluxo completo do CRUD aninhado
- [ ] Validar relacionamento com entidade pai
- [ ] Verificar responsividade

### 📝 Ações
1. **Testar** navegação para aba da entidade filha
2. **Validar** criação, edição e exclusão de itens
3. **Verificar** se `clienteId` está sendo passado corretamente
4. **Testar** modal em diferentes tamanhos de tela
5. **Validar** filtros e busca funcionando
6. **Confirmar** notificações de sucesso/erro

---

## RESUMO DE ARQUIVOS PARA CRUD ANINHADO

### Novos Arquivos a Criar

1. **Tipos:** `src/types/[entidadeFilha].types.ts`
2. **Serviço:** `src/services/[entidadeFilha]Service.ts`
3. **Store:** `src/stores/[entidadeFilha]Store.ts`
4. **CRUD Principal:** `src/components/[entidadeFilha]/[EntidadeFilha]Crud.vue`
5. **Filtros:** `src/components/[entidadeFilha]/[EntidadeFilha]Filter.vue`
6. **Tabela:** `src/components/[entidadeFilha]/[EntidadeFilha]Table.vue`
7. **Modal:** `src/components/[entidadeFilha]/[EntidadeFilha]Modal.vue`

### Arquivo a Modificar

1. **View Pai:** `src/views/clients/ClientDetailsView.vue` (adicionar nova aba ao sistema existente)

### Principais Diferenças do CRUD Principal

1. **Sem rotas próprias** - funciona dentro da entidade pai
2. **Props obrigatórias** - sempre recebe ID da entidade pai
3. **Modal para formulários** - em vez de páginas separadas
4. **Integração via abas** - usa sistema de abas existente
5. **Endpoints relacionais** - sempre vinculado à entidade pai
6. **Carregamento sob demanda** - dados carregados apenas quando aba é acessada

### Padrão de Nomenclatura para CRUD Aninhado

- **Entidade Pai:** Cliente (`cliente_id`)
- **Entidade Filha:** FontePagadora
- **Relacionamento:** `cliente_id` sempre presente nas operações
- **Componente Principal:** `FontesPagadorasCrud.vue`
- **Localização:** Nova aba no sistema existente de `ClientDetailsView.vue`
- **Estrutura:** Todos os arquivos seguem padrão de entidade filha

Este padrão permite criar facilmente outros CRUDs aninhados (endereços, contatos, documentos, etc.) reutilizando o sistema de abas existente e mantendo consistência com o padrão do sistema.
!!! IMPORTANTE: Hoje ja existe no sistema a implementacao funcional de um CRUD anihado, este eh o crud de Fontes Pagadoras, portanto, siga o padrao implementado para este CRUD.