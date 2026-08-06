// ============================================================
// SerialControl_AngklungineX.ino
// Kontrol 14 central lock angklung via serial (dari Python).
//
// WIRING TERBARU: docs/wiring-angklung.md
// Tiap aktuator = 2 pin {IN1, IN2} -> driver/relay central lock.
//
// Perintah serial (satu per baris, diakhiri '\n'):
//   "sol_bawah", "la_bawah", "si_bawah"/"ti_bawah", "do", "re",
//   "mi", "fa", "fa#"/"fa2", "sol", "la", "si"/"ti",
//   "do_atas", "re_atas", "mi_atas", atau "none" (stop semua)
// ============================================================

const byte centralLock[14][2] = {
  {49, 47},  // central lock 1  -> fa#
  {45, 43},  // central lock 2  -> sol
  {41, 39},  // central lock 3  -> la
  {37, 35},  // central lock 4  -> ti
  {33, 31},  // central lock 5  -> do_atas
  {29, 27},  // central lock 6  -> re_atas
  {25, 23},  // central lock 7  -> mi_atas
  {48, 46},  // central lock 8  -> sol_bawah
  {44, 42},  // central lock 9  -> la_bawah
  {40, 38},  // central lock 10 -> si_bawah
  {36, 34},  // central lock 11 -> do
  {32, 30},  // central lock 12 -> re
  {28, 26},  // central lock 13 -> mi
  {24, 22}   // central lock 14 -> fa
};

// Map perintah serial -> central lock (index 1..14, 0 = tak dikenal)
struct NoteMap { const char* cmd; byte index; };
const NoteMap noteMap[] = {
  {"sol_bawah", 8},
  {"la_bawah",  9},
  {"si_bawah", 10},
  {"ti_bawah", 10},
  {"do",       11},
  {"re",       12},
  {"mi",       13},
  {"fa",       14},
  {"fa#",       1},
  {"fa2",       1},
  {"sol",       2},
  {"la",        3},
  {"si",        4},
  {"ti",        4},
  {"do_atas",   5},
  {"re_atas",   6},
  {"mi_atas",   7}
};

// Timing pukul (ms)
const unsigned long DURASI_BUNYI = 300;  // total durasi pukul
const unsigned int  DURASI_MAJU = 50;    // maju (dorong solenoid)
const unsigned int  DURASI_MUNDUR = 50;  // mundur (tarik balik)
const unsigned int  JEDA_BALIK = 30;     // jeda ganti arah

void setup() {
  Serial.begin(9600);
  for (byte i = 0; i < 14; i++) {
    pinMode(centralLock[i][0], OUTPUT);
    pinMode(centralLock[i][1], OUTPUT);
  }
  matikanSemua();
  Serial.println("ready");
}

void arahMaju(byte i)   { digitalWrite(centralLock[i][0], HIGH); digitalWrite(centralLock[i][1], LOW); }
void arahMundur(byte i) { digitalWrite(centralLock[i][0], LOW);  digitalWrite(centralLock[i][1], HIGH); }
void berhenti(byte i)   { digitalWrite(centralLock[i][0], LOW);  digitalWrite(centralLock[i][1], LOW); }

void matikanSemua() {
  for (byte i = 0; i < 14; i++) berhenti(i);
}

// Pukul satu aktuator: maju -> stop -> mundur -> stop
void bunyikan(byte i) {
  matikanSemua();
  unsigned long mulai = millis();
  while (millis() - mulai < DURASI_BUNYI) {
    arahMaju(i);    delay(DURASI_MAJU);
    berhenti(i);    delay(JEDA_BALIK);
    arahMundur(i);  delay(DURASI_MUNDUR);
    berhenti(i);    delay(JEDA_BALIK);
  }
  berhenti(i);
}

byte cariNote(String cmd) {
  for (unsigned int i = 0; i < sizeof(noteMap) / sizeof(noteMap[0]); i++) {
    if (cmd == noteMap[i].cmd) return noteMap[i].index;
  }
  return 0; // tak dikenal
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "none") { matikanSemua(); return; }

    byte idx = cariNote(cmd);
    if (idx > 0) bunyikan(idx - 1);
  }
}
