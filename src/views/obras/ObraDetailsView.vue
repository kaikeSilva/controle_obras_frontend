<template>
  <div class="obra-details-container">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-container">
      <ErrorMessage :message="error" />
    </div>
    <div v-else-if="obra" class="obra-details">
      <!-- Abas de Navegação -->
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'dados-gerais' }"
          @click="activeTab = 'dados-gerais'"
        >
          Dados Gerais
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'gastos' }"
          @click="activeTab = 'gastos'"
        >
          Gastos
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'entradas-recursos' }"
          @click="activeTab = 'entradas-recursos'"
        >
          Entradas de Recursos
        </div>
      </div>

      <div class="tab-content">
        <!-- Cabeçalho da Obra -->
        <div class="obra-header">
          <div class="obra-header-main">
            <h2 class="obra-name">{{ obra.nome }}</h2>
            <div class="obra-actions">
              <button @click="handleEdit" class="action-button edit-button">
                <IconEdit class="icon" />
                Editar Obra
              </button>
              <button @click="showDeleteConfirm = true" class="action-button delete-button">
                <IconTrash class="icon" />
                Excluir Obra
              </button>
            </div>
          </div>
          <div class="obra-meta">
            <span class="meta-item">ID: {{ obra.id }}</span>
            <span class="meta-item">Início: {{ formatDate(obra.data_inicio) }}</span>
            <span v-if="obra.cliente?.name" class="meta-item">Cliente: {{ obra.cliente.name }}</span>
          </div>
        </div>

        <!-- Conteúdo da Aba Dados Gerais -->
        <div v-if="activeTab === 'dados-gerais'" class="data-section">
          <h3 class="section-title">Informações da Obra</h3>
          <div class="data-grid">
            <div class="data-item"><span class="data-label">ID:</span> {{ obra.id }}</div>
            <div class="data-item"><span class="data-label">Descrição:</span> {{ obra.descricao }}</div>
            <div class="data-item"><span class="data-label">Endereço:</span> {{ obra.endereco || '-' }}</div>
            <div class="data-item"><span class="data-label">Status:</span> <span :class="`status-badge status-${obra.status?.toLowerCase()}`">{{ obra.status || '-' }}</span></div>
            <div class="data-item"><span class="data-label">Data de Início:</span> {{ formatDate(obra.data_inicio) }}</div>
            <div class="data-item"><span class="data-label">Data de Conclusão Prevista:</span> {{ formatDate(obra.data_prevista_conclusao) }}</div>
            <div class="data-item"><span class="data-label">Data de Conclusão Real:</span> {{ obra.data_conclusao ? formatDate(obra.data_conclusao) : '-' }}</div>
            <div class="data-item"><span class="data-label">Valor Total:</span> {{ formatCurrency(obra.valor_total) }}</div>
            <div class="data-item"><span class="data-label">Cliente:</span> {{ obra.cliente?.name || '-' }} (ID: {{ obra.cliente_id }})</div>
            <div class="data-item"><span class="data-label">Responsável:</span> {{ obra.responsavel?.name || '-' }} (ID: {{ obra.responsavel_id }})</div>
            <div class="data-item"><span class="data-label">Criado em:</span> {{ formatDate(obra.created_at) }}</div>
            <div class="data-item"><span class="data-label">Atualizado em:</span> {{ formatDate(obra.updated_at) }}</div>
          </div>
        </div>
        
        <!-- Tab Gastos -->
        <div v-if="activeTab === 'gastos'" class="gastos-section">
          <GastosCrud :obraId="obra.id" />
        </div>
        
        <!-- Tab Entradas de Recursos -->
        <div v-if="activeTab === 'entradas-recursos'" class="entradas-recursos-section">
          <EntradaRecursoCrud :obraId="obra.id" />
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <!-- Estado vazio -->
    </div>

    <ConfirmationModal
      :show="showDeleteConfirm"
      title="Excluir Obra"
      :message="`Tem certeza que deseja excluir a obra '${obra?.descricao}'? Esta ação não pode ser desfeita.`"
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteConfirm = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useObrasStore } from '@/stores/obrasStore'
import type { Obra } from '@/types/obra.types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
import GastosCrud from '@/components/gastos/GastosCrud.vue'
import EntradaRecursoCrud from '@/components/entradaRecurso/EntradaRecursoCrud.vue'

const route = useRoute()
const router = useRouter()
const obrasStore = useObrasStore()
const notificationStore = useNotificationStore()
const breadcrumbStore = useBreadcrumbStore()

const obra = ref<Obra | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const activeTab = ref('dados-gerais')

// Observar mudanças no parâmetro active_tab da URL
watch(() => route.query.active_tab, (tab) => {
  if (tab === 'entradas-recursos') activeTab.value = 'entradas-recursos'
  else if (tab === 'gastos') activeTab.value = 'gastos'
  else if (tab) activeTab.value = tab as string
})

