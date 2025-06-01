<template>
  <div class="filters-section">
    <div class="filters-header">
      <div class="filters-title">
        <svg class="icon" style="width: 20px; height: 20px;" viewBox="0 0 24 24">
          <path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
        </svg>
        Filtros
      </div>
      <div class="filters-actions">
        <button class="btn-secondary" @click="clearFilters">Limpar</button>
        <button class="btn-primary" @click="applyFilters">Aplicar</button>
      </div>
    </div>

    <div class="filters-grid">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">
            <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
            </svg>
            Categorias de Gasto
          </label>
          <div class="filter-control">
            <Multiselect
              v-model="filters.categorias_gasto"
              :options="categoriasOptions"
              :searchable="true"
              :multiple="true"
              mode="tags"
              placeholder="Selecione as categorias"
              class="filter-select"
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
      </div>
      
      <div class="filters-row period-row">
        <div class="filter-group period-group">
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
    </div>

    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">Filtros Ativos</div>
      <div class="filters-tags">
        <div v-if="filters.categorias_gasto.length > 0" class="filter-tag">
          Categorias: {{ filters.categorias_gasto.length }} selecionadas
          <span class="filter-tag-remove" @click="removeFilter('categoria')">×</span>
        </div>
        <div v-if="showDateFilter" class="filter-tag">
          Período: {{ formatDate(filters.dataInicio) }} até {{ formatDate(filters.dataFim) }}
          <span class="filter-tag-remove" @click="resetDateFilter">×</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { DashboardFiltros, DashboardCategoriaGasto } from '@/types/dashboard.types'
import type { Obra } from '@/types/obra.types'
import { categoriasGastosService } from '@/services/categoriasGastosService'
// Define props
const props = defineProps<{
  obra?: Obra | null
}>()
const startOfMonth = new Date()
startOfMonth.setDate(1)
const endOfMonth = new Date()
endOfMonth.setMonth(endOfMonth.getMonth() + 1)
endOfMonth.setDate(0)
const categoriasOptions = ref<DashboardCategoriaGasto[]>([])
// Emitir eventos para o componente pai
const emit = defineEmits(['filter-applied'])

// Stores
const dashboardStore = useDashboardStore()

// Estado dos filtros
const filters = ref({
  obras: [],
  categorias_gasto: [],
  dataInicio: startOfMonth.toISOString().split('T')[0],
  dataFim: endOfMonth.toISOString().split('T')[0]
})

function onObraChange() {
  filters.value.obras = props.obra ? [props.obra.id] : []
  applyFilters()
}

function getCategoriasGasto() {
  categoriasGastosService.getCategoriasGastosAutocomplete().then((response) => {
    categoriasOptions.value = response.data
  })
}

watch(() => props.obra, () => {
  onObraChange()
}, { immediate: true })

function clearFilters() {
  filters.value = {
    obras: props.obra ? [props.obra.id] : [],
    categorias_gasto: [],
    dataInicio: startOfMonth.toISOString().split('T')[0],
    dataFim: endOfMonth.toISOString().split('T')[0]
  }
  applyFilters()
}

function applyFilters() {
  dashboardStore.updateFiltros(filters.value)
  dashboardStore.fetchDashboardData()
  emit('filter-applied', filters.value)
}

onMounted(() => {
  getCategoriasGasto()
})
</script>

<style scoped lang="scss">
/* Multiselect Custom Styling */
:deep(.multiselect) {
  --ms-tag-bg: #ebf4ff;
  --ms-tag-color: #4338ca; /* Darker indigo */
  --ms-tag-radius: 0.25rem;
  --ms-option-bg-selected: #ebf4ff;
  --ms-option-color-selected: #312e81; /* Darker indigo */
  --ms-ring-width: 0;
  --ms-border-color: #e2e8f0;
  --ms-border-width: 1px;
  --ms-radius: 0.375rem;
  --ms-py: 0.25rem;
  --ms-px: 0.5rem;
  --ms-bg: #ffffff;
  --ms-font: inherit;
  --ms-placeholder-color: #718096;
  --ms-font-size: 0.875rem;
  --ms-option-font-size: 0.875rem;
  --ms-option-bg-pointed: #f7fafc;
  --ms-option-color-pointed: #1e293b; /* Darker slate */
  --ms-option-bg-selected-pointed: #ebf4ff;
  --ms-option-color-selected-pointed: #312e81; /* Darker indigo */
  --ms-option-bg-disabled: #f7fafc;
  --ms-option-color-disabled: #a0aec0;
  --ms-bg-disabled: #f7fafc;
  --ms-color-disabled: #a0aec0;
  padding: 0 !important;
  
  .multiselect-search {
    padding: 0.25rem 0;
    margin: 0;
    color: #4a5568;
    background-color: #fff;
  }
  
  .multiselect-dropdown {
    padding: 0.25rem 0;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: #fff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .multiselect-option {
    padding: 0.5rem 0.75rem;
    color: #4a5568;
  }
  
  .multiselect-single-label {
    color: #1a202c;
    font-weight: 500;
  }
  
  .multiselect-tags-search {
    color: #1a202c;
  }
}

:deep(.multiselect-tags) {
  margin: 0;
  padding: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

:deep(.multiselect-tag) {
  background-color: #3b82f6;
  color: white;
  margin: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.multiselect-tag-icon) {
  margin-left: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  padding: 0.125rem;
}

:deep(.multiselect-tag-icon:after) {
  content: '×';
  font-size: 0.875rem;
  font-weight: bold;
}

:deep(.multiselect-tag-icon:hover) {
  background-color: rgba(255, 255, 255, 0.3);
}

.filters-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filters-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  color: #475569;
}

.btn-primary {
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  background: #3b82f6;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.period-row {
  grid-template-columns: 1fr;
}

.period-group {
  max-width: 100%;
}

.date-range-group {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.filter-input {
  flex: 1;
  min-width: 140px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input:focus {
  border-color: #3b82f6;
}

.date-separator {
  padding: 0 8px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.active-filters-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
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
  padding: 4px 10px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 12px;
  border-radius: 16px;
}

.filter-tag {
  @include dark-mode {
    background: #1e3a8a;
    color: #bfdbfe;
  }
}

.filter-tag-remove {
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    
    @include dark-mode {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

/* Dark mode styles */
.filters-section {
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
  }
}

.filters-title {
  @include dark-mode {
    color: #f1f1f1;
  }
}

.btn-secondary {
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
    color: #94a3b8;
    
    &:hover {
      border-color: #444;
      color: #cbd5e1;
    }
  }
}

.filter-label {
  @include dark-mode {
    color: #94a3b8;
  }
}

.filter-input {
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
    color: #e2e8f0;
  }
}

.date-separator {
  @include dark-mode {
    color: #94a3b8;
  }
}

.active-filters {
  @include dark-mode {
    border-top-color: #333;
  }
}

.active-filters-title {
  @include dark-mode {
    color: #94a3b8;
  }
}
</style>
