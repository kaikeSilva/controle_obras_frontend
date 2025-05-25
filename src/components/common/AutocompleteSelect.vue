<template>
  <div class="autocomplete-select">
    <label v-if="label" :for="id" class="select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    
    <div class="select-container" :class="{ 'has-error': error }">
      <select 
        :id="id" 
        v-model="selectedValue"
        class="select-input"
        :disabled="disabled || loading"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <div class="select-icon">
        <div v-if="loading" class="select-spinner"></div>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="helpText" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Option {
  value: number | string
  label: string
}

interface Props {
  modelValue?: number | string
  options: Option[]
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  error?: string
  helpText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  label: '',
  placeholder: 'Selecione uma opção',
  required: false,
  disabled: false,
  loading: false,
  error: '',
  helpText: '',
  id: () => `select-${Math.random().toString(36).substring(2, 9)}`
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
  (e: 'change', value: number | string): void
}>()

const selectedValue = ref(props.modelValue)

// Atualizar o valor selecionado quando o modelValue mudar
watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue
})

// Emitir evento quando o valor selecionado mudar
watch(selectedValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleChange = () => {
  emit('change', selectedValue.value)
}
</script>

<style scoped>
.autocomplete-select {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.select-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.required {
  color: #dc2626;
  margin-left: 0.125rem;
}

.select-container {
  position: relative;
  width: 100%;
}

.select-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.select-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(79, 70, 229, 0.2);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.has-error .select-input {
  border-color: #dc2626;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
  font-weight: 500;
}

.help-text {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
</style>
