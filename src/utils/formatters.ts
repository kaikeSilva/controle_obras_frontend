export const formatDate = (date?: string | Date): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Adicionar verificação se a data é válida para evitar 'Invalid Date'
  if (isNaN(dateObj.getTime())) return '-'; 
  return dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adicionado UTC para consistência
};

export const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatBoolean = (value?: boolean | null): string => {
  if (value === null || value === undefined) return '-';
  return value ? 'Sim' : 'Não';
};
