dada a rota de api para buscar os dados do dashboard conseus respectivos query params:
http://localhost:8000/api/dashboard?data_inicio=2024-06-01&data_fim=2025-06-30&obras%5B%5D=1&obras%5B%5D=2&categorias_gasto%5B%5D=3&categorias_gasto%5B%5D=7

dada a estrutura de dados retornada pela rota:
{
	"resumo": {
		"valores_brutos": {
			"total_gastos": 0,
			"total_entradas": 382810.66,
			"total_faturamento": 0,
			"saldo_liquido": 382810.66
		},
		"cards": [
			{
				"title": "Total Gastos",
				"value": "R$ 0,00",
				"icon": "IconCircleCheck",
				"change": {
					"direction": "↗",
					"value": "+0,0%",
					"isPositive": false
				}
			},
			{
				"title": "Faturamento",
				"value": "R$ 0,00",
				"icon": "IconMoney",
				"change": {
					"direction": "↗",
					"value": "+0,0%",
					"isPositive": true
				}
			},
			{
				"title": "Entradas de Recurso",
				"value": "R$ 382,8K",
				"icon": "IconPlus",
				"change": {
					"direction": "↗",
					"value": "+0,0%",
					"isPositive": true
				}
			},
			{
				"title": "Saldo Líquido",
				"value": "R$ 382,8K",
				"icon": "IconCalendar",
				"change": {
					"direction": "↗",
					"value": "+0,0%",
					"isPositive": true
				}
			}
		]
	},
	"evolucao_mensal": [
		{
			"mes": "2024-06",
			"mes_nome": "junho",
			"mes_ano": "Jun\/2024",
			"ano": 2024,
			"gastos": 0,
			"entradas": 0,
			"faturamento": 0
		},
		{
			"mes": "2024-07",
			"mes_nome": "julho",
			"mes_ano": "Jul\/2024",
			"ano": 2024,
			"gastos": 0,
			"entradas": 176869.4,
			"faturamento": 0
		},
		{
			"mes": "2024-08",
			"mes_nome": "agosto",
			"mes_ano": "Aug\/2024",
			"ano": 2024,
			"gastos": 0,
			"entradas": 0,
			"faturamento": 0
		},
		{
			"mes": "2024-09",
			"mes_nome": "setembro",
			"mes_ano": "Sep\/2024",
			"ano": 2024,
			"gastos": 0,
			"entradas": 0,
			"faturamento": 0
		},
		{
			"mes": "2024-10",
			"mes_nome": "outubro",
			"mes_ano": "Oct\/2024",
			"ano": 2024,
			"gastos": 0,
			"entradas": 18299.9,
			"faturamento": 0
		},
    ...
	],
	"grafico_data": {
		"labels": [
			"junho",
			"julho",
			"agosto",
			"setembro",
			"outubro",
			"novembro",
			"dezembro",
			"janeiro",
			"fevereiro",
			"março",
			"abril",
			"maio",
			"junho"
		],
		"datasets": {
			"gastos": [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			],
			"faturamento": [
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			],
			"entradas": [
				0,
				176869.4,
				0,
				0,
				18299.9,
				25396.17,
				0,
				66796.37,
				0,
				0,
				95448.82,
				0,
				0
			]
		}
	},
	"filtros_disponiveis": {
		"obras": [
			{
				"id": 4,
				"nome": "Bashirian-Ullrich",
				"status": "em_andamento",
				"status_formatado": "Em Andamento"
			},
			{
				"id": 19,
				"nome": "Bechtelar-O'Hara",
				"status": "em_andamento",
				"status_formatado": "Em Andamento"
			},
      ...
		],
		"categorias_gasto": [
			{
				"id": 3,
				"nome": "Alimentação",
				"cor": "#2ecc71"
			},
			{
				"id": 7,
				"nome": "Despesas de equipamentos 9706",
				"cor": "#8b375c"
			},
      ...
		]
	}
}
construa o store datatypes e services para o dashboard e utilize os mesmos para substituir os dados mocados