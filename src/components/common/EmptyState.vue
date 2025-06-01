<template>
<div class="empty-state">
    <p>{{ message }}</p>
    <button class="add-button-small" @click="emit('navigateToCreateForm')">
        <span>{{ buttonLabel }}</span>
    </button>
</div>
</template>

<script setup lang="ts">
    // props message
const props = defineProps({
    message: {
        type: String,
        default: 'Nada encontrado.'
    },
    buttonLabel: {
        type: String,
        default: 'Adicionar'
    }
})
const emit = defineEmits(['navigateToCreateForm'])
</script>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 200px;
}
.add-button-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  background-color: $color-primary;
  color: $color-text-primary;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button-small:hover {
  background-color: $color-primary-hover;
}

</style>
