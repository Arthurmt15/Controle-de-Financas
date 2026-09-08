/**
 * Serviço de OCR usando EasyOCR API (gratuito, sem cadastro)
 * https://console.easyocr.org/api/ocr
 */

import { createWorker } from 'tesseract.js';

const EASYOCR_URL = 'https://console.easyocr.org/api/ocr';

interface OcrResult {
  text: string;
  confidence: number;
  source: 'easyocr' | 'tesseract';
  error?: string;
}

/**
 * OCR via EasyOCR API (gratuito, sem cadastro)
 */
async function easyOcr(file: File): Promise<OcrResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(EASYOCR_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();

    if (!data.words || data.words.length === 0) {
      return { text: '', confidence: 0, source: 'easyocr', error: 'Nenhum texto encontrado' };
    }

    // Junta todo o texto reconhecido
    const fullText = data.words.map((w: any) => w.text).join('\n');
    const avgConfidence = data.words.reduce((sum: number, w: any) => sum + (w.rate || 0), 0) / data.words.length;

    return {
      text: fullText.trim(),
      confidence: Math.round(avgConfidence * 100),
      source: 'easyocr',
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'easyocr',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * OCR via tesseract.js (local, fallback)
 */
async function ocrTesseract(file: File): Promise<OcrResult> {
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
 * OCR principal - tenta EasyOCR primeiro, fallback para tesseract
 */
export async function extractTextFromImage(
  file: File,
  language: string = 'eng'
): Promise<OcrResult> {
  // Tenta EasyOCR primeiro
  const easyResult = await easyOcr(file);

  // Se EasyOCR funcionou e tem texto, usa
  if (easyResult.text && easyResult.text.length > 10) {
    return easyResult;
  }

  // Fallback para tesseract
  const tesseractResult = await ocrTesseract(file);

  // Se ambos falharam
  if (!easyResult.text && !tesseractResult.text) {
    return {
      text: '',
      confidence: 0,
      source: 'tesseract',
      error: 'Nenhum OCR conseguiu ler a imagem',
    };
  }

  // Retorna o que tem mais texto
  return easyResult.text.length > tesseractResult.text.length ? easyResult : tesseractResult;
}

/**
 * Extrai texto de URL
 */
export async function extractTextFromUrl(
  url: string,
  language: string = 'eng'
): Promise<OcrResult> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    return await extractTextFromImage(file, language);
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'easyocr',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
