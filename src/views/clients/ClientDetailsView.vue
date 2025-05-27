<template>
  <div class="client-details-container" >

    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="error" class="error-container">
      <ErrorMessage :message="error" />
    </div>

    <div v-else-if="client" class="client-details">
      <div class="tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'dados-gerais' }"
          @click="activeTab = 'dados-gerais'"
        >
          Dados Gerais
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'fontes-pagadoras' }"
          @click="activeTab = 'fontes-pagadoras'"
        >
          Fontes Pagadoras
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'obras' }"
          @click="activeTab = 'obras'"
        >
          Obras
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'categorias-gastos' }"
          @click="activeTab = 'categorias-gastos'"
        >
          Categoria de Gastos
        </div>
      </div>

      <div class="tab-content">
        <div class="client-header">
          <div class="client-header-main">
            <h2 class="client-name">{{ client.name }}</h2>
            <div class="client-actions">
              <button @click="handleEdit" class="edit-button">
                <IconEdit class="icon" />
                Editar Cliente
              </button>
              <button @click="showDeleteModal = true" class="delete-button">
                <IconTrash class="icon" />
                Excluir Cliente
              </button>
            </div>
          </div>
          <div class="client-meta">
            <span class="meta-item">ID: {{ client.id }}</span>
            <span class="meta-item">Cadastro: {{ formatDate(client.created_at) }}</span>
          </div>
        </div>

        <!-- Tab Dados Gerais -->
        <div v-if="activeTab === 'dados-gerais'" class="data-section">
          <div class="data-row">
            <div class="data-label">Nome:</div>
            <div class="data-value">{{ client.name }}</div>
          </div>
          <div class="data-row">
            <div class="data-label">Email:</div>
            <div class="data-value">{{ client.email }}</div>
          </div>
          <div class="data-row">
            <div class="data-label">Telefone:</div>
            <div class="data-value">{{ client.phone || '-' }}</div>
          </div>
          <div class="data-row">
            <div class="data-label">Endereço:</div>
            <div class="data-value">{{ client.address || '-' }}</div>
          </div>
          <div class="data-row">
            <div class="data-label">Data de Cadastro:</div>
            <div class="data-value">{{ formatDate(client.created_at) }}</div>
          </div>
          <div class="data-row">
            <div class="data-label">Última Atualização:</div>
            <div class="data-value">{{ formatDate(client.updated_at) }}</div>
          </div>
        </div>
        
        <!-- Tab Fontes Pagadoras -->
        <div v-if="activeTab === 'fontes-pagadoras'" class="fontes-pagadoras-section">
          <FontesPagadorasCrud :cliente-id="client.id" />
        </div>
        
        <!-- Tab Obras -->
        <div v-if="activeTab === 'obras'" class="obras-section">
          <ObrasCrud :clienteId="client.id" />
        </div>
        
        <!-- Tab Categorias de Gastos -->
        <div v-if="activeTab === 'categorias-gastos'" class="categorias-gastos-section">
          <CategoriasGastosCrud :clienteId="client.id" />
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Cliente não encontrado</p>
    </div>
    
    <!-- Modal de confirmação de exclusão -->
    <ConfirmationModal
      :show="showDeleteModal"
      title="Excluir Cliente"
      :message="`Tem certeza que deseja excluir o cliente '${client?.name}'? Esta ação não pode ser desfeita.`"
      confirmText="Excluir"
      cancelText="Cancelar"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientsService } from '@/services/clientsService'
import type { Client } from '@/types/client.types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'
import FontesPagadorasCrud from '@/components/fontesPagadoras/FontesPagadorasCrud.vue'
import ObrasCrud from '@/components/obras/ObrasCrud.vue'
import CategoriasGastosCrud from '@/components/categoriasGastos/CategoriasGastosCrud.vue'

const route = useRoute()
const router = useRouter()
const client = ref<Client | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const notificationStore = useNotificationStore()
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const activeTab = ref('dados-gerais')

// Ativa tab via query param
import { watch } from 'vue'
watch(() => route.query.active_tab, (tab) => {
  if (tab === 'obra' || tab === 'obras') activeTab.value = 'obras'
  else if (tab) activeTab.value = tab
})
if (route.query.active_tab === 'obra' || route.query.active_tab === 'obras') {
  activeTab.value = 'obras'
} else if (route.query.active_tab) {
  activeTab.value = route.query.active_tab as string
}

const handleEdit = () => {
  if (client.value?.id) {
    notificationStore.addNotification(
      'Redirecionando para a edição...',
      'info',
      2000
    )
    
    router.push({ name: 'edit-client', params: { id: client.value.id.toString() } })
  }
}

