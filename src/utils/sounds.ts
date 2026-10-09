/**
 * @file utils/sounds.ts
 * @description Efeitos sonoros sintetizados via Web Audio API (sem arquivos nem dependências).
 * Cada ação do app tem um som próprio e curto. Nunca quebra o app: tudo é
 * envolvido em try/catch e o AudioContext é criado sob demanda (política de
 * autoplay dos navegadores). Preferência persistida em localStorage.
 */

export type SoundName =
  | 'income'
  | 'expense'
  | 'create'
  | 'update'
  | 'delete'
  | 'success'
  | 'error'
  | 'send'
  | 'receive'
  | 'click'
  | 'drawer'
  | 'hover';

/** Rótulos amigáveis para a tela de Configurações */
export const SOUND_LABELS: Record<SoundName, string> = {
  income: 'Receita recebida',
  expense: 'Despesa lançada',
  create: 'Item criado',
  update: 'Item atualizado',
  delete: 'Item removido',
  success: 'Concluído',
  error: 'Erro',
  send: 'Mensagem enviada',
  receive: 'Resposta recebida',
  click: 'Toque',
  drawer: 'Abrir menu',
  hover: 'Passar o mouse',
};

interface Tone {
  /** Frequência inicial (Hz) */
  freq: number;
  /** Frequência final (glide); omitido = nota fixa */
  slideTo?: number;
  /** Atraso em segundos a partir do início */
  at: number;
  /** Duração em segundos */
  dur: number;
  type?: OscillatorType;
  /** Ganho 0..1 (padrão 0.12) */
  vol?: number;
}

const SOUNDS: Record<SoundName, Tone[]> = {
  // Moedinhas subindo — receita
  income: [
    { freq: 880, at: 0, dur: 0.09 },
    { freq: 1174.66, at: 0.08, dur: 0.09 },
    { freq: 1567.98, at: 0.16, dur: 0.14 },
  ],
  // Toque duplo grave e suave — despesa
  expense: [
    { freq: 392, at: 0, dur: 0.1, type: 'triangle' },
    { freq: 311.13, at: 0.1, dur: 0.14, type: 'triangle' },
  ],
  // Subida rápida — criação genérica
  create: [
    { freq: 523.25, at: 0, dur: 0.08 },
    { freq: 783.99, at: 0.07, dur: 0.12 },
  ],
  // Blip neutro duplo — atualização
  update: [
    { freq: 600, at: 0, dur: 0.06, type: 'triangle' },
    { freq: 900, at: 0.06, dur: 0.08, type: 'triangle' },
  ],
  // Descida — remoção
  delete: [{ freq: 420, slideTo: 140, at: 0, dur: 0.22, type: 'sawtooth', vol: 0.07 }],
  // Tríade maior — concluído
  success: [
    { freq: 523.25, at: 0, dur: 0.1 },
    { freq: 659.25, at: 0.09, dur: 0.1 },
    { freq: 783.99, at: 0.18, dur: 0.16 },
  ],
  // Grave duplo — erro (baixo e discreto)
  error: [
    { freq: 220, at: 0, dur: 0.12, type: 'square', vol: 0.05 },
    { freq: 174.61, at: 0.11, dur: 0.18, type: 'square', vol: 0.05 },
  ],
  // Pop curto — envio
  send: [{ freq: 950, at: 0, dur: 0.06, type: 'triangle' }],
  // Ding suave — resposta
  receive: [
    { freq: 659.25, at: 0, dur: 0.09, type: 'sine', vol: 0.1 },
    { freq: 880, at: 0.08, dur: 0.12, type: 'sine', vol: 0.1 },
  ],
  // Tick mínimo — toques
  click: [{ freq: 1250, at: 0, dur: 0.03, vol: 0.05 }],
  // Swoosh suave para cima — abrir menu/drawer/chat
  drawer: [{ freq: 480, slideTo: 940, at: 0, dur: 0.1, type: 'triangle', vol: 0.09 }],
  // Tick quase inaudível — hover (sempre via playHover, que limita a frequência)
  hover: [{ freq: 1500, at: 0, dur: 0.025, vol: 0.028 }],
};

