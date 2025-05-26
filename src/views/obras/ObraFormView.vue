<template>
  <div class="obra-form-view">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? 'Editar Obra' : 'Nova Obra' }}</h1>
        <p class="form-description">
          {{ isEditMode ? 'Edite os dados da obra' : 'Preencha os dados para cadastrar uma nova obra' }}
        </p>
      </div>
      <form @submit.prevent="handleSubmit" class="obra-form">
        <div class="form-row">
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
            <label for="endereco" class="form-label">Endereço</label>
            <input id="endereco" v-model="form.endereco" type="text" class="form-input" :class="{ 'input-error': errors.endereco }" />
            <span v-if="errors.endereco" class="error-message">{{ errors.endereco }}</span>
          </div>
          <div class="form-group">
            <label for="area_m2" class="form-label">Área (m²)</label>
            <input id="area_m2" v-model.number="form.area_m2" type="number" step="0.01" min="0" class="form-input" :class="{ 'input-error': errors.area_m2 }" />
            <span v-if="errors.area_m2" class="error-message">{{ errors.area_m2 }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="data_inicio" class="form-label">Data de Início <span class="required">*</span></label>
            <input id="data_inicio" v-model="form.data_inicio" type="date" class="form-input" :class="{ 'input-error': errors.data_inicio }" required />
            <span v-if="errors.data_inicio" class="error-message">{{ errors.data_inicio }}</span>
          </div>
          <div class="form-group">
            <label for="prazo_estimado" class="form-label">Prazo Estimado</label>
            <input id="prazo_estimado" v-model="form.prazo_estimado" type="date" class="form-input" :class="{ 'input-error': errors.prazo_estimado }" />
            <span v-if="errors.prazo_estimado" class="error-message">{{ errors.prazo_estimado }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="valor_estimado" class="form-label">Valor Estimado (R$)</label>
            <input id="valor_estimado" v-model.number="form.valor_estimado" type="number" step="0.01" min="0" class="form-input" :class="{ 'input-error': errors.valor_estimado }" />
            <span v-if="errors.valor_estimado" class="error-message">{{ errors.valor_estimado }}</span>
          </div>
          <div class="form-group">
            <label for="taxa_administracao" class="form-label">Taxa de Administração (%)</label>
            <input id="taxa_administracao" v-model.number="form.taxa_administracao" type="number" step="0.01" min="0" max="100" class="form-input" :class="{ 'input-error': errors.taxa_administracao }" />
            <span v-if="errors.taxa_administracao" class="error-message">{{ errors.taxa_administracao }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="status" class="form-label">Status <span class="required">*</span></label>
            <select id="status" v-model="form.status" class="form-select" :class="{ 'input-error': errors.status }" required>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="pausada">Pausada</option>
            </select>
            <span v-if="errors.status" class="error-message">{{ errors.status }}</span>
          </div>
          <div class="form-group">
            <label for="ativo" class="form-label">Situação</label>
            <div class="toggle-container">
              <label class="toggle">
                <input type="checkbox" v-model="form.ativo">
                <span class="slider"></span>
              </label>
              <span class="toggle-label">{{ form.ativo ? 'Ativo' : 'Inativo' }}</span>
            </div>
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
import { useObrasStore } from '@/stores/obrasStore'
import type { ObraForm, Obra } from '@/types/obra.types'

const props = defineProps<{ clienteId?: number | null }>()

const router = useRouter()
const route = useRoute()
const obrasStore = useObrasStore()
const notificationStore = useNotificationStore()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

const isEditMode = computed(() => !!route.params.id)
const form = reactive<ObraForm>({
  cliente_id: props.clienteId ?? (route.params.cliente_id ? Number(route.params.cliente_id) : null),
  nome: '',
  descricao: '',
  endereco: '',
  area_m2: null,
  data_inicio: new Date().toISOString().split('T')[0],
  prazo_estimado: '',
  valor_estimado: null,
  taxa_administracao: null,
  status: 'em_andamento',
  ativo: true
})
console.log('[ObraFormView] cliente_id recebido:', props.clienteId, '| route.params.cliente_id:', route.params.cliente_id, '| form.cliente_id:', form.cliente_id)
// Se prop mudar depois, atualiza também
watch(() => props.clienteId, (val) => { if (!isEditMode.value) form.cliente_id = val })

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
const breadcrumbStore = useBreadcrumbStore()

onMounted(async () => {
  if (form.cliente_id) breadcrumbStore.setClienteId(form.cliente_id)
  breadcrumbStore.setActiveTab('obra')

  if (isEditMode.value && route.params.id) {
    loading.value = true
    try {
      const obra = await obrasStore.fetchObra(Number(route.params.id))
      if (obra) {
        // Se vier no formato { data: { ... } }, usar obra.data
        if (obra.data) {
          populateForm(obra.data)
          if (obra.data.cliente_id) breadcrumbStore.setClienteId(obra.data.cliente_id)
        } else {
          populateForm(obra)
          if (obra.cliente_id) breadcrumbStore.setClienteId(obra.cliente_id)
        }
      }
    } finally {
      loading.value = false
    }
  }
})

function populateForm(obra: Obra) {
  form.cliente_id = obra.cliente_id
  // Disponibiliza o cliente_id globalmente para o breadcrumb
  if (obra.cliente_id) {
    window.__obraFormClienteId = obra.cliente_id
  }
  form.nome = obra.nome
  form.descricao = obra.descricao || ''
  form.endereco = obra.endereco || ''
  form.area_m2 = obra.area_m2 || null
  form.data_inicio = obra.data_inicio || new Date().toISOString().split('T')[0]
  form.prazo_estimado = obra.prazo_estimado || ''
  form.valor_estimado = obra.valor_estimado || null
  form.taxa_administracao = obra.taxa_administracao || null
  form.status = obra.status
  form.ativo = obra.ativo
}

function validateForm(): boolean {
  let valid = true
  Object.keys(errors).forEach(key => { errors[key] = '' })
  if (!form.nome) {
    errors.nome = 'Nome é obrigatório.'
    valid = false
  }
  if (!form.data_inicio) {
    errors.data_inicio = 'Data de início é obrigatória.'
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
  if (!form.cliente_id) {
    notificationStore.addNotification('Cliente é obrigatório para criar uma obra.', 'error')
    return
  }
  loading.value = true
  try {
    if (isEditMode.value && route.params.id) {
      await obrasStore.updateObra(Number(route.params.id), form)
      notificationStore.addNotification('Obra atualizada com sucesso!', 'success')
      router.push({ name: 'client-details', params: { id: form.cliente_id }, query: { active_tab: 'obra' } })
    } else {
      await obrasStore.createObra(form)
      notificationStore.addNotification('Obra criada com sucesso!', 'success')
      router.push({ name: 'client-details', params: { id: form.cliente_id }, query: { active_tab: 'obra' } })
    }
  } catch (error: any) {
    // Só mostra erro se realmente houver erro
    console.error('[ObraFormView] Erro ao salvar obra:', error)
    notificationStore.addNotification('Erro ao salvar obra!', 'error')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'client-details', params: { id: form.cliente_id }, query: { active_tab: 'obra' } })
}
</script>

<style scoped>
.obra-form-view {
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
.obra-form {
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
.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.toggle {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: .4s;
  border-radius: 1.5rem;
}
.slider:before {
  position: absolute;
  content: "";
  height: 1.25rem;
  width: 1.25rem;
  left: 0.125rem;
  bottom: 0.125rem;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #4f46e5;
}
input:focus + .slider {
  box-shadow: 0 0 1px #4f46e5;
}
input:checked + .slider:before {
  transform: translateX(1.5rem);
}
.toggle-label {
  font-size: 0.95rem;
  color: #374151;
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
