/*
 * ======================================================================================
 * PROJECT: Smart Routine - Personal Lifestyle, Gym & Medicine Assistant
 * USER: Mayur (Daily Routine)
 * FIRMWARE: ESP8266 NodeMCU (I2C LCD + DS3231 RTC + 3 LEDs + Buzzer + Push Button)
 * ======================================================================================
 * 
 * ---------------- COMPLETE PIN CONFIGURATION ----------------
 * Component          | ESP8266 Pin | Wiring Details
 * -------------------+-------------+---------------------------------------------------
 * LCD SDA            | D2 (GPIO 4) | 16x2 I2C LCD SDA
 * LCD SCL            | D1 (GPIO 5) | 16x2 I2C LCD SCL
 * RTC SDA            | D2 (GPIO 4) | DS3231 RTC SDA (Shared with LCD SDA on D2)
 * RTC SCL            | D1 (GPIO 5) | DS3231 RTC SCL (Shared with LCD SCL on D1)
 * RTC & LCD VCC      | 3V3         | 3.3V Power
 * RTC & LCD GND      | GND         | Common Ground
 * Buzzer +           | D0 (GPIO 16)| Positive (+) leg to D0
 * Buzzer -           | GND         | Negative (-) leg to GND
 * 🔴 RED LED +       | D5 (GPIO 14)| Anode (+) through 220Ω to D5 (1st Medicine - Slot 1)
 * 🟡 YELLOW LED +    | D6 (GPIO 12)| Anode (+) through 220Ω to D6 (2nd Medicine - Slot 2)
 * 🟢 GREEN LED +     | D7 (GPIO 13)| Anode (+) through 220Ω to D7 (3rd Medicine - Slot 3)
 * सर्व LEDs - (Cathode)| GND        | Cathode (-) legs of all 3 LEDs to Common GND
 * Push Button        | D4 & GND    | Pin 1 to D4 (GPIO 2), Pin 2 to GND (INPUT_PULLUP)
 * ======================================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>

// ---------------- Wi-Fi आणि SERVER सेटिंग्ज ----------------
// येथे तुमच्या मोबाईल हॉटस्पॉट किंवा Wi-Fi चे नाव आणि पासवर्ड टाका:
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// लॅपटॉप किंवा सर्व्हरचा IP पत्ता (Server URL):
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
#endif

#define PIN_BUZZER       D0  // D0 (GPIO 16) -> Buzzer +
#define PIN_LCD_SCL      D1  // D1 (GPIO 5)  -> LCD SCL & RTC SCL
#define PIN_LCD_SDA      D2  // D2 (GPIO 4)  -> LCD SDA & RTC SDA
#define PIN_BUTTON       D4  // D4 (GPIO 2)  -> Push Button (D4 आणि GND)
#define PIN_LED_RED      D5  // D5 (GPIO 14) -> 🔴 RED LED (1st Medicine / Slot 1)
#define PIN_LED_YELLOW   D6  // D6 (GPIO 12) -> 🟡 YELLOW LED (2nd Medicine / Slot 2)
#define PIN_LED_GREEN    D7  // D7 (GPIO 13) -> 🟢 GREEN LED (3rd Medicine / Slot 3)

// ---------------- BUZZER TYPE ----------------
bool IS_ACTIVE_BUZZER = true;

// ---------------- Hardware Objects ----------------
LiquidCrystal_I2C lcd(0x27, 16, 2); // बहुतांश I2C LCD चा पत्ता 0x27 किंवा 0x3F असतो
RTC_DS3231 rtc;
WiFiClient wifiClient;

// ---------------- State Variables ----------------
bool rtcDetected = false;
bool isAlertActive = false;
bool alertLedRed = false;    // 1st Medicine (Slot 1)
bool alertLedYellow = false; // 2nd Medicine (Slot 2)
bool alertLedGreen = false;  // 3rd Medicine (Slot 3)
String activeReminderIds = "";
String activeRoutineName = "";
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL_MS = 3000; // दर ३ सेकंदांनी सर्व्हर तपासणे
unsigned long lastBlinkTime = 0;
bool ledToggle = false;

// ---------------- Buzzer Drivers ----------------
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

// ---------------- All LEDs Helper ----------------
void allLedsOff() {
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_GREEN, LOW);
}

// ---------------- LCD Display Helpers ----------------
void updateLCD(String line1, String line2) {
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(line2.substring(0, 16));
}

void turnLcdOff() {
  lcd.clear();
  lcd.noBacklight();
}

// ---------------- Sound Alert Chimes ----------------
void triggerBuzzerChime() {
  for (int i = 0; i < 3; i++) {
    if (alertLedRed) digitalWrite(PIN_LED_RED, HIGH);
    if (alertLedYellow) digitalWrite(PIN_LED_YELLOW, HIGH);
    if (alertLedGreen) digitalWrite(PIN_LED_GREEN, HIGH);
    buzzerOn();
    delay(180);
    buzzerOff();
    allLedsOff();
    delay(120);
  }
}

// ---------------- Server वरून Routine तपासणे ----------------
void checkRoutineStatus() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/esp8266/check?deviceId=" + String(DEVICE_ID);
  
  http.begin(wifiClient, url);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    
    StaticJsonDocument<768> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      // 1. Sync RTC from server time if available (Once every hour)
      static unsigned long lastRtcSync = 0;
      if (rtcDetected && (millis() - lastRtcSync > 3600000 || lastRtcSync == 0)) {
        if (doc.containsKey("timeComponents")) {
          int y = doc["timeComponents"]["year"];
          int m = doc["timeComponents"]["month"];
          int d = doc["timeComponents"]["day"];
          int h = doc["timeComponents"]["hour"];
          int min = doc["timeComponents"]["minute"];
          int s = doc["timeComponents"]["second"];
          if (y >= 2024) {
            rtc.adjust(DateTime(y, m, d, h, min, s));
            lastRtcSync = millis();
            Serial.printf("⏰ [RTC] Auto-synced with Server: %02d:%02d:%02d\n", h, min, s);
          }
        }
      }

      // 2. Process Routine Alert State
      bool active = doc["active"] | false;
      String line1 = doc["lcdLine1"] | "Smart Routine";
      String line2 = doc["lcdLine2"] | "Ready";

      if (active) {
        // औषध १ (Slot 1) -> 🔴 RED LED (D5)
        // औषध २ (Slot 2) -> 🟡 YELLOW LED (D6)
        // औषध ३ (Slot 3) -> 🟢 GREEN LED (D7)
        alertLedRed = doc["led1"] | false;
        alertLedYellow = doc["led2"] | false;
        alertLedGreen = doc["led3"] | false;

        // Backward compatibility if single compartment was sent
        if (!alertLedRed && !alertLedYellow && !alertLedGreen) {
          int comp = doc["compartment"] | 1;
          if (comp == 1) alertLedRed = true;
          else if (comp == 2) alertLedYellow = true;
          else if (comp == 3) alertLedGreen = true;
          else alertLedRed = true;
        }

        // Collect reminder IDs
        if (doc.containsKey("reminderIds")) {
          activeReminderIds = "";
          JsonArray rIds = doc["reminderIds"].as<JsonArray>();
          for (size_t i = 0; i < rIds.size(); i++) {
            if (i > 0) activeReminderIds += ",";
            activeReminderIds += rIds[i].as<String>();
          }
        } else {
          activeReminderIds = doc["reminderId"] | "";
        }

        activeRoutineName = doc["routineName"] | "Routine Alert";

        if (!isAlertActive) {
          isAlertActive = true;
          Serial.printf("\n🔔 [ALERT] Reminder Time Matched! [🔴 Red(D5):%s, 🟡 Yellow(D6):%s, 🟢 Green(D7):%s] - %s\n",
                        alertLedRed ? "ON" : "OFF",
                        alertLedYellow ? "ON" : "OFF",
                        alertLedGreen ? "ON" : "OFF",
                        activeRoutineName.c_str());
          updateLCD(line1, line2);
          triggerBuzzerChime();
        }
      } else {
        // Routine चा टाईम नसेल किंवा संपला असेल तर LCD, LEDs आणि Buzzer पूर्ण बंद (Dark Mode)
        if (isAlertActive) {
          isAlertActive = false;
          alertLedRed = false;
          alertLedYellow = false;
          alertLedGreen = false;
          activeReminderIds = "";
          buzzerOff();
          allLedsOff();
          turnLcdOff();
          Serial.println("💤 Routine alert ended. LCD & LEDs turned OFF (Dark Mode).");
        }
      }
    }
  }
  http.end();
}

// ---------------- पुश बटण (D4) दाबल्यावर Routine Confirm करणे ----------------
void sendButtonConfirmation() {
  if (WiFi.status() != WL_CONNECTED) return;

  Serial.println("\n👉 [BUTTON D4] Push Button Pressed! Confirming Routine...");
  updateLCD("Confirming...", "Please wait...");

  HTTPClient http;
  String url = String(SERVER_BASE) + "/api/esp8266/confirm";
  http.begin(wifiClient, url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<384> postDoc;
  postDoc["deviceId"] = DEVICE_ID;
  if (activeReminderIds.length() > 0) {
    postDoc["reminderId"] = activeReminderIds;
    postDoc["routineId"] = activeReminderIds;
  }
  postDoc["buttonPressed"] = true;

  String jsonBody;
  serializeJson(postDoc, jsonBody);

  int httpCode = http.POST(jsonBody);

  if (httpCode == HTTP_CODE_OK) {
    Serial.println("✅ [SUCCESS] Routine confirmed on server!");
    updateLCD("Routine Done!", "Great Job Mayur!");
    
    // Stop ongoing alert alarm immediately
    isAlertActive = false;
    alertLedRed = false;
    alertLedYellow = false;
    alertLedGreen = false;
    activeReminderIds = "";
    buzzerOff();
    allLedsOff();

    // Two short confirmation chimes
    for (int i = 0; i < 2; i++) {
      digitalWrite(PIN_LED_RED, HIGH);
      digitalWrite(PIN_LED_YELLOW, HIGH);
      digitalWrite(PIN_LED_GREEN, HIGH);
      buzzerOn();
      delay(120);
      buzzerOff();
      allLedsOff();
      delay(80);
    }

    delay(1500);  // 1.5 सेकंद संदेश दाखवून लगेच LCD OFF करणे
    turnLcdOff(); // LCD पुन्हा पूर्णपणे OFF (Dark Mode)
    Serial.println("💤 Button acknowledged. LCD backlight & LEDs are now OFF.");
  } else {
    updateLCD("Server Error", "Try Again");
    delay(1500);
    turnLcdOff();
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
  pinMode(PIN_BUTTON, INPUT_PULLUP);    // D4 Push Button (D4 आणि GND)
  pinMode(PIN_BUZZER, OUTPUT);          // D0 Buzzer
  pinMode(PIN_LED_RED, OUTPUT);         // D5 🔴 Red LED (1st Medicine)
  pinMode(PIN_LED_YELLOW, OUTPUT);      // D6 🟡 Yellow LED (2nd Medicine)
  pinMode(PIN_LED_GREEN, OUTPUT);       // D7 🟢 Green LED (3rd Medicine)

  buzzerOff();
  allLedsOff();

  // 1. HARDWARE BOOT SELF-TEST (Sequentially tests Red, Yellow, Green LEDs & Buzzer)
  Serial.println("[TEST] Testing LEDs & Buzzer...");
  digitalWrite(PIN_LED_RED, HIGH); delay(200); digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_YELLOW, HIGH); delay(200); digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH); delay(200); digitalWrite(PIN_LED_GREEN, LOW);

  digitalWrite(PIN_LED_RED, HIGH);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  digitalWrite(PIN_LED_GREEN, HIGH);
  buzzerOn(); delay(300); buzzerOff();
  allLedsOff();
  Serial.println("[TEST] Hardware Boot Self-Test Complete!\n");

  // 2. I2C Bus Initialize: SDA=D2, SCL=D1 (Shared for both LCD & RTC)
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);

  lcd.init();
  lcd.backlight();
  updateLCD("Smart Routine", "Starting RTC...");

  // Initialize DS3231 RTC
  if (rtc.begin()) {
    rtcDetected = true;
    Serial.println("✅ [RTC] DS3231 RTC Module detected & running!");
    if (rtc.lostPower()) {
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    DateTime now = rtc.now();
    Serial.printf("⏰ [RTC] Time: %04d-%02d-%02d %02d:%02d:%02d\n",
                  now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
  } else {
    Serial.println("⚠️ [RTC] RTC Module NOT detected on I2C (Check D1/D2 connections)");
  }

  // 3. Wi-Fi Connection
  updateLCD("Smart Routine", "Connecting WiFi...");
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_LED_YELLOW, !digitalRead(PIN_LED_YELLOW)); // Blink Yellow LED while connecting
    attempts++;
  }
  allLedsOff();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected!");
    Serial.print("ESP8266 IP Address: ");
    Serial.println(WiFi.localIP());

    digitalWrite(PIN_LED_GREEN, HIGH);
    updateLCD("WiFi Connected!", WiFi.localIP().toString());
    triggerBuzzerChime();
    delay(1500);
    allLedsOff();
  } else {
    updateLCD("WiFi Failed", "Offline Mode");
    delay(1500);
  }

  // Standby Sleep: Routine चा टाईम येईपर्यंत LCD पूर्णपणे बंद (Dark Mode) ठेवणे
  turnLcdOff();
  Serial.println("💤 [STANDBY] LCD is now OFF. Will automatically turn ON only when routine time arrives!");
}

// ---------------- MAIN LOOP ----------------
void loop() {
  // 1. Check Push Button on D4 (Active LOW due to INPUT_PULLUP)
  if (digitalRead(PIN_BUTTON) == LOW) {
    delay(50); // Debounce delay
    if (digitalRead(PIN_BUTTON) == LOW) {
      sendButtonConfirmation();
      while (digitalRead(PIN_BUTTON) == LOW) {
        delay(20);
      }
    }
  }

  // 2. Alert LEDs & Buzzer pulsing when routine reminder is active
  if (isAlertActive) {
    if (millis() - lastBlinkTime > 500) {
      lastBlinkTime = millis();
      ledToggle = !ledToggle;

      if (ledToggle) {
        // औषध १ ची वेळ असेल तर 🔴 RED LED ब्लिंक होईल
        if (alertLedRed) digitalWrite(PIN_LED_RED, HIGH);
        // औषध २ ची वेळ असेल तर 🟡 YELLOW LED ब्लिंक होईल
        if (alertLedYellow) digitalWrite(PIN_LED_YELLOW, HIGH);
        // औषध ३ ची वेळ असेल तर 🟢 GREEN LED ब्लिंक होईल
        if (alertLedGreen) digitalWrite(PIN_LED_GREEN, HIGH);

        buzzerOn();
        delay(180); // 180ms audible beep
        buzzerOff();
      } else {
        allLedsOff();
      }
    }
  }

  // 3. Periodic Poll from Server (every 3 seconds)
  // जेव्हा वेळ मॅच होईल, तेव्हा checkRoutineStatus() आपोआप LCD आणि संबंधित LED चालू करेल.
  if (millis() - lastPollTime > POLL_INTERVAL_MS) {
    lastPollTime = millis();
    checkRoutineStatus();
  }

  yield();
}
