/**
 * @file services/ocrService.ts
 * @description Serviço de OCR usando Tesseract.js (roda no navegador).
 */

import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  source: 'tesseract';
  rawText?: string;
  error?: string;
}

/**
 * OCR via Tesseract.js
 */
async function tesseractOcr(file: File): Promise<OcrResult> {
  try {
    const worker = await createWorker('por+eng');
    const { data } = await worker.recognize(file);
    await worker.terminate();

    return {
      text: data.text.trim(),
      confidence: data.confidence,
      source: 'tesseract',
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'tesseract',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * OCR principal - usa Tesseract.js
 */
export async function extractTextFromImage(
  file: File,
  _language: string = 'por'
): Promise<OcrResult> {
  return tesseractOcr(file);
}

/**
 * Extrai texto de URL via Tesseract.js
 */
export async function extractTextFromUrl(
  url: string,
  _language: string = 'por'
): Promise<OcrResult> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });
    return tesseractOcr(file);
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'tesseract',
      error: error instanceof Error ? error.message : 'Erro ao baixar imagem',
    };
  }
}
