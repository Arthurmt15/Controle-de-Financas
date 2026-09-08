/**
 * Serviço de OCR simplificado
 * Usa tesseract.js com configurações otimizadas para comprovantes
 */

import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  rawText: string; // Texto bruto para debug
  error?: string;
}

/**
 * Pré-processa imagem para melhorar OCR
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

      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Converte para tons de cinza
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }

      // Threshold binário
      const threshold = 128;
      for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > threshold ? 255 : 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      ctx!.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name, { type: 'image/png' }));
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
 * OCR principal - tesseract.js com configurações otimizadas
 */
export async function extractTextFromImage(
  file: File,
  language: string = 'por'
): Promise<OcrResult> {
  try {
    // Pré-processa a imagem
    const processedFile = await preprocessImage(file);

    // Cria worker com português + inglês
    const worker = await createWorker(`${language}+eng`, 1, {
      logger: (m) => console.log(m),
    });

    // Configurações otimizadas para comprovantes
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:/- R$%áéíóúãõâêôàèìòùçñÁÉÍÓÚÃÕÂÊÔÀÈÌÒÙÇÑ',
    });

    const { data } = await worker.recognize(processedFile);
    await worker.terminate();

    return {
      text: data.text.trim(),
      confidence: data.confidence,
      rawText: data.text, // Texto bruto para debug
    };
  } catch (error) {
    return {
      text: '',
      confidence: 0,
      rawText: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Extrai texto de URL
 */
export async function extractTextFromUrl(
  url: string,
  language: string = 'por'
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
      rawText: '',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
