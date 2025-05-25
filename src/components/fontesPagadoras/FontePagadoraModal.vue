<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditMode ? 'Editar' : 'Nova' }} Fonte Pagadora</h3>
        <button class="close-button" @click="closeModal">
          <IconTimes :size="20" />
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="fonte-pagadora-form">
        <div class="modal-body">
          <div class="form-group">
            <label for="nome" class="form-label">Nome <span class="required">*</span></label>
            <input 
              id="nome" 
              v-model="formData.nome" 
              type="text" 
              class="form-input"
              :class="{ 'has-error': validationErrors.nome }"
              placeholder="Nome da fonte pagadora"
              required
            />
            <span v-if="validationErrors.nome" class="error-message">{{ validationErrors.nome }}</span>
          </div>
          
          <div class="form-group">
            <label for="descricao" class="form-label">Descrição</label>
            <textarea 
              id="descricao" 
              v-model="formData.descricao" 
              class="form-textarea"
              :class="{ 'has-error': validationErrors.descricao }"
              placeholder="Descrição detalhada da fonte pagadora"
              rows="3"
            ></textarea>
            <span v-if="validationErrors.descricao" class="error-message">{{ validationErrors.descricao }}</span>
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <div class="toggle-container">
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="formData.ativo"
                  @change="formData.status = formData.ativo ? 'ativo' : 'inativo'"
                />
                <span class="toggle-slider"></span>
              </label>
              <span class="toggle-label">{{ formData.ativo ? 'Ativo' : 'Inativo' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="form-actions">
            <button type="button" class="action-button action-button-cancel" @click="closeModal">Cancelar</button>
            <button type="submit" class="action-button action-button-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting">Salvando...</span>
              <span v-else>{{ isEditMode ? 'Atualizar' : 'Salvar' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FontePagadora } from '@/types/fontePagadora.types'
import IconTimes from '@/components/icons/IconTimes.vue'

interface Props {
  clienteId: number;
  fontePagadora: FontePagadora | null;
  mode: 'create' | 'edit';
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', fontePagadora: Partial<FontePagadora>): void;
}>()

// Form data
const formData = reactive<{
  nome: string;
  descricao: string | null;
  ativo: boolean;
  status: 'ativo' | 'inativo';
}>({
  nome: '',
  descricao: null,
  ativo: true,
  status: 'ativo'
})

// Form state
const isSubmitting = ref(false)
const validationErrors = reactive<Record<string, string>>({})

// Computed
const isEditMode = computed(() => props.mode === 'edit')

// Lifecycle hooks
onMounted(() => {
  if (props.fontePagadora && isEditMode.value) {
    // Preencher o formulário com os dados existentes
    formData.nome = props.fontePagadora.nome
    formData.descricao = props.fontePagadora.descricao
    formData.ativo = props.fontePagadora.ativo
    formData.status = props.fontePagadora.status
  }
})

// Methods
const validateForm = (): boolean => {
  // Limpar erros anteriores
  Object.keys(validationErrors).forEach(key => {
    delete validationErrors[key]
  })
  
  let isValid = true
  
  // Validar nome (obrigatório)
  if (!formData.nome.trim()) {
    validationErrors.nome = 'O nome é obrigatório'
    isValid = false
  } else if (formData.nome.trim().length < 3) {
    validationErrors.nome = 'O nome deve ter pelo menos 3 caracteres'
    isValid = false
  }
  
  // Validar descrição (opcional, mas se preenchida, deve ter pelo menos 5 caracteres)
  if (formData.descricao && formData.descricao.trim().length > 0 && formData.descricao.trim().length < 5) {
    validationErrors.descricao = 'A descrição deve ter pelo menos 5 caracteres'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // Preparar dados para envio
    const fontePagadoraData: Partial<FontePagadora> = {
      nome: formData.nome.trim(),
      descricao: formData.descricao ? formData.descricao.trim() : null,
      ativo: formData.ativo,
      status: formData.status,
      cliente_id: props.clienteId
    }
    
    // Emitir evento de salvamento
    emit('save', fontePagadoraData)
  } catch (error) {
    console.error('Erro ao salvar fonte pagadora:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #111827; /* Texto quase preto para máximo contraste */
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563; /* Cinza mais escuro */
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827; /* Texto quase preto */
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.fonte-pagadora-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937; /* Cinza escuro para melhor legibilidade */
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  color: #1f2937; /* Texto mais escuro */
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
}

.form-input.has-error,
.form-textarea.has-error {
  border-color: var(--color-danger);
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: .4s;
  border-radius: 34px;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #4f46e5;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827; /* Texto mais escuro para melhor contraste */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.action-button {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  min-width: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-button-cancel {
  background-color: #f3f4f6;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.action-button-cancel:hover {
  background-color: #e5e7eb;
  color: #000000;
}

.action-button-submit {
  background-color: #4f46e5;
  color: white;
  font-weight: 700;
  letter-spacing: 0.025em;
}

.action-button-submit:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.action-button-submit:active {
  transform: translateY(0);
}

.action-button-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #6366f1;
}

@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  .modal-overlay {
    padding: 0;
  }
}
</style>