onMounted(async () => {
  // Verificar se há uma aba ativa na query string
  const tabFromQuery = route.query.active_tab as string;
  if (tabFromQuery === 'entradas-recursos') {
    activeTab.value = 'entradas-recursos';
  } else if (tabFromQuery) {
    activeTab.value = tabFromQuery;
  }
  
  const obraId = Number(route.params.id);
  console.log('[ObraDetailsView] obraId from route params:', obraId);

  if (isNaN(obraId)) {
    error.value = 'ID da obra inválido.';
    loading.value = false;
    console.error('[ObraDetailsView] Invalid obraId:', route.params.id);
    return;
  }

  try {
    console.log('[ObraDetailsView] Fetching obra with ID:', obraId);
    const apiResponse = await obrasStore.fetchObra(obraId); 
    console.log('[ObraDetailsView] API response for obra:', apiResponse); 

    if (apiResponse && apiResponse.data) { 
      obra.value = apiResponse.data; 
      console.log('[ObraDetailsView] obra.value after assignment:', obra.value);

      // Atualizar breadcrumbStore com clienteId para navegação de volta correta
      if (obra.value && obra.value.cliente_id) { 
        breadcrumbStore.setClienteId(parseInt(obra.value.cliente_id.toString()));
        breadcrumbStore.setActiveTab('obras'); 
      }
    } else {
      error.value = 'Obra não encontrada ou formato de dados inesperado.';
      console.warn('[ObraDetailsView] Obra data not found or malformed in API response for ID:', obraId, apiResponse);
    }
  } catch (err: any) {
    console.error('[ObraDetailsView] Error fetching obra:', err);
    error.value = err.response?.data?.message || 'Falha ao carregar dados da obra.';
  } finally {
    loading.value = false;
  }
});

const handleEdit = () => {
  if (obra.value?.id) {
    router.push({ name: 'edit-obra', params: { id: obra.value.id.toString() } })
  }
}

const handleDelete = async () => {
  if (!obra.value?.id) return
  try {
    await obrasStore.deleteObra(obra.value.id)
    notificationStore.addNotification(
      `Obra ${obra.value?.nome} excluída com sucesso!`,
      'success'
    )
    // Tenta voltar para a tela de detalhes do cliente se currentClienteId estiver definido
    if (breadcrumbStore.currentClienteId) {
      router.push({ 
        name: 'client-details', 
        params: { id: breadcrumbStore.currentClienteId },
        query: { active_tab: 'obras' } 
      });
    } else {
      // Fallback para uma lista geral de obras ou home, se não houver cliente associado
      // ou se a navegação direta para obras for preferida.
      router.push({ name: 'home' }) 
    }
  } catch (err: any) {
    notificationStore.addNotification('Erro ao excluir obra.', 'error')
    console.error('Erro ao excluir obra:', err)
  } finally {
    showDeleteConfirm.value = false
  }
}

</script>

<style scoped lang="scss">
.obra-details-container {
  width: 100%; 
  padding: $spacing-lg;
  background-color: $background-light;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  // max-width: 1000px; 
  // margin: $spacing-lg auto; 
}

.loading-container,
.error-container,
.empty-state {
  @include center-flex;
  flex-direction: column;
  padding: $spacing-xl;
  min-height: 300px;
  text-align: center;
}

.tabs {
  display: flex;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-lg;

  .tab {
    padding: $spacing-md $spacing-lg;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba($primary-color, 0.05);
    }
    
    &.active {
      border-bottom: 2px solid $primary-color;
      color: $primary-color;
      font-weight: 600;
    }
    color: $text-gray;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
      font-weight: 600;
    }

    &:hover {
      color: $primary-color-dark;
    }
  }
}

.obra-header {
  margin-bottom: 0; 
  padding-bottom: $spacing-sm; 
  border-bottom: 1px solid $border-color;
}

.obra-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.obra-name {
  font-size: $font-size-xl;
  color: $text-color-dark;
  font-weight: 600;
  margin: 0;
}

.obra-actions {
  display: flex;
  gap: $spacing-md;

  .action-button {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    transition: background-color $transition-speed;

    .icon {
      width: 16px;
      height: 16px;
    }

    &.edit-button {
      background-color: $primary-color;
      color: white;

      &:hover {
        background-color: $primary-color-dark;
      }
    }

    &.delete-button {
      background-color: $error-color;
      color: white;

      &:hover {
        background-color: $error-color-dark;
      }
    }
  }
}

.obra-meta {
  display: flex;
  gap: $spacing-lg;
  font-size: $font-size-sm;
  color: $text-gray;

  .meta-item {
    // Estilos para cada item de metadado, se necessário
  }
}

.tab-content {
  // Estilos para o container do conteúdo da aba, se necessário
}

.data-section {
  background-color: $color-white; 
  padding: $spacing-lg;
  border-radius: $border-radius-sm;
  // box-shadow: $shadow-xs; 
}

.gastos-section,
.entradas-recursos-section {
  padding: $spacing-sm 0;
}

.section-title {
  font-size: $font-size-lg;
  color: $text-color-dark;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid $border-color;
}

.data-grid {
  display: grid;
  gap: $spacing-md;
  // margin-bottom: $spacing-lg; // Removed to match ClientDetailsView

  &.responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); // Adjusted to match ClientDetailsView
  }
}

.data-item {
  background-color: $bg-gray-light;
  padding: $spacing-sm 0; // Adjusted to match ClientDetailsView
  border-radius: $border-radius-sm;
  font-size: $font-size-base;
  color: $text-color-dark; // Added for better readability of data values
}

.data-label {
  font-weight: 600;
  color: $text-gray-dark;
  margin-right: $spacing-xs;
}

.status-badge {
  padding: 3px $spacing-xs;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm * 0.9;
  font-weight: 600;
  text-transform: capitalize;
}

.status-planejada {
  background-color: #e6f7ff; 
  color: #005f80;
}

.status-em_andamento {
  background-color: #fffbe6; 
  color: #806f00;
}

.status-concluida {
  background-color: #e6ffed; 
  color: #00661a;
}

.status-cancelada {
  background-color: #ffe6e6; 
  color: #800000;
}

.status-pendente {
  background-color: #f0f0f0; 
  color: #595959;
}

/* Estilos para LoadingSpinner e ErrorMessage devem vir dos componentes globais ou ser definidos aqui se necessário */
.loading-spinner, .error-message {
  text-align: center;
  padding: $spacing-lg;
}
</style>
