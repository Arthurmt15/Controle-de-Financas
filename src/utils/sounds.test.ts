/**
 * @file utils/sounds.test.ts
 * @description Testes do motor de sons (jsdom não tem AudioContext — deve falhar silencioso).
 */
import { playSound, isSoundEnabled, setSoundEnabled, SOUND_LABELS, type SoundName } from './sounds';

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
});
