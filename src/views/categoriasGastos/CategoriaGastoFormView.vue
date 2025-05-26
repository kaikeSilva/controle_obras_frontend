<template>
  <div class="categoria-gasto-form-view">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? 'Editar Categoria de Gasto' : 'Nova Categoria de Gasto' }}</h1>
        <p class="form-description">
          {{ isEditMode ? 'Edite os dados da categoria de gasto' : 'Preencha os dados para cadastrar uma nova categoria de gasto' }}
        </p>
      </div>
      <form @submit.prevent="handleSubmit" class="categoria-gasto-form">
        <div class="form-row">
          <div class="form-group" v-if="!props.clienteId">
            <label for="cliente" class="form-label">Cliente <span class="required">*</span></label>
            <Multiselect
              v-model="selectedCliente"
              :options="clientesOptions"
              :searchable="true"
              placeholder="Selecione um cliente"
              :class="{ 'is-invalid': errors.cliente_id }"
              @search="searchClientes"
              @change="handleClienteChange"
              valueProp="id"
              label="nome"
            >
              <template #noOptions>
                Digite para buscar clientes
              </template>
              <template #noResults>
                Nenhum cliente encontrado
              </template>
            </Multiselect>
            <span v-if="errors.cliente_id" class="error-message">{{ errors.cliente_id }}</span>
          </div>
          <div class="form-group">
            <label for="nome" class="form-label">Nome <span class="required">*</span></label>
            <input id="nome" v-model="form.nome" type="text" class="form-input" :class="{ 'input-error': errors.nome }" required />
            <span v-if="errors.nome" class="error-message">{{ errors.nome }}</span>
          </div>
          <div class="form-group">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea id="descricao" v-model="form.descricao" class="form-textarea" :class="{ 'input-error': errors.descricao }" rows="3"></textarea>
            <span v-if="errors.descricao" class="error-message">{{ errors.descricao }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cor" class="form-label">Cor</label>
            <div class="color-picker-container">
              <input id="cor" v-model="form.cor" type="color" class="form-color-input" />
              <input v-model="form.cor" type="text" class="form-input color-text-input" :class="{ 'input-error': errors.cor }" placeholder="#RRGGBB" />
            </div>
            <span v-if="errors.cor" class="error-message">{{ errors.cor }}</span>
          </div>
          <div class="form-group">
            <label for="status" class="form-label">Status <span class="required">*</span></label>
            <select id="status" v-model="form.status" class="form-select" :class="{ 'input-error': errors.status }" required>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
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
import { useCategoriaGastoStore } from '@/stores/categoriaGastoStore'
import type { CategoriaGastoForm, CategoriaGasto } from '@/types/categoriaGasto.types'
import { clientsService, type Cliente } from '@/services/clientsService'

const props = defineProps<{ clienteId?: number | null }>()

const router = useRouter()
const route = useRoute()
const categoriaGastoStore = useCategoriaGastoStore()
const notificationStore = useNotificationStore()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})
const clientes = ref<Cliente[]>([])
const clientesOptions = ref<{id: number, nome: string}[]>([])
const selectedCliente = ref<number | null>(null)

const isEditMode = computed(() => !!route.params.id)

// Computed para converter o status booleano para string
const form = reactive<CategoriaGastoForm>({
  cliente_id: props.clienteId ?? (route.params.cliente_id ? Number(route.params.cliente_id) : null),
  nome: '',
  status: 'ativo',
  descricao: null,
  cor: '#3B82F6'
})

// Não é mais necessário o watch para status, agora é selecionado diretamente

// Se prop mudar depois, atualiza também
watch(() => props.clienteId, (val) => { if (!isEditMode.value) form.cliente_id = val })

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
const breadcrumbStore = useBreadcrumbStore()

// Método para buscar clientes para o autocomplete
async function searchClientes(search: string) {
  console.log('Buscando clientes para autocomplete, termo:', search)
  try {
    console.log('Chamando clientsService.getClientesAutocomplete()')
    const clientesList = await clientsService.getClientesAutocomplete()
    console.log('Clientes recebidos:', clientesList)
    clientes.value = clientesList
    clientesOptions.value = clientesList.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome
    }))
    console.log('clientesOptions atualizado:', clientesOptions.value)
    
    // Se temos um cliente_id mas não temos o objeto cliente selecionado, encontre-o na lista
    if (form.cliente_id && !selectedCliente.value) {
      selectedCliente.value = form.cliente_id
    }
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
  }
}

// Método para lidar com a mudança de cliente selecionado
function handleClienteChange(clienteId: number | null) {
  if (clienteId) {
    form.cliente_id = clienteId
    delete errors.cliente_id
  } else {
    form.cliente_id = null
  }
}

