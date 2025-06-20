Com o Objetivo de adaptar o front-end para o novo fluxo assíncrono de geração de realtorio de obras na geracao do pdf 
segue a nova estrutura do backend:

O serviço de PDF é acessado através das seguintes rotas da API Laravel:

```
GET  /api/relatorios/gastos              # Solicita geração de um relatório
GET  /api/relatorios/status/{filename}   # Verifica o status de geração
GET  /api/relatorios/download/{filename} # Faz download do PDF gerado
```

## Integração com Laravel

O serviço está integrado ao Laravel através de um job assíncrono:

```php
use App\Jobs\GeneratePdfJob;

// Dispatch do job para a fila
dispatch(new GeneratePdfJob(
    view:     'reports.gastos',
    data:     ['data' => $data],
    filename: 'relatorio_'.now()->format('Ymd_His').'.pdf',
    options:  [
        'landscape' => true, 
        'margin' => [
            'top' => '10mm',
            'right' => '10mm',
            'bottom' => '10mm',
            'left' => '10mm'
        ]
    ],
))->onQueue('pdf');
```

Os PDFs gerados são armazenados no disco `pdfs` configurado em `config/filesystems.php`.

## Integração com Frontend

Para integrar com um frontend (Vue.js, React, etc.), siga este fluxo de exemplo:

```javascript
// 1. Solicitar a geração do PDF
async function solicitarRelatorio(filtros) {
  const response = await fetch('/api/relatorios/gastos?data_inicio=2025-01-01&data_fim=2025-06-01', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.filename; // Nome do arquivo para consultar status
}

// 2. Verificar o status periodicamente
async function verificarStatus(filename) {
  const response = await fetch(`/api/relatorios/status/${filename}`, {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    }
  });
  
  return await response.json();
}

// 3. Implementar polling para verificar status
async function aguardarPDF(filename) {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const status = await verificarStatus(filename);
      
      if (status.status === 'completed') {
        clearInterval(interval);
        resolve(status.download_url);
      }
    }, 2000); // Verificar a cada 2 segundos
  });
}

// 4. Uso completo
async function gerarEBaixarPDF() {
  try {
    // Exibir indicador de carregamento
    showLoading('Solicitando relatório...');
    
    // Solicitar geração
    const filename = await solicitarRelatorio(filtros);
    
    // Atualizar mensagem de carregamento
    updateLoading('Gerando PDF, aguarde...');
    
    // Aguardar conclusão
    const downloadUrl = await aguardarPDF(filename);
    
    // Baixar o arquivo
    hideLoading();
    window.location.href = downloadUrl;
  } catch (error) {
    hideLoading();
    showError('Erro ao gerar relatório');
    console.error(error);
  }
}
```

Este código demonstra como implementar o fluxo completo de solicitação, verificação de status e download do PDF gerado.

hoje esta funcionalidade deve ser construida na pagina de relatorio e deve ser criadas e utilizadas novas rotas no service de obras.

faça esta implementacao dessa nova funcionalidade no sistema, no fluxo:

1. solicitar a geração do PDF - o botao de gerar pdf deve apresentar um loading e deve ser desabilitado
2. verificar o status de geração
3. aguardar a conclusão da geração
4. baixar o PDF gerado
5. exibir uma mensagem de sucesso e o botao de gerar pdf deve ser reabilitado

nao crie novos arquivos nem faca nada alem da funcionalidade solicitada