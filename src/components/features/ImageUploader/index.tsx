/**
 * @file components/features/ImageUploader/index.tsx
 * @description Componente para upload e análise de fotos de comprovantes.
 * Extrai valores, datas e descrições de imagens.
 */

import React, { useState, useRef } from 'react';
import { useTransactions } from '../../../hooks/useTransactions';
import { parseImageText } from '../../../utils/parseTransaction';
import { toInputDate } from '../../../utils/formatters';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Simula análise de imagem (em produção, usaria OCR real)
    setIsAnalyzing(true);

    setTimeout(() => {
      // Simula dados extraídos da imagem
      // Em produção, aqui seria chamado um serviço de OCR
      const simulatedResult: AnalysisResult = {
        amount: null,
        description: null,
        date: null,
        rawText: 'Análise de imagem - Por favor, preencha os dados manualmente ou use o chat.',
      };

      setAnalysisResult(simulatedResult);
      setIsAnalyzing(false);
    }, 1500);
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
        </C.AnalysisResult>
      )}

      {/* Erro */}
      {error && (
        <C.ErrorMessage>{error}</C.ErrorMessage>
      )}

      {/* Botões */}
      {selectedFile && (
        <C.Actions>
          <button onClick={handleRemove}>Cancelar</button>
          <button onClick={handleConfirm}>Confirmar</button>
        </C.Actions>
      )}
    </C.UploaderContainer>
  );
};

export default ImageUploader;
