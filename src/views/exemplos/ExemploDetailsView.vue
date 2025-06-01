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
          carregar outro componente de CRUD aqui
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

<style lang="scss">
@import '@/styles/_detail_view.scss';
</style>
