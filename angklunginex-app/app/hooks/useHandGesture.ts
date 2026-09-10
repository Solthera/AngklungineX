import solRendah from '~/assets/handsign/sol,.webp'
import laRendah from '~/assets/handsign/la,.webp'
import tiRendah from '~/assets/handsign/ti,.webp'
import doNote from '~/assets/handsign/do.webp'
import reNote from '~/assets/handsign/re.webp'
import miNote from '~/assets/handsign/mi.webp'
import faNote from '~/assets/handsign/fa.webp'
import fis from '~/assets/handsign/fis.webp'
import solNote from '~/assets/handsign/sol.webp'
import laNote from '~/assets/handsign/la.webp'
import tiNote from '~/assets/handsign/ti.webp'
import doTinggi from '~/assets/handsign/do`.webp'
import reTinggi from '~/assets/handsign/re`.webp'
import miTinggi from '~/assets/handsign/mi`.webp'

export type HandGesture = {
  /** Label gesture dari useGestureWs (lihat LABEL_TO_NODE di lib/angklung) */
  label: string
  image: string
}

// Konvensi nama file: tanpa aksen = nada tengah, akhiran "`" = nada tinggi,
// akhiran "," = nada rendah. Urut dari nada rendah → tinggi.
// Catatan: nada tengah "ti" dan "fa#" belum punya file gambar.
export const HAND_GESTURES: HandGesture[] = [
  // Rendah (,)
  { label: 'Sol rendah', image: solRendah },
  { label: 'La rendah', image: laRendah },
  { label: 'Ti rendah', image: tiRendah },
  // Tengah
  { label: 'Do', image: doNote },
  { label: 'Re', image: reNote },
  { label: 'Mi', image: miNote },
  { label: 'Fa', image: faNote },
  { label: 'Fa sharp', image: fis },
  { label: 'Sol', image: solNote },
  { label: 'La', image: laNote },
  { label: 'Ti', image: tiNote},
  // Tinggi (`)
  { label: "Do'", image: doTinggi },
  { label: "Re'", image: reTinggi },
  { label: "Mi'", image: miTinggi },
]

export function useHandGesture() {
  return { gestures: HAND_GESTURES }
}
