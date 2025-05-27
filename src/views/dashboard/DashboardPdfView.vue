<template>
  <div class="dashboard-container">
    <!-- PDF Controls -->
    <div class="pdf-controls">
      <button @click="generatePDF" :disabled="isGeneratingPdf" class="pdf-button">
        <span v-if="isGeneratingPdf">Gerando PDF...</span>
        <span v-else>📄 Gerar PDF</span>
      </button>
    </div>

    <!-- Conteúdo que será convertido em PDF -->
    <div ref="pdfContent" class="pdf-content">
      <!-- Cabeçalho para PDF (oculto na tela, visível no PDF) -->
      <div class="pdf-header">
        <h1>Relatório Financeiro</h1>
        <p>{{ new Date().toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) }}</p>
        <hr>
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import DashboardFilter from '@/components/dashboard/DashboardFilter.vue'
import DashboardCard from '@/components/dashboard/DashboardCard.vue'
import DashboardMonthEvolution from '@/components/dashboard/DashboardMonthEvolution.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import type { DashboardFiltros } from '@/types/dashboard.types'

// Refs
const pdfContent = ref<HTMLElement | null>(null)
const isGeneratingPdf = ref(false)

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
async function handleFilterApplied(filters: DashboardFiltros) {
  // Converter os filtros do componente para o formato esperado pela API
  const dashboardFiltros: DashboardFiltros = {
    dataInicio: filters.dataInicio,
    dataFim: filters.dataFim,
    obras: [],
    categorias_gasto: []
  }
  
  // Se houver obra selecionada, converter para o formato esperado
  if (filters.obra) {
    // Converter o ID da obra para número
    const obraId = parseInt(filters.obra)
    if (!isNaN(obraId)) {
      dashboardFiltros.obras = [obraId]
    }
  }
  
  // Se houver categoria selecionada, converter para o formato esperado
  if (filters.categoria) {
    // Converter o ID da categoria para número
    const categoriaId = parseInt(filters.categoria)
    if (!isNaN(categoriaId)) {
      dashboardFiltros.categorias_gasto = [categoriaId]
    }
  }
  
  // Atualizar os filtros na store e buscar os dados atualizados
  dashboardStore.updateFiltros(dashboardFiltros)
  await dashboardStore.fetchDashboardData()
}

async function handleFilterCleared() {
  // Resetar os filtros na store e buscar os dados originais
  dashboardStore.resetFiltros()
  await dashboardStore.fetchDashboardData()
}

// Método para gerar PDF
const generatePDF = async () => {
  if (!pdfContent.value || isGeneratingPdf.value) return
  
  isGeneratingPdf.value = true
  
  try {
    // Mostrar cabeçalho para PDF
    const pdfHeader = pdfContent.value.querySelector('.pdf-header') as HTMLElement
    if (pdfHeader) {
      pdfHeader.style.display = 'block'
    }
    
    // Esconder filtros e controles no PDF
    const filters = pdfContent.value.querySelector('.dashboard-filter') as HTMLElement
    const pdfControls = document.querySelector('.pdf-controls') as HTMLElement
    
    const originalFilterDisplay = filters?.style.display
    const originalControlsDisplay = pdfControls?.style.display
    
    if (filters) {
      filters.style.display = 'none'
    }
    if (pdfControls) {
      pdfControls.style.display = 'none'
    }
    
    // Aguardar um momento para garantir que as mudanças de estilo sejam aplicadas
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Configurações do html2canvas
    const canvas = await html2canvas(pdfContent.value, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: pdfContent.value.scrollWidth,
      height: pdfContent.value.scrollHeight,
      onclone: (clonedDoc) => {
        // Garantir que o cabeçalho seja visível no clone
        const clonedHeader = clonedDoc.querySelector('.pdf-header') as HTMLElement
        if (clonedHeader) {
          clonedHeader.style.display = 'block'
        }
      }
    })
    
    // Configurações do PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pdfWidth - 20 // margem de 10mm de cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 10 // margem superior
    
    // Adicionar primeira página
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pdfHeight - 20) // descontar margens
    
    // Adicionar páginas adicionais se necessário
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pdfHeight - 20)
    }
    
    // Salvar PDF
    const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    // Restaurar elementos originais
    if (pdfHeader) {
      pdfHeader.style.display = 'none'
    }
    if (filters) {
      filters.style.display = originalFilterDisplay || ''
    }
    if (pdfControls) {
      pdfControls.style.display = originalControlsDisplay || ''
    }
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF. Tente novamente.')
  } finally {
    isGeneratingPdf.value = false
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* PDF Controls */
.pdf-controls {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  
  .pdf-button {
    background-color: #dc2626;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
    }
  }
}

/* PDF Header - oculto na tela, visível no PDF */
.pdf-header {
  display: none;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  p {
    color: #6b7280;
    font-size: 16px;
    margin-bottom: 20px;
  }
  
  hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 0;
  }
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
  break-inside: avoid;
  page-break-inside: avoid;
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

  .pdf-controls {
    justify-content: center;
    
    .pdf-button {
      width: 100%;
      max-width: 200px;
    }
  }
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

/* Estilos específicos para impressão/PDF */
@media print {
  .pdf-controls {
    display: none !important;
  }
  
  .pdf-header {
    display: block !important;
  }
  
  .dashboard-filter {
    display: none !important;
  }
  
  .dashboard-container {
    padding: 0;
    max-width: none;
  }
  
  .stats-grid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* Garantir que gráficos não quebrem no PDF */
:deep(.chart-container) {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>