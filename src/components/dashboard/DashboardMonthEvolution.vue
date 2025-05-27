<template>
  <div class="chart-section">
    <div class="chart-header">
      <h2 class="chart-title">Evolução Mensal</h2>
      <p class="chart-subtitle">Comparativo dos últimos 6 meses por categoria</p>
    </div>

    <div class="chart-controls">
      <div class="chart-tip">
        <span class="tip-icon">💡</span>
        <strong>Dica:</strong> Clique na legenda para mostrar/ocultar categorias
      </div>
    </div>

    <div class="chart-wrapper">
      <canvas ref="barChart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

// Registrar componentes do Chart.js
Chart.register(...registerables)

// Referência para o elemento canvas
const barChart = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// Props para receber os dados do gráfico
const props = defineProps({
  chartData: {
    type: Object,
    required: true,
    validator: (value: any) => {
      return value.gastos && value.faturamento && value.entradas
    }
  },
  labels: {
    type: Array,
    default: () => ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']
  }
})

// Inicializar o gráfico
onMounted(() => {
  initChart()
})

// Observar mudanças nos dados do gráfico
watch(() => props.chartData, (newData) => {
  updateChart()
}, { deep: true })

// Função para inicializar o gráfico
function initChart() {
  if (barChart.value) {
    const ctx = barChart.value.getContext('2d')
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: props.labels,
          datasets: [
            {
              label: 'Gastos',
              data: props.chartData.gastos,
              backgroundColor: 'rgba(239, 68, 68, 0.6)',
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Faturamento',
              data: props.chartData.faturamento,
              backgroundColor: 'rgba(34, 197, 94, 0.6)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Entradas de Recurso',
              data: props.chartData.entradas,
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                pointStyle: 'rect',
                padding: 20,
                color: '#1e293b',
              }
            },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              cornerRadius: 8,
              padding: 12,
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y
                  return context.dataset.label + ': R$ ' + value.toLocaleString('pt-BR')
                },
                afterBody: function(tooltipItems) {
                  let total = 0
                  tooltipItems.forEach(item => {
                    total += item.parsed.y
                  })
                  return '\nTotal do mês: R$ ' + total.toLocaleString('pt-BR')
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f1f5f9',
                borderColor: '#e2e8f0'
              },
              ticks: {
                color: '#64748b',
                callback: function(value) {
                  return 'R$ ' + (value as number / 1000) + 'K'
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#64748b'
              }
            }
          },
          animation: {
            duration: 800
          }
        }
      })
    }
  }
}

// Função para atualizar o gráfico quando os dados mudarem
function updateChart() {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = props.chartData.gastos
    chartInstance.data.datasets[1].data = props.chartData.faturamento
    chartInstance.data.datasets[2].data = props.chartData.entradas
    chartInstance.update()
  }
}
</script>

<style scoped lang="scss">
/* Chart Section */
.chart-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  
  @include dark-mode {
    background: #1e1e1e;
    border-color: #333;
  }
}

.chart-header {
  margin-bottom: 32px;
}

.chart-title {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
  
  @include dark-mode {
    color: #f1f1f1;
  }
}

.chart-subtitle {
  font-size: 14px;
  color: #64748b;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.chart-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.chart-tip {
  text-align: center;
  color: #64748b;
  font-size: 14px;
  padding: 12px 20px;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  @include dark-mode {
    background: #1e293b;
    border-color: #2d3748;
    color: #cbd5e1;
  }
}

.tip-icon {
  margin-right: 4px;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-section {
    padding: 24px 16px;
  }

  .chart-wrapper {
    height: 300px;
  }
}
</style>
