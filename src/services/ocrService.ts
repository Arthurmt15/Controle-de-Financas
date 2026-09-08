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
 * Pré-processamento agressivo da imagem para OCR
 * Converte para preto e branco com alto contraste
 */
async function preprocessImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Escala para 2x se muito pequena
      const scale = Math.min(2, Math.max(1, 1500 / Math.max(img.width, img.height)));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Desenha a imagem escalada
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Pega os pixels
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Passo 1: Converte para tons de cinza
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Passo 2: Aplica threshold (preto e branco puro)
      const threshold = 140;
      for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > threshold ? 255 : 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx!.putImageData(imageData, 0, 0);

      // Passo 3: Aplica sharpening via convolução
      const sharpened = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const sData = sharpened.data;
      const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];

      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
              const ki = (ky + 1) * 3 + (kx + 1);
              r += data[idx] * kernel[ki];
              g += data[idx + 1] * kernel[ki];
              b += data[idx + 2] * kernel[ki];
            }
          }
          const idx = (y * canvas.width + x) * 4;
          sData[idx] = Math.min(255, Math.max(0, r));
          sData[idx + 1] = Math.min(255, Math.max(0, g));
          sData[idx + 2] = Math.min(255, Math.max(0, b));
        }
      }

      ctx!.putImageData(sharpened, 0, 0);

      // Converte de volta para blob
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, { type: 'image/png' });
          resolve(newFile);
        } else {
          resolve(file);
        }
      }, 'image/png');
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * OCR via OCR.space API (modo receipt)
 */
async function ocrSpace(file: File): Promise<OcrResult> {
  try {
    // Pré-processa a imagem
    const processedFile = await preprocessImage(file);
    const base64 = await fileToBase64(processedFile);
    const mimeType = processedFile.type || 'image/jpeg';

    const formData = new FormData();
    formData.append('base64Image', `data:${mimeType};base64,${base64}`);
    formData.append('language', 'por');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');
    formData.append('isTable', 'true'); // Modo receipt/tabela
    formData.append('scale', 'true'); // Escala para melhorar resolução
    formData.append('enqueue', 'true'); // Processa na fila (mais preciso)

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: { apikey: OCR_API_KEY },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro API: ${response.status}`);
    }

    const data = await response.json();

    // Se enfileirou, espera o resultado
    if (data.OCRExitCode === 1 && data.ParsedResults?.length === 0 && data.RequestId) {
      // Aguarda e busca o resultado
      await new Promise(r => setTimeout(r, 3000));
      const checkResponse = await fetch(`${OCR_API_URL}?requestId=${data.RequestId}`, {
        headers: { apikey: OCR_API_KEY },
      });
      const checkData = await checkResponse.json();
      if (checkData.ParsedResults?.length > 0) {
        const fullText = checkData.ParsedResults.map((r: any) => r.ParsedText).join('\n');
        return { text: fullText.trim(), confidence: 90, source: 'ocr.space' };
      }
    }

    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'Erro desconhecido');
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: '', confidence: 0, source: 'ocr.space', error: 'Nenhum texto encontrado' };
    }

    const fullText = parsedResults.map((r: any) => r.ParsedText).join('\n');
    const confidence = parsedResults.length > 0 ? 90 : 0;

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
