/**
 * Serviço de OCR usando Puter.js (gratuito, sem cadastro, sem limite)
 * https://developer.puter.com/tutorials/free-unlimited-ocr-api
 */

import { createWorker } from 'tesseract.js';

declare const puter: any;

export interface OcrResult {
  text: string;
  confidence: number;
  source: 'puter' | 'tesseract';
  rawText?: string;
  error?: string;
}

/**
 * OCR via Puter.js (gratuito, sem cadastro)
 */
async function puterOcr(file: File): Promise<OcrResult> {
  try {
    // Converte file para data URL
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Usa puter.ai.img2txt para extrair texto
    const text = await puter.ai.img2txt(dataUrl);

    if (!text || text.trim().length === 0) {
      return { text: '', confidence: 0, source: 'puter', error: 'Nenhum texto encontrado' };
    }

    return {
      text: text.trim(),
      confidence: 95,
      source: 'puter',
      rawText: text,
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'puter',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * OCR via tesseract.js (fallback)
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
 * OCR principal - tenta Puter.js primeiro, fallback para tesseract
 */
export async function extractTextFromImage(
  file: File,
  language: string = 'por'
): Promise<OcrResult> {
  // Tenta Puter.js primeiro
  const puterResult = await puterOcr(file);

  // Se Puter.js funcionou e tem texto, usa
  if (puterResult.text && puterResult.text.length > 5) {
    return puterResult;
  }

  // Fallback para tesseract
  const tesseractResult = await tesseractOcr(file);

  // Retorna o que tem mais texto
  return puterResult.text.length > tesseractResult.text.length ? puterResult : tesseractResult;
}

/**
 * Extrai texto de URL
 */
export async function extractTextFromUrl(
  url: string,
  language: string = 'por'
): Promise<OcrResult> {
  try {
    // Usa puter.ai.img2txt diretamente com URL
    const text = await puter.ai.img2txt(url);

    if (!text || text.trim().length === 0) {
      return { text: '', confidence: 0, source: 'puter', error: 'Nenhum texto encontrado' };
    }

    return {
      text: text.trim(),
      confidence: 95,
      source: 'puter',
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'puter',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
