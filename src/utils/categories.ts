/**
 * @file utils/categories.ts
 * @description Mapa de palavras-chave para categorias compartilhado entre
 * o parser de transações e o detector de comandos do chat.
 */

export interface CategoryKeywords {
  keywords: string[];
  category: string;
}

export const CATEGORY_MAP: CategoryKeywords[] = [
  {
    keywords: ['mercado', 'supermercado', 'compra', 'almoço', 'almoco',
      'jantar', 'café', 'cafe', 'restaurante', 'lanche', 'padaria',
      'açougue', 'acougue', 'feira', 'refeição', 'refeicao', 'comida',
      'leite', 'pão', 'paes', 'arroz', 'feijão', 'carne', 'ovo',
      'frango', 'peixe', 'legume', 'fruta', 'hortifruti'],
    category: 'Alimentação',
  },
  {
    keywords: ['uber', '99', 'taxi', 'ônibus', 'onibus', 'combustível',
      'combustivel', 'posto', 'gasolina', 'etanol', 'estacionamento',
      'pedágio', 'pedagio', 'van', 'táxi'],
    category: 'Transporte',
  },
  {
    keywords: ['aluguel', 'luz', 'água', 'agua', 'internet', 'condomínio',
      'condominio', 'telefone', 'encargos', 'iptu', 'conta de luz',
      'conta de água', 'conta de agua', 'energia', 'gás', 'gas'],
    category: 'Moradia',
  },
  {
    keywords: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico',
      'medico', 'hospital', 'exame', 'dentista', 'consulta', 'plano de saúde',
      'plano de saude', 'vacina', 'laboratório', 'laboratorio'],
    category: 'Saúde',
  },
  {
    keywords: ['escola', 'faculdade', 'curso', 'livro', 'material',
      'matrícula', 'matricula', 'mensalidade', 'aula', 'universidade'],
    category: 'Educação',
  },
  {
    keywords: ['cinema', 'show', 'teatro', 'parque', 'bar', 'balada',
      'jogo', 'netflix', 'spotify', 'amazon prime', 'hbo', 'streaming',
      'viagem', 'hotel', 'passeio', 'lazer', 'playstation', 'xbox', 'steam'],
    category: 'Lazer',
  },
  {
    keywords: ['roupa', 'calçado', 'calcado', 'sapato', 'tênis', 'tenis',
      'camisa', 'calça', 'calca', 'vestido', 'renner', 'zara'],
    category: 'Lazer',
  },
  {
    keywords: ['salário', 'salario', 'pagamento', 'ordenha', 'proventos'],
    category: 'Salário',
  },
  {
    keywords: ['freelance', 'freela', 'bico', 'trabalho extra'],
    category: 'Freelance',
  },
  {
    keywords: ['investimento', 'ações', 'acoes', 'renda fixa', 'tesouro',
      'dividendo', 'cripto', 'bitcoin', 'criptomoeda'],
    category: 'Investimentos',
  },
];

export const CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  'Alimentação': { color: '#FF6B6B', icon: 'FaUtensils' },
  'Transporte': { color: '#4ECDC4', icon: 'FaCar' },
  'Moradia': { color: '#45B7D1', icon: 'FaHome' },
  'Saúde': { color: '#FFEAA7', icon: 'FaHeartbeat' },
  'Educação': { color: '#DDA0DD', icon: 'FaGraduationCap' },
  'Lazer': { color: '#96CEB4', icon: 'FaGamepad' },
  'Salário': { color: '#00B894', icon: 'FaMoneyBillWave' },
  'Freelance': { color: '#6C5CE7', icon: 'FaLaptop' },
  'Investimentos': { color: '#FDCB6E', icon: 'FaChartLine' },
  'Outros': { color: '#636E72', icon: 'FaEllipsisH' },
};
