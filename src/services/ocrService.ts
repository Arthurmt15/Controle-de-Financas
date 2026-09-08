/**
 * Serviço de OCR híbrido
 * Usa OCR.space (gratuito) + tesseract.js (local) e compara resultados
 */

import { createWorker } from 'tesseract.js';

const OCR_API_KEY = 'K85405495388957'; // Chave de teste OCR.space
const OCR_API_URL = 'https://api.ocr.space/parse/image';

interface OcrResult {
  text: string;
  confidence: number;
  source: 'ocr.space' | 'tesseract' | 'combined';
  error?: string;
}

/**
 * Converte File para base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * OCR via OCR.space API
 */
async function ocrSpace(file: File): Promise<OcrResult> {
  try {
    const base64 = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const formData = new FormData();
    formData.append('base64Image', `data:${mimeType};base64,${base64}`);
    formData.append('language', 'por');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: { apikey: OCR_API_KEY },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'Erro desconhecido');
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: '', confidence: 0, source: 'ocr.space', error: 'Nenhum texto encontrado' };
    }

    const fullText = parsedResults.map((r: any) => r.ParsedText).join('\n');
    const confidence = parsedResults.length > 0 ? 85 : 0;

    return { text: fullText.trim(), confidence, source: 'ocr.space' };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'ocr.space',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * OCR via tesseract.js (local)
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
 * Conta caracteres relevantes (letras + números + pontuação)
 */
function countRelevantChars(text: string): number {
  return text.replace(/[^a-zA-Z0-9À-ÿ.,;:!?]/g, '').length;
}

/**
 * Detecta se o texto parece ser de um comprovante
 */
function looksLikeReceipt(text: string): boolean {
  const patterns = /(?:total|valor|pagamento|pix|transferência|comprovante|nota fiscal|chf|eur|usd|r\$)/i;
  return patterns.test(text);
}

/**
 * OCR principal - tenta ambos e usa o melhor resultado
 */
export async function extractTextFromImage(
  file: File,
  language: string = 'eng'
): Promise<OcrResult> {
  // Tenta ambos em paralelo
  const [spaceResult, tesseractResult] = await Promise.all([
    ocrSpace(file),
    ocrTesseract(file),
  ]);

  // Se um falhou, usa o outro
  if (!spaceResult.text && !tesseractResult.text) {
    return {
      text: '',
      confidence: 0,
      source: 'combined',
      error: 'Ambos os OCRs falharam',
    };
  }

  if (!spaceResult.text) return tesseractResult;
  if (!tesseractResult.text) return spaceResult;

  // Ambos retornaram texto - compara
  const spaceChars = countRelevantChars(spaceResult.text);
  const tesseractChars = countRelevantChars(tesseractResult.text);

  // Se a diferença é grande (>30%), usa o maior
  if (Math.abs(spaceChars - tesseractChars) > Math.min(spaceChars, tesseractChars) * 0.3) {
    return spaceChars > tesseractChars ? spaceResult : tesseractResult;
  }

  // Se parecem com comprovante, prioriza esse
  const spaceIsReceipt = looksLikeReceipt(spaceResult.text);
  const tesseractIsReceipt = looksLikeReceipt(tesseractResult.text);

  if (spaceIsReceipt && !tesseractIsReceipt) return spaceResult;
  if (tesseractIsReceipt && !spaceIsReceipt) return tesseractResult;

  // Senão, usa o de maior confiança
  return spaceResult.confidence >= tesseractResult.confidence ? spaceResult : tesseractResult;
}

/**
 * Extrai texto de URL
 */
export async function extractTextFromUrl(
  url: string,
  language: string = 'eng'
): Promise<OcrResult> {
  try {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: { apikey: OCR_API_KEY },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'Erro desconhecido');
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: '', confidence: 0, source: 'ocr.space', error: 'Nenhum texto encontrado' };
    }

    const fullText = parsedResults.map((r: any) => r.ParsedText).join('\n');

    return { text: fullText.trim(), confidence: 85, source: 'ocr.space' };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      source: 'ocr.space',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
