/*
 * AngklungineX Arc-2 — Firmware Serial
 * 
 * Cara kerja:
 *   - Dengarkan Serial (115200 baud)
 *   - Terima command: "SOL1_ON\n", "DO2_OFF\n", "ALL_OFF\n"
 *   - Parse dan aktifkan/matikan solenoid yang sesuai
 * 
 * Pin mapping mengacu ke Arc-1 (Lagu_AngklungineX.ino)
 *   motor[N][0] = PWM pin (for enable)
 *   motor[N][1] = IN1
 *   motor[N][2] = IN2
 */

// ======================== PIN MAPPING ========================
// Format: {PWM, IN1, IN2}
// Urutan: Sol Rendah → Mi Tinggi (14 nada)

const int motor1[3]  = {A0, 46, 48};  // Sol Rendah
const int motor2[3]  = {A0, 42, 44};  // La Rendah
const int motor3[3]  = {A0, 38, 40};  // Ti Rendah
const int motor4[3]  = {A0, 34, 36};  // Do
const int motor5[3]  = {A0, 30, 32};  // Re
const int motor6[3]  = {A1, 26, 28};  // Mi
const int motor7[3]  = {A1, 22, 24};  // Fa
const int motor8[3]  = {A1, 47, 49};  // Fis
const int motor9[3]  = {A1, 43, 45};  // Sol
const int motor10[3] = {A1, 39, 41};  // La
const int motor11[3] = {A2, 35, 37};  // Ti
const int motor12[3] = {A2, 31, 33};  // Do Tinggi
const int motor13[3] = {A2, 27, 29};  // Re Tinggi
const int motor14[3] = {A2, 23, 25};  // Mi Tinggi

// Array dari semua motor untuk akses mudah
const int* allMotors[14] = {motor1, motor2, motor3, motor4, motor5, motor6, motor7, motor8, motor9, motor10, motor11, motor12, motor13, motor14};

// Nama notes (harus cocok dengan yang dikirim dari browser)
const char* noteNames[14] = {
  "SOL1", "LA1", "TI1", "DO2", "RE2", "MI2", "FA2", "FIS2",
  "SOL2", "LA2", "TI2", "DO3", "RE3", "MI3"
};

int motorState[14] = {0};  // 0 = OFF, 1 = ON

// Konfigurasi
const int STRIKE_DURATION = 70;  // ms per pukulan (forward/backward)
const int BAUD_RATE = 115200;

// ======================== SETUP ========================

void setup() {
  Serial.begin(BAUD_RATE);

  // Set semua pin sebagai OUTPUT
  for (int i = 0; i < 14; i++) {
    for (int j = 0; j < 3; j++) {
      pinMode(allMotors[i][j], OUTPUT);
      digitalWrite(allMotors[i][j], LOW);
    }
  }

  Serial.println("AngklungineX Arc-2 Ready");
}

// ======================== MOTOR CONTROL ========================

void activateMotor(int idx) {
  if (idx < 0 || idx >= 14) return;
  if (motorState[idx] == 1) return;  // already on

  const int* m = allMotors[idx];
  motorState[idx] = 1;

  // Forward strike
  digitalWrite(m[0], HIGH);  // PWM enable
  digitalWrite(m[1], HIGH);
  digitalWrite(m[2], LOW);
  delay(STRIKE_DURATION);

  // Backward strike
  digitalWrite(m[1], LOW);
  digitalWrite(m[2], HIGH);
  delay(STRIKE_DURATION);

  // Keep PWM high for sustain, but motor will oscillate
  // Actually for central lock: just one strike, then hold OFF
  digitalWrite(m[0], LOW);
  digitalWrite(m[1], LOW);
  digitalWrite(m[2], LOW);
  motorState[idx] = 0;

  Serial.print("OK:");
  Serial.println(noteNames[idx]);
}

void deactivateMotor(int idx) {
  if (idx < 0 || idx >= 14) return;
  // For safety: turn everything off
  const int* m = allMotors[idx];
  digitalWrite(m[0], LOW);
  digitalWrite(m[1], LOW);
  digitalWrite(m[2], LOW);
  motorState[idx] = 0;
}

void allOff() {
  for (int i = 0; i < 14; i++) {
    deactivateMotor(i);
  }
  Serial.println("ALL_OFF_OK");
}

// ======================== COMMAND PARSER ========================

int findNoteIndex(const char* name) {
  for (int i = 0; i < 14; i++) {
    if (strcmp(noteNames[i], name) == 0) {
      return i;
    }
  }
  return -1;  // not found
}

void executeCommand(char* cmd) {
  // Trim newline/carriage return
  cmd[strcspn(cmd, "\r\n")] = 0;

  // Handle ALL_OFF
  if (strcmp(cmd, "ALL_OFF") == 0) {
    allOff();
    return;
  }

  // Handle PING
  if (strcmp(cmd, "PING") == 0) {
    Serial.println("PONG");
    return;
  }

  // Parse: "SOL1_ON" or "DO2_OFF"
  // Format: NOTE_ACTION where NOTE = prefix, ACTION = ON/OFF
  
  // Find last underscore
  char* underscore = strrchr(cmd, '_');
  if (underscore == NULL) {
    Serial.println("ERR:FORMAT");
    return;
  }

  // Split into note name and action
  *underscore = '\0';
  char* noteName = cmd;
  char* action = underscore + 1;

  int idx = findNoteIndex(noteName);
  if (idx == -1) {
    Serial.print("ERR:UNKNOWN_NOTE:");
    Serial.println(noteName);
    return;
  }

  if (strcmp(action, "ON") == 0) {
    activateMotor(idx);
  } else if (strcmp(action, "OFF") == 0) {
    deactivateMotor(idx);
    Serial.print("OFF:");
    Serial.println(noteNames[idx]);
  } else {
    Serial.println("ERR:ACTION");
  }
}

// ======================== MAIN LOOP ========================

void loop() {
  if (Serial.available() > 0) {
    // Baca satu baris perintah
    char buffer[64];
    size_t len = Serial.readBytesUntil('\n', buffer, sizeof(buffer) - 1);
    buffer[len] = '\0';

    executeCommand(buffer);
  }
}
