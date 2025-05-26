<template>
  <div class="filter-container">
    <div class="filter-form">
      <div class="filter-left">
        <div class="filter-group">
          <input 
            type="text" 
            v-model="filterState.busca" 
            placeholder="Buscar..." 
            class="filter-input"
            @keyup.enter="applyFilters"
          />
        </div>
        
        <div class="filter-actions">
          <button 
            class="filter-button filter-button-clear" 
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            Limpar
          </button>
          <button 
            class="filter-button filter-button-apply" 
            @click="applyFilters"
          >
            Buscar
          </button>
        </div>
      </div>
      
      <div class="filter-right">
        <button 
          class="filter-button filter-button-advanced" 
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          {{ showAdvancedFilters ? 'Ocultar filtros' : 'Filtros avançados' }}
          <span class="filter-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" :class="{ 'rotate-180': showAdvancedFilters }">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
    
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="filterState.status" class="filter-select">
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface FilterState {
  busca: string;
  status: boolean | string;
}

const emit = defineEmits<{
  (e: 'filter', filters: Record<string, any>): void;
  (e: 'clear'): void;
  (e: 'add-categoria-gasto'): void;
}>()

// Estado do filtro
const filterState = reactive<FilterState>({
  busca: '',
  status: ''
})

// Estado do componente
const showAdvancedFilters = ref(false)

// Computed
const hasActiveFilters = computed(() => {
  return filterState.busca !== '' || 
         filterState.status !== ''
})

// Métodos
const applyFilters = () => {
  const filters: Record<string, any> = {}
  
  if (filterState.busca) filters.busca = filterState.busca
  if (filterState.status !== '') filters.status = filterState.status
  
  emit('filter', filters)
}

const clearFilters = () => {
  filterState.busca = ''
  filterState.status = ''
  
  emit('clear')
}
</script>

<style scoped>
.filter-container {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  flex: 1;
}

.filter-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  width: 100%;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #4b5563; /* Cinza mais escuro para melhor contraste */
}

.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  color: #1f2937; /* Texto mais escuro */
}

.filter-input:focus,
.filter-select:focus {
  border-color: #4f46e5;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-button-clear {
  background-color: #f3f4f6;
  color: #4b5563; /* Cinza mais escuro */
}

.filter-button-clear:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.filter-button-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button-apply {
  background-color: #4f46e5; /* Indigo 600 - cor mais forte */
  color: white;
  font-weight: 600;
}

.filter-button-apply:hover {
  background-color: #4338ca; /* Indigo 700 - cor mais escura no hover */
}

.filter-right {
  display: flex;
  gap: 0.5rem;
}

.filter-button-advanced {
  background-color: #f3f4f6;
  color: #4b5563; /* Cinza mais escuro */
}

.filter-button-advanced:hover {
  background-color: #e5e7eb;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
  display: inline-flex;
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

.advanced-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

@media (max-width: 767px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left, .filter-right {
    width: 100%;
  }
  
  .filter-actions {
    margin-top: $spacing-sm;
  }
  
  .filter-button-advanced {
    width: 100%;
    justify-content: center;
    margin-top: $spacing-sm;
  }
}
</style>
