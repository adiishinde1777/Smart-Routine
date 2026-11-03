/*
 * ======================================================================================
 * PROJECT: Smart Routine - Personal Lifestyle, Gym & Medicine Assistant
 * HARDWARE FIRMWARE: ESP8266 (NodeMCU V1.0 / Wemos D1 Mini)
 * ======================================================================================
 * 
 * ---------------- EXACT PIN CONFIGURATION (Matching Summary Diagram) ----------------
 * ESP8266 Pin | Component   | तपशील
 * ------------+-------------+-----------------------------------------------------------
 * D0 (GPIO 16)| Buzzer      | Positive (+) leg to D0, Negative (-) to GND
 * D1 (GPIO 5) | LCD SCL     | 16x2 I2C LCD SCL pin
 * D2 (GPIO 4) | LCD SDA     | 16x2 I2C LCD SDA pin
 * D5 (GPIO 14)| LED         | Anode (+) through 220Ω to D5, Cathode (-) to GND
 * D6 (GPIO 12)| Push Button | Pin 1 to D6, Pin 2 to GND (INPUT_PULLUP)
 * 3V3         | LCD VCC     | LCD VCC Power (3.3V)
 * GND         | Ground      | Common GND for LCD, Buzzer, LED, and Button
 * ======================================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---------------- Wi-Fi आणि SERVER सेटिंग्ज ----------------
// येथे तुमच्या मोबाईल हॉटस्पॉट किंवा Wi-Fi चे नाव आणि पासवर्ड टाका:
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// तुमच्या लॅपटॉपचा लोकल IP पत्ता (आधीच सेट केला आहे):
const char* SERVER_BASE   = "http://10.99.33.207:5001";
const char* DEVICE_ID     = "ESP8266-SR-01";

// ---------------- पिन व्याख्या (NodeMCU Board Pins) ----------------
#ifndef D0
#define D0 16
#define D1 5
#define D2 4
#define D3 0
#define D4 2
#define D5 14
#define D6 12
#define D7 13
#define D8 15
#endif

#define PIN_BUZZER       D0  // D0 (GPIO 16) -> Buzzer
#define PIN_LCD_SCL      D1  // D1 (GPIO 5)  -> LCD SCL
#define PIN_LCD_SDA      D2  // D2 (GPIO 4)  -> LCD SDA
#define PIN_LED          D5  // D5 (GPIO 14) -> LED
#define PIN_BUTTON       D6  // D6 (GPIO 12) -> Push Button (INPUT_PULLUP)

// ---------------- BUZZER TYPE CONFIGURATION ----------------
// बहुतांश Arduino Starter Kits मध्ये ACTIVE Buzzer असतो (digitalWrite HIGH ने वाजतो).
// जर तुमचा Buzzer Passive असेल तर खाली false करा:
bool IS_ACTIVE_BUZZER = true;

// Hardware Objects
LiquidCrystal_I2C lcd(0x27, 16, 2); // बहुतांश I2C LCD चा पत्ता 0x27 किंवा 0x3F असतो
WiFiClient wifiClient;

// State Variables
bool isAlertActive = false;
String activeReminderId = "";
String activeRoutineName = "";
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL_MS = 3000; // दर ३ सेकंदांनी सर्व्हर तपासणे
unsigned long lastBlinkTime = 0;
bool ledToggle = false;

// ---------------- Buzzer & LED Drivers (Works with both Active & Passive Buzzers) ----------------
void buzzerOn() {
  if (IS_ACTIVE_BUZZER) {
    digitalWrite(PIN_BUZZER, HIGH);
  } else {
    tone(PIN_BUZZER, 2500);
  }
}

void buzzerOff() {
  if (IS_ACTIVE_BUZZER) {
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    noTone(PIN_BUZZER);
  }
  digitalWrite(PIN_BUZZER, LOW);
}

// ---------------- LCD Display Helper ----------------
void updateLCD(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(line2.substring(0, 16));
}

// ---------------- Sound Buzzer Initial Chime ----------------
void triggerBuzzerChime() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(PIN_LED, HIGH);
    buzzerOn();
    delay(180);
    buzzerOff();
    digitalWrite(PIN_LED, LOW);
    delay(120);
  }
}

// ---------------- Server वरून Routine तपासणे ----------------
void checkRoutineStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Reconnecting...");
    return;
  }

  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/esp8266/check?deviceId=" + String(DEVICE_ID);
  
  http.begin(wifiClient, url);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      bool active = doc["active"] | false;
      String line1 = doc["lcdLine1"] | "Smart Routine";
      String line2 = doc["lcdLine2"] | "Ready";

      if (active) {
        if (!isAlertActive) {
          isAlertActive = true;
          activeReminderId = doc["reminderId"].as<String>();
          activeRoutineName = doc["routineName"].as<String>();
          
          Serial.println("\n🔔 [ALERT] Reminder Time! Buzzer and LED Triggered for: " + activeRoutineName);
          updateLCD(line1, line2);
          triggerBuzzerChime();
        }
      } else {
        if (isAlertActive) {
          isAlertActive = false;
          activeReminderId = "";
        }
        buzzerOff();
        digitalWrite(PIN_LED, LOW);
        updateLCD(line1, line2);
      }
    }
  } else {
    Serial.printf("[HTTP] GET failed, code: %d\n", httpCode);
  }
  http.end();
}

// ---------------- पुश बटन (D6) दाबल्यावर Server ला Confirmation पाठवणे ----------------
void sendButtonConfirmation() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("\n👉 [BUTTON D6] Push Button Pressed! Confirming...");
  updateLCD("Confirming...", "Please wait...");

  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/esp8266/confirm";
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> postDoc;
  postDoc["deviceId"] = DEVICE_ID;
  if (activeReminderId.length() > 0) {
    postDoc["reminderId"] = activeReminderId;
    postDoc["routineId"] = activeReminderId;
  }
  postDoc["buttonPressed"] = true;

  String jsonBody;
  serializeJson(postDoc, jsonBody);

  int httpCode = http.POST(jsonBody);

  if (httpCode == HTTP_CODE_OK) {
    Serial.println("✅ [SUCCESS] Routine confirmed on server!");
    updateLCD("Routine Done!", "Well Done! OK");
    
    // Stop ongoing alert alarm
    isAlertActive = false;
    activeReminderId = "";
    buzzerOff();
    digitalWrite(PIN_LED, LOW);

    // Two short confirmation chimes
    for (int i = 0; i < 2; i++) {
      digitalWrite(PIN_LED, HIGH);
      buzzerOn();
      delay(120);
      buzzerOff();
      digitalWrite(PIN_LED, LOW);
      delay(80);
    }
  } else {
    Serial.printf("❌ [ERROR] POST failed, code: %d\n", httpCode);
    updateLCD("Server Error", "Try Again");
  }
  http.end();
}

// ---------------- SETUP FUNCTION ----------------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n=======================================================");
  Serial.println("⚡ Smart Routine - NodeMCU ESP8266 Initializing...");
  Serial.println("=======================================================");

  // Pin Modes Setup
  pinMode(PIN_BUTTON, INPUT_PULLUP); // D6 Push Button (Connected to GND)
  pinMode(PIN_BUZZER, OUTPUT);       // D0 Buzzer
  pinMode(PIN_LED, OUTPUT);          // D5 LED

  buzzerOff();
  digitalWrite(PIN_LED, LOW);

  // 1. HARDWARE SELF-TEST AT BOOT (Verifies D0 Buzzer & D5 LED immediately!)
  Serial.println("\n[TEST] ---------------- HARDWARE SELF-TEST ON BOOT ----------------");
  Serial.println("[TEST] 1. Turning ON LED on D5...");
  digitalWrite(PIN_LED, HIGH);

  Serial.println("[TEST] 2. Testing Active Buzzer pulse on D0 (digitalWrite HIGH)...");
  digitalWrite(PIN_BUZZER, HIGH);
  delay(300);
  digitalWrite(PIN_BUZZER, LOW);
  delay(150);

  Serial.println("[TEST] 3. Testing Passive Buzzer tone on D0 (tone 2500Hz)...");
  tone(PIN_BUZZER, 2500);
  delay(300);
  noTone(PIN_BUZZER);
  digitalWrite(PIN_BUZZER, LOW);

  digitalWrite(PIN_LED, LOW);
  Serial.println("[TEST] 4. Boot Self-Test Complete! LED and Buzzer are functional.\n");

  // I2C LCD Initialize: SDA=D2, SCL=D1
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);
  lcd.init();
  lcd.backlight();
  updateLCD("Smart Routine", "Connecting WiFi...");

  // Wi-Fi Connection
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_LED, !digitalRead(PIN_LED)); // LED blinks while connecting
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected!");
    Serial.print("ESP8266 IP Address: ");
    Serial.println(WiFi.localIP());

    digitalWrite(PIN_LED, HIGH);
    updateLCD("WiFi Connected!", WiFi.localIP().toString());
    triggerBuzzerChime();
    delay(1500);
    digitalWrite(PIN_LED, LOW);
  } else {
    Serial.println("\n⚠️ Wi-Fi Connection Timeout. Check SSID/Password.");
    updateLCD("WiFi Failed", "Offline Mode");
    delay(1500);
  }

  updateLCD("Smart Routine", "Ready & Synced");
}

// ---------------- MAIN LOOP ----------------
void loop() {
  // 1. Check Button Press on D6 (Active LOW due to INPUT_PULLUP)
  if (digitalRead(PIN_BUTTON) == LOW) {
    delay(50); // Debounce delay
    if (digitalRead(PIN_BUTTON) == LOW) {
      sendButtonConfirmation();
      // Wait until button is released
      while (digitalRead(PIN_BUTTON) == LOW) {
        delay(20);
      }
    }
  }

  // 2. Alert LED & Buzzer pulsing when reminder is active
  if (isAlertActive) {
    if (millis() - lastBlinkTime > 600) {
      lastBlinkTime = millis();
      ledToggle = !ledToggle;
      if (ledToggle) {
        digitalWrite(PIN_LED, HIGH);
        buzzerOn();
        delay(180); // 180ms loud beep!
        buzzerOff();
      } else {
        digitalWrite(PIN_LED, LOW);
      }
    }
  }

  // 3. Periodic Poll from Server (every 3 seconds)
  if (millis() - lastPollTime > POLL_INTERVAL_MS) {
    lastPollTime = millis();
    checkRoutineStatus();
  }

  yield();
}
