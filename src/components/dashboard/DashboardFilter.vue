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
      <div class="filter-group">
        <label class="filter-label">
          <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,3L2,12H5V20H19V12H22L12,3M9,8A1,1 0 0,1 10,9A1,1 0 0,1 9,10A1,1 0 0,1 8,9A1,1 0 0,1 9,8M9,10.5C10.25,10.5 11.25,11.5 11.25,12.75C11.25,14 10.25,15 9,15C7.75,15 6.75,14 6.75,12.75C6.75,11.5 7.75,10.5 9,10.5M15,12H18V18H15V12Z"/>
          </svg>
          Obra
        </label>
        <div class="filter-control">
          <select class="filter-select" v-model="filters.obra">
            <option value="">Todas as obras</option>
            <option value="obra1">Residencial Vila Nova</option>
            <option value="obra2">Edifício Comercial Centro</option>
            <option value="obra3">Shopping Mall Norte</option>
            <option value="obra4">Condomínio Jardins</option>
            <option value="obra5">Hospital Regional</option>
          </select>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">
          <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
          </svg>
          Categoria de Gasto
        </label>
        <div class="filter-control">
          <select class="filter-select" v-model="filters.categoria">
            <option value="">Todas as categorias</option>
            <option value="material">Material de Construção</option>
            <option value="mao-obra">Mão de Obra</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="transporte">Transporte</option>
            <option value="servicos">Serviços Terceirizados</option>
            <option value="administrativo">Administrativo</option>
          </select>
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
        <div v-if="filters.obra" class="filter-tag">
          Obra: {{ getObraName(filters.obra) }}
          <span class="filter-tag-remove" @click="removeFilter('obra')">×</span>
        </div>
        <div v-if="filters.categoria" class="filter-tag">
          Categoria: {{ getCategoriaName(filters.categoria) }}
          <span class="filter-tag-remove" @click="removeFilter('categoria')">×</span>
        </div>
        <div v-if="isDateRangeActive" class="filter-tag">
          Período: {{ formatDate(filters.dataInicio) }} até {{ formatDate(filters.dataFim) }}
          <span class="filter-tag-remove" @click="removeFilter('date')">×</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Dados mockados para filtros
const mockData = {
  obras: {
    'obra1': { name: 'Residencial Vila Nova', gastos: [35000, 42000, 38000, 46000, 39000, 43000] },
    'obra2': { name: 'Edifício Comercial Centro', gastos: [55000, 62000, 58000, 66000, 59000, 63000] },
    'obra3': { name: 'Shopping Mall Norte', gastos: [75000, 82000, 78000, 86000, 79000, 83000] },
    'obra4': { name: 'Condomínio Jardins', gastos: [45000, 52000, 48000, 56000, 49000, 53000] },
    'obra5': { name: 'Hospital Regional', gastos: [65000, 72000, 68000, 76000, 69000, 73000] }
  },
  categorias: {
    'material': { name: 'Material de Construção', gastos: [25000, 28000, 24000, 32000, 26000, 30000] },
    'mao-obra': { name: 'Mão de Obra', gastos: [15000, 18000, 16000, 19000, 17000, 18000] },
    'equipamentos': { name: 'Equipamentos', gastos: [8000, 12000, 10000, 15000, 11000, 13000] },
    'transporte': { name: 'Transporte', gastos: [5000, 7000, 6000, 8000, 7000, 9000] },
    'servicos': { name: 'Serviços Terceirizados', gastos: [12000, 15000, 13000, 16000, 14000, 17000] },
    'administrativo': { name: 'Administrativo', gastos: [10000, 12000, 11000, 13000, 12000, 14000] }
  }
}

// Estado dos filtros
const filters = ref({
  obra: '',
  categoria: '',
  dataInicio: '2025-01-01',
  dataFim: '2025-06-30'
})

// Emitir eventos para o componente pai
const emit = defineEmits(['filter-applied', 'filter-cleared'])

// Computados
const hasActiveFilters = computed(() => {
  return filters.value.obra !== '' || 
         filters.value.categoria !== '' || 
         isDateRangeActive.value
})

const isDateRangeActive = computed(() => {
  const defaultStart = '2025-01-01'
  const defaultEnd = '2025-06-30'
  return filters.value.dataInicio !== defaultStart || filters.value.dataFim !== defaultEnd
})

// Métodos
function applyFilters() {
  emit('filter-applied', { ...filters.value })
}

function clearFilters() {
  filters.value = {
    obra: '',
    categoria: '',
    dataInicio: '2025-01-01',
    dataFim: '2025-06-30'
  }
  emit('filter-cleared')
}

function removeFilter(type: string) {
  if (type === 'obra') {
    filters.value.obra = ''
  } else if (type === 'categoria') {
    filters.value.categoria = ''
  } else if (type === 'date') {
    filters.value.dataInicio = '2025-01-01'
    filters.value.dataFim = '2025-06-30'
  }
  emit('filter-applied', { ...filters.value })
}

function getObraName(id: string) {
  return mockData.obras[id as keyof typeof mockData.obras]?.name || id
}

function getCategoriaName(id: string) {
  return mockData.categorias[id as keyof typeof mockData.categorias]?.name || id
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}
</script>

<style scoped lang="scss">
/* Filters Section */
.filters-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
  }
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
  
  @include dark-mode {
    color: #f1f1f1;
  }
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
  
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
    color: #94a3b8;
  }
}

.btn-secondary:hover {
  border-color: #cbd5e1;
  color: #475569;
  
  @include dark-mode {
    border-color: #444;
    color: #cbd5e1;
  }
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.filter-control {
  position: relative;
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: #ffffff;
  transition: border-color 0.2s ease;
  
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
    color: #e2e8f0;
  }
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-range-group {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
}

.date-separator {
  padding: 0 8px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  
  @include dark-mode {
    border-top-color: #333;
  }
}

.active-filters-title {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  
  @include dark-mode {
    color: #94a3b8;
  }
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

/* Responsive Design */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .date-range-group {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .date-separator {
    display: none;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filters-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
