<template>
  <div class="categorias-gastos-crud">
    <div v-if="loading && !categoriasGastos.length" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando categorias de gastos...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="loadCategoriasGastos">Tentar novamente</button>
    </div>
    
    <div v-else class="crud-container">
      <div class="filter-and-actions">
        <CategoriasGastosFilter 
          @filter="handleFilter" 
          @clear="clearFilters" 
        />
        <button class="add-button" @click="navigateToCreateForm">
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
      
      <div v-if="!loading && !categoriasGastos.length" class="empty-state">
        <p>Nenhuma categoria de gasto encontrada.</p>
        <button class="add-button-small" @click="navigateToCreateForm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>Adicionar categoria</span>
        </button>
      </div>
      
      <div v-else>
        <!-- Desktop View - Table -->
        <CategoriasGastosTable 
          v-if="!isMobile"
          :cliente-id="clienteId"
          :categorias-gastos="categoriasGastos" 
          :sort-by="sortBy" 
          :sort-direction="sortDirection" 
          :is-mobile="isMobile"
          @edit="openEditModal" 
          @delete="confirmDelete" 
          @sort="handleSort"
        />
        
        <!-- Mobile View - Cards -->
        <CategoriasGastosCards 
          v-else
          :cliente-id="clienteId"
          :categorias-gastos="categoriasGastos"
          @edit="openEditModal"
          @delete="confirmDelete"
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
          <p class="confirm-message">Tem certeza que deseja excluir a categoria <strong>{{ categoriaGastoToDelete?.nome }}</strong>?</p>
          <p class="confirm-warning">Esta ação não pode ser desfeita!</p>
        </div>
        <div class="confirm-modal-footer">
          <button class="cancel-button" @click="cancelDelete">Cancelar</button>
          <button 
            class="delete-button" 
            @click="deleteCategoriaGasto" 
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriaGastoStore } from '@/stores/categoriaGastoStore'
import type { CategoriaGasto } from '@/types/categoriaGasto.types'
import CategoriasGastosFilter from './CategoriasGastosFilter.vue'
import CategoriasGastosTable from './CategoriasGastosTable.vue'
import CategoriasGastosCards from './CategoriasGastosCards.vue'
import Pagination from '@/components/common/Pagination.vue'
import { useNotificationStore } from '@/stores/notificationStore'

// Props
const props = defineProps<{
  clienteId: number
}>()

// Store
const categoriaGastoStore = useCategoriaGastoStore()
const notificationStore = useNotificationStore()

// Router
const router = useRouter()

// Estado
const showModal = ref(false)
const selectedCategoriaGasto = ref<CategoriaGasto | null>(null)
const formSubmitting = ref(false)
const showDeleteConfirm = ref(false)
const categoriaGastoToDelete = ref<CategoriaGasto | null>(null)
const deleteSubmitting = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(15)
const isMobile = ref(false)
const errors = ref<Record<string, string>>({})

// Formulário
const form = ref<CategoriaGastoForm>({
  nome: '',
  status: true,
  cliente_id: props.clienteId,
  descricao: null,
  cor: null
})

// Computed
const categoriasGastos = computed(() => categoriaGastoStore.getCategoriasGastos)
const loading = computed(() => categoriaGastoStore.isLoading)
const error = computed(() => categoriaGastoStore.getError)
const pagination = computed(() => categoriaGastoStore.getPagination)
const sortBy = computed(() => categoriaGastoStore.getSortBy)
const sortDirection = computed(() => categoriaGastoStore.getSortDirection)
const isFormValid = computed(() => {
  return form.value.nome.trim().length >= 3
})

// Métodos
const loadCategoriasGastos = async () => {
  await categoriaGastoStore.fetchCategoriasGastos(
    currentPage.value,
    itemsPerPage.value,
    categoriaGastoStore.getFilters,
    { sortBy: sortBy.value, direction: sortDirection.value },
    props.clienteId
  )
}

const handleFilter = (filters: Record<string, string>) => {
  categoriaGastoStore.setFilters(filters)
  currentPage.value = 1 // Resetar para a primeira página ao filtrar
  loadCategoriasGastos()
}

const clearFilters = () => {
  categoriaGastoStore.clearFilters()
  currentPage.value = 1
  loadCategoriasGastos()
}

const handleSort = (field: string) => {
  categoriaGastoStore.setSorting(field)
  loadCategoriasGastos()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadCategoriasGastos()
}

const handlePerPageChange = (perPage: number) => {
  itemsPerPage.value = perPage
  currentPage.value = 1 // Resetar para a primeira página ao mudar itens por página
  loadCategoriasGastos()
}

const navigateToCreateForm = () => {
  router.push({ 
    name: 'new-categoria-gasto', 
    params: { cliente_id: props.clienteId } 
  })
}

const openEditModal = (categoriaGasto: CategoriaGasto) => {
  router.push({ 
    name: 'edit-categoria-gasto', 
    params: { id: categoriaGasto.id } 
  })
}

