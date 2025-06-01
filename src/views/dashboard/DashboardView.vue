<template>
  <div class="dashboard-container">
    <!-- Page Header
    <div class="dashboard-header">
      <h1 class="dashboard-title">Fluxo Financeiro</h1>
      <p class="dashboard-description">Acompanhe o desempenho financeiro da sua empresa</p>
    </div> -->
    
    <!-- Filters Section -->
    <DashboardFilter @filter-applied="handleFilterApplied" @filter-cleared="handleFilterCleared" />

    <!-- Loading Indicator -->
    <div v-if="dashboardStore.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Carregando dados...</p>
    </div>

    <!-- Error Message -->
    <div v-else-if="dashboardStore.error" class="error-container">
      <p class="error-message">{{ dashboardStore.error }}</p>
      <button class="retry-button" @click="dashboardStore.fetchDashboardData()">Tentar novamente</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Grid -->
      <div class="stats-grid">
        <DashboardCard 
          v-for="(card, index) in dashboardStore.statCards" 
          :key="index"
          :title="card.title"
          :value="card.value"
          :icon="card.icon"
          :change="card.change"
        />
      </div>

      <!-- Chart Section -->
      <DashboardMonthEvolution :chartData="filteredData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import IconCircleCheck from '@/components/icons/IconCircleCheck.vue'
import IconMoney from '@/components/icons/IconMoney.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import DashboardMonthEvolution from '@/components/dashboard/DashboardMonthEvolution.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { DashboardFiltros } from '@/types/dashboard.types'


// Usar a store do dashboard
const dashboardStore = useDashboardStore()

// Inicializar o carregamento dos dados
onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})

// Usar os dados da store em vez de dados mockados
const filteredData = computed(() => {
  return dashboardStore.chartData || {
    gastos: [],
    faturamento: [],
    entradas: []
  }
})

// Funções para lidar com os eventos de filtro
async function handleFilterApplied(filters: any) {
  console.log('Filtros recebidos do componente:', filters)
  
  // Converter os filtros do componente para o formato esperado pela API
  const dashboardFiltros: DashboardFiltros = {
    dataInicio: filters.dataInicio,
    dataFim: filters.dataFim,
    obras: [],
    categorias_gasto: []
  }
  
  // Se houver obras selecionadas, converter para o formato esperado
  if (filters.obras && filters.obras.length > 0) {
    // Mapear os IDs das obras para números
    dashboardFiltros.obras = filters.obras.map((id: any) => {
      return typeof id === 'number' ? id : parseInt(id.toString())
    }).filter((id: number) => !isNaN(id))
  }
  
  // Se houver categorias selecionadas, converter para o formato esperado
  if (filters.categorias_gasto && filters.categorias_gasto.length > 0) {
    // Mapear os IDs das categorias para números
    dashboardFiltros.categorias_gasto = filters.categorias_gasto.map((id: any) => {
      return typeof id === 'number' ? id : parseInt(id.toString())
    }).filter((id: number) => !isNaN(id))
  } else if (filters.categorias && filters.categorias.length > 0) {
    // Compatibilidade com o componente DashboardFilter que usa 'categorias' em vez de 'categorias_gasto'
    dashboardFiltros.categorias_gasto = filters.categorias.map((id: any) => {
      return typeof id === 'number' ? id : parseInt(id.toString())
    }).filter((id: number) => !isNaN(id))
  }
  
  console.log('Filtros convertidos para a API:', dashboardFiltros)
  
  // Atualizar os filtros na store e buscar os dados atualizados
  dashboardStore.updateFiltros(dashboardFiltros)
  await dashboardStore.fetchDashboardData()
}

async function handleFilterCleared() {
  
  // Resetar os filtros na store e buscar os dados originais
  dashboardStore.resetFiltros()
  await dashboardStore.fetchDashboardData()
}

// O gráfico é atualizado automaticamente quando filteredData muda
// pois o componente DashboardMonthEvolution observa as mudanças na prop chartData

// Não é mais necessário inicializar o gráfico aqui, pois isso foi movido para o componente DashboardMonthEvolution
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 20px;
  
  .dashboard-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .dashboard-description {
    font-size: 14px;
    color: #6b7280;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6b7280;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #3b82f6;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

/* Error Styles */
.error-container {
  background-color: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 6px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
  
  .error-message {
    color: #b91c1c;
    margin-bottom: 12px;
  }
  
  .retry-button {
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #dc2626;
    }
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* As configurações de responsividade do gráfico foram movidas para o componente DashboardMonthEvolution */
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-title {
    font-size: 20px;
  }
}
</style>
