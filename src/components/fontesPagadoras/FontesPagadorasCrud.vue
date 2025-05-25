<template>
  <div class="fontes-pagadoras-crud">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error-container">
      <ErrorMessage :message="error" @close="clearError" />
    </div>

    <div v-else class="crud-container">
      <div class="filter-and-actions">
        <FontesPagadorasFilter 
          @filter="handleFilter" 
          @clear="handleClearFilters" 
        />
        <button class="add-button" @click="openCreateModal">
          <IconAdd :size="16" />
          <span>Adicionar</span>
        </button>
      </div>

      <div v-if="fontesPagadoras.length === 0" class="empty-state">
        <p>Nenhuma fonte pagadora encontrada.</p>
      </div>

      <div v-else>
        <FontesPagadorasTable 
          :fontes-pagadoras="fontesPagadoras" 
          :pagination="pagination"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
          @sort="handleSort"
          @edit="openEditModal"
          @delete="openDeleteModal"
          @toggle-status="handleToggleStatus"
        />
      </div>
    </div>

    <!-- Botão flutuante removido -->

    <!-- Modal para criar/editar fonte pagadora -->
    <FontePagadoraModal
      v-if="showModal"
      :cliente-id="clienteId"
      :fonte-pagadora="selectedFontePagadora"
      :mode="modalMode"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Modal de confirmação de exclusão -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Excluir Fonte Pagadora"
      :message="`Tem certeza que deseja excluir a fonte pagadora '${selectedFontePagadora?.nome}'? Esta ação não pode ser desfeita.`"
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFontesPagadorasStore } from '@/stores/fontesPagadorasStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { FontePagadora } from '@/types/fontePagadora.types'
import FontesPagadorasFilter from './FontesPagadorasFilter.vue'
import FontesPagadorasTable from './FontesPagadorasTable.vue'
import FontePagadoraModal from './FontePagadoraModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import IconAdd from '@/components/icons/IconAdd.vue'

// Props
const props = defineProps<{
  clienteId: number
}>()

// Stores
const fontesPagadorasStore = useFontesPagadorasStore()
const notificationStore = useNotificationStore()

// Destructure store state
const { 
  fontesPagadoras, 
  loading, 
  error, 
  currentPage, 
  lastPage, 
  perPage, 
  total, 
  paginationLinks,
  sortBy,
  sortDirection
} = storeToRefs(fontesPagadorasStore)

// Modal state
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedFontePagadora = ref<FontePagadora | null>(null)
const showDeleteModal = ref(false)

// Computed
const pagination = computed(() => {
  if (currentPage.value && lastPage.value && perPage.value && total.value) {
    return {
      currentPage: currentPage.value,
      lastPage: lastPage.value,
      perPage: perPage.value,
      total: total.value,
      links: paginationLinks.value
    }
  }
  return null
})

// Lifecycle hooks
onMounted(() => {
  loadFontesPagadoras()
})

// Watch for changes in clienteId
watch(() => props.clienteId, () => {
  loadFontesPagadoras()
})

// Methods
const loadFontesPagadoras = async () => {
  try {
    await fontesPagadorasStore.fetchFontesPagadoras(1, perPage.value, undefined, undefined, props.clienteId)
  } catch (err) {
    console.error('Erro ao carregar fontes pagadoras:', err)
  }
}

const handleFilter = (filters: Record<string, string>) => {
  fontesPagadorasStore.fetchFontesPagadoras(1, perPage.value, filters, undefined, props.clienteId)
}

const handleClearFilters = () => {
  fontesPagadorasStore.clearFilters(props.clienteId)
}

const handlePageChange = (page: number) => {
  fontesPagadorasStore.fetchFontesPagadoras(page, perPage.value, undefined, undefined, props.clienteId)
}

const handlePerPageChange = (itemsPerPage: number) => {
  fontesPagadorasStore.fetchFontesPagadoras(1, itemsPerPage, undefined, undefined, props.clienteId)
}

