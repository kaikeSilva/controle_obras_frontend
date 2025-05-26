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
          <label class="filter-label">Obra</label>
          <Multiselect
            v-model="selectedObra"
            :options="obrasOptions"
            :searchable="true"
            placeholder="Selecione uma obra"
            class="filter-select"
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
          <label class="filter-label">Categoria</label>
          <Multiselect
            v-model="selectedCategoriaGasto"
            :options="categoriasGastosOptions"
            :searchable="true"
            placeholder="Selecione uma categoria"
            class="filter-select"
            @search="searchCategoriasGastos"
            @change="handleCategoriaGastoChange"
            valueProp="id"
            label="nome"
          >
            <template #noOptions>
              Digite para buscar categorias
            </template>
            <template #noResults>
              Nenhuma categoria encontrada
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
            class="filter-select"
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
      </div>
      
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Data da Compra</label>
          <input 
            type="date" 
            v-model="filterState.data_compra" 
            class="filter-input" 
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data do Pagamento</label>
          <input 
            type="date" 
            v-model="filterState.data_pagamento" 
            class="filter-input" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue'
import type { GastoFilter } from '@/types/gasto.types'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { obrasAutocompleteService, type ObraAutocomplete } from '@/services/obrasAutocompleteService'
import { categoriasGastosAutocompleteService, type CategoriaGastoAutocomplete } from '@/services/categoriasGastosAutocompleteService'
import { fontesPagadorasAutocompleteService, type FontePagadoraAutocomplete } from '@/services/fontesPagadorasAutocompleteService'

const emit = defineEmits<{
  (e: 'filter', filters: GastoFilter): void
  (e: 'clear'): void
  (e: 'add-gasto'): void
}>()

const props = defineProps<{
  modelValue?: GastoFilter
}>()

const showAdvancedFilters = ref(false)

const filterState = reactive<GastoFilter>({
  search: '',
  obra_id: undefined,
  categoria_gasto_id: undefined,
  fonte_pagadora_id: undefined,
  data_compra: undefined,
  data_pagamento: undefined,
})

// Autocomplete de obras
const obras = ref<ObraAutocomplete[]>([])
const obrasOptions = ref<{id: number, nome: string}[]>([])
const selectedObra = ref<number | null>(null)

// Autocomplete de categorias de gastos
const categoriasGastos = ref<CategoriaGastoAutocomplete[]>([])
const categoriasGastosOptions = ref<{id: number, nome: string}[]>([])
const selectedCategoriaGasto = ref<number | null>(null)

// Autocomplete de fontes pagadoras
const fontesPagadoras = ref<FontePagadoraAutocomplete[]>([])
const fontesPagadorasOptions = ref<{id: number, nome: string}[]>([])
const selectedFontePagadora = ref<number | null>(null)

watch(() => props.modelValue, (val) => {
  if (val) {
    Object.assign(filterState, val)
    
    // Atualizar os valores selecionados nos Multiselect
    if (val.obra_id) selectedObra.value = val.obra_id
    if (val.categoria_gasto_id) selectedCategoriaGasto.value = val.categoria_gasto_id
    if (val.fonte_pagadora_id) selectedFontePagadora.value = val.fonte_pagadora_id
  }
}, { immediate: true })

const hasActiveFilters = computed(() => {
  return !!(
    filterState.search ||
    filterState.obra_id ||
    filterState.categoria_gasto_id ||
    filterState.fonte_pagadora_id ||
    filterState.data_compra ||
    filterState.data_pagamento
  )
})

function applyFilters() {
  // Remove undefined values before emitting
  const filters = Object.fromEntries(
    Object.entries(filterState).filter(([_, v]) => v !== undefined && v !== '')
  ) as GastoFilter
  emit('filter', filters)
}

function clearFilters() {
  Object.assign(filterState, {
    search: '',
    obra_id: undefined,
    categoria_gasto_id: undefined,
    fonte_pagadora_id: undefined,
    data_compra: undefined,
    data_pagamento: undefined,
  })
  selectedObra.value = null
  selectedCategoriaGasto.value = null
  selectedFontePagadora.value = null
  emit('clear')
}

// Método para buscar obras para o autocomplete
async function searchObras(search: string) {
  console.log('Buscando obras para autocomplete, termo:', search)
  try {
    const obrasList = await obrasAutocompleteService.getObrasAutocomplete()
    console.log('Obras recebidas:', obrasList)
    obras.value = obrasList
    obrasOptions.value = obrasList.map(obra => ({
      id: obra.id,
      nome: obra.nome
    }))
    console.log('obrasOptions atualizado:', obrasOptions.value)
    
    // Se temos um obra_id mas não temos o objeto obra selecionado, encontre-o na lista
    if (filterState.obra_id && !selectedObra.value) {
      selectedObra.value = filterState.obra_id
    }
  } catch (error) {
    console.error('Erro ao buscar obras:', error)
  }
}

