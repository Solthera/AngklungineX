# Wiring Angklung & Arduino Mega 2560

*Oleh: kang Faruq*

Dokumentasi pemetaan pin dari Arduino Mega 2560 ke Modul Relay / Driver Central Lock Robot Angklung (14 Aktuator).

## Daftar Pemetaan Pin

| No. Central Lock | Pin Arduino IN1 | Pin Arduino IN2 | Keterangan |
|------------------|-----------------|-----------------|------------|
| 1                | 49              | 47              | Aktuator 1 |
| 2                | 45              | 43              | Aktuator 2 |
| 3                | 41              | 39              | Aktuator 3 |
| 4                | 37              | 35              | Aktuator 4 |
| 5                | 33              | 31              | Aktuator 5 |
| 6                | 29              | 27              | Aktuator 6 |
| 7                | 25              | 23              | Aktuator 7 |
| 8                | 48              | 46              | Aktuator 8 |
| 9                | 44              | 42              | Aktuator 9 |
| 10               | 40              | 38              | Aktuator 10|
| 11               | 36              | 34              | Aktuator 11|
| 12               | 32              | 30              | Aktuator 12|
| 13               | 28              | 26              | Aktuator 13|
| 14               | 24              | 22              | Aktuator 14|

## Kode Pengujian (Arduino)

Berikut adalah kode untuk menguji pergerakan masing-masing central lock secara berurutan.

```cpp
// Kode pengujian dari wiring-angklung.md sebelumnya
const byte centralLock[14][2] = {
  {49, 47},  // Central lock 1
  {45, 43},  // Central lock 2
  {41, 39},  // Central lock 3
  {37, 35},  // Central lock 4
  {33, 31},  // Central lock 5
  {29, 27},  // Central lock 6
  {25, 23},  // Central lock 7

  {48, 46},  // Central lock 8
  {44, 42},  // Central lock 9
  {40, 38},  // Central lock 10
  {36, 34},  // Central lock 11
  {32, 30},  // Central lock 12
  {28, 26},  // Central lock 13
  {24, 22}   // Central lock 14
};

const byte JUMLAH_CENTRAL_LOCK = 14;
const unsigned long DURASI_BUNYI = 1000;
const unsigned int DURASI_ARAH = 50;
const unsigned int JEDA_BALIK_ARAH = 30;
const unsigned int JEDA_ANTAR_AKTUATOR = 200;
const unsigned int JEDA_PENGULANGAN = 100000;

void setup() {
  Serial.begin(9600);
  for (byte i = 0; i < JUMLAH_CENTRAL_LOCK; i++) {
    pinMode(centralLock[i][0], OUTPUT);
    pinMode(centralLock[i][1], OUTPUT);
    digitalWrite(centralLock[i][0], LOW);
    digitalWrite(centralLock[i][1], LOW);
  }
  Serial.println("================================");
  Serial.println("Tes 14 central lock dimulai");
  Serial.println("================================");
  delay(1000);
}

void arahMaju(byte nomor) {
  digitalWrite(centralLock[nomor][0], HIGH);
  digitalWrite(centralLock[nomor][1], LOW);
}

void arahMundur(byte nomor) {
  digitalWrite(centralLock[nomor][0], LOW);
  digitalWrite(centralLock[nomor][1], HIGH);
}

void berhenti(byte nomor) {
  digitalWrite(centralLock[nomor][0], LOW);
  digitalWrite(centralLock[nomor][1], LOW);
}

void matikanSemua() {
  for (byte i = 0; i < JUMLAH_CENTRAL_LOCK; i++) {
    berhenti(i);
  }
}

void bunyikanCentralLock(byte nomor, unsigned long durasi) {
  unsigned long waktuMulai = millis();
  while (millis() - waktuMulai < durasi) {
    arahMaju(nomor);
    delay(DURASI_ARAH);
    berhenti(nomor);
    delay(JEDA_BALIK_ARAH);
    if (millis() - waktuMulai >= durasi) {
      break;
    }
    arahMundur(nomor);
    delay(DURASI_ARAH);
    berhenti(nomor);
    delay(JEDA_BALIK_ARAH);
  }
  berhenti(nomor);
}

void loop() {
  for (byte i = 0; i < JUMLAH_CENTRAL_LOCK; i++) {
    matikanSemua();
    Serial.print("Central lock ");
    Serial.print(i + 1);
    Serial.println(" sedang diuji...");
    bunyikanCentralLock(i, DURASI_BUNYI);
    Serial.print("Central lock ");
    Serial.print(i + 1);
    Serial.println(" selesai.");
    Serial.println("------------------------------");
    delay(JEDA_ANTAR_AKTUATOR);
  }
  matikanSemua();
  Serial.println("Semua central lock selesai diuji.");
  Serial.println("Mengulang dari central lock 1...");
  Serial.println();
  delay(JEDA_PENGULANGAN);
}
```
