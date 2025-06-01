<template>
  <div class="details-container" >

    <div v-if="exemploStore.loading" class="loading-container">
      <LoadingSpinner />
    </div>

    <div v-else-if="exemploStore.storeFetchError" class="error-container">
      <ErrorMessage :message="exemploStore.storeFetchError" />
    </div>

    <div v-else-if="exemploStore?.exemplo" class="details">
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
          :class="{ active: activeTab === 'exemplos-aninhados' }"
          @click="activeTab = 'exemplos-aninhados'"
        >
          Exemplos Aninhados
        </div>
      </div>

      <div class="tab-content">
        <div class="detail-header">
          <div class="detail-header-main">
            <h2 class="detail-name">{{ exemploStore.exemplo?.nome }}</h2>
            <div class="detail-actions">
              <button @click="handleEdit" class="edit-button">
                <IconEdit class="icon" />
                Editar Exemplo
              </button>
            </div>
          </div>
          <div class="detail-meta">
            <span class="meta-item">ID: {{ exemploStore.exemplo?.id }}</span>
            <span class="meta-item">Cadastro: {{ formatDate(exemploStore.exemplo?.created_at) }}</span>
          </div>
        </div>

        <!-- Tab Dados Gerais -->
        <div v-if="activeTab === 'dados-gerais'" class="data-section">
          <div class="data-row">
            <div class="data-label">Nome:</div>
            <div class="data-value">{{ exemploStore.exemplo?.nome }}</div>
          </div>
          <!-- status -->
          <div class="data-row">
            <div class="data-label">Status:</div>
            <div class="data-value">{{ exemploStore.exemplo?.status }}</div>
          </div>
        </div>
        
        <!-- Tab Fontes Pagadoras -->
        <div v-if="activeTab === 'exemplos-aninhados'" class="table-section">
          <ExemploCrud />
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Exemplo não encontrado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import { formatDate } from '@/utils/formatters';
import { useExemploStore } from '@/stores/exemploStore'
import ExemploCrud from '@/components/exemplos/ExemploCrud.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('dados-gerais')
const exemploStore = useExemploStore()

const handleEdit = () => {
  if (exemploStore.exemplo?.id) {
    router.push({ name: 'edit-exemplo', params: { id: exemploStore.exemplo.id.toString() } })
  }
}

onMounted(async () => {
    const exemploId = parseInt(route.params.id as string)
    await exemploStore.fetchExemplo(exemploId)
})
</script>

<style scoped lang="scss">
.details-container {
  width: 100%;
  padding: $spacing-lg;
}

.details {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.detail-actions {
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

.detail-header {
  margin-bottom: 0;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-sm;
}

.detail-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
  flex-wrap: wrap;
}

@media (max-width: $mobile-max) {
  .detail-header-main {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  
  .detail-actions {
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

.detail-name {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  flex: 1;
}

.detail-meta {
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

.table-section {
  padding: $spacing-sm 0;
}

.tab-content {
  width: 100%;
}

.detail-header {
  margin-bottom: 0;
}

.detail-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-gray-dark;
  margin: 0 0 $spacing-sm 0;
}

.detail-meta {
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
  .detail-header-main {
    flex-direction: column-reverse;
    align-items: flex-start;
  }
  
  .detail-actions {
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