const STORAGE_KEY = 'financas_sounds_enabled';

let ctx: AudioContext | null = null;
let unlocked = false;

function ensureUnlockListeners(): void {
  if (unlocked || typeof window === 'undefined') return;
  unlocked = true;
  const unlock = () => {
    try {
      getContext()?.resume().catch(() => {});
    } catch {
      // ignora — áudio é opcional
    }
  };
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
}

function getContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx.state === 'running' ? ctx : ctx;
  } catch {
    return null;
  }
}

/** Sons ativados? Padrão: sim. */
export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

/** Liga/desliga todos os sons. */
export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // storage indisponível — ignora
  }
}

/**
 * Toca um efeito. Nunca lança exceção.
 * @param force ignora a preferência (usado na prévia da tela de Sons)
 */
export function playSound(name: SoundName, opts?: { force?: boolean }): void {
  try {
    ensureUnlockListeners();
    if (name !== 'click' && name !== 'hover') lastSpecificAt = Date.now();
    if (!opts?.force && !isSoundEnabled()) return;
    const ac = getContext();
    const tones = SOUNDS[name];
    if (!ac || !tones) return;
    const now = ac.currentTime;
    for (const tone of tones) {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = tone.type || 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.at);
      if (tone.slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(tone.slideTo, 1), now + tone.at + tone.dur);
      }
      const vol = tone.vol ?? 0.12;
      gain.gain.setValueAtTime(0.0001, now + tone.at);
      gain.gain.exponentialRampToValueAtTime(vol, now + tone.at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.at + tone.dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now + tone.at);
      osc.stop(now + tone.at + tone.dur + 0.02);
    }
  } catch {
    // áudio nunca pode quebrar o app
  }
}

let lastHoverAt = 0;
let lastSpecificAt = 0;
let globalInit = false;
/** Janela (ms) em que o clique global é suprimido após um som específico. */
const FALLBACK_SUPPRESS_MS = 500;

/** Tick de hover com throttle (máx. ~1 a cada 90ms) para não virar ruído. */
export function playHover(): void {
  try {
    const now = Date.now();
    if (now - lastHoverAt < 90) return;
    lastHoverAt = now;
    playSound('hover');
  } catch {
    // ignora
  }
}

const CLICKABLE_SELECTOR =
  'button, a, [role="button"], [role="tab"], [role="menuitem"], select, input[type="checkbox"], input[type="radio"], label';

/**
 * Liga o fallback global (idempotente): qualquer clique/toque em elemento
 * interativo toca 'click' e qualquer hover sobre eles toca o tick — exceto
 * quando um som específico tocou há menos de 500ms (evita duplicar com os
 * sons de ação como income/success). Cobre o app inteiro sem fiação manual.
 */
export function initGlobalSounds(): void {
  try {
    if (globalInit || typeof document === 'undefined' || typeof window === 'undefined') return;
    globalInit = true;
    document.addEventListener(
      'click',
      (e) => {
        try {
          const el = e.target as Element | null;
          if (!el || typeof (el as Element).closest !== 'function') return;
          if (!(el as Element).closest(CLICKABLE_SELECTOR)) return;
          if (Date.now() - lastSpecificAt < FALLBACK_SUPPRESS_MS) return;
          playSound('click');
        } catch {
          // ignora
        }
      },
      { capture: true, passive: true }
    );
    document.addEventListener(
      'mouseover',
      (e) => {
        try {
          const el = e.target as Element | null;
          if (!el || typeof (el as Element).closest !== 'function') return;
          if (!(el as Element).closest('button, a, [role="button"], [role="tab"], [role="menuitem"]'))
            return;
          playHover();
        } catch {
          // ignora
        }
      },
      { passive: true }
    );
  } catch {
    // ignora
  }
}
