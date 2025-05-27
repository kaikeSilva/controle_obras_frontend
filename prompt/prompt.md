<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Fluxo Financeiro</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }

        /* Top Bar */
        .top-bar {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 24px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            background: #e2e8f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
        }

        .user-details {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .user-name {
            font-size: 14px;
            font-weight: 500;
            color: #0f172a;
        }

        .user-role {
            font-size: 12px;
            color: #64748b;
        }

        /* Main Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px 24px;
        }

        /* Page Header */
        .page-header {
            margin-bottom: 24px;
        }

        .page-title {
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
        }

        .page-subtitle {
            font-size: 16px;
            color: #64748b;
        }

        /* Filters Section */
        .filters-section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
        }

        .filters-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        .filters-title {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .filters-actions {
            display: flex;
            gap: 8px;
        }

        .btn-secondary {
            padding: 8px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background: #ffffff;
            color: #64748b;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-secondary:hover {
            border-color: #cbd5e1;
            color: #475569;
        }

        .btn-primary {
            padding: 8px 16px;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            background: #3b82f6;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-primary:hover {
            background: #2563eb;
            border-color: #2563eb;
        }

        .filters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .filter-label {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .filter-control {
            position: relative;
        }

        .filter-select,
        .filter-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            color: #374151;
            background: #ffffff;
            transition: border-color 0.2s ease;
        }

        .filter-select:focus,
        .filter-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .date-range-group {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 8px;
            align-items: end;
        }

        .date-separator {
            padding: 0 8px;
            color: #64748b;
            font-size: 14px;
            text-align: center;
            line-height: 40px;
        }

        .filter-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: #dbeafe;
            color: #1e40af;
            font-size: 12px;
            border-radius: 16px;
            margin-top: 4px;
        }

        .active-filters {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f3f4f6;
        }

        .active-filters-title {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
        }

        .filters-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.2s ease;
        }

        .stat-card:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-color: #cbd5e1;
        }

        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .stat-title {
            font-size: 14px;
            font-weight: 500;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-icon {
            width: 20px;
            height: 20px;
            color: #94a3b8;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 8px;
        }

        .stat-change {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
            font-weight: 500;
        }

        .change-positive {
            color: #059669;
        }

        .change-negative {
            color: #dc2626;
        }

        .change-neutral {
            color: #64748b;
        }

        /* Chart Section */
        .chart-section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 32px;
        }

        .chart-header {
            margin-bottom: 32px;
        }

        .chart-title {
            font-size: 24px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 8px;
        }

        .chart-subtitle {
            font-size: 14px;
            color: #64748b;
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
        }

        .tip-icon {
            margin-right: 6px;
        }

        .chart-wrapper {
            position: relative;
            height: 400px;
            margin-top: 24px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .top-bar {
                padding: 0 16px;
            }

            .user-details {
                display: none;
            }

            .container {
                padding: 24px 16px;
            }

            .page-title {
                font-size: 24px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }

            .chart-section {
                padding: 24px 16px;
            }

            .chart-wrapper {
                height: 300px;
            }
        }

        @media (max-width: 480px) {
            .logo {
                font-size: 16px;
            }

            .page-title {
                font-size: 20px;
            }

            .stat-value {
                font-size: 24px;
            }

            .chart-title {
                font-size: 20px;
            }
        }

        /* Icons */
        .icon {
            display: inline-block;
            width: 1em;
            height: 1em;
            stroke-width: 0;
            stroke: currentColor;
            fill: currentColor;
        }
    </style>
