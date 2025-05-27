<template>
  <div class="gastos-crud">
    <div v-if="loading && !gastos.length" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando gastos...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button class="retry-button" @click="loadGastos">Tentar novamente</button>
    </div>
    <div v-else class="crud-container">
      <div class="filter-and-actions">
        <GastosFilter 
          v-model="filters"
          @filter="handleFilter"
          @clear="clearFilters"
          @add-gasto="openAddPage"
        />
        <button class="add-button" @click="openAddPage">
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
          :from="pagination.from || 0"
          :to="pagination.to || 0"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
      
      <div v-if="!loading && !gastos.length" class="empty-state">
        <p>Nenhum gasto encontrado.</p>
        <button class="add-button-small" @click="openAddPage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          <span>Adicionar gasto</span>
        </button>
      </div>
      <div v-else>
        <!-- Desktop Table -->
        <GastosTable
          v-if="!isMobile"
          :gastos="gastos"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
          @edit="openEditPage"
          @delete="confirmDelete"
          @sort="handleSort"
          @view="viewGasto"
        />
        <!-- Mobile Cards -->
        <GastosCards
          v-else
          :gastos="gastos"
          @edit="openEditPage"
          @delete="confirmDelete"
          @view="viewGasto"
        />
      </div>
      <!-- Modal de confirmação de exclusão -->
      <div v-if="showDeleteModal" class="confirm-modal-overlay">
        <div class="confirm-modal">
          <p>Tem certeza que deseja excluir este gasto?</p>
          <div class="confirm-modal-footer">
            <button @click="cancelDelete">Cancelar</button>
            <button class="delete-confirm" @click="deleteGasto">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGastosStore } from '@/stores/gastosStore'
import Pagination from '@/components/common/Pagination.vue'
import GastosFilter from './GastosFilter.vue'
import GastosTable from './GastosTable.vue'
import GastosCards from './GastosCards.vue'
import type { Gasto, GastoFilter } from '@/types/gasto.types'

// Props
const props = defineProps<{
  obraId?: number
}>()

const router = useRouter()
const gastosStore = useGastosStore()

// Refs
const currentPage = ref(1)
const itemsPerPage = ref(15)
const filters = ref<GastoFilter>({})
const isMobile = ref(window.innerWidth < 768)

// Se obraId for fornecido, adiciona ao filtro inicial
if (props.obraId) {
  filters.value.obra_id = props.obraId
}

// Computed
const gastos = computed(() => gastosStore.gastosList)
const loading = computed(() => gastosStore.isLoading)
const error = computed(() => gastosStore.getError)
const pagination = computed(() => gastosStore.getPagination)
const sortBy = computed(() => gastosStore.getSort)
const sortDirection = computed(() => gastosStore.getDirection)

function checkMobileView() {
  isMobile.value = window.innerWidth < 768;
}
onMounted(() => {
  // Garantir que o filtro de obra_id seja aplicado ao carregar os gastos
  if (props.obraId) {
    gastosStore.setFilters({ obra_id: props.obraId });
  }
  loadGastos();
  window.addEventListener('resize', checkMobileView);
});
onUnmounted(() => {
  window.removeEventListener('resize', checkMobileView);
});

async function loadGastos(page = 1) {
  currentPage.value = page
  
  // Garantir que o filtro de obra_id esteja sempre presente se props.obraId existir
  const requestFilters = { ...filters.value }
  if (props.obraId && !requestFilters.obra_id) {
    requestFilters.obra_id = props.obraId
  }
  
  await gastosStore.fetchGastos({
    page,
    perPage: itemsPerPage.value,
    ...requestFilters
  })
}

function handleFilter(newFilters: GastoFilter) {
  filters.value = { ...newFilters }
  currentPage.value = 1 // Resetar para a primeira página ao filtrar
  loadGastos(currentPage.value)
}

function clearFilters() {
  // Ao limpar filtros, mantém apenas o filtro de obra_id se props.obraId existir
  if (props.obraId) {
    filters.value = { obra_id: props.obraId }
    currentPage.value = 1
    gastosStore.setFilters({ obra_id: props.obraId })
  } else {
    filters.value = {}
    currentPage.value = 1
    gastosStore.setFilters({})
  }
  loadGastos(currentPage.value)
}

function handleSort(field: string) {
  const newDirection = sortBy.value === field && sortDirection.value === 'asc' ? 'desc' : 'asc'
  gastosStore.setSort(field, newDirection)
  currentPage.value = 1
  loadGastos(currentPage.value)
}

function handlePageChange(page: number) {
  loadGastos(page)
}

function handlePerPageChange(perPage: number) {
  itemsPerPage.value = perPage
  currentPage.value = 1 // Resetar para a primeira página ao mudar itens por página
  loadGastos(currentPage.value)
}
// CRUD actions
function openAddPage() {
  if (props.obraId) {
    // A rota correta é 'new-gasto' e não 'create-gasto'
    // Além disso, a rota espera o obra_id como parâmetro, não como query
    router.push({ name: 'new-gasto', params: { obra_id: props.obraId.toString() } })
  } else {
    router.push({ name: 'new-gasto' })
  }
}
function openEditPage(gasto: Gasto) {
  router.push({ name: 'edit-gasto', params: { id: gasto.id } });
}
function viewGasto(gasto: Gasto) {
  router.push({ name: 'gasto-detail', params: { id: gasto.id } });
}
// Delete modal logic
const showDeleteModal = ref(false)
const gastoToDelete = ref<Gasto | null>(null)
function confirmDelete(gasto: Gasto) {
  gastoToDelete.value = gasto;
  showDeleteModal.value = true;
}
function cancelDelete() {
  showDeleteModal.value = false;
  gastoToDelete.value = null;
}
async function deleteGasto() {
  if (!gastoToDelete.value) return;
  try {
    await gastosStore.deleteGasto(gastoToDelete.value.id);
    showDeleteModal.value = false;
    gastoToDelete.value = null;
    loadGastos();
  } catch (e) {
    // erro já tratado na store
  }
}
</script>

<style scoped>
.gastos-crud {
  width: 100%;
  padding: 0.25rem 0;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.loading-spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-container {
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
}
.retry-button {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  cursor: pointer;
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
  background-color: #22c55e;
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
  background-color: #16a34a;
  transform: translateY(-1px);
}

.add-button:active {
  transform: translateY(0);
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

.add-button svg,
.add-button-small svg {
  width: 1rem;
  height: 1rem;
}
.table-header {
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
.empty-state {
  padding: 3rem 0;
  text-align: center;
  color: #6b7280;
}
.confirm-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-modal {
  background: #fff;
  border-radius: 8px;
  padding: 2rem 2.5rem;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  min-width: 300px;
  max-width: 90vw;
}
.confirm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem 0 1.5rem;
}
.delete-confirm {
  background: #f87171;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
}
.pagination-desktop {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  
  .table-header {
    justify-content: center;
  }
}
</style>
