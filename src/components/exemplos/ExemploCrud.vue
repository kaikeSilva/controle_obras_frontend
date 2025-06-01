<template>
    <div class="exemplo-view">
      <div class="filter-and-actions">
        <ExemploFilter/>
        <button class="add-button" @click="navigateToCreateForm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>Adicionar</span>
          </button>
      </div>
      <Pagination v-if="canShowPagination"
      :current-page="exemploStore.pagination.current_page" 
      :total-pages="exemploStore.pagination.last_page" 
      :total="exemploStore.pagination.total" 
      :per-page="exemploStore.pagination.per_page"
      :from="exemploStore.pagination.from || 0"
      :to="exemploStore.pagination.to || 0"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
      />
      <EmptyState v-if="canShowEmptyState" 
      message="Nenhum exemplo encontrado."
      buttonLabel="Adicionar Exemplo"
      @navigateToCreateForm="navigateToCreateForm"/>
      <ErrorMessage v-if="canShowErrorMessage"
      :message="exemploStore.storeFetchError" @retry="clearError" />
      <LoadingSpinner v-if="exemploStore.loading" />
      <!-- Desktop Table -->
      <ExemploTable v-if="canShowTable" />
       <!-- Mobile Cards -->
       <ExemploCards v-if="layoutStore.isViewMobile"/>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useExemploStore } from '@/stores/exemploStore';
  import ExemploFilter from '@/components/exemplos/ExemploFilter.vue';
  import Pagination from '@/components/common/Pagination.vue';
  import ExemploTable from '@/components/exemplos/ExemploTable.vue';
  import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
  import ErrorMessage from '@/components/common/ErrorMessage.vue';
  import EmptyState from '@/components/common/EmptyState.vue';
  import { useRouter } from 'vue-router';
  import ExemploCards from '@/components/exemplos/ExemploCards.vue';
  import { useLayoutStore } from '@/stores/layout'
  
  const layoutStore = useLayoutStore()
  const router = useRouter()
  const exemploStore = useExemploStore()
  
  onMounted(() => {
    console.log('ExemploView mounted');
  });
  
  const getTotalExemplos = computed(() => {
    return exemploStore.exemplos.length
  })
  
  const canShowPagination = computed(() => {
    return exemploStore.pagination && exemploStore.pagination.last_page > 0 && !exemploStore.storeFetchError && !exemploStore.loading && exemploStore.exemplos.length > 0
  })
  
  const canShowTable = computed(() => {
    return !exemploStore.storeFetchError && !exemploStore.loading && exemploStore.exemplos.length > 0 && !layoutStore.isViewMobile
  })
  
  const canShowEmptyState = computed(() => {
    return !exemploStore.storeFetchError && !exemploStore.loading && exemploStore.exemplos.length === 0
  })
  
  const canShowErrorMessage = computed(() => {
    return exemploStore.storeFetchError && !exemploStore.loading
  })
  
  const handlePageChange = (page: number) => {
    exemploStore.pagination.current_page = page
    exemploStore.fetchExemplos()
  }
  
  const handlePerPageChange = (perPage: number) => {
    exemploStore.pagination.per_page = perPage
    exemploStore.fetchExemplos()
  }
  
  const clearError = () => {
    exemploStore.storeFetchError = null
    exemploStore.fetchExemplos()
  }
  
  const navigateToCreateForm = () => {
    router.push({ name: 'new-exemplo' })
  }
  </script>
  
  <style scoped lang="scss">
  .exemplo-view {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
  }
  
  .add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    white-space: nowrap;
    height: 38px;
    min-width: 120px;
  }
  
  .add-button:hover {
    background-color: #4338ca;
    transform: translateY(-1px);
  }
  
  .add-button:active {
    transform: translateY(0);
  }
  
  .add-button svg {
    width: 1rem;
    height: 1rem;
  }
  
  .add-button-small svg {
    width: 1rem;
    height: 1rem;
  }
  
  .filter-and-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    gap: 0.75rem;
  
    @media (max-width: 768px) {
      flex-direction: column;
      gap: $spacing-sm;
  
      .add-button {
        width: 100%;
      }
    }
  }
  
  </style>
  