// Método para lidar com a mudança de obra selecionada
function handleObraChange(obraId: number | null) {
  console.log('handleObraChange chamado com:', obraId);
  filterState.obra_id = obraId || undefined;
}

// Método para buscar categorias de gastos para o autocomplete
async function searchCategoriasGastos(search: string) {
  console.log('Buscando categorias de gastos para autocomplete, termo:', search)
  try {
    const categoriasList = await categoriasGastosAutocompleteService.getCategoriasGastosAutocomplete()
    console.log('Categorias recebidas:', categoriasList)
    categoriasGastos.value = categoriasList
    categoriasGastosOptions.value = categoriasList.map(categoria => ({
      id: categoria.id,
      nome: categoria.nome
    }))
    console.log('categoriasGastosOptions atualizado:', categoriasGastosOptions.value)
    
    // Se temos um categoria_gasto_id mas não temos o objeto categoria selecionado, encontre-o na lista
    if (filterState.categoria_gasto_id && !selectedCategoriaGasto.value) {
      selectedCategoriaGasto.value = filterState.categoria_gasto_id
    }
  } catch (error) {
    console.error('Erro ao buscar categorias de gastos:', error)
  }
}

// Método para lidar com a mudança de categoria de gasto selecionada
function handleCategoriaGastoChange(categoriaId: number | null) {
  console.log('handleCategoriaGastoChange chamado com:', categoriaId);
  filterState.categoria_gasto_id = categoriaId || undefined;
}

// Método para buscar fontes pagadoras para o autocomplete
async function searchFontesPagadoras(search: string) {
  console.log('Buscando fontes pagadoras para autocomplete, termo:', search)
  try {
    const fontesList = await fontesPagadorasAutocompleteService.getFontesPagadorasAutocomplete()
    console.log('Fontes pagadoras recebidas:', fontesList)
    fontesPagadoras.value = fontesList
    fontesPagadorasOptions.value = fontesList.map(fonte => ({
      id: fonte.id,
      nome: fonte.nome
    }))
    console.log('fontesPagadorasOptions atualizado:', fontesPagadorasOptions.value)
    
    // Se temos um fonte_pagadora_id mas não temos o objeto fonte selecionado, encontre-o na lista
    if (filterState.fonte_pagadora_id && !selectedFontePagadora.value) {
      selectedFontePagadora.value = filterState.fonte_pagadora_id
    }
  } catch (error) {
    console.error('Erro ao buscar fontes pagadoras:', error)
  }
}

// Método para lidar com a mudança de fonte pagadora selecionada
function handleFontePagadoraChange(fonteId: number | null) {
  console.log('handleFontePagadoraChange chamado com:', fonteId);
  filterState.fonte_pagadora_id = fonteId || undefined;
}
onMounted(async () => {
  // Carregar dados para os autocompletes
  await Promise.all([
    searchObras(''),
    searchCategoriasGastos(''),
    searchFontesPagadoras('')
  ])
})
</script>

<style scoped>
.filter-select {
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
  background-color: #fff;
  color: #1e293b;
  font-size: 0.875rem;
}

:deep(.multiselect-tags) {
  margin: 0;
}

:deep(.multiselect-tag) {
  background-color: #3b82f6;
  color: white;
}
</style>

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
  color: #4b5563;
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
  color: #1f2937;
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
  color: #4b5563;
}

.filter-button-clear:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.filter-button-clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button-apply {
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
}

.filter-button-apply:hover {
  background-color: #4338ca;
}

.filter-button-advanced {
  background-color: #f3f4f6;
  color: #4b5563;
}

.filter-button-advanced:hover {
  background-color: #e5e7eb;
}

.filter-button-add {
  background-color: #22c55e;
  color: white;
  font-weight: 600;
  margin-left: 0.5rem;
}

.filter-button-add:hover {
  background-color: #16a34a;
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
  margin-bottom: 1rem;
}

.filter-row:last-child {
  margin-bottom: 0;
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
    gap: 0.5rem;
  }
  
  .filter-button {
    width: 100%;
    justify-content: center;
  }
  
  .filter-button-add {
    margin-left: 0;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }

  .multiselect {
    padding: 0!important;
  }
}
</style>
