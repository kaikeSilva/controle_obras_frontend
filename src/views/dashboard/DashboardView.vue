<template>
  <div class="dashboard-container">
    <!-- Page Header
    <div class="dashboard-header">
      <h1 class="dashboard-title">Fluxo Financeiro</h1>
      <p class="dashboard-description">Acompanhe o desempenho financeiro da sua empresa</p>
    </div> -->
    
    <!-- Filters Section -->
    <DashboardFilter @filter-applied="handleFilterApplied" @filter-cleared="handleFilterCleared" />

    <!-- Stats Grid -->
    <div class="stats-grid">
      <DashboardCard 
        v-for="(card, index) in statCards" 
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconCircleCheck from '@/components/icons/IconCircleCheck.vue'
import IconMoney from '@/components/icons/IconMoney.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import DashboardMonthEvolution from '@/components/dashboard/DashboardMonthEvolution.vue'

// Dados mockados para o gráfico e cards

// Dados mockados para os cards de estatísticas
const statCards = [
  {
    title: 'Total Gastos',
    value: 'R$ 303,0K',
    icon: 'IconCircleCheck',
    change: {
      direction: '↗',
      value: '+4,2%',
      isPositive: false
    }
  },
  {
    title: 'Faturamento',
    value: 'R$ 570,0K',
    icon: 'IconMoney',
    change: {
      direction: '↗',
      value: '+12,8%',
      isPositive: true
    }
  },
  {
    title: 'Entradas de Recurso',
    value: 'R$ 198,0K',
    icon: 'IconPlus',
    change: {
      direction: '↗',
      value: '+18,5%',
      isPositive: true
    }
  },
  {
    title: 'Saldo Líquido',
    value: 'R$ 465,0K',
    icon: 'IconCalendar',
    change: {
      direction: '↗',
      value: '+15,3%',
      isPositive: true
    }
  }
]

// Dados mockados para o gráfico
const chartData = {
  gastos: {
    data: [45000, 52000, 48000, 56000, 49000, 53000]
  },
  faturamento: {
    data: [85000, 92000, 78000, 105000, 98000, 112000]
  },
  entradas: {
    data: [25000, 18000, 35000, 42000, 28000, 50000]
  }
}

// Dados filtrados (inicialmente iguais aos dados originais)
const filteredData = ref({
  gastos: [...chartData.gastos.data],
  faturamento: [...chartData.faturamento.data],
  entradas: [...chartData.entradas.data]
})

// Funções para lidar com os eventos de filtro
function handleFilterApplied(filters: any) {
  console.log('Filtros aplicados:', filters)
  
  // Aqui você aplicaria a lógica real de filtragem com base nos filtros
  // Por enquanto, vamos apenas simular uma alteração nos dados
  if (filters.obra === 'obra1') {
    filteredData.value = {
      gastos: [35000, 42000, 38000, 46000, 39000, 43000],
      faturamento: [65000, 72000, 58000, 85000, 78000, 92000],
      entradas: [20000, 15000, 25000, 32000, 18000, 40000]
    }
  } else if (filters.obra === 'obra2') {
    filteredData.value = {
      gastos: [55000, 62000, 58000, 66000, 59000, 63000],
      faturamento: [95000, 102000, 88000, 115000, 108000, 122000],
      entradas: [30000, 23000, 40000, 47000, 33000, 55000]
    }
  } else if (filters.categoria === 'material') {
    filteredData.value = {
      gastos: [25000, 28000, 24000, 32000, 26000, 30000],
      faturamento: [45000, 52000, 38000, 65000, 58000, 72000],
      entradas: [15000, 10000, 20000, 25000, 13000, 30000]
    }
  } else {
    // Resetar para os dados originais se não houver filtro específico
    filteredData.value = {
      gastos: [...chartData.gastos.data],
      faturamento: [...chartData.faturamento.data],
      entradas: [...chartData.entradas.data]
    }
  }
  
  // Os dados filtrados foram atualizados, o gráfico será atualizado automaticamente
}

function handleFilterCleared() {
  console.log('Filtros limpos')
  
  // Resetar para os dados originais
  filteredData.value = {
    gastos: [...chartData.gastos.data],
    faturamento: [...chartData.faturamento.data],
    entradas: [...chartData.entradas.data]
  }
  
  // Os dados filtrados foram resetados, o gráfico será atualizado automaticamente
}

// O gráfico é atualizado automaticamente quando filteredData muda
// pois o componente DashboardMonthEvolution observa as mudanças na prop chartData

// Não é mais necessário inicializar o gráfico aqui, pois isso foi movido para o componente DashboardMonthEvolution
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 1.5rem;
  width: 100%;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  
  @include dark-mode {
    color: #f1f1f1;
  }
}

.dashboard-description {
  color: #64748b;
  font-size: 0.95rem;
  
  @include dark-mode {
    color: #aaa;
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

/* Estilos para o grid de estatísticas */
/* Os estilos dos cards foram movidos para o componente DashboardCard */

/* Os estilos do gráfico foram movidos para o componente DashboardMonthEvolution */

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
