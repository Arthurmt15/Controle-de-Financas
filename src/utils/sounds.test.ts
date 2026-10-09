/**
 * @file utils/sounds.test.ts
 * @description Testes do motor de sons (jsdom não tem AudioContext — deve falhar silencioso).
 */
import { playSound, isSoundEnabled, setSoundEnabled, SOUND_LABELS, initGlobalSounds, type SoundName } from './sounds';

describe('sounds', () => {
  afterEach(() => {
    setSoundEnabled(true);
  });

  it('toca todos os sons sem lançar exceção (mesmo sem AudioContext)', () => {
    for (const name of Object.keys(SOUND_LABELS) as SoundName[]) {
      expect(() => playSound(name)).not.toThrow();
      expect(() => playSound(name, { force: true })).not.toThrow();
    }
  });

  it('liga/desliga e persiste a preferência', () => {
    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    expect(() => playSound('success')).not.toThrow();
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('fallback global é idempotente e não quebra em clique/hover', () => {
    expect(() => initGlobalSounds()).not.toThrow();
    expect(() => initGlobalSounds()).not.toThrow();
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    expect(() =>
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    ).not.toThrow();
    expect(() => btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))).not.toThrow();
    document.body.removeChild(btn);
  });
});
