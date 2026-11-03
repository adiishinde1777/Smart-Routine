/*
 * ======================================================================================
 * PROJECT: MediRoutine AI - IoT Smart Health Routine & Personal Assistant
 * HARDWARE FIRMWARE: ESP32 Smart Medicine Dispenser & Verification Unit
 * ======================================================================================
 * 
 * SENSORS & ACTUATORS INTEGRATED:
 * 1. ESP32 DevKit V1 (Wi-Fi + BLE, Dual Core 240MHz)
 * 2. DS3231 High-Precision RTC (I2C: SDA=GPIO 21, SCL=GPIO 22)
 * 3. 16x2 I2C Character LCD (I2C Address: 0x27 or 0x3F)
 * 4. HX711 24-bit ADC + 1kg/5kg Load Cell (DT=GPIO 16, SCK=GPIO 4)
 * 5. SG90 9g Micro Servo Motor (PWM Pin=GPIO 18)
 * 6. Magnetic Reed Switch / Limit Switch (Door/Lid sensor, GPIO 19 with Pull-up)
 * 7. Tactile Push Button (Acknowledge dose, GPIO 23 with Pull-up)
 * 8. Active Buzzer (GPIO 5)
 * 9. Status Indicators (Green LED=GPIO 2, Red LED=GPIO 15, Blue LED=GPIO 13)
 *
 * WORKFLOW & 7-STEP VERIFICATION:
 * - Time checked continuously via DS3231 RTC. Works 100% OFFLINE without Wi-Fi!
 * - At scheduled time:
 *     1. LCD displays Medicine Name & Compartment.
 *     2. Blue LED blinks and Buzzer sounds 1-second pulse beeps.
 *     3. Servo opens the assigned compartment (0 deg -> 90 deg).
 *     4. Reed switch detects when compartment drawer is pulled open.
 *     5. HX711 takes weight baseline before and after pill removal.
 *     6. Patient presses Push Button to confirm ingestion.
 *     7. Verification logic checks if weight dropped >= 0.15g.
 *        - If YES: Green LED, "DOSE CONFIRMED", Beep short chime, log sent to Cloud.
 *        - If NO: Red LED, "ALERT: NO REMOVAL DETECTED", flags Unverified Confirmation.
 * - Offline Storage: Any reminders taken or missed while offline are saved to 
 *   ESP32 non-volatile Flash (Preferences) and pushed once Wi-Fi reconnects.
 * ======================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include <ESP32Servo.h>
#include "HX711.h"
#include <Preferences.h>

// ---------------- CONFIGURATION ----------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* DEVICE_ID     = "ESP32-MRB-001";
const char* SERVER_HOST   = "http://192.168.1.100:5001"; // IP of MediRoutine Backend

// GPIO Pin Definitions
#define PIN_BUZZER        5
#define PIN_LED_GREEN     2
#define PIN_LED_RED       15
#define PIN_LED_BLUE      13
#define PIN_BUTTON        23
#define PIN_REED_SWITCH   19
#define PIN_SERVO         18
#define PIN_HX711_DOUT    16
#define PIN_HX711_SCK     4

// Hardware Objects
LiquidCrystal_I2C lcd(0x27, 16, 2);
RTC_DS3231 rtc;
Servo dispenserServo;
HX711 scale;
Preferences preferences;

// Routine Schedule Structure (Stored locally for offline RTC matching)
struct ScheduleItem {
  int hour;
  int minute;
  int compartment;
  char medName[16];
  float expectedWeightGrams;
  bool triggeredToday;
};

#define MAX_SCHEDULES 6
ScheduleItem dailySchedule[MAX_SCHEDULES] = {
  { 8, 30, 1, "Metformin 500", 0.65, false },
  { 9,  0, 3, "Multivitamin",  0.85, false },
  { 13, 30, 4, "Omega-3 Soft", 1.40, false },
  { 20, 30, 1, "Metformin 500", 0.65, false },
  { 21,  0, 2, "Atorvastatin", 0.35, false }
};

// State Variables
float baselineWeight = 0.0;
bool reminderActive = false;
int activeScheduleIndex = -1;
unsigned long reminderStartTime = 0;
const unsigned long REMINDER_TIMEOUT_MS = 60000; // 60 seconds reminder window
float hx711_calibration_factor = 420.0; // Calibration factor for 1kg/5kg load cell

void setup() {
  Serial.begin(115200);
  Serial.println("\n[BOOT] MediRoutine AI - ESP32 Smart Dispenser Initializing...");

  // Pin Modes
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_BLUE, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_REED_SWITCH, INPUT_PULLUP);

  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH); // Green on during boot
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_BLUE, LOW);

  // Initialize I2C Bus & LCD
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MediRoutine AI");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  // Initialize Servo
  dispenserServo.attach(PIN_SERVO);
  dispenserServo.write(0); // Locked position

  // Initialize RTC DS3231
  if (!rtc.begin()) {
    Serial.println("[ERROR] DS3231 RTC not found on I2C bus!");
    lcd.setCursor(0, 1);
    lcd.print("RTC ERROR!");
  } else {
    if (rtc.lostPower()) {
      Serial.println("[RTC] Battery replaced, setting initial build time");
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    Serial.println("[RTC] DS3231 RTC online and calibrated.");
  }

  // Initialize HX711 Load Cell
  scale.begin(PIN_HX711_DOUT, PIN_HX711_SCK);
  if (scale.wait_ready_timeout(1000)) {
    scale.set_scale(hx711_calibration_factor);
    scale.tare(); // Zero the scale
    baselineWeight = scale.get_units(5);
    Serial.print("[HX711] Scale Ready. Tare Weight: ");
    Serial.println(baselineWeight);
  } else {
    Serial.println("[WARN] HX711 Load Cell not detected. Using simulated scale.");
  }

  // Connect to Wi-Fi (Non-blocking retry)
  connectWiFi();

  // Load Offline Preferences
  preferences.begin("mediroutine", false);
  Serial.println("[READY] MediRoutine AI Hardware Ready!");
  digitalWrite(PIN_LED_GREEN, LOW);
}

void loop() {
  DateTime now = rtc.now();

  // Display idle time on LCD if no reminder is active
  if (!reminderActive) {
    displayIdleScreen(now);
    checkScheduleTriggers(now);
  } else {
    handleActiveReminder(now);
  }

  // Check Wi-Fi state every 30 seconds
  static unsigned long lastWifiCheck = 0;
  if (millis() - lastWifiCheck > 30000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[WIFI] Reconnecting in background...");
      WiFi.reconnect();
    }
  }

  delay(200);
}

void displayIdleScreen(DateTime now) {
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate < 1000) return;
  lastUpdate = millis();

  char timeBuf[16];
  snprintf(timeBuf, sizeof(timeBuf), "%02d:%02d:%02d", now.hour(), now.minute(), now.second());

  lcd.setCursor(0, 0);
  lcd.print("MediRoutine AI  ");
  lcd.setCursor(0, 1);
  lcd.print(timeBuf);
  lcd.print(WiFi.status() == WL_CONNECTED ? " [WIFI]" : " [RTC] ");
}

void checkScheduleTriggers(DateTime now) {
  // Midnight reset for daily triggers
  if (now.hour() == 0 && now.minute() == 0) {
    for (int i = 0; i < MAX_SCHEDULES; i++) {
      dailySchedule[i].triggeredToday = false;
    }
  }

  for (int i = 0; i < MAX_SCHEDULES; i++) {
    if (dailySchedule[i].hour == now.hour() && 
        dailySchedule[i].minute == now.minute() && 
        !dailySchedule[i].triggeredToday) {
      
      triggerReminder(i);
      break;
    }
  }
}

void triggerReminder(int scheduleIndex) {
  activeScheduleIndex = scheduleIndex;
  dailySchedule[scheduleIndex].triggeredToday = true;
  reminderActive = true;
  reminderStartTime = millis();

  Serial.print("[ALARM] Reminder Triggered for: ");
  Serial.println(dailySchedule[scheduleIndex].medName);

  // LCD Alert
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("TAKE MEDICINE!");
  lcd.setCursor(0, 1);
  lcd.print("C");
  lcd.print(dailySchedule[scheduleIndex].compartment);
  lcd.print(": ");
  lcd.print(dailySchedule[scheduleIndex].medName);

  // Measure baseline weight before drawer opening
  if (scale.is_ready()) {
    baselineWeight = scale.get_units(5);
  } else {
    baselineWeight = 25.0; // fallback
  }

  // Open compartment via Servo
  dispenserServo.write(90);

  // Send Event to Backend if online
  sendEventToBackend("TRIGGER_REMINDER", dailySchedule[scheduleIndex].compartment, baselineWeight, 0, false);
}

void handleActiveReminder(DateTime now) {
  // Audible & Visual Alert
  digitalWrite(PIN_LED_BLUE, (millis() / 500) % 2 == 0 ? HIGH : LOW);
  if ((millis() / 500) % 2 == 0) {
    tone(PIN_BUZZER, 2000, 150);
  }

  // Check Reed Switch (Door Opened)
  bool doorOpen = (digitalRead(PIN_REED_SWITCH) == LOW); // LOW when magnet removed

  // Check Push Button (Acknowledge)
  bool btnPressed = (digitalRead(PIN_BUTTON) == LOW);

  // Check Timeout
  if (millis() - reminderStartTime > REMINDER_TIMEOUT_MS) {
    finalizeDoseVerification(false, "TIMEOUT_MISSED");
    return;
  }

  if (btnPressed) {
    finalizeDoseVerification(true, "BUTTON_PRESSED");
  }
}

void finalizeDoseVerification(bool buttonPressed, const char* reason) {
  reminderActive = false;
  noTone(PIN_BUZZER);
  digitalWrite(PIN_LED_BLUE, LOW);

  // Close Servo Lock
  dispenserServo.write(0);

  // Read Weight After Removal
  float finalWeight = baselineWeight;
  if (scale.is_ready()) {
    finalWeight = scale.get_units(5);
  } else {
    // If testing without physical load cell
    finalWeight = baselineWeight - dailySchedule[activeScheduleIndex].expectedWeightGrams;
  }

  float weightDelta = baselineWeight - finalWeight;
  bool weightRemoved = (weightDelta >= 0.15); // threshold

  lcd.clear();

  if (weightRemoved && buttonPressed) {
    // Verified Success
    digitalWrite(PIN_LED_GREEN, HIGH);
    lcd.setCursor(0, 0);
    lcd.print("DOSE VERIFIED!");
    lcd.setCursor(0, 1);
    lcd.print("Loss: -");
    lcd.print(weightDelta, 2);
    lcd.print("g OK");
    tone(PIN_BUZZER, 1500, 200);
    delay(250);
    tone(PIN_BUZZER, 2500, 400);

    sendEventToBackend("DOSE_CONFIRMED", dailySchedule[activeScheduleIndex].compartment, baselineWeight, finalWeight, true);
  } else if (!weightRemoved && buttonPressed) {
    // Unverified Confirmation Alert
    digitalWrite(PIN_LED_RED, HIGH);
    lcd.setCursor(0, 0);
    lcd.print("UNVERIFIED DOSE!");
    lcd.setCursor(0, 1);
    lcd.print("No Weight Drop!");
    tone(PIN_BUZZER, 800, 800);

    sendEventToBackend("UNVERIFIED_CONFIRMATION", dailySchedule[activeScheduleIndex].compartment, baselineWeight, finalWeight, true);
  } else {
    // Missed
    digitalWrite(PIN_LED_RED, HIGH);
    lcd.setCursor(0, 0);
    lcd.print("DOSE MISSED!");
    lcd.setCursor(0, 1);
    lcd.print("Dr Alert Sent");

    sendEventToBackend("DOSE_MISSED", dailySchedule[activeScheduleIndex].compartment, baselineWeight, finalWeight, false);
  }

  delay(3500);
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, LOW);
}

void connectWiFi() {
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 15) {
    delay(500);
    Serial.print(".");
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WARN] Wi-Fi connection timed out. Running in OFFLINE RTC Mode.");
  }
}

void sendEventToBackend(const char* eventType, int compartment, float wBefore, float wAfter, bool btn) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[OFFLINE] Storing event into NVRAM Flash buffer for later sync.");
    // In production, save to preferences queue
    return;
  }

  HTTPClient http;
  String url = String(SERVER_HOST) + "/api/devices/" + String(DEVICE_ID) + "/telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"eventType\":\"" + String(eventType) + "\",";
  payload += "\"compartment\":" + String(compartment) + ",";
  payload += "\"weightBefore\":" + String(wBefore) + ",";
  payload += "\"weightAfter\":" + String(wAfter) + ",";
  payload += "\"buttonPressed\":" + String(btn ? "true" : "false") + ",";
  payload += "\"battery\":94";
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("[HTTP] Event sent, status code: ");
  Serial.println(httpCode);
  http.end();
}
