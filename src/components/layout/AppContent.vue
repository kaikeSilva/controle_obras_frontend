<template>
  <main class="app-content" :class="contentClasses">
    <Breadcrumb />
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useLayoutStore } from '@/stores/layout'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

const breadcrumbStore = useBreadcrumbStore()
const route = useRoute()
const layoutStore = useLayoutStore()

const contentClasses = computed(() => ({
  'sidebar-collapsed': layoutStore.isSidebarCollapsed,
  'sidebar-hidden': !layoutStore.isSidebarVisible
}))

// Função para atualizar breadcrumb
const updateBreadcrumb = () => {
  breadcrumbStore.buildPath(route.path, {
    name: route.meta.name,
    breadcrumb: route.meta.breadcrumb,
    title: route.meta.title,
    description: route.meta.description,
    params: route.params,
    query: route.query,
    meta: route.meta
  })
}

// Watch para mudanças de rota
watch(() => route.path, updateBreadcrumb, { immediate: true })

// OnMounted como fallback
onMounted(() => {
  updateBreadcrumb()
})
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

.content-wrapper {
  padding: 0;
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