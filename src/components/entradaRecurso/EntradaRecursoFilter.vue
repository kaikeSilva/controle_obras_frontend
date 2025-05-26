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
          class="filter-button filter-button-add"
          @click="$emit('add-entrada-recurso')"
        >
          Nova Entrada
        </button>
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
          <label class="filter-label">Obra</label>
          <Multiselect
            v-model="selectedObra"
            :options="obrasOptions"
            :searchable="true"
            placeholder="Selecione uma obra"
            @search="searchObras"
            @change="handleObraChange"
            valueProp="id"
            label="nome"
          >
            <template #noOptions>
              Digite para buscar obras
            </template>
            <template #noResults>
              Nenhuma obra encontrada
            </template>
          </Multiselect>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Fonte Pagadora</label>
          <Multiselect
            v-model="selectedFontePagadora"
            :options="fontesPagadorasOptions"
            :searchable="true"
            placeholder="Selecione uma fonte pagadora"
            @search="searchFontesPagadoras"
            @change="handleFontePagadoraChange"
            valueProp="id"
            label="nome"
          >
            <template #noOptions>
              Digite para buscar fontes pagadoras
            </template>
            <template #noResults>
              Nenhuma fonte pagadora encontrada
            </template>
          </Multiselect>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Tipo de Entrada</label>
          <select v-model="filterState.tipo_entrada" class="filter-select">
            <option value="">Todos</option>
            <option value="aporte_inicial">Aporte Inicial</option>
            <option value="aporte_adicional">Aporte Adicional</option>
            <option value="reembolso">Reembolso</option>
            <option value="regular">Regular</option>
          </select>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Data de Entrada</label>
          <input 
            type="date" 
            v-model="filterState.data_entrada" 
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data Inicial</label>
          <input 
            type="date" 
            v-model="filterState.data_inicio" 
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data Final</label>
          <input 
            type="date" 
            v-model="filterState.data_fim" 
            class="filter-input"
          />
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Valor Mínimo (R$)</label>
          <input 
            type="number" 
            v-model="filterState.valor_min" 
            class="filter-input"
            placeholder="0,00"
            min="0"
            step="0.01"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Valor Máximo (R$)</label>
          <input 
            type="number" 
            v-model="filterState.valor_max" 
            class="filter-input"
            placeholder="0,00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import Multiselect from '@vueform/multiselect'
import { obrasAutocompleteService, type ObraAutocomplete } from '@/services/obrasAutocompleteService'
import { fontesPagadorasAutocompleteService, type FontePagadoraAutocomplete } from '@/services/fontesPagadorasAutocompleteService'

interface FilterState {
  search: string
  obra_id?: number
  fonte_pagadora_id?: number
  tipo_entrada: string
  data_entrada: string
  data_inicio: string
  data_fim: string
  valor_min: string
  valor_max: string
}

const emit = defineEmits<{
  (e: 'filter', filters: Record<string, string>): void
  (e: 'clear'): void
  (e: 'add-entrada-recurso'): void
}>()

const showAdvancedFilters = ref(false)

// Variáveis para Multiselect de Obras
const obras = ref<ObraAutocomplete[]>([])
const obrasOptions = ref<{id: number, nome: string}[]>([])
const selectedObra = ref<number | null>(null)

// Variáveis para Multiselect de Fontes Pagadoras
const fontesPagadoras = ref<FontePagadoraAutocomplete[]>([])
const fontesPagadorasOptions = ref<{id: number, nome: string}[]>([])
const selectedFontePagadora = ref<number | null>(null)

const filterState = reactive<FilterState>({
  search: '',
  obra_id: undefined,
  fonte_pagadora_id: undefined,
  tipo_entrada: '',
  data_entrada: '',
  data_inicio: '',
  data_fim: '',
  valor_min: '',
  valor_max: ''
})

const hasActiveFilters = computed(() => {
  return filterState.search !== '' || 
         filterState.obra_id !== undefined ||
         filterState.fonte_pagadora_id !== undefined ||
         filterState.tipo_entrada !== '' || 
         filterState.data_entrada !== '' || 
         filterState.data_inicio !== '' || 
         filterState.data_fim !== '' ||
         filterState.valor_min !== '' ||
         filterState.valor_max !== ''
})