onMounted(async () => {
  // Sempre buscar a lista de clientes para o autocomplete
  await searchClientes('')
  
  if (form.cliente_id) {
    breadcrumbStore.setClienteId(form.cliente_id)
  }
  breadcrumbStore.setActiveTab('categoria-gasto')

  if (isEditMode.value && route.params.id) {
    loading.value = true
    try {
      const categoriaGasto = await categoriaGastoStore.fetchCategoriaGasto(Number(route.params.id))
      if (categoriaGasto) {
        // Se vier no formato { data: { ... } }, usar categoriaGasto.data
        if (categoriaGasto.data) {
          populateForm(categoriaGasto.data)
          if (categoriaGasto.data.cliente_id) breadcrumbStore.setClienteId(categoriaGasto.data.cliente_id)
        } else {
          populateForm(categoriaGasto)
          if (categoriaGasto.cliente_id) breadcrumbStore.setClienteId(categoriaGasto.cliente_id)
        }
      }
    } catch (error) {
      console.error('[CategoriaGastoFormView] Erro ao buscar categoria de gasto:', error)
      notificationStore.addNotification('Erro ao carregar categoria de gasto!', 'error')
    } finally {
      loading.value = false
    }
  }
})

function populateForm(categoriaGasto: CategoriaGasto) {
  form.cliente_id = categoriaGasto.cliente_id
  form.nome = categoriaGasto.nome
  form.descricao = categoriaGasto.descricao
  form.cor = categoriaGasto.cor || '#3B82F6'
  form.status = categoriaGasto.status
}

function validateForm(): boolean {
  let valid = true
  Object.keys(errors).forEach(key => { errors[key] = '' })
  
  // Validar cliente_id apenas quando não estiver no modo aninhado (sem props.clienteId)
  if (!props.clienteId && !form.cliente_id) {
    errors.cliente_id = 'Cliente é obrigatório.'
    valid = false
  }
  
  if (!form.nome) {
    errors.nome = 'Nome é obrigatório.'
    valid = false
  }
  
  if (!form.status) {
    errors.status = 'Status é obrigatório.'
    valid = false
  }
  
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (isEditMode.value && route.params.id) {
      await categoriaGastoStore.updateCategoriaGasto(Number(route.params.id), form)
      notificationStore.addNotification('Categoria de gasto atualizada com sucesso!', 'success')
    } else {
      await categoriaGastoStore.createCategoriaGasto(form)
      notificationStore.addNotification('Categoria de gasto criada com sucesso!', 'success')
    }
    
    // Redireciona para a página de detalhes do cliente com a aba de categorias de gastos ativa
    if (form.cliente_id) {
      router.push({ 
        name: 'client-details', 
        params: { id: form.cliente_id }, 
        query: { active_tab: 'categoria-gasto' } 
      })
    } else {
      // Se for uma categoria global, redirecionar para a lista de categorias
      router.push({ name: 'categorias-gastos' })
    }
  } catch (error: any) {
    console.error('[CategoriaGastoFormView] Erro ao salvar categoria de gasto:', error)
    notificationStore.addNotification('Erro ao salvar categoria de gasto!', 'error')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  if (form.cliente_id) {
    router.push({ 
      name: 'client-details', 
      params: { id: form.cliente_id }, 
      query: { active_tab: 'categoria-gasto' } 
    })
  } else {
    // Se for uma categoria global, redirecionar para a lista de categorias
    router.push({ name: 'categorias-gastos' })
  }
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

.categoria-gasto-form-view {
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

.categoria-gasto-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    
    .form-group {
      flex: 1;
    }
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
  transition: border-color 0.15s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 6rem;
}

.input-error {
  border-color: #ef4444;
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
  }
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
}

.required {
  color: #ef4444;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + .slider {
      background-color: #3b82f6;
    }
    
    &:checked + .slider:before {
      transform: translateX(1.5rem);
    }
  }
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.4s;
  border-radius: 1.5rem;
  
  &:before {
    position: absolute;
    content: "";
    height: 1.125rem;
    width: 1.125rem;
    left: 0.1875rem;
    bottom: 0.1875rem;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
}

.toggle-label {
  font-size: 0.875rem;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.form-button {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.cancel-button {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  
  &:hover {
    background-color: #f3f4f6;
  }
}

.submit-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
  }
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-color-input {
  width: 3rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
}

@media (max-width: 767px) {
  .form-container {
    padding: 1rem;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    
    .form-button {
      width: 100%;
    }
  }
}
</style>
