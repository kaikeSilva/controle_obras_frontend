# Arquitetura de Breadcrumb Dinâmico

## Visão Geral da Arquitetura

### BreadcrumbStore - Componente Central
O store é o único responsável por toda a lógica de breadcrumb, eliminando a necessidade de um service separado. Concentra todas as operações em um local centralizado para facilitar manutenção e debugging.

## Componentes da Arquitetura

### 1. **BreadcrumbStore**
**Responsabilidade**: Gerenciamento completo do estado e lógica de navegação

**Estado Interno**:
- **Stack de Navegação**: Array hierárquico de itens do breadcrumb
- **Contexto Atual**: Informações sobre a localização atual (tipo, ID da entidade, aba ativa)
- **Metadados de Contexto**: Informações adicionais sobre cada nível da navegação

**Funcionalidades Principais**:

#### `buildPath(routeInfo, routeMeta)`
- **Propósito**: Construir toda a hierarquia de breadcrumb baseada na rota atual
- **Processo**:
  - Analisa a configuração da rota (meta)
  - Identifica dependências hierárquicas (cliente → obra → entrada)
  - Resolve dados das entidades automaticamente
  - Constrói stack completo de navegação
  - Preserva query parameters relevantes

#### `updatePath(newStack)`
- **Propósito**: Atualizar o estado global do breadcrumb
- **Processo**:
  - Substitui stack atual pelo novo
  - Atualiza contexto atual
  - Trigger de reatividade para componentes

#### `updateContext(contextInfo)`
- **Propósito**: Atualizar apenas o contexto sem modificar a estrutura
- **Processo**:
  - Mantém stack inalterado
  - Atualiza informações do contexto atual (aba ativa, metadados)
  - Preserva estado para navegação futura
  - Útil para mudanças de aba dentro da mesma view

#### `updateTabContext(tabName)`
- **Propósito**: Gerenciar contexto específico de abas
- **Processo**:
  - Atualiza aba ativa no contexto atual
  - Preserva essa informação para navegação de retorno
  - Mantém estado consistente entre mudanças de aba
  - Atualiza query parameters quando necessário

#### `trimToLevel(targetLevel)`
- **Propósito**: Navegação via breadcrumb para níveis anteriores
- **Processo**:
  - Remove todos os níveis após o índice especificado
  - Restaura contexto do nível de destino
  - Preserva aba ativa se aplicável

### 2. **Componente Breadcrumb**
**Responsabilidade**: Renderização e interação com usuário

**Características**:
- **Renderização Reativa**: Responde automaticamente a mudanças no store
- **Navegação Clicável**: Permite voltar a qualquer nível do breadcrumb
- **Indicadores Visuais**: Mostra nível atual e separadores apropriados
- **Responsividade**: Adapta-se a diferentes tamanhos de tela

### 3. **Integration Mixin/Composable**
**Responsabilidade**: Integração automática com views

**Características**:
- **Setup Automático**: Views declaram configuração mínima
- **Lifecycle Hooks**: Integração automática com mounted/unmounted
- **Cleanup**: Remove referências quando component é destruído
- **Error Handling**: Gerencia casos onde dados não estão disponíveis

## Caso de Uso Detalhado: Cliente → Obra → Entrada de Recurso

### **Cenário**: Navegação completa do sistema com retorno via breadcrumb

---

### **Etapa 1: Lista de Clientes (`/clientes`)**

**Ação do Sistema**:
```
buildPath() executa:
├── Detecta rota tipo 'clients_list'
├── Constrói stack: [Home, Clientes]
├── Define contexto: { type: 'clients_list' }

updatePath() executa:
├── Stack = [
│   { type: 'home', label: 'Home', path: '/' },
│   { type: 'clients_list', label: 'Clientes', path: '/clientes' }
│   ]
├── Contexto = { type: 'clients_list', entityId: null }
```

**Estado Resultante**:
- **Breadcrumb Visual**: Home > Clientes
- **Contexto Interno**: Lista de clientes ativa

---

### **Etapa 2: Detalhes do Cliente (`/clientes/123`)**

**Ação do Sistema**:
```
buildPath() executa:
├── Identifica entityId: 123
├── Resolve dados do cliente (cache ou API)
├── Mantém níveis anteriores + adiciona específico
├── Preserva estrutura hierárquica

updatePath() executa:
├── Stack = [Home, Clientes, "João Silva"]
├── Cache cliente: { 123: { name: "João Silva" } }
├── Contexto = { type: 'client_details', entityId: 123 }
```

