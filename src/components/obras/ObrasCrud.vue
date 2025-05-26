<template>
  <div class="obras-crud">
    <div v-if="loading && !obras.length" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando obras...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="loadObras">Tentar novamente</button>
    </div>
    
    <div v-else class="crud-container">
      <div class="filter-and-actions">
        <ObrasFilter 
          @filter="handleFilter" 
          @clear="clearFilters" 
        />
        <button class="add-button" @click="() => router.push({ name: 'new-obra', params: { cliente_id } })">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>Adicionar</span>
        </button>
      </div>
      
      <div v-if="pagination && pagination.last_page > 0" class="table-header">
        <Pagination 
          :current-page="currentPage" 
          :total-pages="pagination.last_page" 
          :total="pagination.total" 
          :per-page="itemsPerPage"
          :from="pagination.from"
          :to="pagination.to"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
      
      <div v-if="!loading && !obras.length" class="empty-state">
        <p>Nenhuma obra encontrada.</p>
        <button class="add-button-small" @click="() => router.push({ name: 'new-obra', params: { cliente_id } })">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>Adicionar obra</span>
        </button>
      </div>
      
      <div v-else>
        <ObrasTable 
          :cliente-id="cliente_id"
          :obras="obras" 
          :sort-by="sortBy" 
          :sort-direction="sortDirection" 
          :is-mobile="isMobile"
          @edit="openEditPage" 
          @delete="confirmDelete" 
          @sort="handleSort"
          @view="viewObra"
        />
        

      </div>
    </div>
    
    
    
    <!-- Modal de confirmação de exclusão -->
    <div v-if="showDeleteConfirm" class="confirm-modal-backdrop" @click="cancelDelete">
      <div class="confirm-modal" @click.stop>
        <div class="confirm-modal-header">
          <h3 class="confirm-modal-title">Confirmar exclusão</h3>
          <button class="close-button" @click="cancelDelete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div class="confirm-modal-body">
          <p class="confirm-message">Tem certeza que deseja excluir a obra <strong>{{ obraToDelete?.nome }}</strong>?</p>
          <p class="confirm-warning">Esta ação não pode ser desfeita!</p>
        </div>
        <div class="confirm-modal-footer">
          <button class="cancel-button" @click="cancelDelete">Cancelar</button>
          <button 
            class="delete-button" 
            @click="deleteObra" 
            :disabled="deleteSubmitting"
          >
            <span v-if="deleteSubmitting" class="loading-spinner-small"></span>
            <span v-else>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useObrasStore } from '@/stores/obrasStore'
import type { Obra, ObraForm } from '@/types/obra.types'
import ObrasFilter from './ObrasFilter.vue'
import ObrasTable from './ObrasTable.vue'
import Pagination from '@/components/common/Pagination.vue'

// Props
const props = defineProps<{
  clienteId: number
}>()
console.log('[ObrasCrud] clienteId recebido:', props.clienteId)
const cliente_id = props.clienteId

// Store
const obrasStore = useObrasStore()

// Estado
const showModal = ref(false)
const selectedObra = ref<Obra | null>(null)
const formSubmitting = ref(false)
const showDeleteConfirm = ref(false)
const obraToDelete = ref<Obra | null>(null)
const deleteSubmitting = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(15)
const isMobile = ref(false)

// Computed
const obras = computed(() => obrasStore.getObras)
const loading = computed(() => obrasStore.isLoading)
const error = computed(() => obrasStore.error)
const pagination = computed(() => obrasStore.getPagination)
const totalObras = computed(() => pagination.value?.total || 0)
const sortBy = computed(() => obrasStore.getSortBy)
const sortDirection = computed(() => obrasStore.getSortDirection)

// Métodos
const loadObras = async () => {
  await obrasStore.fetchObras(
    currentPage.value,
    itemsPerPage.value,
    obrasStore.getFilters,
    { sortBy: sortBy.value, direction: sortDirection.value },
    props.clienteId
  )
}