const confirmDelete = (categoriaGasto: CategoriaGasto) => {
  categoriaGastoToDelete.value = categoriaGasto
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  categoriaGastoToDelete.value = null
}

const deleteCategoriaGasto = async () => {
  if (!categoriaGastoToDelete.value) return
  
  deleteSubmitting.value = true
  
  try {
    await categoriaGastoStore.deleteCategoriaGasto(categoriaGastoToDelete.value.id)
    
    notificationStore.addNotification(
      `Categoria "${categoriaGastoToDelete.value.nome}" excluída com sucesso!`,
      'success',
      5000
    )
    
    cancelDelete()
    loadCategoriasGastos()
  } catch (err) {
    console.error('Erro ao excluir categoria de gasto:', err)
    
    notificationStore.addNotification(
      'Ocorreu um erro ao excluir a categoria. Tente novamente.',
      'error',
      5000
    )
  } finally {
    deleteSubmitting.value = false
  }
}

const checkMobileView = () => {
  isMobile.value = window.innerWidth < 768
}

// Lifecycle hooks
onMounted(() => {
  loadCategoriasGastos()
  checkMobileView()
  
  window.addEventListener('resize', checkMobileView)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView)
})
</script>

<style scoped>
.categorias-gastos-crud {
  width: 100%;
  padding: 0.25rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
  color: $color-text-secondary;
}

.loading-spinner {
  border: 3px solid rgba($primary-color, 0.3);
  border-radius: 50%;
  border-top: 3px solid $primary-color;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: $spacing-md;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;
}

.error-message {
  color: $error-color;
  margin-bottom: $spacing-md;
}

.retry-button {
  padding: $spacing-sm $spacing-md;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: background-color $transition-speed;
}

.retry-button:hover {
  background-color: $primary-color-dark;
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

.add-button svg {
  width: 1rem;
  height: 1rem;
}

.add-button-small svg {
  width: 1rem;
  height: 1rem;
}

.table-header {
  margin-bottom: $spacing-md;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0;
  color: $color-text-secondary;
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

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($background-light, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: $bg-gray-light;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.modal-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: $color-text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: background-color $transition-speed;
}

.close-button:hover {
  background-color: $background-light;
  color: $text-gray-dark;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: $spacing-lg;
}

.categoria-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: $text-gray-dark;
  margin-bottom: $spacing-xs;
}

.form-input, .form-textarea {
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  font-size: $font-size-base;
  transition: border-color $transition-speed;
}

.form-input:focus, .form-textarea:focus {
  border-color: $primary-color;
  outline: none;
}

.input-error {
  border-color: $error-color;
}

.error-text {
  color: $error-color;
  font-size: $font-size-sm;
  margin-top: $spacing-xs;
}

.color-input-container {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.form-color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $background-light;
  transition: $transition-speed;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: $bg-gray-light;
  transition: $transition-speed;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: $success-color;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  font-size: $font-size-base;
  color: $text-gray-dark;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-md;
}

.cancel-button {
  padding: $spacing-sm $spacing-lg;
  background-color: $background-light;
  color: $text-gray-dark;
  border: none;
  border-radius: $border-radius;
  font-size: $font-size-base;
  cursor: pointer;
  transition: background-color $transition-speed;
}

.cancel-button:hover {
  background-color: darken($background-light, 5%);
}

.save-button {
  padding: $spacing-sm $spacing-lg;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius;
  font-size: $font-size-base;
  cursor: pointer;
  transition: background-color $transition-speed;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.save-button:hover {
  background-color: $primary-color-dark;
}

.save-button:disabled {
  background-color: $background-light;
  color: $color-text-secondary;
  cursor: not-allowed;
}

.loading-spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

/* Confirm Modal Styles */
.confirm-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($background-light, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirm-modal {
  background-color: $bg-gray-light;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  width: 90%;
  max-width: 400px;
}

.confirm-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1px solid $border-color;
}

.confirm-modal-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  margin: 0;
}

.confirm-modal-body {
  padding: $spacing-lg;
}

.confirm-message {
  margin-bottom: $spacing-sm;
  color: $text-gray-dark;
}

.confirm-warning {
  color: $error-color;
  font-weight: 500;
}

.confirm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid $border-color;
}

.delete-button {
  padding: $spacing-sm $spacing-lg;
  background-color: $error-color;
  color: white;
  border: none;
  border-radius: $border-radius;
  font-size: $font-size-base;
  cursor: pointer;
  transition: background-color $transition-speed;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.delete-button:hover {
  background-color: $color-danger-dark;
}

.delete-button:disabled {
  background-color: $background-light;
  color: $color-text-secondary;
  cursor: not-allowed;
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
  
  .add-button-small {
    width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button, .save-button, .delete-button {
    width: 100%;
  }
}
</style>
