<template>
  <div class="form-view">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-title">{{ isEditMode ? 'Editar Exemplo' : 'Novo Exemplo' }}</h1>
        <p class="form-description">
          {{ isEditMode ? 'Edite os dados do exemplo' : 'Preencha os dados para cadastrar um novo exemplo' }}
        </p>
      </div>
      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="nome" class="form-label">Nome <span class="required">*</span></label>
            <input id="nome" v-model="form.nome" type="text" class="form-input" :class="{ 'input-error': errors.nome }" required />
            <span v-if="errors.nome" class="error-message">{{ errors.nome }}</span>
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
          <button type="submit" class="form-button submit-button" :disabled="exemploStore.loading">
            <span v-if="exemploStore.loading">{{ isEditMode ? 'Atualizando...' : 'Salvando...' }}</span>
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
import { useExemploStore } from '@/stores/exemploStore'
import type { Exemplo } from '@/types/exemplo.types'

const router = useRouter()
const route = useRoute()
const exemploStore = useExemploStore()
const errors = reactive<Record<string, string>>({})

const isEditMode = computed(() => !!route.params.id)

const form = reactive<Exemplo>({
  nome: '',
  status: 'ativo',
})

watch(() => exemploStore.exemplo, (newExemplo) => {
  if (newExemplo) {
    populateForm(newExemplo)
  }
})

watch(() => form.nome, () => {
  validateForm()
})

watch(() => form.status, () => {
  validateForm()
})

onMounted(async () => {
  if (isEditMode.value && route.params.id) {
    await exemploStore.fetchExemplo(Number(route.params.id))
  }
})

function populateForm(exemplo: Exemplo) {
  form.nome = exemplo.nome
  form.status = exemplo.status
}

function validateForm(): boolean {
  let valid = true
  Object.keys(errors).forEach(key => { errors[key] = '' })
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
  try {
    if (isEditMode.value && route.params.id) {
      await exemploStore.updateExemplo(Number(route.params.id), form)
    } else {
      await exemploStore.createExemplo(form)
    }
    router.push({ name: 'exemplos' })
  } catch (error) {
    console.error(error)
  }
}

function handleCancel() {
  router.push({ name: 'exemplos' })
}
</script>

<style lang="scss">
@import '@/styles/_form_view.scss';
</style>
