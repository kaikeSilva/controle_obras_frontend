<template>
  <div class="breadcrumbs">
    <button 
      v-if="canGoBack" 
      @click="goBack" 
      class="back-button"
      title="Voltar"
    >
      <IconChevronLeft size="16" class="back-icon" />
    </button>
    
    <template v-for="(item, index) in navigationStack" :key="index">
      <router-link 
        v-if="index < navigationStack.length - 1" 
        :to="item.route" 
        class="breadcrumb-item"
      >
        <IconHome v-if="index === 0" class="breadcrumb-icon" />
        {{ item.name }}
      </router-link>
      <span v-else class="breadcrumb-item active">
        {{ item.name }}
      </span>
      
      <IconChevronRight 
        v-if="index < navigationStack.length - 1" 
        class="breadcrumb-separator"
        size="12"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import IconHome from '@/components/icons/IconHome.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
import type { BreadcrumbItem } from '@/types/breadcrumb.types'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const breadcrumbStore = useBreadcrumbStore()

// storeToRefs para manter a reatividade
const { navigationStack } = storeToRefs(breadcrumbStore)

// Verificar se podemos voltar (se há histórico de navegação)
const canGoBack = computed(() => navigationStack.value.length > 1)

// Função para voltar para a rota anterior
const goBack = () => {
  if (navigationStack.value.length > 1) {
    // Obter a rota anterior (penúltimo item da stack)
    const previousIndex = navigationStack.value.length - 2
    const previousRoute = navigationStack.value[previousIndex].route
    
    // Navegar para a rota anterior
    router.push(previousRoute)
  } else {
    // Fallback: usar o histórico do navegador se não houver rota anterior na stack
    router.back()
  }
}
</script>


<style scoped lang="scss">
@import '@/styles/variables';
@import '@/styles/mixins';

.app-content {
  position: fixed;
  top: $header-height;
  left: $sidebar-width;
  right: 0;
  bottom: 0;
  background-color: $background-light;
  transition: left $transition-speed;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  @include dark-mode {
    background-color: $background-dark;
    color: white;
  }
  
  @include mobile-only {
    left: 0;
  }
  
  &.sidebar-collapsed {
    left: $sidebar-collapsed-width;
    
    @include mobile-only {
      left: 0;
    }
  }
  
  &.sidebar-hidden {
    left: 0;
  }
}

.breadcrumbs {
  padding: 0.5rem 1rem; /* Reduced padding to make it more compact */
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.25rem; /* Reduced gap between items */
  font-size: 0.75rem; /* Smaller font size */
  
  @include dark-mode {
    background: #1e1e1e;
    border-bottom-color: #333;
  }
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* Reduced gap */
  color: #666;
  padding: 0.25rem 0.5rem; /* Compact padding */
  
  &.active {
    color: $primary-color;
    font-weight: 500;
  }
  
  i {
    font-size: 0.875rem;
  }
}

.breadcrumb-separator {
  margin: 0 4px; /* Reduced margin */
  color: #6c757d;
  width: 12px; /* Smaller size */
  height: 12px; /* Smaller size */
}

.breadcrumb-icon {
  width: 12px; /* Smaller size */
  height: 12px; /* Smaller size */
  margin-right: 2px; /* Reduced margin */
  vertical-align: -1px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  padding: 4px;
  margin-right: 8px;
  cursor: pointer;
  color: #666;
  transition: background-color 0.2s, color 0.2s;
}

.back-button:hover {
  background-color: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.content-wrapper {
  padding: 0; /* Removed padding to eliminate space between breadcrumbs and content */
  flex: 1;
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  
  & > * {
    width: 100%;
    max-width: 100%;
  }
}
</style>
