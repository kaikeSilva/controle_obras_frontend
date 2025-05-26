<template>
  <main class="app-content" :class="contentClasses">
    <div class="breadcrumbs" v-if="breadcrumbs.length > 0">
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <router-link 
          v-if="index < breadcrumbs.length - 1"
          :to="crumb.path"
          class="breadcrumb-item"
        >
          <IconHome v-if="index === 0" class="breadcrumb-icon" />
          {{ crumb.title }}
        </router-link>
        
        <span v-else class="breadcrumb-item active">
          {{ crumb.title }}
        </span>
        
        <IconChevronRight 
          v-if="index < breadcrumbs.length - 1" 
          class="breadcrumb-separator"
        />
      </template>
    </div>
    
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import IconHome from '@/components/icons/IconHome.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

const router = useRouter()

interface Breadcrumb {
  title: string
  path: string
}

const route = useRoute()
const layoutStore = useLayoutStore()

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'
const breadcrumbStore = useBreadcrumbStore()

const breadcrumbs = computed(() => {
  // Se existe um breadcrumb customizado na meta, use ele
  if (route.meta.breadcrumb && Array.isArray(route.meta.breadcrumb)) {
    // Tenta obter cliente_id do route ou do form (caso não esteja na URL)
    // Busca o cliente_id do breadcrumbStore se não estiver na URL
    let clienteId = route.params.cliente_id
    if (!clienteId && breadcrumbStore.currentClienteId) {
      clienteId = breadcrumbStore.currentClienteId
    }
    // Fallbacks antigos
    if (!clienteId && route.params.id && window.__obraFormClienteId) {
      clienteId = window.__obraFormClienteId
    }
    if (!clienteId && window.__PINIA__ && window.__PINIA__.obrasStore && window.__PINIA__.obrasStore.selectedObra) {
      clienteId = window.__PINIA__.obrasStore.selectedObra.cliente_id
    }
    if (!clienteId && window.__obraForm && window.__obraForm.cliente_id) {
      clienteId = window.__obraForm.cliente_id
    }
    return route.meta.breadcrumb.map((item: any) => {
      if (item.dynamic && typeof item.getPath === 'function') {
        let path = `/clientes/${clienteId}`
        if (breadcrumbStore.activeTab) {
          path += `?active_tab=${breadcrumbStore.activeTab}`
        }
        return {
          title: item.title,
          path
        }
      }
      return item
    })
  }

  // Fallback para lógica padrão
  const crumbs: Breadcrumb[] = [
    { title: 'Home', path: '/' }
  ]
  if (route.meta.title) {
    if (route.path.includes('/usuarios/novo')) {
      crumbs.push(
        { title: 'Usuários', path: '/usuarios' },
        { title: 'Novo Usuário', path: route.path }
      )
    } else if (route.meta.parent) {
      const parentRoute = router.getRoutes().find(r => r.name === route.meta.parent)
      if (parentRoute && parentRoute.meta && parentRoute.meta.title) {
        crumbs.push({
          title: parentRoute.meta.title as string,
          path: parentRoute.path
        })
      }
      crumbs.push({ 
        title: route.meta.title as string, 
        path: route.path 
      })
    } else {
      crumbs.push({ 
        title: route.meta.title as string, 
        path: route.path 
      })
    }
  }
  return crumbs
})

const contentClasses = computed(() => ({
  'sidebar-collapsed': layoutStore.isSidebarCollapsed,
  'sidebar-hidden': !layoutStore.isSidebarVisible
}))
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
