<template>
  <div class="entrada-recurso-form-view">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? 'Editar Entrada de Recurso' : 'Nova Entrada de Recurso' }}</h1>
        <p class="form-description">
          {{ isEditMode ? 'Edite os dados da entrada de recurso' : 'Preencha os dados para cadastrar uma nova entrada de recurso' }}
        </p>
      </div>
      <form @submit.prevent="handleSubmit" class="entrada-recurso-form">
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
            <label for="data_entrada" class="form-label">Data de Entrada <span class="required">*</span></label>
            <input id="data_entrada" v-model="form.data_entrada" type="date" class="form-input" :class="{ 'input-error': errors.data_entrada }" required />
            <span v-if="errors.data_entrada" class="error-message">{{ errors.data_entrada }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="tipo_entrada" class="form-label">Tipo de Entrada <span class="required">*</span></label>
            <select id="tipo_entrada" v-model="form.tipo_entrada" class="form-select" :class="{ 'input-error': errors.tipo_entrada }" required>
              <option value="aporte_inicial">Aporte Inicial</option>
              <option value="aporte_adicional">Aporte Adicional</option>
              <option value="reembolso">Reembolso</option>
              <option value="regular">Regular</option>
            </select>
            <span v-if="errors.tipo_entrada" class="error-message">{{ errors.tipo_entrada }}</span>
          </div>
          <div class="form-group">
            <label for="comprovante_url" class="form-label">URL do Comprovante</label>
            <input id="comprovante_url" v-model="form.comprovante_url" type="text" class="form-input" :class="{ 'input-error': errors.comprovante_url }" />
            <span v-if="errors.comprovante_url" class="error-message">{{ errors.comprovante_url }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea id="descricao" v-model="form.descricao" class="form-textarea" :class="{ 'input-error': errors.descricao }" rows="3"></textarea>
            <span v-if="errors.descricao" class="error-message">{{ errors.descricao }}</span>
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
import { useEntradaRecursoStore } from '@/stores/entradaRecursoStore'
import type { EntradaRecursoForm, EntradaRecurso } from '@/types/entrada-recurso.types'
import Multiselect from '@vueform/multiselect'
import { obrasAutocompleteService, type ObraAutocomplete } from '@/services/obrasAutocompleteService'
import { fontesPagadorasAutocompleteService, type FontePagadoraAutocomplete } from '@/services/fontesPagadorasAutocompleteService'

const props = defineProps<{ obraId?: number | null }>()

const router = useRouter()
const route = useRoute()
const entradaRecursoStore = useEntradaRecursoStore()
const notificationStore = useNotificationStore()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

// Variáveis para Multiselect de Obras
const obras = ref<ObraAutocomplete[]>([])
const obrasOptions = ref<{id: number, nome: string}[]>([])
const selectedObra = ref<number | null>(null)

// Variáveis para Multiselect de Fontes Pagadoras
const fontesPagadoras = ref<FontePagadoraAutocomplete[]>([])
const fontesPagadorasOptions = ref<{id: number, nome: string}[]>([])
const selectedFontePagadora = ref<number | null>(null)

const isEditMode = computed(() => !!route.params.id)
const form = reactive<EntradaRecursoForm>({
  obra_id: props.obraId ?? (route.params.obra_id ? Number(route.params.obra_id) : 0),
  fonte_pagadora_id: 0,
  valor: 0,
  data_entrada: new Date().toISOString().split('T')[0],
  descricao: '',
  comprovante_url: null,
  tipo_entrada: 'regular'
})

// Se o obraId for fornecido via props, atualizar o selectedObra
watch(() => props.obraId, (val) => {
  if (val && !isEditMode.value) {
    form.obra_id = val
    selectedObra.value = val
  }
})

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
const breadcrumbStore = useBreadcrumbStore()

// Método para buscar obras para o autocomplete
async function searchObras(search: string = '') {
  try {
    const obrasData = await obrasAutocompleteService.getObrasAutocomplete()
    obras.value = obrasData
    obrasOptions.value = obrasData.map(obra => ({
      id: obra.id,
      nome: obra.nome
    }))
    
    // Se temos um obraId e ainda não temos um selectedObra, vamos selecionar a obra
    if (form.obra_id && !selectedObra.value) {
      selectedObra.value = form.obra_id
    }
  } catch (error) {
    console.error('Erro ao buscar obras:', error)
    notificationStore.addNotification('Erro ao carregar obras', 'error')
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
    
    // Se temos um fonte_pagadora_id e ainda não temos um selectedFontePagadora, vamos selecionar a fonte pagadora
    if (form.fonte_pagadora_id && !selectedFontePagadora.value) {
      selectedFontePagadora.value = form.fonte_pagadora_id
    }
  } catch (error) {
    console.error('Erro ao buscar fontes pagadoras:', error)
    notificationStore.addNotification('Erro ao carregar fontes pagadoras', 'error')
  }
}

// Método para lidar com a mudança de obra selecionada
function handleObraChange(obraId: number | null) {
  form.obra_id = obraId || 0
  if (errors.obra_id) {
    errors.obra_id = ''
  }
}

// Método para lidar com a mudança de fonte pagadora selecionada
function handleFontePagadoraChange(fontePagadoraId: number | null) {
  form.fonte_pagadora_id = fontePagadoraId || 0
  if (errors.fonte_pagadora_id) {
    errors.fonte_pagadora_id = ''
  }
}

onMounted(async () => {
  // Buscar obras e fontes pagadoras para o autocomplete
  await Promise.all([searchObras(), searchFontesPagadoras()])
  
  if (form.obra_id) breadcrumbStore.setObraId(form.obra_id)
  breadcrumbStore.setActiveTab('entrada_recurso')

  if (isEditMode.value && route.params.id) {
    loading.value = true
    try {
      const entradaRecurso = await entradaRecursoStore.fetchEntradaRecursoById(Number(route.params.id))
      if (entradaRecurso) {
        // Se vier no formato { data: { ... } }, usar entradaRecurso.data
        if (entradaRecurso.data) {
          populateForm(entradaRecurso.data)
          if (entradaRecurso.data.obra_id) breadcrumbStore.setObraId(entradaRecurso.data.obra_id)
        } else {
          populateForm(entradaRecurso)
          if (entradaRecurso.obra_id) breadcrumbStore.setObraId(entradaRecurso.obra_id)
        }
      }
    } finally {
      loading.value = false
    }
  }
})

function populateForm(entradaRecurso: EntradaRecurso) {
  form.obra_id = entradaRecurso.obra_id
  form.fonte_pagadora_id = entradaRecurso.fonte_pagadora_id
  form.valor = entradaRecurso.valor
  form.data_entrada = entradaRecurso.data_entrada || new Date().toISOString().split('T')[0]
  form.descricao = entradaRecurso.descricao || ''
  form.comprovante_url = entradaRecurso.comprovante_url || null
  form.tipo_entrada = entradaRecurso.tipo_entrada
  
  // Atualizar os valores selecionados nos componentes Multiselect
  selectedObra.value = entradaRecurso.obra_id
  selectedFontePagadora.value = entradaRecurso.fonte_pagadora_id
}

function validateForm(): boolean {
  let valid = true
  Object.keys(errors).forEach(key => { errors[key] = '' })
  
  if (!form.obra_id) {
    errors.obra_id = 'Obra é obrigatória.'
    valid = false
  }
  
  if (!form.fonte_pagadora_id) {
    errors.fonte_pagadora_id = 'Fonte pagadora é obrigatória.'
    valid = false
  }
  
  if (!form.valor || form.valor <= 0) {
    errors.valor = 'Valor é obrigatório e deve ser maior que zero.'
    valid = false
  }
  
  if (!form.data_entrada) {
    errors.data_entrada = 'Data de entrada é obrigatória.'
    valid = false
  }
  
  if (!form.tipo_entrada) {
    errors.tipo_entrada = 'Tipo de entrada é obrigatório.'
    valid = false
  }
  
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (isEditMode.value && route.params.id) {
      await entradaRecursoStore.updateEntradaRecurso(Number(route.params.id), form)
      notificationStore.addNotification('Entrada de recurso atualizada com sucesso!', 'success')
      router.push({ name: 'obra-details', params: { id: form.obra_id }, query: { active_tab: 'entrada_recurso' } })
    } else {
      await entradaRecursoStore.createEntradaRecurso(form)
      notificationStore.addNotification('Entrada de recurso criada com sucesso!', 'success')
      router.push({ name: 'obra-details', params: { id: form.obra_id }, query: { active_tab: 'entrada_recurso' } })
    }
  } catch (error: any) {
    console.error('[EntradaRecursoFormView] Erro ao salvar entrada de recurso:', error)
    notificationStore.addNotification('Erro ao salvar entrada de recurso!', 'error')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'obra-details', params: { id: form.obra_id }, query: { active_tab: 'entrada_recurso' } })
}
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

.entrada-recurso-form-view {
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
.entrada-recurso-form {
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

/* Responsividade para mobile */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  .form-container {
    padding: 1rem;
  }
  .form-title {
    font-size: 1.5rem;
  }
}
</style>
