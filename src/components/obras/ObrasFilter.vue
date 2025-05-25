<template>
  <div class="filter-container">
    <div class="filter-form">
      <div class="filter-left">
        <div class="filter-group">
          <input 
            type="text" 
            v-model="filterState.search" 
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
            <option value="em_andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
            <option value="pausada">Pausada</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Status ativo</label>
          <select v-model="filterState.ativo" class="filter-select">
            <option value="">Todos</option>
            <option :value="true">Ativo</option>
            <option :value="false">Inativo</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data de início</label>
          <input 
            type="date" 
            v-model="filterState.data_inicio" 
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Prazo estimado</label>
          <input 
            type="date" 
            v-model="filterState.prazo_estimado" 
            class="filter-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface FilterState {
  search: string
  status: string
  ativo: boolean | string
  data_inicio: string
  prazo_estimado: string
}

const emit = defineEmits<{
  (e: 'filter', filters: Record<string, string>): void
  (e: 'clear'): void
}>()

const showAdvancedFilters = ref(false)

const filterState = reactive<FilterState>({
  search: '',
  status: '',
  ativo: '',
  data_inicio: '',
  prazo_estimado: ''
})

const hasActiveFilters = computed(() => {
  return filterState.search !== '' || 
         filterState.status !== '' || 
         filterState.ativo !== '' || 
         filterState.data_inicio !== '' || 
         filterState.prazo_estimado !== ''
})

const applyFilters = () => {
  const filters: Record<string, string> = {}
  
  if (filterState.search) filters.search = filterState.search
  if (filterState.status) filters.status = filterState.status
  if (filterState.ativo !== '') filters.ativo = String(filterState.ativo)
  if (filterState.data_inicio) filters.data_inicio = filterState.data_inicio
  if (filterState.prazo_estimado) filters.prazo_estimado = filterState.prazo_estimado
  
  emit('filter', filters)
}

const clearFilters = () => {
  filterState.search = ''
  filterState.status = ''
  filterState.ativo = ''
  filterState.data_inicio = ''
  filterState.prazo_estimado = ''
  
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
    align-items: flex-start;
  }
  
  .filter-left {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .filter-right {
    width: 100%;
  }
  
  .filter-button-advanced {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
}
</style>
