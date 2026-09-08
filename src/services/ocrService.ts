/**
 * Serviço de OCR usando OCR.space API (gratuito)
 * https://ocr.space/ocrapi
 */

const OCR_API_KEY = 'K85405495388957'; // Chave de teste gratuita
const OCR_API_URL = 'https://api.ocr.space/parse/image';

interface OcrResult {
  text: string;
  confidence: number;
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
      // Remove o prefixo data:image/...;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Detecta o tipo MIME da imagem
 */
function getMimeType(file: File): string {
  const mimeTypes: Record<string, string> = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/bmp': 'image/bmp',
    'image/webp': 'image/webp',
    'image/tiff': 'image/tiff',
    'application/pdf': 'application/pdf',
  };
  return mimeTypes[file.type] || 'image/jpeg';
}

/**
 * Extrai texto de uma imagem usando OCR.space
 * 
 * @param file - Arquivo de imagem ou PDF
 * @param language - Idioma (padrão: 'eng' para inglês)
 * @returns Texto extraído
 * 
 * @example
 * const result = await extractTextFromImage(file);
 * if (result.text) {
 *   console.log('Texto extraído:', result.text);
 * }
 */
export async function extractTextFromImage(
  file: File,
  language: string = 'eng'
): Promise<OcrResult> {
  try {
    const base64 = await fileToBase64(file);
    const mimeType = getMimeType(file);

    const formData = new FormData();
    formData.append('base64Image', `data:${mimeType};base64,${base64}`);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); // Engine 2 é melhor para comprovantes

    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: {
        apikey: OCR_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro na API OCR: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      const errorMessage = data.ErrorMessage?.[0] || 'Erro desconhecido no OCR';
      return { text: '', confidence: 0, error: errorMessage };
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: '', confidence: 0, error: 'Nenhum texto encontrado na imagem' };
    }

    // Combina todos os resultados (para PDFs multi-página)
    const fullText = parsedResults
      .map((result: any) => result.ParsedText)
      .join('\n');

    // Calcula confiança média
    const avgConfidence = parsedResults.reduce(
      (sum: number, result: any) => sum + (result.TextOverlay?.HasOverlay ? 100 : 85),
      0
    ) / parsedResults.length;

    return {
      text: fullText.trim(),
      confidence: avgConfidence,
    };
  } catch (error) {
    console.error('Erro no OCR:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Extrai texto de uma imagem a partir de URL
 * 
 * @param url - URL da imagem
 * @param language - Idioma (padrão: 'eng')
 * @returns Texto extraído
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
      headers: {
        apikey: OCR_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro na API OCR: ${response.status}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      const errorMessage = data.ErrorMessage?.[0] || 'Erro desconhecido no OCR';
      return { text: '', confidence: 0, error: errorMessage };
    }

    const parsedResults = data.ParsedResults;
    if (!parsedResults || parsedResults.length === 0) {
      return { text: '', confidence: 0, error: 'Nenhum texto encontrado na imagem' };
    }

    const fullText = parsedResults
      .map((result: any) => result.ParsedText)
      .join('\n');

    const avgConfidence = parsedResults.reduce(
      (sum: number, result: any) => sum + (result.TextOverlay?.HasOverlay ? 100 : 85),
      0
    ) / parsedResults.length;

    return {
      text: fullText.trim(),
      confidence: avgConfidence,
    };
  } catch (error) {
    console.error('Erro no OCR:', error);
    return {
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Detecta idioma do texto automaticamente
 */
export function detectLanguage(text: string): string {
  // Padrões para detectar idioma
  const patterns = {
    pt: /\b(pix|transferência|pagamento|comprovante|nota fiscal|valor|total)\b/i,
    de: /\b(mwst|steuer|betrag|summe|bar|rechnung|quittung)\b/i,
    fr: /\b(montant|total|paiement|reçu|facture|tva)\b/i,
    es: /\b(pago|monto|total|recibo|factura|iva)\b/i,
    en: /\b(payment|amount|total|receipt|invoice|tax)\b/i,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }

  return 'eng'; // Padrão inglês
}

/**
 * Processa imagem e retorna idioma detectado
 */
export async function extractTextWithAutoLanguage(
  file: File
): Promise<OcrResult & { detectedLanguage: string }> {
  // Primeiro detecta o idioma
  const tempResult = await extractTextFromImage(file, 'eng');
  const detectedLanguage = detectLanguage(tempResult.text);

  // Se detectou outro idioma, refaz com o idioma correto
  if (detectedLanguage !== 'eng') {
    return {
      ...await extractTextFromImage(file, detectedLanguage),
      detectedLanguage,
    };
  }

  return {
    ...tempResult,
    detectedLanguage,
  };
}
