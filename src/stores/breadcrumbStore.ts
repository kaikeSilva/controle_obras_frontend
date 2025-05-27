import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BreadcrumbItem } from '@/types/breadcrumb.types'

export const useBreadcrumbStore = defineStore('breadcrumb', () => {
  const navigationStack = ref<BreadcrumbItem[]>([])
  const currentContext = ref<BreadcrumbItem | null>(null)

  const buildPath = (route: string, routeMeta: any) => {
    // Verificar se a rota está no navigationStack
    const index = navigationStack.value.findIndex(item => item.route === route)
    
    // Se estiver, atualizar o item com o novo context e truncar
    if (index !== -1) {
      navigationStack.value[index].meta = routeMeta
      updateContext(navigationStack.value[index])
      trimToLevel(index)
      return
    }
    
    // Se não estiver, criar novo item usando apenas o breadcrumb do meta
    const breadcrumbName = routeMeta.meta?.breadcrumb || routeMeta.breadcrumb || routeMeta.title || 'Página'
    const description = routeMeta.meta?.description || routeMeta.description || 'Página'
    const item: BreadcrumbItem = {
      type: 'page',
      id: route,
      name: breadcrumbName,
      description: description,
      route: route,
      params: routeMeta.params || {},
      query: routeMeta.query || {},
      meta: routeMeta
    }
    
    pushBreadcrumbItem(item)
  }

  const pushBreadcrumbItem = (item: BreadcrumbItem) => {
    navigationStack.value.push(item)
    updateContext(item)
  }

  const updateContext = (contextInfo: BreadcrumbItem) => {
    currentContext.value = contextInfo
  }

  const getCurrentContext = () => {
    return currentContext.value
  }

  const updateTabContext = (tabName: string) => {
    if (currentContext.value) {
      currentContext.value.meta.activeTab = tabName
    }
  }

  const getCurrentStack = () => {
    return navigationStack.value
  }

  const trimToLevel = (targetLevel: number) => {
    navigationStack.value = navigationStack.value.slice(0, targetLevel + 1)
    updateContext(navigationStack.value[navigationStack.value.length - 1])
  }

  const clearStack = () => {
    navigationStack.value = []
    currentContext.value = null
  }

  return {
    buildPath,
    pushBreadcrumbItem,
    updateContext,
    getCurrentContext,
    updateTabContext,
    getCurrentStack,
    trimToLevel,
    clearStack,
    navigationStack,
    currentContext
  }
})