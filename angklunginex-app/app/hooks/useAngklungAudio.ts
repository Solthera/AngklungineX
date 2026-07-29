import { useEffect, useRef } from 'react';

const AUDIO_MAP: Record<string, string> = {
  'G-Object009': '/angklung-14-nada/Sol-rendah-(G).wav',
  'G-Object018': '/angklung-14-nada/La-rendah-(A).wav',
  'G-Object001': '/angklung-14-nada/Ti-rendah-(B).wav',
  'G-Object002': '/angklung-14-nada/Do-(C).wav',
  'G-Object003': '/angklung-14-nada/Re-(D).wav',
  'G-Object004': '/angklung-14-nada/Mi-(E).wav',
  'G-Object005': '/angklung-14-nada/Fa-(F).wav',
  'G-Object006': '/angklung-14-nada/Fis-(F-sharp).wav',
  'G-Object007': '/angklung-14-nada/Sol-(G).wav',
  'G-Object008': '/angklung-14-nada/La-(A).wav',
  'G-Object010': '/angklung-14-nada/Ti-(B).wav',
  'G-Object011': '/angklung-14-nada/Do-tinggi-(C).wav',
  'G-Object013': '/angklung-14-nada/Re-tinggi-(D).wav',
  'G-Object012': '/angklung-14-nada/Mi-tinggi-(E).wav'
}

export function useAngklungAudio(activeNotes: Set<string>) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  const prevNotesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    Object.entries(AUDIO_MAP).forEach(([nodeId, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
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
