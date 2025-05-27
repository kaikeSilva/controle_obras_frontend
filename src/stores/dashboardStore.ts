import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardService } from '@/services/dashboardService'
import type { 
  DashboardData, 
  DashboardFiltros,
  DashboardCard,
  DashboardGraficoData
} from '@/types/dashboard.types'

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dashboardData = ref<DashboardData | null>(null)
  
  // Filtros atuais
  const filtros = ref<DashboardFiltros>({
    dataInicio: '2024-06-01',
    dataFim: '2025-06-30',
    obras: [],
    categorias_gasto: []
  })

  // Getters
  const statCards = computed<DashboardCard[]>(() => {
    if (!dashboardData.value || !dashboardData.value.resumo) return []
    console.log("dashboardData.value.resumo.cards", dashboardData.value.resumo.cards)
    return dashboardData.value.resumo.cards || []
  })

  const graficoData = computed<DashboardGraficoData | null>(() => {
    if (!dashboardData.value) return null
    return dashboardData.value.grafico_data || null
  })

  const chartData = computed(() => {
    if (!dashboardData.value || !dashboardData.value.grafico_data) return null
    
    // Verificar se os datasets existem
    const datasets = dashboardData.value.grafico_data.datasets || {}
    
    return {
      gastos: datasets.gastos || [],
      faturamento: datasets.faturamento || [],
      entradas: datasets.entradas || []
    }
  })

  const labels = computed(() => {
    if (!dashboardData.value || !dashboardData.value.grafico_data) return []
    return dashboardData.value.grafico_data.labels || []
  })

  const filtrosDisponiveis = computed(() => {
    if (!dashboardData.value) return { obras: [], categorias_gasto: [] }
    return dashboardData.value.filtros_disponiveis || { obras: [], categorias_gasto: [] }
  })

  // Ações
  async function fetchDashboardData() {
    isLoading.value = true
    error.value = null
    
    try {
      console.log('Buscando dados do dashboard com filtros:', filtros.value)
      dashboardData.value = await dashboardService.getDashboardData(filtros.value)
      console.log('Dados do dashboard recebidos:', dashboardData.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard'
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      isLoading.value = false
    }
  }

  function updateFiltros(novosFiltros: Partial<DashboardFiltros>) {
    filtros.value = { ...filtros.value, ...novosFiltros }
  }

  function resetFiltros() {
    filtros.value = {
      dataInicio: '2024-06-01',
      dataFim: '2025-06-30',
      obras: [],
      categorias_gasto: []
    }
  }

  return {
    // Estado
    isLoading,
    error,
    dashboardData,
    filtros,
    
    // Getters
    statCards,
    graficoData,
    chartData,
    labels,
    filtrosDisponiveis,
    
    // Ações
    fetchDashboardData,
    updateFiltros,
    resetFiltros
  }
})
