import { useEffect, useRef } from 'react';
import solRendah from '~/assets/angklung-14-nada/Sol-rendah-(G).wav';
import laRendah from '~/assets/angklung-14-nada/La-rendah-(A).wav';
import tiRendah from '~/assets/angklung-14-nada/Ti-rendah-(B).wav';
import doNote from '~/assets/angklung-14-nada/Do-(C).wav';
import reNote from '~/assets/angklung-14-nada/Re-(D).wav';
import miNote from '~/assets/angklung-14-nada/Mi-(E).wav';
import faNote from '~/assets/angklung-14-nada/Fa-(F).wav';
import fisNote from '~/assets/angklung-14-nada/Fis-(F-sharp).wav';
import solNote from '~/assets/angklung-14-nada/Sol-(G).wav';
import laNote from '~/assets/angklung-14-nada/La-(A).wav';
import tiNote from '~/assets/angklung-14-nada/Ti-(B).wav';
import doTinggi from '~/assets/angklung-14-nada/Do-tinggi-(C).wav';
import reTinggi from '~/assets/angklung-14-nada/Re-tinggi-(D).wav';
import miTinggi from '~/assets/angklung-14-nada/Mi-tinggi-(E).wav';

const AUDIO_MAP: Record<string, string> = {
  'G-Object009': solRendah,
  'G-Object018': laRendah,
  'G-Object001': tiRendah,
  'G-Object002': doNote,
  'G-Object003': reNote,
  'G-Object004': miNote,
  'G-Object005': faNote,
  'G-Object006': fisNote,
  'G-Object007': solNote,
  'G-Object008': laNote,
  'G-Object010': tiNote,
  'G-Object011': doTinggi,
  'G-Object013': reTinggi,
  'G-Object012': miTinggi
}

export function useAngklungAudio(activeNotes: Set<string>) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const prevNotesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    Object.entries(AUDIO_MAP).forEach(([nodeId, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.loop = true; // loop selama nada aktif
      audioCache.current[nodeId] = audio;
    });
    return () => {
      Object.values(audioCache.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioCache.current = {};
    };
  }, []);

  useEffect(() => {
    const prevNotes = prevNotesRef.current;

    activeNotes.forEach((nodeId) => {
      if (!prevNotes.has(nodeId)) {
        const audio = audioCache.current[nodeId];
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(e => console.error("Audio play failed:", e));
        }
      }
    });

    prevNotes.forEach((nodeId) => {
      if (!activeNotes.has(nodeId)) {
        const audio = audioCache.current[nodeId];
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    });

    prevNotesRef.current = new Set(activeNotes);
  }, [activeNotes]);
}