// Método para buscar obras para o autocomplete
async function searchObras(search: string = '') {
  try {
    const obrasData = await obrasAutocompleteService.getObrasAutocomplete()
    obras.value = obrasData
    obrasOptions.value = obrasData.map(obra => ({
      id: obra.id,
      nome: obra.nome
    }))
  } catch (error) {
    console.error('Erro ao buscar obras:', error)
  }
}

// Método para buscar fontes pagadoras para o autocomplete
async function searchFontesPagadoras(search: string = '') {
  try {
    const fontesPagadorasData = await fontesPagadorasAutocompleteService.getFontesPagadorasAutocomplete()
    fontesPagadoras.value = fontesPagadorasData
    fontesPagadorasOptions.value = fontesPagadorasData.map(fonte => ({
      id: fonte.id,
      nome: fonte.nome
    }))
  } catch (error) {
    console.error('Erro ao buscar fontes pagadoras:', error)
  }
}

// Método para lidar com a mudança de obra selecionada
function handleObraChange(obraId: number | null) {
  filterState.obra_id = obraId || undefined
}

// Método para lidar com a mudança de fonte pagadora selecionada
function handleFontePagadoraChange(fontePagadoraId: number | null) {
  filterState.fonte_pagadora_id = fontePagadoraId || undefined
}

const applyFilters = () => {
  const filters: Record<string, string> = {}
  
  if (filterState.search) filters.search = filterState.search
  if (filterState.obra_id !== undefined) filters.obra_id = filterState.obra_id.toString()
  if (filterState.fonte_pagadora_id !== undefined) filters.fonte_pagadora_id = filterState.fonte_pagadora_id.toString()
  if (filterState.tipo_entrada) filters.tipo_entrada = filterState.tipo_entrada
  if (filterState.data_entrada) filters.data_entrada = filterState.data_entrada
  if (filterState.data_inicio) filters.data_inicio = filterState.data_inicio
  if (filterState.data_fim) filters.data_fim = filterState.data_fim
  if (filterState.valor_min) filters.valor_min = filterState.valor_min
  if (filterState.valor_max) filters.valor_max = filterState.valor_max
  
  emit('filter', filters)
}

const clearFilters = () => {
  filterState.search = ''
  filterState.obra_id = undefined
  filterState.fonte_pagadora_id = undefined
  filterState.tipo_entrada = ''
  filterState.data_entrada = ''
  filterState.data_inicio = ''
  filterState.data_fim = ''
  filterState.valor_min = ''
  filterState.valor_max = ''
  
  // Reset dos valores selecionados nos componentes Multiselect
  selectedObra.value = null
  selectedFontePagadora.value = null
  
  emit('clear')
}

// Inicializar dados para os componentes Multiselect
onMounted(async () => {
  await Promise.all([searchObras(), searchFontesPagadoras()])
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
  --ms-py: 0.5rem;
  --ms-px: 0.75rem;
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

  &.is-invalid {
    --ms-border-color: #e53e3e;
  }

  .multiselect-search {
    padding: 0.25rem 0;
    margin: 0;
    color: #4a5568;
    background-color: #fff;
  }

  .multiselect-dropdown {
    padding: 0.5rem 0;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    background-color: #fff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .multiselect-option {
    padding: 0.5rem 1rem;
    color: #4a5568;
  }
  
  .multiselect-single-label {
    color: #1a202c; /* Very dark gray for better readability */
    font-weight: 500;
  }
  
  .multiselect-tags-search {
    color: #1a202c;
  }
}

.filter-container {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  padding: 1rem;
  margin-bottom: 1.5rem;
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

.filter-button-add {
  background-color: #10b981; /* Emerald 600 - verde */
  color: white;
  font-weight: 600;
  margin-right: 0.5rem;
}

.filter-button-add:hover {
  background-color: #059669; /* Emerald 700 - verde mais escuro no hover */
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
    display: flex;
    flex-direction: column;
  }
  
  .filter-button-advanced,
  .filter-button-add {
    width: 100%;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
}
</style>
