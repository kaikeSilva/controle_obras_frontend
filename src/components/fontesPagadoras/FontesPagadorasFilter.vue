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
          :class="{ 'active': showAdvancedFilters }"
          :title="showAdvancedFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'"
        >
          <IconFilter :size="16" />
          <span class="filter-button-text">Filtros</span>
        </button>
      </div>
    </div>
    
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <div class="filter-row">
        <div class="filter-group">
          <label for="filter-nome">Nome</label>
          <input 
            id="filter-nome" 
            type="text" 
            v-model="filterState.nome" 
            placeholder="Nome da fonte pagadora" 
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label for="filter-descricao">Descrição</label>
          <input 
            id="filter-descricao" 
            type="text" 
            v-model="filterState.descricao" 
            placeholder="Descrição da fonte pagadora" 
            class="filter-input"
          />
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-group">
          <label for="filter-status">Status</label>
          <select 
            id="filter-status" 
            v-model="filterState.ativo" 
            class="filter-input"
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="filter-data-cadastro">Data de cadastro</label>
          <input 
            id="filter-data-cadastro" 
            type="date" 
            v-model="filterState.data_cadastro" 
            class="filter-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import IconFilter from '@/components/icons/IconFilter.vue'

interface FilterState {
  busca: string;
  nome: string;
  descricao: string;
  ativo: string;
  data_cadastro: string;
}

const emit = defineEmits<{
  (e: 'filter', filters: Record<string, string>): void;
  (e: 'clear'): void;
}>()

const showAdvancedFilters = ref(false)

const filterState = reactive<FilterState>({
  busca: '',
  nome: '',
  descricao: '',
  ativo: '',
  data_cadastro: ''
})

const hasActiveFilters = computed(() => {
  return Object.values(filterState).some(value => value !== '')
})

const applyFilters = () => {
  // Criar objeto de filtros apenas com valores não vazios
  const filters: Record<string, string> = {}
  
  Object.entries(filterState).forEach(([key, value]) => {
    if (value !== '') {
      filters[key] = value
    }
  })
  
  emit('filter', filters)
}

const clearFilters = () => {
  // Limpar todos os filtros
  Object.keys(filterState).forEach(key => {
    filterState[key as keyof FilterState] = ''
  })
  
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

.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  color: #1f2937; /* Texto mais escuro */
}

.filter-input:focus {
  border-color: var(--color-primary);
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
  background-color: var(--color-gray-200);
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

.filter-button-advanced:hover,
.filter-button-advanced.active {
  background-color: var(--color-gray-200);
}

.filter-button-text {
  display: none;
}

.advanced-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
}

@media (min-width: 768px) {
  .filter-button-text {
    display: inline;
  }
  
  .filter-row {
    flex-direction: row;
  }
}

@media (max-width: 767px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .filter-left {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .filter-actions {
    justify-content: space-between;
  }
  
  .filter-right {
    justify-content: flex-end;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
