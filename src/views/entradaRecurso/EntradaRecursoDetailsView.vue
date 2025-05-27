<template>
  <div class="entrada-recurso-details-container">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="error-container">
      <ErrorMessage :message="error" />
    </div>
    <div v-else-if="entradaRecurso" class="entrada-recurso-details">
      <!-- Abas de Navegação -->
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'dados-gerais' }"
          @click="activeTab = 'dados-gerais'"
        >
          Dados Gerais
        </div>
      </div>

      <div class="tab-content">
        <!-- Cabeçalho da Entrada de Recurso -->
        <div class="entrada-recurso-header">
          <div class="entrada-recurso-header-main">
            <h2 class="entrada-recurso-name">
              Entrada de Recurso #{{ entradaRecurso.id }}
              <span class="entrada-recurso-valor">{{ formatCurrency(entradaRecurso.valor) }}</span>
            </h2>
            <div class="entrada-recurso-actions">
              <button @click="handleEdit" class="action-button edit-button">
                <IconEdit class="icon" />
                Editar
              </button>
              <button @click="showDeleteConfirm = true" class="action-button delete-button">
                <IconTrash class="icon" />
                Excluir
              </button>
            </div>
          </div>
          <div class="entrada-recurso-meta">
            <span class="meta-item">ID: {{ entradaRecurso.id }}</span>
            <span class="meta-item">Data: {{ formatDate(entradaRecurso.data_entrada) }}</span>
            <span v-if="entradaRecurso.obra?.nome" class="meta-item">Obra: {{ entradaRecurso.obra.nome }}</span>
            <span class="meta-item">
              <span :class="`status-badge status-${entradaRecurso.tipo_entrada}`">
                {{ getTipoEntradaFormatado(entradaRecurso.tipo_entrada) }}
              </span>
            </span>
          </div>
        </div>

        <!-- Conteúdo da Aba Dados Gerais -->
        <div v-if="activeTab === 'dados-gerais'" class="data-section">
          <h3 class="section-title">Informações da Entrada de Recurso</h3>
          <div class="data-grid">
            <div class="data-item"><span class="data-label">ID:</span> {{ entradaRecurso.id }}</div>
            <div class="data-item">
              <span class="data-label">Obra:</span> 
              {{ entradaRecurso.obra?.nome || '-' }} (ID: {{ entradaRecurso.obra_id }})
            </div>
            <div class="data-item">
              <span class="data-label">Fonte Pagadora:</span> 
              {{ entradaRecurso.fonte_pagadora?.nome || '-' }} (ID: {{ entradaRecurso.fonte_pagadora_id }})
            </div>
            <div class="data-item">
              <span class="data-label">Valor:</span> 
              {{ formatCurrency(entradaRecurso.valor) }}
            </div>
            <div class="data-item">
              <span class="data-label">Data de Entrada:</span> 
              {{ formatDate(entradaRecurso.data_entrada) }}
            </div>
            <div class="data-item">
              <span class="data-label">Tipo de Entrada:</span> 
              <span :class="`status-badge status-${entradaRecurso.tipo_entrada}`">
                {{ getTipoEntradaFormatado(entradaRecurso.tipo_entrada) }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">Descrição:</span> 
              {{ entradaRecurso.descricao || '-' }}
            </div>
            <div class="data-item">
              <span class="data-label">Comprovante:</span> 
              <a v-if="entradaRecurso.comprovante_url" :href="entradaRecurso.comprovante_url" target="_blank" class="link">
                Ver comprovante
              </a>
              <span v-else>-</span>
            </div>
            <div class="data-item">
              <span class="data-label">Criado em:</span> 
              {{ formatDate(entradaRecurso.created_at) }}
            </div>
            <div class="data-item">
              <span class="data-label">Atualizado em:</span> 
              {{ formatDate(entradaRecurso.updated_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Nenhuma entrada de recurso encontrada.</p>
    </div>

    <ConfirmationModal
      :show="showDeleteConfirm"
      title="Excluir Entrada de Recurso"
      :message="`Tem certeza que deseja excluir esta entrada de recurso? Esta ação não pode ser desfeita.`"
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteConfirm = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntradaRecursoStore } from '@/stores/entradaRecursoStore'
import type { EntradaRecurso } from '@/types/entrada-recurso.types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

const route = useRoute()
const router = useRouter()
const entradaRecursoStore = useEntradaRecursoStore()
const notificationStore = useNotificationStore()
const breadcrumbStore = useBreadcrumbStore()

const entradaRecurso = ref<EntradaRecurso | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const activeTab = ref('dados-gerais')

// Função para formatar o tipo de entrada
const getTipoEntradaFormatado = (tipo: string): string => {
  const formatMap: Record<string, string> = {
    'aporte_inicial': 'Aporte Inicial',
    'aporte_adicional': 'Aporte Adicional',
    'reembolso': 'Reembolso',
    'regular': 'Regular'
  }
  return formatMap[tipo] || tipo
}

onMounted(async () => {
  // Verificar se há uma aba ativa na query string
  const tabFromQuery = route.query.active_tab as string;
  if (tabFromQuery) {
    activeTab.value = tabFromQuery;
  }
  
  const entradaRecursoId = Number(route.params.id);

  if (isNaN(entradaRecursoId)) {
    error.value = 'ID da entrada de recurso inválido.';
    loading.value = false;
    return;
  }

  try {
    const apiResponse = await entradaRecursoStore.fetchEntradaRecursoById(entradaRecursoId); 

    // A resposta já está sendo processada corretamente no service e retornando o objeto dentro de data
    if (apiResponse) { 
      entradaRecurso.value = apiResponse; 

      // Atualizar breadcrumb para navegação - mockado para evitar erros
      try {
        if (entradaRecurso.value && entradaRecurso.value.obra_id) { 
          // Apenas definir a aba ativa, já que setObraId não existe
          breadcrumbStore.setActiveTab('entradas-recursos'); 
        }
      } catch (breadcrumbErr) {
        console.warn('[EntradaRecursoDetailsView] Non-critical breadcrumb error:', breadcrumbErr);
      }
    } else {
      error.value = 'Entrada de recurso não encontrada ou formato de dados inesperado.';
      console.warn('[EntradaRecursoDetailsView] Entrada de recurso data not found or malformed in API response for ID:', entradaRecursoId, apiResponse);
    }
  } catch (err: any) {
    console.error('[EntradaRecursoDetailsView] Error fetching entrada de recurso:', err);
    error.value = err.response?.data?.message || 'Falha ao carregar dados da entrada de recurso.';
  } finally {
    loading.value = false;
  }
});

const handleEdit = () => {
  if (entradaRecurso.value?.id) {
    router.push({ name: 'edit-entrada-recurso', params: { id: entradaRecurso.value.id.toString() } })
  }
}

const handleDelete = async () => {
  if (!entradaRecurso.value?.id) return
  try {
    await entradaRecursoStore.deleteEntradaRecurso(entradaRecurso.value.id)
    notificationStore.addNotification(
      `Entrada de recurso excluída com sucesso!`,
      'success'
    )
    // Navegar de volta para a obra relacionada
    if (entradaRecurso.value.obra_id) {
      router.push({ 
        name: 'obra-details', 
        params: { id: entradaRecurso.value.obra_id },
        query: { active_tab: 'entrada_recurso' } 
      });
    } else {
      // Fallback para uma lista geral
      router.push({ name: 'home' }) 
    }
  } catch (err: any) {
    notificationStore.addNotification('Erro ao excluir entrada de recurso.', 'error')
    console.error('Erro ao excluir entrada de recurso:', err)
  } finally {
    showDeleteConfirm.value = false
  }
}
</script>

<style scoped lang="scss">
.entrada-recurso-details-container {
  width: 100%; 
  padding: $spacing-lg;
  background-color: $background-light;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
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
    color: $text-gray;
    
    &:hover {
      background-color: rgba($primary-color, 0.05);
    }
    
    &.active {
      border-bottom: 2px solid $primary-color;
      color: $primary-color;
      font-weight: 600;
    }
  }
}

.entrada-recurso-header {
  margin-bottom: 0; 
  padding-bottom: $spacing-sm; 
  border-bottom: 1px solid $border-color;
}

.entrada-recurso-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.entrada-recurso-name {
  font-size: $font-size-xl;
  color: $text-color-dark;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.entrada-recurso-valor {
  font-size: $font-size-lg;
  color: $primary-color;
  font-weight: 700;
}

.entrada-recurso-actions {
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

.entrada-recurso-meta {
  display: flex;
  gap: $spacing-lg;
  font-size: $font-size-sm;
  color: $text-gray;
}

.data-section {
  background-color: $color-white; 
  padding: $spacing-lg;
  border-radius: $border-radius-sm;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-md;
}

.data-item {
  background-color: $bg-gray-light;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  font-size: $font-size-base;
  color: $text-color-dark;
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

.status-aporte_inicial {
  background-color: #e6f7ff; 
  color: #005f80;
}

.status-aporte_adicional {
  background-color: #fffbe6; 
  color: #806f00;
}

.status-reembolso {
  background-color: #e6ffed; 
  color: #00661a;
}

.status-regular {
  background-color: #f0f0f0; 
  color: #595959;
}

.link {
  color: $primary-color;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

/* Responsividade para mobile */
@media (max-width: 768px) {
  .entrada-recurso-header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-md;
  }
  
  .entrada-recurso-meta {
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
  
  .entrada-recurso-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
