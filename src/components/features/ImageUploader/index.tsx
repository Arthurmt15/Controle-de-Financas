/**
 * @file components/features/ImageUploader/index.tsx
 * @description Componente para upload e análise de fotos de comprovantes.
 * Extrai valores, datas e descrições de imagens.
 */

import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { useTransactions } from '../../../hooks/useTransactions';

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

  /**
   * Extrai valor do texto OCR
   */
  const extractAmount = (text: string): number | null => {
    const patterns = [
      /R\$\s*([\d.,]+)/i,
      /valor[:\s]*R?\$?\s*([\d.,]+)/i,
      /total[:\s]*R?\$?\s*([\d.,]+)/i,
      /([\d]+[.,]\d{2})/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const cleaned = match[1].replace(/\./g, '').replace(',', '.');
        const value = parseFloat(cleaned);
        if (!isNaN(value) && value > 0) return value;
      }
    }
    return null;
  };

  /**
   * Extrai data do texto OCR
   */
  const extractDate = (text: string): string | null => {
    const patterns = [
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{2}\.\d{2}\.\d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{2}\/\d{2}\/\d{2})/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let dateStr = match[1];
        if (dateStr.includes('/')) {
          const [d, m, y] = dateStr.split('/');
          const year = y.length === 2 ? `20${y}` : y;
          dateStr = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else if (dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const [d, m, y] = dateStr.split('.');
          dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        const date = new Date(dateStr + 'T12:00:00');
        if (!isNaN(date.getTime())) return dateStr;
      }
    }
    return null;
  };

  /**
   * Extrai descrição do texto OCR (primeira linha significativa)
   */
  const extractDescription = (text: string): string | null => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const skipWords = ['comprovante', 'nota fiscal', 'recibo', 'cnpj', 'cpf', 'imposto', 'taxa'];
    for (const line of lines) {
      const lower = line.toLowerCase();
      const isNoise = skipWords.some(w => lower.includes(w)) || /^\d+[.,/]/.test(line);
      if (!isNoise && line.length >= 3 && line.length <= 80) {
        return line;
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

    // Análise real com Tesseract.js
    setIsAnalyzing(true);
    setAnalysisProgress('Carregando OCR...');

    try {
      const worker = await createWorker('por');
      setAnalysisProgress('Analisando imagem...');

      const { data } = await worker.recognize(file);
      const rawText = data.text;

      const amount = extractAmount(rawText);
      const date = extractDate(rawText);
      const description = extractDescription(rawText);

      const result: AnalysisResult = { amount, description, date, rawText };
      setAnalysisResult(result);

      await worker.terminate();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Confirma e cria transação com dados extraídos
   */
  const handleConfirm = async () => {
    if (!analysisResult) return;

    // Encontra categoria padrão
    const defaultCategoryId = categories.length > 0
      ? categories[0].id
      : '';

    const transactionData: Omit<Transaction, 'id'> = {
      description: analysisResult.description || 'Compra via comprovante',
      amount: analysisResult.amount || 0,
      type: 'expense',
      date: analysisResult.date || new Date().toISOString(),
      categoryId: defaultCategoryId,
    };

    try {
      await addTransaction(transactionData);

      if (onTransactionCreated) {
        onTransactionCreated(transactionData);
      }

      // Limpa após sucesso
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
          </C.AnalysisTitle>

          <C.AnalysisField>
            <C.FieldLabel>Valor:</C.FieldLabel>
            <C.FieldValue>
              {analysisResult.amount
                ? `R$ ${analysisResult.amount.toFixed(2).replace('.', ',')}`
                : 'Não identificado'}
            </C.FieldValue>
          </C.AnalysisField>

          <C.AnalysisField>
            <C.FieldLabel>Data:</C.FieldLabel>
            <C.FieldValue>
              {analysisResult.date || 'Não identificada'}
            </C.FieldValue>
          </C.AnalysisField>

          <C.AnalysisField>
            <C.FieldLabel>Descrição:</C.FieldLabel>
            <C.FieldValue>
              {analysisResult.description || 'Não identificada'}
            </C.FieldValue>
          </C.AnalysisField>

          {analysisResult.rawText && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: '#888', cursor: 'pointer' }}>
                Ver texto extraído
              </summary>
              <pre style={{
                fontSize: 11,
                marginTop: 4,
                padding: 8,
                background: '#f5f5f5',
                borderRadius: 6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 120,
                overflow: 'auto',
              }}>
                {analysisResult.rawText}
              </pre>
            </details>
          )}
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
