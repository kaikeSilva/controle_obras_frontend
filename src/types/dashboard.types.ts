// Definições de tipos para o dashboard

// Tipos para os cards
export interface DashboardCardChange {
  direction: string;
  value: string;
  isPositive: boolean;
}

export interface DashboardCard {
  title: string;
  value: string;
  icon: string;
  change: DashboardCardChange;
}

// Tipos para o resumo
export interface DashboardResumoValoresBrutos {
  total_gastos: number;
  total_entradas: number;
  total_faturamento: number;
  saldo_liquido: number;
}

export interface DashboardResumo {
  valores_brutos: DashboardResumoValoresBrutos;
  cards: DashboardCard[];
}

// Tipos para evolução mensal
export interface DashboardEvolucaoMensal {
  mes: string;
  mes_nome: string;
  mes_ano: string;
  ano: number;
  gastos: number;
  entradas: number;
  faturamento: number;
}

// Tipos para o gráfico
export interface DashboardGraficoDatasets {
  gastos: number[];
  faturamento: number[];
  entradas: number[];
}

export interface DashboardGraficoData {
  labels: string[];
  datasets: DashboardGraficoDatasets;
}

// Tipos para filtros disponíveis
export interface DashboardObra {
  id: number;
  nome: string;
  status: string;
  status_formatado: string;
}

export interface DashboardCategoriaGasto {
  id: number;
  nome: string;
  cor: string;
}

export interface DashboardFiltrosDisponiveis {
  obras: DashboardObra[];
  categorias_gasto: DashboardCategoriaGasto[];
}

// Tipo principal para os dados do dashboard
export interface DashboardData {
  resumo: DashboardResumo;
  evolucao_mensal: DashboardEvolucaoMensal[];
  grafico_data: DashboardGraficoData;
  filtros_disponiveis: DashboardFiltrosDisponiveis;
}

// Tipo para os filtros do dashboard
export interface DashboardFiltros {
  dataInicio: string;
  dataFim: string;
  obras: number[];
  categorias_gasto: number[];
}
