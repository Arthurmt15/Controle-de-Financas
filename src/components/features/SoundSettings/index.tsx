/**
 * @file components/features/SoundSettings/index.tsx
 * @description Preferências de sons do app: liga/desliga geral + prévia de cada efeito.
 */

import React, { useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  playSound,
  isSoundEnabled,
  setSoundEnabled,
  SOUND_LABELS,
  type SoundName,
} from '../../../utils/sounds';

const SoundSettings: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => isSoundEnabled());

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playSound('success', { force: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Efeitos sonoros</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled ? 'Ativados — cada ação tem seu som.' : 'Desativados — app silencioso.'}
          </p>
        </div>
        <Button
          variant={enabled ? 'default' : 'outline'}
          className="rounded-xl gap-2 shrink-0"
          onClick={handleToggle}
          aria-pressed={enabled}
          aria-label={enabled ? 'Desativar sons' : 'Ativar sons'}
        >
          {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          {enabled ? 'Ativados' : 'Desativados'}
        </Button>
      </div>

      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground mb-2">
          Toque para ouvir cada som
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(SOUND_LABELS) as SoundName[]).map((name) => (
            <Button
              key={name}
              variant="outline"
              className="rounded-xl gap-2 h-11 text-xs justify-start"
              onClick={() => playSound(name, { force: true })}
              aria-label={`Ouvir som ${SOUND_LABELS[name]}`}
            >
              <Play className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{SOUND_LABELS[name]}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SoundSettings;