const handleSort = (field: string) => {
  const newDirection = sortBy.value === field && sortDirection.value === 'asc' ? 'desc' : 'asc'
  fontesPagadorasStore.fetchFontesPagadoras(
    currentPage.value, 
    perPage.value, 
    undefined, 
    { sortBy: field, direction: newDirection },
    props.clienteId
  )
}

const openCreateModal = () => {
  selectedFontePagadora.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (fontePagadoraId: number) => {
  const fontePagadora = fontesPagadoras.value.find(f => f.id === fontePagadoraId)
  if (fontePagadora) {
    selectedFontePagadora.value = fontePagadora
    modalMode.value = 'edit'
    showModal.value = true
  }
}

const closeModal = () => {
  showModal.value = false
  selectedFontePagadora.value = null
}

const handleSave = async (fontePagadora: Partial<FontePagadora>) => {
  try {
    if (modalMode.value === 'create') {
      await fontesPagadorasStore.createFontePagadora({
        ...fontePagadora,
        cliente_id: props.clienteId
      })
      notificationStore.addNotification(
        'Fonte pagadora criada com sucesso!',
        'success',
        5000
      )
    } else {
      if (selectedFontePagadora.value) {
        await fontesPagadorasStore.updateFontePagadora(
          selectedFontePagadora.value.id,
          {
            ...fontePagadora,
            cliente_id: props.clienteId
          }
        )
        notificationStore.addNotification(
          'Fonte pagadora atualizada com sucesso!',
          'success',
          5000
        )
      }
    }
    closeModal()
  } catch (err) {
    console.error('Erro ao salvar fonte pagadora:', err)
    notificationStore.addNotification(
      'Erro ao salvar fonte pagadora. Tente novamente.',
      'error',
      5000
    )
  }
}

const openDeleteModal = (fontePagadoraId: number) => {
  const fontePagadora = fontesPagadoras.value.find(f => f.id === fontePagadoraId)
  if (fontePagadora) {
    selectedFontePagadora.value = fontePagadora
    showDeleteModal.value = true
  }
}

const confirmDelete = async () => {
  if (!selectedFontePagadora.value) return
  
  try {
    await fontesPagadorasStore.deleteFontePagadora(
      selectedFontePagadora.value.id,
      props.clienteId
    )
    
    notificationStore.addNotification(
      `Fonte pagadora ${selectedFontePagadora.value.nome} excluída com sucesso!`,
      'success',
      5000
    )
    
    showDeleteModal.value = false
    selectedFontePagadora.value = null
  } catch (err) {
    console.error('Erro ao excluir fonte pagadora:', err)
    notificationStore.addNotification(
      'Erro ao excluir fonte pagadora. Tente novamente.',
      'error',
      5000
    )
  }
}

const handleToggleStatus = async (fontePagadoraId: number, ativo: boolean) => {
  try {
    await fontesPagadorasStore.updateFontePagadoraStatus(
      fontePagadoraId,
      ativo ? 'ativo' : 'inativo',
      props.clienteId
    )
    
    notificationStore.addNotification(
      `Status da fonte pagadora alterado com sucesso!`,
      'success',
      5000
    )
  } catch (err) {
    console.error('Erro ao alterar status da fonte pagadora:', err)
    notificationStore.addNotification(
      'Erro ao alterar status da fonte pagadora. Tente novamente.',
      'error',
      5000
    )
  }
}

const clearError = () => {
  fontesPagadorasStore.clearError()
}
</script>

<style scoped>
.fontes-pagadoras-crud {
  width: 100%;
  padding: 0.25rem 0;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
}

.crud-container {
  width: 100%;
}

.filter-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  gap: 0.75rem;
}

@media (max-width: 767px) {
  .filter-and-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-button {
    width: 100%;
    margin-top: 0.5rem;
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #111827; /* Texto quase preto para máximo contraste */
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  white-space: nowrap;
  height: 38px;
  min-width: 120px;
}

.add-button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.add-button:active {
  transform: translateY(0);
}

/* Botão flutuante removido */

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  color: #4b5563; /* Cinza mais escuro */
  font-weight: 500;
}
</style>
