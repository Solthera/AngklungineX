// ============================================================
// mapping_pin.ino — Tes 14 central lock via serial (angka 1..14)
//
// WIRING TERBARU: docs/wiring-angklung.md
// Kirim satu karakter per baris, diakhiri '\n':
//   '1'..'14' -> pukul central lock sesuai nomor wiring
//   '0'       -> stop semua
// Cocok untuk mengetes tiap aktuator cepat sebelum pakai
// SerialControl_AngklungineX.ino (yang versi nama-nada).
// ============================================================

const byte centralLock[14][2] = {
  {49, 47},  // central lock 1
  {45, 43},  // central lock 2
  {41, 39},  // central lock 3
  {37, 35},  // central lock 4
  {33, 31},  // central lock 5
  {29, 27},  // central lock 6
  {25, 23},  // central lock 7
  {48, 46},  // central lock 8
  {44, 42},  // central lock 9
  {40, 38},  // central lock 10
  {36, 34},  // central lock 11
  {32, 30},  // central lock 12
  {28, 26},  // central lock 13
  {24, 22}   // central lock 14
};

const unsigned long DURASI_BUNYI = 300;
const unsigned int  DURASI_MAJU = 50;
const unsigned int  DURASI_MUNDUR = 50;
const unsigned int  JEDA_BALIK = 30;

void setup() {
  Serial.begin(9600);
  for (byte i = 0; i < 14; i++) {
    pinMode(centralLock[i][0], OUTPUT);
    pinMode(centralLock[i][1], OUTPUT);
  }
  matikanSemua();
  Serial.println("ready — kirim angka 1..14 (\\n), 0 = stop semua");
}

void arahMaju(byte i)   { digitalWrite(centralLock[i][0], HIGH); digitalWrite(centralLock[i][1], LOW); }
void arahMundur(byte i) { digitalWrite(centralLock[i][0], LOW);  digitalWrite(centralLock[i][1], HIGH); }
void berhenti(byte i)   { digitalWrite(centralLock[i][0], LOW);  digitalWrite(centralLock[i][1], LOW); }

void matikanSemua() {
  for (byte i = 0; i < 14; i++) berhenti(i);
}

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

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "0" || cmd == "none") { matikanSemua(); return; }

    byte nomor = cmd.toInt();
    if (nomor >= 1 && nomor <= 14) {
      Serial.print("Pukul central lock ");
      Serial.println(nomor);
      bunyikan(nomor - 1);
    } else {
      Serial.println("Perintah tak dikenal. Kirim 1..14 atau 0.");
    }
  }
}
