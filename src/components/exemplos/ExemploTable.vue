<template>
  <div class="table-container">
    <!-- Desktop View - Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th @click="sortTable('id')" class="sortable-header">
            ID
            <span v-if="exemploStore.sortBy === 'id'" class="sort-icon">
              {{ exemploStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('nome')" class="sortable-header">
            Nome
            <span v-if="exemploStore.sortBy === 'nome'" class="sort-icon">
              {{ exemploStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('status')" class="sortable-header">
            Status
            <span v-if="exemploStore.sortBy === 'status'" class="sort-icon">
              {{ exemploStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('created_at')" class="sortable-header">
            Data de Criação
            <span v-if="exemploStore.sortBy === 'created_at'" class="sort-icon">
              {{ exemploStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="sortTable('updated_at')" class="sortable-header">
            Data de Atualização
            <span v-if="exemploStore.sortBy === 'updated_at'" class="sort-icon">
              {{ exemploStore.sortDirection === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="exemplo in exemploStore.exemplos" :key="exemplo.id" class="table-row">
          <td>{{ exemplo.id }}</td>
          <td>{{ exemplo.nome }}</td>
          <td>{{ exemplo.status }}</td>
          <td>{{ formatDate(exemplo.created_at) }}</td>
          <td>{{ formatDate(exemplo.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button 
                class="action-button view-button" 
                @click="viewExemplo(exemplo)"
                title="Visualizar"
              >
                <IconView size="16" />
              </button>
              <button 
                class="action-button edit-button" 
                @click="editExemplo(exemplo)"
                title="Editar"
              >
                <IconEdit size="16" />
              </button>
              <button 
                class="action-button delete-button" 
                @click="deleteExemplo(exemplo)"
                title="Excluir"
              >
                <IconDelete size="16" />
              </button>
            </div>
          </td>
          
        </tr>
      </tbody>
    </table>

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
  </div>
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
@import '@/styles/_table_view.scss';
</style>
