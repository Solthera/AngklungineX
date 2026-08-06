// Mapping label gesture (dari Python) → node ID di GLB angklung
export const LABEL_TO_NODE: Record<string, string> = {
  "sol_bawah": "G-Object009", // Sol Rendah (5.)
  "la_bawah":  "G-Object018", // La Rendah (6.)
  "ti_bawah":  "G-Object001", // Ti Rendah (7.)
  "do":        "G-Object002", // Do (1)
  "re":        "G-Object003", // Re (2)
  "mi":        "G-Object004", // Mi (3)
  "fa":        "G-Object005", // Fa (4)
  "fa#":       "G-Object006", // Fis (4#)
  "sol":       "G-Object007", // Sol (5)
  "la":        "G-Object008", // La (6)
  "ti":        "G-Object010", // Ti (7)
  "do'":       "G-Object011", // Do Tinggi (1')
  "re'":       "G-Object013", // Re Tinggi (2')
  "mi'":       "G-Object012", // Mi Tinggi (3')
};

// Mapping node ID → nama nada yang ditampilkan ke user
export const NODE_TO_LABEL: Record<string, string> = {
  "G-Object009": "Sol Rendah (5.)",
  "G-Object018": "La Rendah (6.)",
  "G-Object001": "Ti Rendah (7.)",
  "G-Object002": "Do (1)",
  "G-Object003": "Re (2)",
  "G-Object004": "Mi (3)",
  "G-Object005": "Fa (4)",
  "G-Object006": "Fis (4#)",
  "G-Object007": "Sol (5)",
  "G-Object008": "La (6)",
  "G-Object010": "Ti (7)",
  "G-Object011": "Do Tinggi (1')",
  "G-Object013": "Re Tinggi (2')",
  "G-Object012": "Mi Tinggi (3')",
};
