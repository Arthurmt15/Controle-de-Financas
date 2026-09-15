/**
 * @file components/features/ImageUploader/index.tsx
 * @description Uploader de comprovantes redesenhado com shadcn + tailwind + framer-motion + lucide.
 * Card com drag-drop estilizado tailwind, Button, Badge e ícone lucide. Preserva extração OCR.
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Check, Loader2, Sparkles, Wallet, Tag, Calendar, FileText, TrendingUp } from 'lucide-react';
import { extractTextFromImage } from '../../../services/ocrService';
import { useTransactions } from '../../../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import type { Transaction } from '../../../types';

/** Resultado da análise OCR */
interface AnalysisResult {
  amount: number | null;
  description: string | null;
  date: string | null;
  rawText: string;
}

/** Props do uploader */
interface ImageUploaderProps {
  /** Callback quando transação é criada */
  onTransactionCreated?: (transaction: Omit<Transaction, 'id'>) => void;
}

/**
 * Uploader de comprovantes - design shadcn
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({ onTransactionCreated }) => {
  // Categorias e ação de criar transação
  const { addTransaction, categories } = useTransactions();

  // Estados de arquivo e preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Campos editáveis após OCR
  const [editableDescription, setEditableDescription] = useState('');
  const [editableAmount, setEditableAmount] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableCategoryId, setEditableCategoryId] = useState('');
  const [editableType, setEditableType] = useState<'income' | 'expense'>('expense');

  /** Extrai valor do texto OCR */
  const extractAmount = (text: string): number | null => {
    const lower = text.toLowerCase();
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
    const brlMatch = lower.match(/r\$\s*(\d{1,6}[.,]\d{2})/);
    if (brlMatch) {
      const value = brlMatch[1].replace('.', '').replace(',', '.');
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) return num;
    }
    const decimalPattern = /(\d{1,6}[.,]\d{2})\b/g;
    let lastMatch: RegExpExecArray | null = null;
    let m: RegExpExecArray | null;
    while ((m = decimalPattern.exec(text)) !== null) {
      const value = m[1].replace('.', '').replace(',', '.');
      const num = parseFloat(value);
      if (num >= 1.0) lastMatch = m;
    }
    if (lastMatch) {
      const value = lastMatch[1].replace('.', '').replace(',', '.');
      return parseFloat(value);
    }
    return null;
  };

  /** Extrai data do texto OCR */
  const extractDate = (text: string): string | null => {
    const patterns = [/(\d{2})\/(\d{2})\/(\d{4})/, /(\d{2})\.(\d{2})\.(\d{4})/, /(\d{2})\/(\d{2})\/(\d{2})/, /(\d{4})-(\d{2})-(\d{2})/];
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

  /** Extrai descrição do texto OCR pulando linhas de ruído */
  const extractDescription = (text: string): string | null => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 2);
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
      if (noisePatterns.some((p) => p.test(line))) continue;
      if (/^[\d\s.,xX]+$/.test(line)) continue;
      if (line.length < 3 || line.length > 60) continue;
      const cleaned = line.replace(/[^\w\sáàãâéêíóôõúç]/gi, '').trim();
      if (cleaned.length >= 3) {
        return cleaned.substring(0, 50);
      }
    }
    return null;
  };

  /** Processa o arquivo selecionado com OCR */
  const handleFileSelect = async (file: File) => {
    setError(null);
    setAnalysisResult(null);
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida (JPG, PNG, etc.)');
      return;
    }
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

    // Análise real com OCR
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
      const defaultCat = categories.find((c) => c.name.toLowerCase() === 'outros') || categories[0];
      setEditableCategoryId(defaultCat?.id || '');
    } catch (err) {
      console.error('Erro no OCR:', err);
      setError('Erro ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  /** Trata mudança no input de arquivo */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  /** Handlers de drag and drop */
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
    if (file) handleFileSelect(file);
  };

  /** Abre seletor de arquivo */
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  /** Remove imagem selecionada e reseta estado */
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setEditableDescription('');
    setEditableAmount('');
    setEditableDate('');
    setEditableCategoryId('');
    setEditableType('expense');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** Confirma e cria transação com dados editados */
  const handleConfirm = async () => {
    if (!analysisResult) return;
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
    const descricao = editableDescription.trim() || 'Compra via comprovante';
    const data = editableDate || new Date().toISOString().split('T')[0];
    const transactionData: Omit<Transaction, 'id'> = {
      description: descricao,
      amount: valor,
      type: editableType,
      date: data.includes('T') ? data : new Date(data + 'T12:00:00').toISOString(),
      categoryId: editableCategoryId,
      notes: '',
    };
    try {
      await addTransaction(transactionData);
      if (onTransactionCreated) onTransactionCreated(transactionData);
      handleRemove();
    } catch {
      setError('Erro ao criar transação. Por favor, tente novamente.');
    }
  };

  return (
    <div className="flex flex-col h-[560px] overflow-hidden">
      {/* Cabeçalho */}
      <CardHeader className="p-4 border-b bg-gradient-to-r from-violet-500/5 to-transparent shrink-0">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </span>
          Foto de Comprovante
          <Badge variant="outline" className="ml-1 rounded-full text-[11px] gap-1">
            <Sparkles className="h-3 w-3 text-violet-500" />
            OCR
          </Badge>
        </CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {/* Área de upload com drag-drop estilizada tailwind */}
        <div
          onClick={handleZoneClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Área para enviar comprovante. Clique ou arraste uma imagem."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleZoneClick();
            }
          }}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01] shadow-sm'
              : 'border-muted-foreground/20 bg-background hover:border-primary/40 hover:bg-muted/50'
          }`}
        >
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDragging ? 'bg-primary text-white border-primary' : 'bg-muted border-border text-muted-foreground'}`}>
            <Upload className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium">
              Arraste uma foto ou <span className="text-primary underline underline-offset-2">clique para selecionar</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG até 5MB</p>
          </div>
        </div>

        {/* Input oculto */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

        {/* Preview da imagem */}
        <AnimatePresence>
          {previewUrl && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="relative rounded-2xl overflow-hidden border bg-background">
              <img src={previewUrl} alt="Preview do comprovante" className="w-full max-h-[160px] object-contain bg-muted/20" />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md" onClick={handleRemove} title="Remover imagem">
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de análise */}
        {isAnalyzing && (
          <Card className="rounded-2xl border-dashed bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{analysisProgress}</span>
            </CardContent>
          </Card>
        )}

        {/* Resultado da análise - campos editáveis */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-semibold">Dados Identificados</span>
                    <Badge variant="outline" className="rounded-full text-[11px] ml-auto">
                      edite antes de confirmar
                    </Badge>
                  </div>

                  {/* Valor */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Wallet className="h-3 w-3 text-muted-foreground" />
                      Valor
                    </Label>
                    <Input type="text" value={editableAmount} onChange={(e) => { setEditableAmount(e.target.value); setError(null); }} placeholder="0,00" className="rounded-xl h-9" />
                  </div>

                  {/* Data */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Data
                    </Label>
                    <Input type="date" value={editableDate} onChange={(e) => { setEditableDate(e.target.value); setError(null); }} className="rounded-xl h-9" />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      Categoria
                    </Label>
                    <Select value={editableCategoryId} onValueChange={(v) => { setEditableCategoryId(v); setError(null); }}>
                      <SelectTrigger className="rounded-xl h-9">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      Descrição
                    </Label>
                    <Input type="text" value={editableDescription} onChange={(e) => { setEditableDescription(e.target.value); setError(null); }} placeholder="Descrição da transação" className="rounded-xl h-9" />
                  </div>

                  {/* Tipo */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo</Label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border">
                      <Button
                        type="button"
                        variant={editableType === 'income' ? 'default' : 'ghost'}
                        className={`rounded-lg gap-1.5 h-8 text-sm ${editableType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => { setEditableType('income'); setError(null); }}
                        aria-pressed={editableType === 'income'}
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Entrada
                      </Button>
                      <Button
                        type="button"
                        variant={editableType === 'expense' ? 'destructive' : 'ghost'}
                        className="rounded-lg gap-1.5 h-8 text-sm"
                        onClick={() => { setEditableType('expense'); setError(null); }}
                        aria-pressed={editableType === 'expense'}
                      >
                        <TrendingUp className="h-3.5 w-3.5 rotate-180" />
                        Saída
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erro */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 px-3 py-2 text-sm">
            {error}
          </motion.div>
        )}
      </div>

      {/* Botões fixos no rodapé do card */}
      {selectedFile && !isAnalyzing && (
        <div className="p-3 border-t bg-background flex justify-end gap-2 shrink-0">
          <Button variant="outline" className="rounded-xl" onClick={handleRemove}>
            Cancelar
          </Button>
          <Button className="rounded-xl gap-1.5" onClick={handleConfirm}>
            <Check className="h-4 w-4" />
            Confirmar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
