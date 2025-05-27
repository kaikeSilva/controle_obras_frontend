<template>
  <div class="gasto-form-view">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? 'Editar Gasto' : 'Novo Gasto' }}</h1>
        <p class="form-description">
          {{ isEditMode ? 'Edite os dados do gasto' : 'Preencha os dados para cadastrar um novo gasto' }}
        </p>
      </div>
      <form @submit.prevent="handleSubmit" class="gasto-form">
        <div class="form-row">
          <div class="form-group">
            <label for="obra_id" class="form-label">Obra <span class="required">*</span></label>
            <Multiselect
              v-model="selectedObra"
              :options="obrasOptions"
              :searchable="true"
              placeholder="Selecione uma obra"
              :class="{ 'is-invalid': errors.obra_id }"
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
            <span v-if="errors.obra_id" class="error-message">{{ errors.obra_id }}</span>
          </div>
          <div class="form-group">
            <label for="descricao" class="form-label">Descrição <span class="required">*</span></label>
            <input id="descricao" v-model="form.descricao" type="text" class="form-input" :class="{ 'input-error': errors.descricao }" required />
            <span v-if="errors.descricao" class="error-message">{{ errors.descricao }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="categoria_gasto_id" class="form-label">Categoria <span class="required">*</span></label>
            <Multiselect
              v-model="selectedCategoriaGasto"
              :options="categoriasGastosOptions"
              :searchable="true"
              placeholder="Selecione uma categoria"
              :class="{ 'is-invalid': errors.categoria_gasto_id }"
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
            <span v-if="errors.categoria_gasto_id" class="error-message">{{ errors.categoria_gasto_id }}</span>
          </div>
          <div class="form-group">
            <label for="fonte_pagadora_id" class="form-label">Fonte Pagadora <span class="required">*</span></label>
            <Multiselect
              v-model="selectedFontePagadora"
              :options="fontesPagadorasOptions"
              :searchable="true"
              placeholder="Selecione uma fonte pagadora"
              :class="{ 'is-invalid': errors.fonte_pagadora_id }"
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
            <span v-if="errors.fonte_pagadora_id" class="error-message">{{ errors.fonte_pagadora_id }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="valor" class="form-label">Valor (R$) <span class="required">*</span></label>
            <input id="valor" v-model.number="form.valor" type="number" step="0.01" min="0" class="form-input" :class="{ 'input-error': errors.valor }" required />
            <span v-if="errors.valor" class="error-message">{{ errors.valor }}</span>
          </div>
          <div class="form-group">
            <label for="data_compra" class="form-label">Data da Compra <span class="required">*</span></label>
            <input id="data_compra" v-model="form.data_compra" type="date" class="form-input" :class="{ 'input-error': errors.data_compra }" required />
            <span v-if="errors.data_compra" class="error-message">{{ errors.data_compra }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="data_pagamento" class="form-label">Data do Pagamento</label>
            <input id="data_pagamento" v-model="form.data_pagamento" type="date" class="form-input" :class="{ 'input-error': errors.data_pagamento }" />
            <span v-if="errors.data_pagamento" class="error-message">{{ errors.data_pagamento }}</span>
          </div>
          <div class="form-group">
            <label for="numero_documento" class="form-label">Número do Documento</label>
            <input id="numero_documento" v-model="form.numero_documento" type="text" class="form-input" :class="{ 'input-error': errors.numero_documento }" />
            <span v-if="errors.numero_documento" class="error-message">{{ errors.numero_documento }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="observacoes" class="form-label">Observações</label>
            <textarea id="observacoes" v-model="form.observacoes" class="form-textarea" :class="{ 'input-error': errors.observacoes }" rows="3"></textarea>
            <span v-if="errors.observacoes" class="error-message">{{ errors.observacoes }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="form-button cancel-button" @click="handleCancel">Cancelar</button>
          <button type="submit" class="form-button submit-button" :disabled="loading">
            <span v-if="loading">{{ isEditMode ? 'Atualizando...' : 'Salvando...' }}</span>
            <span v-else>{{ isEditMode ? 'Atualizar' : 'Salvar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { useGastosStore } from '@/stores/gastosStore'
import type { GastoForm, Gasto } from '@/types/gasto.types'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { obrasAutocompleteService, type ObraAutocomplete } from '@/services/obrasAutocompleteService'
import { categoriasGastosAutocompleteService, type CategoriaGastoAutocomplete } from '@/services/categoriasGastosAutocompleteService'
import { fontesPagadorasAutocompleteService, type FontePagadoraAutocomplete } from '@/services/fontesPagadorasAutocompleteService'

const props = defineProps<{ obraId?: number | null }>()

const router = useRouter()
const route = useRoute()
const gastosStore = useGastosStore()
const notificationStore = useNotificationStore()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

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

const isEditMode = computed(() => !!route.params.id)
const form = reactive<GastoForm>({
  obra_id: props.obraId ?? (route.params.obra_id ? Number(route.params.obra_id) : 0),
  categoria_gasto_id: 0,
  fonte_pagadora_id: 0,
  descricao: '',
  valor: 0,
  data_compra: new Date().toISOString().split('T')[0],
  data_pagamento: null,
  numero_documento: null,
  comprovante_url: null,
  observacoes: null
})

// Se prop mudar depois, atualiza também
watch(() => props.obraId, (val) => { if (!isEditMode.value && val) form.obra_id = val })

// Método para buscar obras para o autocomplete
async function searchObras(search: string) {
  try {
    const obrasList = await obrasAutocompleteService.getObrasAutocomplete()
    obras.value = obrasList
    obrasOptions.value = obrasList.map(obra => ({
      id: obra.id,
      nome: obra.nome
    }))
    
    // Se temos um obra_id mas não temos o objeto obra selecionado, encontre-o na lista
    if (form.obra_id && !selectedObra.value) {
      selectedObra.value = form.obra_id
    }
  } catch (error) {
    console.error('Erro ao buscar obras:', error)
  }
}

// Método para lidar com a mudança de obra selecionada
function handleObraChange(obraId: number | null) {
  if (obraId) {
    form.obra_id = obraId;
    delete errors.obra_id;
  } else {
    form.obra_id = 0;
  }
}

// Método para buscar categorias de gastos para o autocomplete
async function searchCategoriasGastos(search: string) {
  try {
    const categoriasList = await categoriasGastosAutocompleteService.getCategoriasGastosAutocomplete()
    categoriasGastos.value = categoriasList
    categoriasGastosOptions.value = categoriasList.map(categoria => ({
      id: categoria.id,
      nome: categoria.nome
    }))
    
    // Se temos um categoria_gasto_id mas não temos o objeto categoria selecionado, encontre-o na lista
    if (form.categoria_gasto_id && !selectedCategoriaGasto.value) {
      selectedCategoriaGasto.value = form.categoria_gasto_id
    }
  } catch (error) {
    console.error('Erro ao buscar categorias de gastos:', error)
  }
}

// Método para lidar com a mudança de categoria de gasto selecionada
function handleCategoriaGastoChange(categoriaId: number | null) {
  if (categoriaId) {
    form.categoria_gasto_id = categoriaId;
    delete errors.categoria_gasto_id;
  } else {
    form.categoria_gasto_id = 0;
  }
}

// Método para buscar fontes pagadoras para o autocomplete
async function searchFontesPagadoras(search: string) {
  try {
    const fontesList = await fontesPagadorasAutocompleteService.getFontesPagadorasAutocomplete()
    fontesPagadoras.value = fontesList
    fontesPagadorasOptions.value = fontesList.map(fonte => ({
      id: fonte.id,
      nome: fonte.nome
    }))
    
    // Se temos um fonte_pagadora_id mas não temos o objeto fonte selecionado, encontre-o na lista
    if (form.fonte_pagadora_id && !selectedFontePagadora.value) {
      selectedFontePagadora.value = form.fonte_pagadora_id
    }
  } catch (error) {
    console.error('Erro ao buscar fontes pagadoras:', error)
  }
}

// Método para lidar com a mudança de fonte pagadora selecionada
function handleFontePagadoraChange(fonteId: number | null) {
  if (fonteId) {
    form.fonte_pagadora_id = fonteId;
    delete errors.fonte_pagadora_id;
  } else {
    form.fonte_pagadora_id = 0;
  }
}

onMounted(async () => {
  // Buscar dados para os autocompletes
  await Promise.all([
    searchObras(''),
    searchCategoriasGastos(''),
    searchFontesPagadoras('')
  ])
  
  if (isEditMode.value && route.params.id) {
    loading.value = true
    try {
      const response = await gastosStore.fetchGasto(Number(route.params.id))
      
      // Verifica se a resposta tem o formato esperado
      if (response) {
        // Se a resposta for { data: { ...gasto } }
        if (response.data) {
          populateForm(response.data)
        } else {
          populateForm(response)
        }
      } else {
        notificationStore.addNotification('Não foi possível carregar os dados do gasto!', 'error')
      }
    } catch (error) {
      console.error('Erro ao carregar gasto:', error)
      notificationStore.addNotification('Erro ao carregar dados do gasto!', 'error')
    } finally {
      loading.value = false
    }
  }
})

function populateForm(gasto: Gasto) {
  form.obra_id = gasto.obra_id
  form.categoria_gasto_id = gasto.categoria_gasto_id
  form.fonte_pagadora_id = gasto.fonte_pagadora_id
  form.descricao = gasto.descricao
  form.valor = gasto.valor
  form.data_compra = gasto.data_compra
  form.data_pagamento = gasto.data_pagamento || null
  form.numero_documento = gasto.numero_documento || null
  form.comprovante_url = gasto.comprovante_url || null
  form.observacoes = gasto.observacoes || null
  
  // Se temos a obra completa nos dados, vamos adicioná-la às opções
  if (gasto.obra) {
    // Adicione à lista de opções se ainda não estiver lá
    if (!obrasOptions.value.some(o => o.id === gasto.obra.id)) {
      obrasOptions.value.push({
        id: gasto.obra.id,
        nome: gasto.obra.nome
      });
    }
    
    // Definir o ID da obra como selecionado
    selectedObra.value = gasto.obra_id;
  }
  
  // Se temos a categoria completa nos dados, vamos adicioná-la às opções
  if (gasto.categoria_gasto) {
    // Adicione à lista de opções se ainda não estiver lá
    if (!categoriasGastosOptions.value.some(c => c.id === gasto.categoria_gasto.id)) {
      categoriasGastosOptions.value.push({
        id: gasto.categoria_gasto.id,
        nome: gasto.categoria_gasto.nome
      });
    }
    
    // Definir o ID da categoria como selecionado
    selectedCategoriaGasto.value = gasto.categoria_gasto_id;
  }
  
  // Se temos a fonte pagadora completa nos dados, vamos adicioná-la às opções
  if (gasto.fonte_pagadora) {
    // Adicione à lista de opções se ainda não estiver lá
    if (!fontesPagadorasOptions.value.some(f => f.id === gasto.fonte_pagadora.id)) {
      fontesPagadorasOptions.value.push({
        id: gasto.fonte_pagadora.id,
        nome: gasto.fonte_pagadora.nome
      });
    }
    
    // Definir o ID da fonte pagadora como selecionado
    selectedFontePagadora.value = gasto.fonte_pagadora_id;
  }
}

function validateForm(): boolean {
  let valid = true
  Object.keys(errors).forEach(key => { errors[key] = '' })
  
  if (!form.obra_id) {
    errors.obra_id = 'Obra é obrigatória.'
    valid = false
  }
  
  if (!form.categoria_gasto_id) {
    errors.categoria_gasto_id = 'Categoria é obrigatória.'
    valid = false
  }
  
  if (!form.fonte_pagadora_id) {
    errors.fonte_pagadora_id = 'Fonte pagadora é obrigatória.'
    valid = false
  }
  
  if (!form.descricao) {
    errors.descricao = 'Descrição é obrigatória.'
    valid = false
  }
  
  if (!form.valor || form.valor <= 0) {
    errors.valor = 'Valor deve ser maior que zero.'
    valid = false
  }
  
  if (!form.data_compra) {
    errors.data_compra = 'Data da compra é obrigatória.'
    valid = false
  }
  
  if (form.data_pagamento && form.data_compra && form.data_pagamento < form.data_compra) {
    errors.data_pagamento = 'Data de pagamento não pode ser anterior à data da compra.'
    valid = false
  }
  
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (isEditMode.value && route.params.id) {
      await gastosStore.updateGasto(Number(route.params.id), form)
      notificationStore.addNotification('Gasto atualizado com sucesso!', 'success')
    } else {
      await gastosStore.createGasto(form)
      notificationStore.addNotification('Gasto criado com sucesso!', 'success')
    }
    
    // Redireciona para a página de detalhes da obra ou para a lista de gastos
    if (form.obra_id) {
      router.push({ name: 'obra-details', params: { id: form.obra_id }, query: { active_tab: 'gastos' } })
    } else {
      router.push({ name: 'gastos' })
    }
  } catch (error: any) {
    console.error('[GastoFormView] Erro ao salvar gasto:', error)
    notificationStore.addNotification('Erro ao salvar gasto!', 'error')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  if (form.obra_id) {
    router.push({ name: 'obra-details', params: { id: form.obra_id }, query: { active_tab: 'gastos' } })
  } else {
    router.push({ name: 'gastos' })
  }
}
</script>

<style scoped lang="scss">
/* Multiselect Custom Styling */
:deep(.multiselect) {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  min-height: 38px;
  font-size: 0.95rem;
  box-shadow: none;
  
  &.is-invalid {
    border-color: #ef4444;
  }
  
  .multiselect-placeholder {
    color: #9ca3af;
    padding: 0.5rem 0.75rem;
  }
  
  .multiselect-single-label {
    color: #1f2937;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
  }
  
  .multiselect-tags {
    padding: 0.5rem 0.75rem;
    background-color: white;
    color: #1f2937;
    font-weight: 500;
  }
  
  .multiselect-tag {
    background-color: #4f46e5;
    color: white;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    margin-right: 0.25rem;
  }
  
  .multiselect-options {
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    margin-top: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0;
  }
  
  .multiselect-option {
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
    color: #374151;
    
    &.is-pointed {
      background-color: #f3f4f6;
      color: #111827;
    }
    
    &.is-selected {
      background-color: #4f46e5;
      color: white;
    }
  }
  
  .multiselect-no-options,
  .multiselect-no-results {
    padding: 0.5rem 0.75rem;
    color: #6b7280;
    font-size: 0.95rem;
  }
}

.gasto-form-view {
  min-height: 100vh;
  width: 100vw;
  background: #f9fafb;
  padding: 0;
  display: flex;
}
.form-container {
  background: white;
  border-radius: 0;
  box-shadow: none;
  padding: 2rem;
  width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.form-header {
  margin-bottom: 1.5rem;
}
.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.form-description {
  color: #6b7280;
  margin-top: 0.25rem;
}
.gasto-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-row {
  display: flex;
  gap: 1.5rem;
}
.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.form-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}
.required {
  color: #ef4444;
}
.form-input, .form-select, .form-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  color: #1f2937;
  transition: border-color 0.2s;
  width: 100%;
}
.form-textarea {
  resize: vertical;
  min-height: 80px;
}
.input-error {
  border-color: #ef4444;
}
.error-message {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.25rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
.form-button {
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}
.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
}
.cancel-button:hover {
  background-color: #e5e7eb;
}
.submit-button {
  background-color: #4f46e5;
  color: white;
}
.submit-button:hover:not(:disabled) {
  background-color: #4338ca;
}
.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
@media (max-width: 800px) {
  .form-container {
    padding: 1rem;
    max-width: 98vw;
  }
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
