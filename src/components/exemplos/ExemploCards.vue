<template>
  <div class="cards-container">
    <div 
      v-for="exemplo in exemploStore.exemplos" 
      :key="exemplo.id" 
      class="data-card"
    >
      <div class="card-header">
        <h3 class="card-title">{{ exemplo.nome }}</h3>
        <span 
          v-if="exemplo.status === 'ativo'" 
          class="status-badge status-ativo"
        >
          Ativo
        </span>
        <span 
          v-else 
          class="status-badge status-inativo"
        >
          Inativo
        </span>
      </div>
      
      <div class="card-body">
        <div class="card-field">
          <span class="field-label">ID:</span>
          <span class="field-value">{{ exemplo.id }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Data de Criação:</span>
          <span class="field-value">{{ formatDate(exemplo.created_at) }}</span>
        </div>
        <div class="card-field">
          <span class="field-label">Data de Atualização:</span>
          <span class="field-value">{{ formatDate(exemplo.updated_at) }}</span>
        </div>
      </div>
      
      <div class="card-actions">
        <button 
          class="action-button view-button" 
          @click="viewExemplo(exemplo)"
          title="Visualizar"
        >
          <IconView size="16" />
          <span>Visualizar</span>
        </button>
        <button 
          class="action-button edit-button" 
          @click="editExemplo(exemplo)"
          title="Editar"
        >
          <IconEdit size="16" />
          <span>Editar</span>
        </button>
        <button 
          class="action-button delete-button" 
          @click="deleteExemplo(exemplo)"
          title="Excluir"
        >
          <IconDelete size="16" />
          <span>Excluir</span>
        </button>
      </div>
    </div>
  </div>
   <!-- Modal de confirmação de exclusão -->
   <ConfirmationModal
      :show="showDeleteModal"
      title="Excluir Exemplo"
      :message="`Tem certeza que deseja excluir o exemplo '${exemploToDelete?.nome}'? Esta ação não pode ser desfeita.`"
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Exemplo, PaginationMeta, PaginationLinks } from '@/types/exemplo.types';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconDelete from '@/components/icons/IconDelete.vue';
import IconView from '@/components/icons/IconView.vue';
import { useExemploStore } from '@/stores/exemploStore';
import { formatDate } from '@/utils/formatters';
import ConfirmationModal from '@/components/common/ConfirmationModal.vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const exemploStore = useExemploStore()
const showDeleteModal = ref(false)
const exemploToDelete = ref<Exemplo | null>(null)

function sortTable(field: string) {
  exemploStore.sortBy = field;
  exemploStore.sortDirection = exemploStore.sortDirection === 'asc' ? 'desc' : 'asc';
  exemploStore.fetchExemplos();
}

function viewExemplo(exemplo: Exemplo) {
  router.push(`/exemplos/${exemplo.id}`)
}

function editExemplo(exemplo: Exemplo) {
  router.push(`/exemplos/${exemplo.id}/editar`)
} 

function deleteExemplo(exemplo: Exemplo) {
  exemploToDelete.value = exemplo
  showDeleteModal.value = true
}

function confirmDelete() {
  exemploStore.deleteExemplo(exemploToDelete.value!)
  showDeleteModal.value = false
}

</script>

<style lang="scss">
@import '@/styles/_cards_mobile.scss';
</style>