const handleFilter = (filters: Record<string, string>) => {
  obrasStore.setFilters(filters)
  currentPage.value = 1 // Resetar para a primeira página ao filtrar
  loadObras()
}

const clearFilters = () => {
  obrasStore.clearFilters()
  currentPage.value = 1
  loadObras()
}

const handleSort = (field: string) => {
  obrasStore.setSorting(field)
  loadObras()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadObras()
}

const handlePerPageChange = (perPage: number) => {
  itemsPerPage.value = perPage
  currentPage.value = 1 // Resetar para a primeira página ao mudar itens por página
  loadObras()
}

import { useRouter } from 'vue-router'
const router = useRouter()
const openEditPage = (obra: Obra) => {
  router.push({ name: 'edit-obra', params: { id: obra.id } })
}

const viewObra = (obra: Obra) => {
  router.push({ name: 'obra-details', params: { id: obra.id } })
}

const confirmDelete = (obra: Obra) => {
  obraToDelete.value = obra
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  obraToDelete.value = null
}

const deleteObra = async () => {
  if (!obraToDelete.value) return
  
  deleteSubmitting.value = true
  
  try {
    await obrasStore.deleteObra(obraToDelete.value.id)
    cancelDelete()
    loadObras() // Recarregar a lista
  } catch (error) {
    console.error('Erro ao excluir obra:', error)
  } finally {
    deleteSubmitting.value = false
  }
}

// Função toggleObraStatus removida

const checkMobileView = () => {
  isMobile.value = window.innerWidth < 768
}

// Lifecycle hooks
onMounted(() => {
  loadObras()
  checkMobileView()
  window.addEventListener('resize', checkMobileView)
})

// Watchers
watch(() => props.clienteId, () => {
  // Recarregar obras quando o cliente mudar
  currentPage.value = 1
  loadObras()
})
</script>

<style scoped>
.obras-crud {
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
  flex-direction: column;
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

.add-button svg {
  width: 1rem;
  height: 1rem;
}

.crud-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(79, 70, 229, 0.2);
  border-radius: 50%;
  border-top-color: #4f46e5;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  padding: 2rem;
  text-align: center;
  color: #b91c1c;
}

.error-message {
  margin-bottom: 1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #e5e7eb;
}

.empty-state {
  padding: 3rem 0;
  text-align: center;
  color: #6b7280;
}

.add-button-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button-small:hover {
  background-color: #e5e7eb;
}

.add-button-small svg {
  width: 1rem;
  height: 1rem;
}

.pagination-container {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Modal de confirmação */
.confirm-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.confirm-modal {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.confirm-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.confirm-modal-body {
  padding: 1.5rem;
}

.confirm-message {
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 1rem;
}

.confirm-warning {
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background-color: #fee2e2;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border-left: 3px solid #b91c1c;
  display: flex;
  align-items: center;
}

.confirm-warning::before {
  content: '⚠️';
  margin-right: 0.5rem;
}

.confirm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button,
.delete-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 5rem;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.delete-button {
  background-color: #ef4444;
  color: white;
  border: none;
}

.delete-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.delete-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-button svg, .action-button .icon-edit, .action-button .icon-trash {
  width: 20px;
  height: 20px;
  display: block; /* Para garantir que o SVG não tenha espaço extra abaixo */
}

.view-button svg {
  color: #17a2b8; /* Info blue */
}
.view-button:hover {
  background-color: #e2f3f5;
}

.edit-button svg {
  color: #4f46e5; /* Primary blue */
}
.edit-button:hover {
  background-color: #e5e7eb;
}

.delete-button svg {
  color: #dc3545; /* Danger red */
}
.delete-button:hover {
  background-color: #fbebeb; /* Corrigido de #fbe_BEBE para #fbebeb */
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  text-align: center;
}

.status-badge.success {
  background-color: #2ecc71;
}

.status-badge.warning {
  background-color: #f1c40f;
}

.status-badge.danger {
  background-color: #e74c3c;
}

@media (max-width: 640px) {
  .crud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .add-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
