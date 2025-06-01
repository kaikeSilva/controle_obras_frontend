<template>
  <div class="autocomplete-example">
    <h2 class="example-title">Exemplo de Autocomplete</h2>
    
    <div class="form-group">
      <AutocompleteSelect
        v-model="selectedFontePagadora"
        :options="fontesPagadorasOptions"
        label="Fonte Pagadora"
        placeholder="Selecione uma fonte pagadora"
        :loading="loading"
        :error="error"
        @change="handleFontePagadoraChange"
      />
    </div>
    
    <div v-if="selectedFontePagadora" class="selection-info">
      <p>Fonte Pagadora selecionada: <strong>{{ getSelectedFontePagadoraName() }}</strong></p>
      <p>ID: {{ selectedFontePagadora }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAutocompleteStore } from '@/stores/autocompleteStore'
import AutocompleteSelect from '@/components/common/AutocompleteSelect.vue'

// Store
const autocompleteStore = useAutocompleteStore()

// Estado local
const selectedFontePagadora = ref<number | string>('')

// Computed
const fontesPagadorasOptions = computed(() => {
  return autocompleteStore.getFontesPagadorasOptions()
})

const loading = computed(() => {
  return autocompleteStore.loading
})

const error = computed(() => {
  return autocompleteStore.error
})

// Métodos
const handleFontePagadoraChange = (value: number | string) => {
}

const getSelectedFontePagadoraName = () => {
  const option = fontesPagadorasOptions.value.find(opt => opt.value === selectedFontePagadora.value)
  return option ? option.label : 'Não encontrado'
}

// Lifecycle hooks
onMounted(async () => {
  // Carregar as fontes pagadoras ao montar o componente
  await autocompleteStore.fetchFontesPagadoras()
})
</script>

<style scoped>
.autocomplete-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.example-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.selection-info {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
}

.selection-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #1f2937;
}
</style>
