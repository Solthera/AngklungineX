import { useState, useEffect } from 'react';

const keyToNodeMap: Record<string, string> = {
  'q': 'G-Object009',
  'w': 'G-Object018',
  'e': 'G-Object001',
  'r': 'G-Object002',
  't': 'G-Object003',
  '1': 'G-Object004',
  '2': 'G-Object005',
  '3': 'G-Object006',
  '4': 'G-Object007',
  '5': 'G-Object008',
  '6': 'G-Object010',
  '7': 'G-Object011',
  '8': 'G-Object013',
  '9': 'G-Object012'
};

export function useKeyboardAngklung() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToNodeMap[key]) {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.add(keyToNodeMap[key]);
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyToNodeMap[key]) {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(keyToNodeMap[key]);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return activeNotes;
}
