export function extractAmount(text: string): { value: number; clean: string } | null {
  const lower = text.toLowerCase();
  const kPattern = /(\d+(?:[.,]\d+)?)\s*k\b/i;
  const kMatch = lower.match(kPattern);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return { value: num * 1000, clean: text.replace(kMatch[0], ' ').trim() };
  }
  const slangPattern = /(\d+(?:[.,]\d+)?)\s*(?:conto|pila|paus|reais?|reias?)\b/i;
  const slangMatch = lower.match(slangPattern);
  if (slangMatch) {
    const num = parseFloat(slangMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return { value: num, clean: text.replace(slangMatch[0], ' ').trim() };
  }
  const installmentPattern = /(\d+)\s*(?:x|vezes)\s+de\s+(\d+(?:[.,]\d+)?)/i;
  const installmentMatch = lower.match(installmentPattern);
  if (installmentMatch) {
    const times = parseInt(installmentMatch[1]); const perTime = parseFloat(installmentMatch[2].replace(',', '.'));
    if (!isNaN(times) && !isNaN(perTime) && times > 0 && perTime > 0) return { value: times * perTime, clean: text.replace(installmentMatch[0], ' ').trim() };
  }
  const brlPattern = /R\$\s*(\d{1,6}(?:\.\d{3})*(?:,\d{1,2})?)/i;
  const brlMatch = text.match(brlPattern);
  if (brlMatch) {
    const value = brlMatch[1].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return { value: num, clean: text.replace(brlMatch[0], ' ').trim() };
  }
  const commaDecimalPattern = /(\d{1,6}(?:\.\d{3})*,\d{1,2})\b/g;
  const commaMatches: RegExpExecArray[] = []; let commaMatch: RegExpExecArray | null;
  while ((commaMatch = commaDecimalPattern.exec(text)) !== null) commaMatches.push(commaMatch);
  if (commaMatches.length > 0) {
    const match = commaMatches[commaMatches.length - 1];
    const value = match[1].replace(/\./g, '').replace(',', '.'); const num = parseFloat(value);
    if (!isNaN(num) && num > 0) return { value: num, clean: text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim() };
  }
  const dotDecimalPattern = /\b(\d{1,6}(?:,\d{3})*\.\d{1,2})\b/g;
  const dotMatches: RegExpExecArray[] = []; let dotMatch: RegExpExecArray | null;
  while ((dotMatch = dotDecimalPattern.exec(text)) !== null) dotMatches.push(dotMatch);
  if (dotMatches.length > 0) {
    const match = dotMatches[dotMatches.length - 1]; const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0) return { value: num, clean: text.slice(0, match.index).trim() + ' ' + text.slice(match.index! + match[0].length).trim() };
  }
  const integerPattern = /\b(\d{2,6})\b/g;
  const integerMatches: RegExpExecArray[] = []; let integerMatch: RegExpExecArray | null;
  while ((integerMatch = integerPattern.exec(text)) !== null) integerMatches.push(integerMatch);
  if (integerMatches.length > 0) {
    let bestMatch = integerMatches[0]; let bestValue = parseFloat(bestMatch[1]);
    for (const m of integerMatches) { const val = parseFloat(m[1]); if (val > bestValue) { bestMatch = m; bestValue = val; } }
    if (!isNaN(bestValue) && bestValue > 0) return { value: bestValue, clean: text.slice(0, bestMatch.index).trim() + ' ' + text.slice(bestMatch.index! + bestMatch[0].length).trim() };
  }
  return null;
}