</head>
<body>
    <!-- Top Bar -->
    <div class="top-bar">
        <div class="logo">Dashboard</div>
        <div class="user-info">
            <div class="user-details">
                <div class="user-name">João Silva</div>
                <div class="user-role">Administrador</div>
            </div>
            <div class="user-avatar">JS</div>
        </div>
    </div>

    <!-- Main Container -->
    <div class="container">
        <!-- Filters Section -->
        <div class="filters-section">
            <div class="filters-header">
                <div class="filters-title">
                    <svg class="icon" style="width: 20px; height: 20px;" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z"/>
                    </svg>
                    Filtros
                </div>
                <div class="filters-actions">
                    <button class="btn-secondary" onclick="clearFilters()">Limpar</button>
                    <button class="btn-primary" onclick="applyFilters()">Aplicar</button>
                </div>
            </div>

            <div class="filters-grid">
                <div class="filter-group">
                    <label class="filter-label">
                        <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,3L2,12H5V20H19V12H22L12,3M9,8A1,1 0 0,1 10,9A1,1 0 0,1 9,10A1,1 0 0,1 8,9A1,1 0 0,1 9,8M9,10.5C10.25,10.5 11.25,11.5 11.25,12.75C11.25,14 10.25,15 9,15C7.75,15 6.75,14 6.75,12.75C6.75,11.5 7.75,10.5 9,10.5M15,12H18V18H15V12Z"/>
                        </svg>
                        Obra
                    </label>
                    <div class="filter-control">
                        <select class="filter-select" id="obraFilter">
                            <option value="">Todas as obras</option>
                            <option value="obra1">Residencial Vila Nova</option>
                            <option value="obra2">Edifício Comercial Centro</option>
                            <option value="obra3">Shopping Mall Norte</option>
                            <option value="obra4">Condomínio Jardins</option>
                            <option value="obra5">Hospital Regional</option>
                        </select>
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z"/>
                        </svg>
                        Categoria de Gasto
                    </label>
                    <div class="filter-control">
                        <select class="filter-select" id="categoriaFilter">
                            <option value="">Todas as categorias</option>
                            <option value="material">Material de Construção</option>
                            <option value="mao-obra">Mão de Obra</option>
                            <option value="equipamentos">Equipamentos</option>
                            <option value="transporte">Transporte</option>
                            <option value="servicos">Serviços Terceirizados</option>
                            <option value="administrativo">Administrativo</option>
                        </select>
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <svg class="icon" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z"/>
                        </svg>
                        Período
                    </label>
                    <div class="date-range-group">
                        <input type="date" class="filter-input" id="dataInicio" value="2025-01-01">
                        <div class="date-separator">até</div>
                        <input type="date" class="filter-input" id="dataFim" value="2025-06-30">
                    </div>
                </div>
            </div>

            <div class="active-filters" id="activeFilters" style="display: none;">
                <div class="active-filters-title">Filtros Ativos</div>
                <div class="filters-tags" id="filtersTags"></div>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">Total Gastos</div>
                    <svg class="stat-icon icon" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <div class="stat-value">R$ 303,0K</div>
                <div class="stat-change change-negative">
                    <span>↗</span> +4,2% vs mês anterior
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">Faturamento</div>
                    <svg class="stat-icon icon" viewBox="0 0 24 24">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                    </svg>
                </div>
                <div class="stat-value">R$ 570,0K</div>
                <div class="stat-change change-positive">
                    <span>↗</span> +12,8% vs mês anterior
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">Entradas de Recurso</div>
                    <svg class="stat-icon icon" viewBox="0 0 24 24">
                        <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                </div>
                <div class="stat-value">R$ 198,0K</div>
                <div class="stat-change change-positive">
                    <span>↗</span> +18,5% vs mês anterior
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-title">Saldo Líquido</div>
                    <svg class="stat-icon icon" viewBox="0 0 24 24">
                        <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H4.5C3.12 2 2 3.12 2 4.5v15C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 3.12 20.88 2 19.5 2zM20 19.5c0 .28-.22.5-.5.5h-15c-.28 0-.5-.22-.5-.5v-15c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5v15z"/>
                    </svg>
                </div>
                <div class="stat-value">R$ 465,0K</div>
                <div class="stat-change change-positive">
                    <span>↗</span> +15,3% vs mês anterior
                </div>
            </div>
        </div>

        <!-- Chart Section -->
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
                <canvas id="barChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        // Dados mockados
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
        };

        // Dados simulados para filtros
        const mockData = {
            obras: {
                'obra1': { name: 'Residencial Vila Nova', gastos: [35000, 42000, 38000, 46000, 39000, 43000] },
                'obra2': { name: 'Edifício Comercial Centro', gastos: [55000, 62000, 58000, 66000, 59000, 63000] },
                'obra3': { name: 'Shopping Mall Norte', gastos: [75000, 82000, 78000, 86000, 79000, 83000] }
            },
            categorias: {
                'material': { name: 'Material de Construção', gastos: [25000, 28000, 24000, 32000, 26000, 30000] },
                'mao-obra': { name: 'Mão de Obra', gastos: [15000, 18000, 16000, 19000, 17000, 18000] },
                'equipamentos': { name: 'Equipamentos', gastos: [8000, 12000, 10000, 15000, 11000, 13000] }
            }
        };

        let activeFilters = {
            obra: '',
            categoria: '',
            dataInicio: '2025-01-01',
            dataFim: '2025-06-30'
        };

        // Funções de filtro
        function applyFilters() {
            activeFilters.obra = document.getElementById('obraFilter').value;
            activeFilters.categoria = document.getElementById('categoriaFilter').value;
            activeFilters.dataInicio = document.getElementById('dataInicio').value;
            activeFilters.dataFim = document.getElementById('dataFim').value;

            updateActiveFiltersDisplay();
            updateChartData();
        }

        function clearFilters() {
            document.getElementById('obraFilter').value = '';
            document.getElementById('categoriaFilter').value = '';
            document.getElementById('dataInicio').value = '2025-01-01';
            document.getElementById('dataFim').value = '2025-06-30';
            
            activeFilters = {
                obra: '',
                categoria: '',
                dataInicio: '2025-01-01',
                dataFim: '2025-06-30'
            };

            updateActiveFiltersDisplay();
            updateChartData();
        }

        function updateActiveFiltersDisplay() {
            const activeFiltersDiv = document.getElementById('activeFilters');
            const filtersTags = document.getElementById('filtersTags');
            
            filtersTags.innerHTML = '';
            let hasActiveFilters = false;

            if (activeFilters.obra) {
                const obraName = document.querySelector(`#obraFilter option[value="${activeFilters.obra}"]`).textContent;
                filtersTags.innerHTML += `<span class="filter-badge">Obra: ${obraName}</span>`;
                hasActiveFilters = true;
            }

            if (activeFilters.categoria) {
                const categoriaName = document.querySelector(`#categoriaFilter option[value="${activeFilters.categoria}"]`).textContent;
                filtersTags.innerHTML += `<span class="filter-badge">Categoria: ${categoriaName}</span>`;
                hasActiveFilters = true;
            }

            if (activeFilters.dataInicio !== '2025-01-01' || activeFilters.dataFim !== '2025-06-30') {
                const dataInicioFormatted = new Date(activeFilters.dataInicio).toLocaleDateString('pt-BR');
                const dataFimFormatted = new Date(activeFilters.dataFim).toLocaleDateString('pt-BR');
                filtersTags.innerHTML += `<span class="filter-badge">Período: ${dataInicioFormatted} - ${dataFimFormatted}</span>`;
                hasActiveFilters = true;
            }

            activeFiltersDiv.style.display = hasActiveFilters ? 'block' : 'none';
        }

        function updateChartData() {
            let newData = { ...chartData };

            // Simular aplicação de filtros (em uma aplicação real, isso viria do backend)
            if (activeFilters.obra && mockData.obras[activeFilters.obra]) {
                newData.gastos.data = mockData.obras[activeFilters.obra].gastos;
            }

            if (activeFilters.categoria && mockData.categorias[activeFilters.categoria]) {
                newData.gastos.data = mockData.categorias[activeFilters.categoria].gastos;
            }

            // Atualizar gráfico
            currentChart.data.datasets[0].data = newData.gastos.data;
            currentChart.data.datasets[1].data = newData.faturamento.data;
            currentChart.data.datasets[2].data = newData.entradas.data;
            
            currentChart.update();
        }

        // Configuração do gráfico
        const ctx = document.getElementById('barChart').getContext('2d');
        let currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
                datasets: [
                    {
                        label: 'Gastos',
                        data: chartData.gastos.data,
                        backgroundColor: 'rgba(239, 68, 68, 0.6)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Faturamento',
                        data: chartData.faturamento.data,
                        backgroundColor: 'rgba(34, 197, 94, 0.6)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
                    },
                    {
                        label: 'Entradas de Recurso',
                        data: chartData.entradas.data,
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
                            padding: 20,
                            font: {
                                size: 14,
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            usePointStyle: true,
                            pointStyle: 'rect',
                            color: '#1e293b',
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labels = original.call(this, chart);
                                
                                labels.forEach((label, i) => {
                                    label.fillStyle = chart.data.datasets[i].backgroundColor;
                                    label.strokeStyle = chart.data.datasets[i].borderColor;
                                    label.lineWidth = 1;
                                });
                                
                                return labels;
                            }
                        },
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.datasetIndex;
                            const ci = legend.chart;
                            const meta = ci.getDatasetMeta(index);
                            
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                            ci.update();
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8,
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return context.dataset.label + ': R$ ' + value.toLocaleString('pt-BR');
                            },
                            afterBody: function(tooltipItems) {
                                let total = 0;
                                tooltipItems.forEach(item => {
                                    total += item.parsed.y;
                                });
                                return '\nTotal do mês: R$ ' + total.toLocaleString('pt-BR');
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
                            font: {
                                size: 12,
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            color: '#64748b',
                            callback: function(value) {
                                return 'R$ ' + (value / 1000) + 'K';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            color: '#64748b'
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Animação de entrada dos cards
        window.addEventListener('load', () => {
            const cards = document.querySelectorAll('.stat-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
                card.style.transition = 'all 0.4s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100 + 200);
            });

            // Inicializar filtros
            updateActiveFiltersDisplay();
        });
    </script>
</body>
</html>