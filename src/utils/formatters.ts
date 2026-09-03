/**
 * @file utils/formatters.ts
 * @description Funções de formatação de dados para exibição na interface.
 * Este arquivo contém utilitários para formatar valores, datas e textos.
 */

/**
 * Formata um valor numérico para o formato de moeda brasileira (BRL)
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado como R$ X.XXX,XX
 *
 * @example
 * // Retorna "R$ 1.500,00"
 * formatCurrency(1500)
 *
 * @example
 * // Retorna "R$ -250,50"
 * formatCurrency(-250.5)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data ISO para o formato brasileiro
 * @param {string} dateString - Data no formato ISO ou string parseável
 * @param {boolean} includeTime - Se deve incluir a hora (padrão: false)
 * @returns {string} Data formatada como DD/MM/AAAA ou DD/MM/AAAA HH:MM
 *
 * @example
 * // Retorna "03/09/2026"
 * formatDate('2026-09-03')
 *
 * @example
 * // Retorna "03/09/2026 14:30"
 * formatDate('2026-09-03T14:30:00', true)
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };

  return date.toLocaleDateString('pt-BR', options);
};

/**
 * Formata uma data para o formato ISO (YYYY-MM-DD) para inputs
 * @param {Date} date - Objeto Date a ser formatado
 * @returns {string} Data no formato YYYY-MM-DD
 *
 * @example
 * // Retorna "2026-09-03"
 * toInputDate(new Date())
 */
export const toInputDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formata um número para exibição com separadores de milhar
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Casas decimais (padrão: 2)
 * @returns {string} Valor formatado
 *
 * @example
 * // Retorna "1.500,00"
 * formatNumber(1500)
 *
 * @example
 * // Retorna "1.500,5"
 * formatNumber(1500.5, 1)
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formata um percentual para exibição
 * @param {number} value - Valor do percentual (ex: 0.15 para 15%)
 * @returns {string} Percentual formatado
 *
 * @example
 * // Retorna "15,00%"
 * formatPercentage(0.15)
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Trunca um texto e adiciona reticências se ultrapassar o limite
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 *
 * @example
 * // Retorna "Esta é uma descrição muito..."
 * truncateText('Esta é uma descrição muito longa', 25)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} text - Texto a ser capitalizado
 * @returns {string} Texto com primeira letra maiúscula
 *
 * @example
 * // Retorna "Alimentação"
 * capitalizeFirstLetter('alimentação')
 */
export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Gera uma cor aleatória em formato hexadecimal
 * @returns {string} Cor hexadecimal (#XXXXXX)
 *
 * @example
 * // Retorna "#A3F2B1"
 * getRandomColor()
 */
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Calcula o total de um array de valores
 * @param {number[]} values - Array de valores
 * @returns {number} Soma total
 *
 * @example
 * // Retorna 10
 * calculateTotal([1, 2, 3, 4])
 */
export const calculateTotal = (values: number[]): number => {
  return values.reduce((acc, curr) => acc + curr, 0);
};

/**
 * Obtém o nome do mês a partir do índice (0-11)
 * @param {number} monthIndex - Índice do mês (0 = Janeiro, 11 = Dezembro)
 * @returns {string} Nome do mês
 *
 * @example
 * // Retorna "Setembro"
 * getMonthName(8)
 */
export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return months[monthIndex];
};

/**
 * Obtém a abreviação do mês (3 letras)
 * @param {number} monthIndex - Índice do mês (0-11)
 * @returns {string} Abreviação do mês
 *
 * @example
 * // Retorna "Set"
 * getMonthAbbreviation(8)
 */
export const getMonthAbbreviation = (monthIndex: number): string => {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return months[monthIndex];
};
