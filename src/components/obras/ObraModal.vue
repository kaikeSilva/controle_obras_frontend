<template>
  <div class="modal-backdrop" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Editar Obra' : 'Nova Obra' }}</h2>
        <button class="close-button" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitForm" class="obra-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nome" class="form-label">Nome <span class="required">*</span></label>
              <input 
                id="nome" 
                v-model="form.nome" 
                type="text" 
                class="form-input"
                :class="{ 'input-error': validationErrors.nome }"
                required
              />
              <div v-if="validationErrors.nome" class="error-message">
                {{ validationErrors.nome }}
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="descricao" class="form-label">Descrição</label>
              <textarea 
                id="descricao" 
                v-model="form.descricao" 
                class="form-textarea"
                :class="{ 'input-error': validationErrors.descricao }"
                rows="3"
              ></textarea>
              <div v-if="validationErrors.descricao" class="error-message">
                {{ validationErrors.descricao }}
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="endereco" class="form-label">Endereço</label>
              <input 
                id="endereco" 
                v-model="form.endereco" 
                type="text" 
                class="form-input"
                :class="{ 'input-error': validationErrors.endereco }"
              />
              <div v-if="validationErrors.endereco" class="error-message">
                {{ validationErrors.endereco }}
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="area_m2" class="form-label">Área (m²)</label>
              <input 
                id="area_m2" 
                v-model.number="form.area_m2" 
                type="number" 
                step="0.01"
                min="0"
                class="form-input"
                :class="{ 'input-error': validationErrors.area_m2 }"
              />
              <div v-if="validationErrors.area_m2" class="error-message">
                {{ validationErrors.area_m2 }}
              </div>
            </div>
          </div>
          
          <div class="form-row two-columns">
            <div class="form-group">
              <label for="data_inicio" class="form-label">Data de Início <span class="required">*</span></label>
              <input 
                id="data_inicio" 
                v-model="form.data_inicio" 
                type="date" 
                class="form-input"
                :class="{ 'input-error': validationErrors.data_inicio }"
                required
              />
              <div v-if="validationErrors.data_inicio" class="error-message">
                {{ validationErrors.data_inicio }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="prazo_estimado" class="form-label">Prazo Estimado</label>
              <input 
                id="prazo_estimado" 
                v-model="form.prazo_estimado" 
                type="date" 
                class="form-input"
                :class="{ 'input-error': validationErrors.prazo_estimado }"
              />
              <div v-if="validationErrors.prazo_estimado" class="error-message">
                {{ validationErrors.prazo_estimado }}
              </div>
            </div>
          </div>
          
          <div class="form-row two-columns">
            <div class="form-group">
              <label for="valor_estimado" class="form-label">Valor Estimado (R$)</label>
              <input 
                id="valor_estimado" 
                v-model.number="form.valor_estimado" 
                type="number" 
                step="0.01"
                min="0"
                class="form-input"
                :class="{ 'input-error': validationErrors.valor_estimado }"
              />
              <div v-if="validationErrors.valor_estimado" class="error-message">
                {{ validationErrors.valor_estimado }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="taxa_administracao" class="form-label">Taxa de Administração (%)</label>
              <input 
                id="taxa_administracao" 
                v-model.number="form.taxa_administracao" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="form-input"
                :class="{ 'input-error': validationErrors.taxa_administracao }"
              />
              <div v-if="validationErrors.taxa_administracao" class="error-message">
                {{ validationErrors.taxa_administracao }}
              </div>
            </div>
          </div>
          
          <div class="form-row two-columns">
            <div class="form-group">
              <label for="status" class="form-label">Status <span class="required">*</span></label>
              <select 
                id="status" 
                v-model="form.status" 
                class="form-select"
                :class="{ 'input-error': validationErrors.status }"
                required
              >
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
                <option value="pausada">Pausada</option>
              </select>
              <div v-if="validationErrors.status" class="error-message">
                {{ validationErrors.status }}
              </div>
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
            <button type="button" class="cancel-button" @click="closeModal">Cancelar</button>
            <button type="submit" class="submit-button" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>{{ isEditing ? 'Atualizar' : 'Salvar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Obra, ObraForm } from '@/types/obra.types'

// Props
const props = defineProps<{
  show: boolean
  obra?: Obra | null
  clienteId: number
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', form: ObraForm): void
}>()

// Estado
const validationErrors = reactive<Record<string, string>>({})

// Form
const form = reactive<ObraForm>({
  cliente_id: props.clienteId,
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

// Computed
const isEditing = computed(() => !!props.obra)

// Métodos
const resetForm = () => {
  form.cliente_id = props.clienteId
  form.nome = ''
  form.descricao = ''
  form.endereco = ''
  form.area_m2 = null
  form.data_inicio = new Date().toISOString().split('T')[0]
  form.prazo_estimado = ''
  form.valor_estimado = null
  form.taxa_administracao = null
  form.status = 'em_andamento'
  form.ativo = true
  
  // Limpar erros
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
}

const populateForm = () => {
  if (!props.obra) return
  
  form.cliente_id = props.obra.cliente_id
  form.nome = props.obra.nome
  form.descricao = props.obra.descricao || ''
  form.endereco = props.obra.endereco || ''
  form.area_m2 = props.obra.area_m2 || null
  form.data_inicio = props.obra.data_inicio || new Date().toISOString().split('T')[0]
  form.prazo_estimado = props.obra.prazo_estimado || ''
  form.valor_estimado = props.obra.valor_estimado || null
  form.taxa_administracao = props.obra.taxa_administracao || null
  form.status = props.obra.status
  form.ativo = props.obra.ativo
}

const validateForm = (): boolean => {
  let isValid = true
  
  // Limpar erros anteriores
  Object.keys(validationErrors).forEach(key => {
    validationErrors[key] = ''
  })
  
  // Validar nome
  if (!form.nome.trim()) {
    validationErrors.nome = 'O nome é obrigatório'
    isValid = false
  }
  
  // Validar data de início
  if (!form.data_inicio) {
    validationErrors.data_inicio = 'A data de início é obrigatória'
    isValid = false
  }
  
  // Validar status
  if (!form.status) {
    validationErrors.status = 'O status é obrigatório'
    isValid = false
  }
  
  // Validar prazo estimado (se fornecido)
  if (form.prazo_estimado && form.data_inicio && form.prazo_estimado < form.data_inicio) {
    validationErrors.prazo_estimado = 'O prazo estimado deve ser posterior à data de início'
    isValid = false
  }
  
  // Validar área (se fornecida)
  if (form.area_m2 !== null && form.area_m2 <= 0) {
    validationErrors.area_m2 = 'A área deve ser maior que zero'
    isValid = false
  }
  
  // Validar valor estimado (se fornecido)
  if (form.valor_estimado !== null && form.valor_estimado < 0) {
    validationErrors.valor_estimado = 'O valor estimado não pode ser negativo'
    isValid = false
  }
  
  // Validar taxa de administração (se fornecida)
  if (form.taxa_administracao !== null && (form.taxa_administracao < 0 || form.taxa_administracao > 100)) {
    validationErrors.taxa_administracao = 'A taxa de administração deve estar entre 0 e 100%'
    isValid = false
  }
  
  return isValid
}

const submitForm = () => {
  if (!validateForm()) return
  
  emit('save', { ...form })
}

const closeModal = () => {
  emit('close')
}

// Lifecycle hooks
onMounted(() => {
  if (isEditing.value) {
    populateForm()
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1050;
  overflow-y: auto;
  padding-top: 4.5rem; /* Espaço para header */
  box-sizing: border-box;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.obra-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.two-columns {
  flex-direction: row;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  transition: border-color 0.2s;
  width: 100%;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.2);
}

.input-error {
  border-color: #ef4444;
}

.error-message {
  font-size: 0.75rem;
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
  font-size: 0.875rem;
  color: #374151;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  background: white;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  z-index: 2;
}

.cancel-button,
.submit-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 5rem;
}

.cancel-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

.submit-button {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.submit-button:hover:not(:disabled) {
  background-color: #4338ca;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .two-columns {
    flex-direction: column;
  }
  .modal-content {
    max-width: 98vw;
    width: 98vw;
    min-width: 0;
  }
  .modal-header,
  .form-actions {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .modal-body {
    padding: 1rem;
  }
}
</style>
