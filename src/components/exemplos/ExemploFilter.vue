<template>
  <div class="filter-container">
    <div class="filter-form">
      <div class="filter-left">
        <div class="filter-group">
          <input 
            type="text" 
            v-model="exemploStore.filters.busca" 
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
            <IconChevronTop v-if="showAdvancedFilters" :size="20" />
            <IconChevronDown v-else :size="20" />
          </span>
        </button>
      </div>
    </div>
    
    <div v-if="showAdvancedFilters" class="advanced-filters">
      <div class="filter-row">        
        <!-- INICIO: Exemplo de implementacao de filtragem que precisa de um select multiplo -->
        <div class="filter-control">
          <label class="filter-label">Exemplos</label>
          <Multiselect
            v-model="exemploStore.filters.exemplos"
            :options="exemploStore.exemplosAutocomplete"
            :searchable="true"
            :multiple="true"
            mode="tags"
            placeholder="Todos os exemplos"
            class="filter-select"
            valueProp="id"
            label="nome"
          >
            <template #noOptions>
              Nenhum exemplo disponível
            </template>
            <template #noResults>
              Nenhum exemplo encontrado
            </template>
          </Multiselect>
        </div>
        <!-- FIM: Exemplo de implementacao de filtragem que precisa de um select multiplo -->

        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select v-model="exemploStore.filters.status" class="filter-select">
            <option value="">Todos</option>
            <option :value="STATUS.ATIVO">Ativo</option>
            <option :value="STATUS.INATIVO">Inativo</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data de criação: início</label>
          <input 
            type="date" 
            v-model="exemploStore.filters.created_at_inicio" 
            class="filter-input"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Data de criação: fim</label>
          <input 
            type="date" 
            v-model="exemploStore.filters.created_at_fim" 
            class="filter-input"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useExemploStore } from '@/stores/exemploStore'
import { STATUS } from '@/types/exemplo.types'
import IconChevronTop from '@/components/icons/IconChevronTop.vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import Multiselect from '@vueform/multiselect'
// stores
const exemploStore = useExemploStore()
const showAdvancedFilters = ref(false)

// events
const emit = defineEmits(['applyFilters'])

onMounted(() => {
  loadData()
})

const loadData = () => {
  exemploStore.fetchExemplosAutocomplete()
  applyFilters()
}

const hasActiveFilters = computed(() => {
  return Object.values(exemploStore.filters).some(value => value !== null && value !== undefined && value !== '')
})

const applyFilters = async () => {
    exemploStore.pagination.current_page = 1
    await exemploStore.fetchExemplos()
    emit('applyFilters')
}

const clearFilters = async () => {
  exemploStore.filters = {}
  await applyFilters()
}
</script>

<style lang="scss">
@import '@/styles/_filter_view.scss';
@import '@/styles/_multiselect_customization.scss';
</style>
