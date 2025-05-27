<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">
          <svg class="icon" style="width: 20px; height: 20px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M17,17H7V7H17V17M15,15H9V9H15V15Z" />
          </svg>
          Relatório da Obra
        </div>
        <button class="close-button" @click="closeModal">
          <svg class="icon" style="width: 20px; height: 20px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">
              <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
              </svg>
              Categorias de Gasto
            </label>
            <div class="filter-control">
              <Multiselect
                v-model="selectedCategorias"
                :options="categoriasOptions"
                :searchable="true"
                :multiple="true"
                placeholder="Selecione as categorias"
                mode="tags"
                valueProp="id"
                label="nome"
              >
                <template #noOptions>
                  Nenhuma categoria disponível
                </template>
                <template #noResults>
                  Nenhuma categoria encontrada
                </template>
              </Multiselect>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">
              <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                <path fill="currentColor" d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z"/>
              </svg>
              Período
            </label>
            <div class="date-range-group">
              <input type="date" class="filter-input" v-model="filters.dataInicio">
              <div class="date-separator">até</div>
              <input type="date" class="filter-input" v-model="filters.dataFim">
            </div>
          </div>
        </div>

        <div class="active-filters" v-if="hasActiveFilters">
          <div class="active-filters-title">Filtros Ativos</div>
          <div class="filters-tags">
            <div v-if="selectedCategorias && selectedCategorias.length > 0" class="filter-tag">
              Categorias: {{ selectedCategorias.length }} selecionada(s)
              <span class="filter-tag-remove" @click="removeFilter('categoria')">×</span>
            </div>
            <div v-if="isDateRangeActive" class="filter-tag">
              Período: {{ formatDate(filters.dataInicio) }} até {{ formatDate(filters.dataFim) }}
              <span class="filter-tag-remove" @click="removeFilter('date')">×</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="clearFilters">Limpar</button>
        <button class="btn-primary" @click="generateReport">Gerar Relatório</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { dashboardService } from '@/services/dashboardService'
import type { DashboardFiltros, DashboardCategoriaGasto } from '@/types/dashboard.types'
import Multiselect from '@vueform/multiselect'

// Props
const props = defineProps<{
  isOpen: boolean
  obraId: number | null
}>()

// Emits
const emit = defineEmits(['close'])

// Estado dos filtros
const filtrosDisponiveis = ref<{
  categorias_gasto: DashboardCategoriaGasto[]
}>({
  categorias_gasto: []
})

// Inicializar com datas do mês atual
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

// Opções para o multiselect
const categoriasOptions = computed(() => {
  return filtrosDisponiveis.value.categorias_gasto.map(categoria => ({
    id: categoria.id.toString(),
    nome: categoria.nome
  }))
})

// Categorias selecionadas
const selectedCategorias = ref<Array<{id: string, nome: string}>>([]) 

const filters = ref<{
  dataInicio: string
  dataFim: string
}>({
  dataInicio: firstDay.toISOString().split('T')[0],
  dataFim: lastDay.toISOString().split('T')[0]
})

// Computados
const hasActiveFilters = computed(() => {
  return (selectedCategorias.value && selectedCategorias.value.length > 0) || isDateRangeActive.value
})

const isDateRangeActive = computed(() => {
  return true // Sempre mostra as datas como filtro ativo
})

// Métodos
function closeModal() {
  emit('close')
}

function clearFilters() {
  selectedCategorias.value = []
  filters.value = {
    dataInicio: firstDay.toISOString().split('T')[0],
    dataFim: lastDay.toISOString().split('T')[0]
  }
}

function removeFilter(type: string) {
  if (type === 'categoria') {
    selectedCategorias.value = []
  } else if (type === 'date') {
    filters.value.dataInicio = firstDay.toISOString().split('T')[0]
    filters.value.dataFim = lastDay.toISOString().split('T')[0]
  }
}



function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

async function generateReport() {
  if (!props.obraId) return

  // Preparar os filtros para a API
  const dashboardFiltros: DashboardFiltros = {
    dataInicio: filters.value.dataInicio,
    dataFim: filters.value.dataFim,
    obras: [props.obraId],
    categorias_gasto: selectedCategorias.value.map(cat => parseInt(cat.id))
  }

  try {
    // Chamar a API do dashboard com os filtros
    const dashboardData = await dashboardService.getDashboardData(dashboardFiltros)
    
    // Log dos dados filtrados (conforme solicitado)
    console.log('Dados do relatório para a obra:', props.obraId)
    console.log('Filtros aplicados:', dashboardFiltros)
    console.log('Dados obtidos:', dashboardData)
    
    // Fechar o modal após gerar o relatório
    closeModal()
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
  }
}

// Carregar categorias disponíveis ao montar o componente
onMounted(async () => {
  try {
    // Buscar apenas as categorias disponíveis
    const tempFiltros: DashboardFiltros = {
      dataInicio: filters.value.dataInicio,
      dataFim: filters.value.dataFim,
      obras: props.obraId ? [props.obraId] : [],
      categorias_gasto: []
    }
    
    const data = await dashboardService.getDashboardData(tempFiltros)
    if (data && data.filtros_disponiveis) {
      filtrosDisponiveis.value = {
        categorias_gasto: data.filtros_disponiveis.categorias_gasto || []
      }
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
  }
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

/* Filters Grid */
.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-control {
  width: 100%;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #0f172a;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.filter-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  color: #0f172a;
}

.date-range-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-separator {
  color: #64748b;
  font-size: 14px;
}

/* Active Filters */
.active-filters {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.active-filters-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
}

.filter-tag-remove {
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.filter-tag-remove:hover {
  color: #0c4a6e;
}

.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>

<style src="@vueform/multiselect/themes/default.css"></style>

<style lang="scss">
/* Multiselect Custom Styling */
.multiselect {
  --ms-font-size: 14px;
  --ms-border-width: 1px;
  --ms-border-color: #cbd5e1;
  --ms-border-color-active: #3b82f6;
  --ms-border-radius: 6px;
  --ms-bg: #ffffff;
  --ms-tag-bg: #e0f2fe;
  --ms-tag-color: #0369a1;
  --ms-tag-font-weight: 500;
  --ms-tag-radius: 16px;
  --ms-tag-font-size: 12px;
  --ms-option-bg-selected: #e0f2fe;
  --ms-option-color-selected: #0369a1;
  --ms-option-bg-selected-pointed: #bfdbfe;
  --ms-option-color-selected-pointed: #1e40af;
  --ms-option-bg-pointed: #f1f5f9;
  --ms-option-color-pointed: #334155;
  --ms-option-font-size: 14px;
  --ms-option-padding: 8px 12px;
}
</style>
