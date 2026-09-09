/**
 * @file components/features/ImageUploader/index.tsx
 * @description Componente para upload e análise de fotos de comprovantes.
 * Extrai valores, datas e descrições de imagens.
 */

import React, { useState, useRef } from 'react';
import { extractTextFromImage } from '../../../services/ocrService';
import { useTransactions } from '../../../hooks/useTransactions';
import { parseTransactionFromMessage } from '../../../utils/parseTransaction';

import * as C from './styles';
import type { Transaction } from '../../../types';

/**
 * Interface para resultado da análise
 */
interface AnalysisResult {
  amount: number | null;
  description: string | null;
  date: string | null;
  rawText: string;
}

/**
 * Props do componente ImageUploader
 */
interface ImageUploaderProps {
  /** Função chamada quando uma transação é criada */
  onTransactionCreated?: (transaction: Omit<Transaction, 'id'>) => void;
}

/**
 * Componente de upload de imagens de comprovantes
 * @param {ImageUploaderProps} props - Props do componente
 * @returns {JSX.Element} Componente ImageUploader renderizado
 *
 * @example
 * <ImageUploader />
 *
 * @example
 * <ImageUploader onTransactionCreated={(t) => console.log(t)} />
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onTransactionCreated,
}) => {
  const { addTransaction, categories } = useTransactions();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado editável para os campos OCR
  const [editableDescription, setEditableDescription] = useState('');
  const [editableAmount, setEditableAmount] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableCategoryId, setEditableCategoryId] = useState('');

  /**
   * Extrai valor do texto OCR de notas fiscais.
   * Busca TOTAL/VALOR PAGO primeiro, depois último número decimal como fallback.
   */
  const extractAmount = (text: string): number | null => {
    const lower = text.toLowerCase();

    // 1. Busca linhas com TOTAL ou VALOR PAGO seguido de número
    const totalPatterns = [
      /total\s+(?:liquido|geral|a\s+pagar)?\s*(\d{1,6}[.,]\d{2})/i,
      /valor\s+pago\s+(\d{1,6}[.,]\d{2})/i,
      /valor\s+total\s+(\d{1,6}[.,]\d{2})/i,
      /total\s+(\d{1,6}[.,]\d{2})/i,
    ];
    for (const pattern of totalPatterns) {
      const match = lower.match(pattern);
      if (match) {
        const value = match[1].replace('.', '').replace(',', '.');
        const num = parseFloat(value);
        if (!isNaN(num) && num > 0) return num;
      }
    }

    // 2. Busca "R$ XXX,XX"
    const brlMatch = lower.match(/r\$\s*(\d{1,6}[.,]\d{2})/);
    if (brlMatch) {
      const value = brlMatch[1].replace('.', '').replace(',', '.');
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) return num;
    }

    // 3. Fallback: pega o ÚLTIMO número decimal >= 1,00 (totais ficam no final)
    const decimalPattern = /(\d{1,6}[.,]\d{2})\b/g;
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    while ((m = decimalPattern.exec(text)) !== null) {
      const value = m[1].replace('.', '').replace(',', '.');
      const num = parseFloat(value);
      if (num >= 1.00) lastMatch = m;
    }
    if (lastMatch) {
      const value = lastMatch[1].replace('.', '').replace(',', '.');
      return parseFloat(value);
    }

    return null;
  };

  /**
   * Extrai data do texto OCR de notas fiscais.
   */
  const extractDate = (text: string): string | null => {
    const patterns = [
      /(\d{2})\/(\d{2})\/(\d{4})/,
      /(\d{2})\.(\d{2})\.(\d{4})/,
      /(\d{2})\/(\d{2})\/(\d{2})/,
      /(\d{4})-(\d{2})-(\d{2})/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let [, d, m, y] = match;
        if (y.length === 2) y = `20${y}`;
        if (parseInt(m) >= 1 && parseInt(m) <= 12 && parseInt(d) >= 1 && parseInt(d) <= 31) {
          return `${y}-${m}-${d}`;
        }
      }
    }
    return null;
  };

  /**
   * Extrai descrição do texto OCR pulando linhas de produto e lixo.
   */
  const extractDescription = (text: string): string | null => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

    const noisePatterns = [
      /^\d{4,}\s/,
      /\b(und|x|qty|qtde)\b/i,
      /cnpj|cpf|inscri|nota fiscal|comprovante|recibo/i,
      /total|subtotal|liquido|pagamento|pago/i,
      /taxa|entrega|desconto/i,
      /eded|po pp|\*\)/i,
    ];

    for (const line of lines) {
      if (/^\d{4,}\s/.test(line)) continue;
      if (noisePatterns.some(p => p.test(line))) continue;
      if (/^[\d\s.,xX]+$/.test(line)) continue;
      if (line.length < 3 || line.length > 60) continue;

      const cleaned = line.replace(/[^\w\sáàãâéêíóôõúç]/gi, '').trim();
      if (cleaned.length >= 3) {
        return cleaned.substring(0, 50);
      }
    }

    return null;
  };

  /**
   * Processa o arquivo selecionado
   */
  const handleFileSelect = async (file: File) => {
    setError(null);
    setAnalysisResult(null);

    // Verifica se é imagem
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
      return;
    }

    // Verifica tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    setSelectedFile(file);

    // Cria preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Análise real com OCR.space
    setIsAnalyzing(true);
    setAnalysisProgress('Carregando...');

    try {
      setAnalysisProgress('Analisando imagem...');

      const ocrResult = await extractTextFromImage(file, 'por');
      const rawText = ocrResult.text;

      const amount = extractAmount(rawText);
      const date = extractDate(rawText);
      const description = extractDescription(rawText);

      const result: AnalysisResult = { amount, description, date, rawText };
      setAnalysisResult(result);

      // Inicializa campos editáveis
      setEditableDescription(description || '');
      setEditableAmount(amount ? amount.toFixed(2).replace('.', ',') : '');
      setEditableDate(date || new Date().toISOString().split('T')[0]);

      // Inicializa categoria editável
      const parsed = parseTransactionFromMessage(rawText);
      const categoria = parsed?.categoria || 'Outros';
      const matchCat = categories.find(
        c => c.name.toLowerCase() === categoria.toLowerCase()
      );
      setEditableCategoryId(matchCat?.id || categories[0]?.id || '');
    } catch (err) {
      console.error('Erro no OCR:', err);
      setError('Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  /**
   * Trata mudança no input de arquivo
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Trata drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Clica na área de upload
   */
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Remove imagem selecionada
   */
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setEditableDescription('');
    setEditableAmount('');
    setEditableDate('');
    setEditableCategoryId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Confirma e cria transação com dados extraídos
   */
  const handleConfirm = async () => {
    if (!analysisResult) return;

    // Validações
    if (!editableCategoryId) {
      setError('Selecione uma categoria antes de confirmar.');
      return;
    }

    const valorStr = editableAmount.replace('.', '').replace(',', '.');
    const valor = parseFloat(valorStr) || 0;
    if (valor <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    // Usa o parser centralizado para obter tipo
    const parsed = parseTransactionFromMessage(analysisResult.rawText);

    // Valores editáveis pelo usuário
    const descricao = editableDescription.trim() || 'Compra via comprovante';
    const data = editableDate || new Date().toISOString().split('T')[0];
    const tipo = parsed?.tipo || 'despesa';
    const transactionType = tipo === 'receita' ? 'income' : 'expense';

    const transactionData: Omit<Transaction, 'id'> = {
      description: descricao,
      amount: valor,
      type: transactionType,
      date: data.includes('T') ? data : new Date(data + 'T12:00:00').toISOString(),
      categoryId: editableCategoryId,
      notes: '',
    };

    console.log('📤 Enviando transação:', transactionData);

    try {
      await addTransaction(transactionData);

      if (onTransactionCreated) {
        onTransactionCreated(transactionData);
      }

      handleRemove();
    } catch (err) {
      setError('Erro ao criar transação. Por favor, tente novamente.');
    }
  };

  return (
    <C.UploaderContainer>
      <C.Title>
        <C.TitleIcon>📸</C.TitleIcon>
        Foto de Comprovante
      </C.Title>

      {/* Área de upload */}
      <C.DropZone
        $isDragging={isDragging}
        onClick={handleZoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <C.UploadIcon>📤</C.UploadIcon>
        <C.InstructionText>
          Arraste uma foto ou <C.HighlightText>clique para selecionar</C.HighlightText>
        </C.InstructionText>
        <C.InstructionText>
          JPG, PNG até 5MB
        </C.InstructionText>
      </C.DropZone>

      <C.HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
      />

      {/* Preview da imagem */}
      {previewUrl && (
        <C.ImagePreview>
          <C.PreviewImage src={previewUrl} alt="Preview do comprovante" />
          <C.RemoveButton onClick={handleRemove} title="Remover imagem">
            ✕
          </C.RemoveButton>
        </C.ImagePreview>
      )}

      {/* Indicador de análise */}
      {isAnalyzing && (
        <C.AnalysisResult>
          <C.AnalysisTitle>🔍 {analysisProgress}</C.AnalysisTitle>
        </C.AnalysisResult>
      )}

      {/* Resultado da análise */}
      {analysisResult && (
        <C.AnalysisResult>
          <C.AnalysisTitle>
            ✅ Dados Identificados
            <C.EditHint>(edite antes de confirmar)</C.EditHint>
          </C.AnalysisTitle>

          <C.AnalysisField>
            <C.FieldLabel>Valor:</C.FieldLabel>
            <C.FieldInput
              type="text"
              value={editableAmount}
              onChange={(e) => { setEditableAmount(e.target.value); setError(null); }}
              placeholder="0,00"
            />
          </C.AnalysisField>

          <C.AnalysisField>
            <C.FieldLabel>Data:</C.FieldLabel>
            <C.FieldInput
              type="date"
              value={editableDate}
              onChange={(e) => { setEditableDate(e.target.value); setError(null); }}
            />
          </C.AnalysisField>

          <C.AnalysisField>
            <C.FieldLabel>Categoria:</C.FieldLabel>
            <C.FieldSelect
              value={editableCategoryId}
              onChange={(e) => { setEditableCategoryId(e.target.value); setError(null); }}
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </C.FieldSelect>
          </C.AnalysisField>

          <C.AnalysisField>
            <C.FieldLabel>Descrição:</C.FieldLabel>
            <C.FieldInput
              type="text"
              value={editableDescription}
              onChange={(e) => { setEditableDescription(e.target.value); setError(null); }}
              placeholder="Descrição da transação"
            />
          </C.AnalysisField>
        </C.AnalysisResult>
      )}

      {/* Erro */}
      {error && (
        <C.ErrorMessage>{error}</C.ErrorMessage>
      )}

      {/* Botões */}
      {selectedFile && !isAnalyzing && (
        <C.Actions>
          <button onClick={handleRemove}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </C.Actions>
      )}
    </C.UploaderContainer>
  );
};

export default ImageUploader;
