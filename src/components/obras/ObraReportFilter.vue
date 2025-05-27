<template>
  <div class="filters-section">
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
            @change="handleFilterChange"
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
            <path fill="currentColor" d="M9,10H7V12H9V10M13,10H11V12H13V10M17,10H15V12H17V10M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
          </svg>
          Período
        </label>
        <div class="filter-control date-range">
          <div class="date-input">
            <label>De</label>
            <input 
              type="date" 
              v-model="filters.dataInicio" 
              @change="handleFilterChange"
            />
          </div>
          <div class="date-input">
            <label>Até</label>
            <input 
              type="date" 
              v-model="filters.dataFim" 
              @change="handleFilterChange"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Filters -->
    <div class="active-filters" v-if="hasActiveFilters">
      <div class="active-filters-title">Filtros ativos:</div>
      <div class="active-filters-list">
        <div class="active-filter" v-if="selectedCategorias.length > 0">
          <span class="filter-name">Categorias:</span>
          <span class="filter-value">{{ selectedCategorias.length }} selecionadas</span>
          <button class="remove-filter" @click="removeFilter('categoria')">×</button>
        </div>
        <div class="active-filter" v-if="showDateFilter">
          <span class="filter-name">Período:</span>
          <span class="filter-value">{{ formatDate(filters.dataInicio) }} - {{ formatDate(filters.dataFim) }}</span>
          <button class="remove-filter" @click="resetDateFilter">×</button>
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
import { useRoute } from 'vue-router'

// Stores
const dashboardStore = useDashboardStore()
const route = useRoute()
onMounted(() => {
  initializeDates()
  handleFilterChange()
})

// Estado dos filtros
const filters = ref<DashboardFiltros>({
  dataInicio: '',
  dataFim: '',
  obras: [],
  categorias_gasto: []
})

// Inicializar com datas do mês atual
const initializeDates = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  filters.value.dataInicio = firstDay.toISOString().split('T')[0]
  filters.value.dataFim = lastDay.toISOString().split('T')[0]
}

// Obter o ID da obra da rota
const obraId = computed(() => {
  return route.params.id ? Number(route.params.id) : null
})

// Estado para categorias selecionadas
const selectedCategorias = ref<DashboardCategoriaGasto[]>([])

// Opções para o multiselect
const categoriasOptions = computed(() => {
  if (!dashboardStore.filtrosDisponiveis || !dashboardStore.filtrosDisponiveis.categorias_gasto) {
    return []
  }
  return dashboardStore.filtrosDisponiveis.categorias_gasto
})

// Verificar se há filtros ativos
const hasActiveFilters = computed(() => {
  return selectedCategorias.value.length > 0 || showDateFilter.value
})

// Sempre mostrar o filtro de datas
const showDateFilter = computed(() => {
  return true
})

// Métodos
function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function handleFilterChange() {
  // Atualizar filtros no store do dashboard
  const dashboardFiltros: DashboardFiltros = {
    dataInicio: filters.value.dataInicio,
    dataFim: filters.value.dataFim,
    obras: obraId.value ? [obraId.value] : [],
    categorias_gasto: selectedCategorias.value.map(cat => parseInt(String(cat.id)))
  }
  
  dashboardStore.updateFiltros(dashboardFiltros)
  dashboardStore.fetchDashboardData()
}

function removeFilter(type: string) {
  if (type === 'categoria') {
    selectedCategorias.value = []
    handleFilterChange()
  }
}

function resetDateFilter() {
  initializeDates()
  handleFilterChange()
}

// Observar mudanças nos filtros do dashboard store
watch(() => dashboardStore.filtros, (newFiltros) => {
  // Atualizar filtros locais quando os filtros do store mudarem
  if (newFiltros) {
    filters.value.dataInicio = newFiltros.dataInicio
    filters.value.dataFim = newFiltros.dataFim
    
    // Atualizar categorias selecionadas
    if (newFiltros.categorias_gasto && newFiltros.categorias_gasto.length > 0) {
      const categoriaIds = new Set(newFiltros.categorias_gasto)
      selectedCategorias.value = categoriasOptions.value.filter(cat => 
        categoriaIds.has(parseInt(String(cat.id)))
      )
    } else {
      selectedCategorias.value = []
    }
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.filters-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  
  @include dark-mode {
    background-color: #1e1e1e;
    border-color: #333;
  }
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  
  @include dark-mode {
    color: #d1d5db;
  }
  
  .icon {
    color: #6b7280;
    
    @include dark-mode {
      color: #9ca3af;
    }
  }
}

.filter-control {
  width: 100%;
}

.date-range {
  display: flex;
  gap: 12px;
  
  .date-input {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    label {
      font-size: 12px;
      color: #6b7280;
      
      @include dark-mode {
        color: #9ca3af;
      }
    }
    
    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: #ffffff;
      
      @include dark-mode {
        background-color: #1e1e1e;
        border-color: #4b5563;
        color: #e5e7eb;
      }
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }
  }
}

/* Active Filters */
.active-filters {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  
  @include dark-mode {
    background-color: #111827;
  }
}

.active-filters-title {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  
  @include dark-mode {
    color: #d1d5db;
  }
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #e5e7eb;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  
  @include dark-mode {
    background-color: #374151;
  }
  
  .filter-name {
    font-weight: 500;
    color: #4b5563;
    
    @include dark-mode {
      color: #d1d5db;
    }
  }
  
  .filter-value {
    color: #1f2937;
    
    @include dark-mode {
      color: #f3f4f6;
    }
  }
  
  .remove-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #9ca3af;
    color: #ffffff;
    font-size: 14px;
    line-height: 1;
    border: none;
    cursor: pointer;
    
    &:hover {
      background-color: #6b7280;
    }
    
    @include dark-mode {
      background-color: #6b7280;
      
      &:hover {
        background-color: #9ca3af;
      }
    }
  }
}
</style>