const handleDelete = async () => {
  if (!client.value?.id) return
  
  try {
    isDeleting.value = true
    
    // Chamar a API para excluir o cliente
    await clientsService.deleteClient(client.value.id)
    
    // Fechar o modal
    showDeleteModal.value = false
    
    // Mostrar notificação de sucesso
    notificationStore.addNotification(
      `Cliente ${client.value.name} excluído com sucesso!`,
      'success',
      5000
    )
    
    // Redirecionar para a lista de clientes
    router.push({ name: 'clients' })
  } catch (err) {
    console.error('Erro ao excluir cliente:', err)
    
    // Mostrar notificação de erro
    notificationStore.addNotification(
      'Ocorreu um erro ao excluir o cliente. Tente novamente.',
      'error',
      5000
    )
    
    // Fechar o modal
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  try {
    const clientId = parseInt(route.params.id as string)
    
    if (isNaN(clientId)) {
      throw new Error('ID do cliente inválido')
    }
    
    // Buscar os dados do cliente
    const response = await clientsService.getClientById(clientId)
    
    client.value = response
    
    loading.value = false
  } catch (err) {
    loading.value = false
    error.value = err instanceof Error ? err.message : 'Erro ao carregar os dados do cliente'
    console.error('Erro ao carregar cliente:', err)
  }
})



const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped lang="scss">
.client-details-container {
  width: 100%;
  padding: $spacing-lg;
}

.client-details {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.client-actions {
  display: flex;
  gap: $spacing-sm;
  margin-left: $spacing-md;
}

.edit-button, .delete-button {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  border: none;
  border-radius: $border-radius;
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  font-weight: 500;
  cursor: pointer;
  transition: background-color $transition-speed;
}

.edit-button {
  background-color: $primary-color;
  color: white;
}

.edit-button:hover {
  background-color: $primary-color-dark;
}

.delete-button {
  background-color: $error-color;
  color: white;
}

.delete-button:hover {
  background-color: $error-color-dark;
}

.edit-button .icon, .delete-button .icon {
  width: $icon-size;
  height: $icon-size;
}

.loading-container, .error-container {
  display: flex;
  justify-content: center;
  padding: $spacing-lg 0;
}

.client-header {
  margin-bottom: 0;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-sm;
}

.client-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
  flex-wrap: wrap;
}

@media (max-width: $mobile-max) {
  .client-header-main {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  
  .client-actions {
    margin-left: 0;
    margin-bottom: $spacing-md;
    width: 100%;
    justify-content: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
  
  .edit-button, .delete-button {
    padding: $spacing-sm $spacing-sm * 1.5;
    font-size: $font-size-sm;
  }
}

.client-name {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  flex: 1;
}

.client-meta {
  display: flex;
  gap: $spacing-md;
  color: $text-gray;
  font-size: $font-size-sm;
}

.meta-item {
  display: inline-block;
}

.tabs {
  display: flex;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-lg;
}

.tab {
  padding: $spacing-sm $spacing-md;
  font-weight: 600;
  color: $text-gray;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all $transition-speed;
  font-size: $font-size-base;
}

.tab:hover {
  color: $primary-color;
  background-color: rgba(79, 70, 229, 0.05);
}

.tab.active {
  color: $primary-color;
  border-bottom-color: $primary-color;
  background-color: rgba(79, 70, 229, 0.08);
  font-weight: 700;
}

.fontes-pagadoras-section,
.obras-section,
.categorias-gastos-section {
  padding: $spacing-sm 0;
}

.tab-content {
  width: 100%;
}

.client-header {
  margin-bottom: 0;
}

.client-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  margin: 0 0 $spacing-sm 0;
}

.client-meta {
  display: flex;
  gap: $spacing-md;
  font-size: $font-size-sm;
  color: $text-gray;
}

.meta-item {
  display: inline-block;
}

.data-section {
  background-color: white;
  border-radius: $border-radius;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  overflow: hidden;
}

.data-row {
  display: flex;
  border-bottom: 1px solid $border-color;
}

.data-row:last-child {
  border-bottom: none;
}

.data-label {
  flex: 0 0 200px;
  padding: $spacing-sm $spacing-md;
  background-color: $bg-gray-light;
  font-weight: 500;
  color: $text-gray-dark;
  border-right: 1px solid $border-color;
  flex-basis: 180px;
  min-width: 150px;
}

.data-value {
  padding: $spacing-sm $spacing-md;
  color: $text-gray;
  flex-grow: 1;
  word-break: break-word;
}

.no-data {
  text-align: center;
  padding: $spacing-xl;
  color: $text-gray;
  font-style: italic;
}

@media (max-width: $mobile-max) {
  .data-row {
    flex-direction: column;
  }
  .data-label {
    border-right: none;
    border-bottom: 1px solid $border-color;
    flex-basis: auto;
  }
  .client-header-main {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  
  .client-actions {
    margin-left: 0;
    margin-bottom: $spacing-md;
    width: 100%;
    justify-content: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
  
  .edit-button, .delete-button {
    padding: $spacing-sm $spacing-sm * 1.5;
    font-size: $font-size-sm;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    border-bottom: 1px solid $border-color;
    &.active {
      border-bottom-color: $primary-color;
    }
  }
}
</style>