**Estado Resultante**:
- **Breadcrumb Visual**: Home > Clientes > João Silva
- **Contexto Interno**: Cliente específico carregado

---

### **Etapa 3: Aba de Obras (mudança interna)**

**Ação do Sistema**:
```
updateTabContext('obras') executa:
├── Mantém stack completamente inalterado
├── Atualiza apenas: contexto.tab = 'obras'
├── Preserva para navegação futura
├── Atualiza query: ?active_tab=obras
```

**Estado Resultante**:
- **Breadcrumb Visual**: Inalterado (Home > Clientes > João Silva)
- **Contexto Interno**: Cliente + aba 'obras' ativa

---

### **Etapa 4: Detalhes da Obra (`/obras/456`)**

**Ação do Sistema**:
```
buildPath() executa:
├── Resolve dados da obra via API
├── Detecta cliente_id: 123 (mantém hierarquia)
├── Valida consistência com contexto atual
├── Adiciona novo nível preservando anteriores

updatePath() executa:
├── Stack = [Home, Clientes, "João Silva", "Construção Casa Praia"]
├── Cada item mantém path correto para retorno
├── João Silva path = '/clientes/123?active_tab=obras'
├── Cache obra: { 456: { nome: "Construção...", cliente_id: 123 } }
```

**Estado Resultante**:
- **Breadcrumb Visual**: Home > Clientes > João Silva > Construção Casa Praia
- **Contexto Interno**: Hierarquia completa com obra ativa

---

### **Etapa 5: Aba Entradas de Recursos**

**Ação do Sistema**:
```
updateTabContext('entradas-recursos') executa:
├── Stack permanece inalterado
├── Contexto.tab = 'entradas-recursos'
├── Atualiza path da obra atual: ?active_tab=entradas-recursos
├── Prepara contexto para possível navegação para entrada
```

**Estado Resultante**:
- **Breadcrumb Visual**: Inalterado
- **Contexto Interno**: Obra + aba entradas-recursos

---

### **Etapa 6: Edição de Entrada (`/entrada-recursos/789/editar`)**

**Ação do Sistema**:
```
buildPath() executa:
├── Resolve dados da entrada de recurso
├── Valida obra_id: 456 (consistência)
├── Adiciona contexto de edição
├── Mantém toda hierarquia anterior intacta

updatePath() executa:
├── Stack = [Home, Clientes, "João Silva", "Construção...", "Editar Entrada"]
├── Cada nível mantém path correto de retorno
├── Obra path atualizado: '/obras/456?active_tab=entradas-recursos'
```

**Estado Resultante**:
- **Breadcrumb Visual**: Home > Clientes > João Silva > Construção Casa Praia > Editar Entrada de Recurso
- **Contexto Interno**: Hierarquia completa preservada

---

### **Etapa 7: Retorno via Breadcrumb (clique em "João Silva")**

**Ação do Sistema**:
```
trimToLevel(2) executa:
├── Identifica índice do cliente no stack (posição 2)
├── Remove todos os níveis posteriores
├── Stack = [Home, Clientes, "João Silva"]
├── Restaura contexto: { type: 'client_details', entityId: 123, tab: 'obras' }
├── Navega para: '/clientes/123?active_tab=obras'

updateContext() executa:
├── Restaura contexto completo do cliente
├── Ativa aba 'obras' automaticamente
├── Limpa cache de entidades órfãs (obra, entrada)
```

**Estado Resultante**:
- **Breadcrumb Visual**: Home > Clientes > João Silva
- **Contexto Interno**: Cliente com aba 'obras' ativa
- **Experiência**: Retorno exato ao estado anterior

---

## Benefícios da Arquitetura

### **Simplicidade**
- **Ponto Único de Controle**: Todo estado em um store
- **API Consistente**: Métodos padronizados para todas as operações
- **Debugging Facilitado**: Estado centralizado e previsível

### **Performance**
- **Cache Inteligente**: Evita requests desnecessários
- **Updates Granulares**: Apenas o necessário é atualizado
- **Lazy Loading**: Dados carregados sob demanda

### **Experiência do Usuário**
- **Navegação Fluida**: Breadcrumb sempre atualizado
- **Contexto Preservado**: Abas e estados mantidos
- **Retorno Preciso**: Volta exatamente ao estado anterior

### **Manutenibilidade**
- **Configuração Declarativa**: Views definem estrutura mínima
- **Extensibilidade**: Fácil adição de novos tipos de entidade
- **Testabilidade**: Lógica isolada e facilmente testável