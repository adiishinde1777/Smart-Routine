/*
 * ======================================================================================
 * PROJECT: Smart Routine - Personal Lifestyle, Gym & Medicine Assistant
 * USER: Mayur (Daily Routine)
 * FIRMWARE: ESP8266 NodeMCU (I2C LCD + DS3231 RTC + 1 Green LED + Buzzer + Push Button)
 * ======================================================================================
 * 
 * ---------------- COMPLETE PIN CONFIGURATION ----------------
 * Component        | ESP8266 Pin | Wiring Details
 * -----------------+-------------+------------------------------------------------------
 * LCD SDA          | D2 (GPIO 4) | 16x2 I2C LCD SDA
 * LCD SCL          | D1 (GPIO 5) | 16x2 I2C LCD SCL
 * RTC SDA          | D2 (GPIO 4) | DS3231/DS1307 RTC SDA (Shared with LCD SDA on D2)
 * RTC SCL          | D1 (GPIO 5) | DS3231/DS1307 RTC SCL (Shared with LCD SCL on D1)
 * RTC & LCD VCC    | 3V3         | 3.3V Power
 * RTC & LCD GND    | GND         | Ground
 * Buzzer +         | D0 (GPIO 16)| Positive (+) leg to D0
 * Buzzer -         | GND         | Negative (-) leg to GND
 * Green LED +      | D5 (GPIO 14)| Anode (+) through 220Ω resistor to D5
 * Green LED -      | GND         | Cathode (-) to Common GND
 * Push Button      | D4 & GND    | Pin 1 to D4 (GPIO 2), Pin 2 to GND (INPUT_PULLUP)
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

// लॅपटॉपचा लोकल IP पत्ता (Server URL):
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
#endif

#define PIN_BUZZER       D0  // D0 (GPIO 16) -> Buzzer +
#define PIN_LCD_SCL      D1  // D1 (GPIO 5)  -> LCD SCL & RTC SCL
#define PIN_LCD_SDA      D2  // D2 (GPIO 4)  -> LCD SDA & RTC SDA
#define PIN_BUTTON       D4  // D4 (GPIO 2)  -> Push Button (D4 आणि GND)
#define PIN_GREEN_LED    D5  // D5 (GPIO 14) -> Green LED + (through 220Ω)

// ---------------- BUZZER TYPE ----------------
bool IS_ACTIVE_BUZZER = true;

// ---------------- Hardware Objects ----------------
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C पत्ता 0x27 किंवा 0x3F
RTC_DS3231 rtc;
WiFiClient wifiClient;

// ---------------- State Variables ----------------
bool rtcDetected = false;
bool isAlertActive = false;
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

// ---------------- Green LED Helpers ----------------
void greenLedOn() {
  digitalWrite(PIN_GREEN_LED, HIGH);
}

void greenLedOff() {
  digitalWrite(PIN_GREEN_LED, LOW);
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
    greenLedOn();
    buzzerOn();
    delay(180);
    buzzerOff();
    greenLedOff();
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
          Serial.printf("\n🔔 [ALERT] Reminder Time Matched! Green LED (D5) ON - %s\n", activeRoutineName.c_str());
          updateLCD(line1, line2);
          triggerBuzzerChime();
        }
      } else {
        // Routine चा टाईम नसेल किंवा संपला असेल तर LCD आणि Green LED पूर्ण बंद (Dark Mode)
        if (isAlertActive) {
          isAlertActive = false;
          activeReminderIds = "";
          buzzerOff();
          greenLedOff();
          turnLcdOff();
          Serial.println("💤 Routine alert ended. LCD & Green LED turned OFF (Dark Mode).");
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
    activeReminderIds = "";
    buzzerOff();
    greenLedOff();

    // Two short confirmation chimes (Green LED + Buzzer)
    for (int i = 0; i < 2; i++) {
      greenLedOn();
      buzzerOn();
      delay(120);
      buzzerOff();
      greenLedOff();
      delay(80);
    }

    delay(1500);  // 1.5 सेकंद संदेश दाखवून लगेच LCD OFF करणे
    turnLcdOff(); // LCD पुन्हा पूर्णपणे OFF (Dark Mode)
    Serial.println("💤 Button acknowledged. LCD backlight & LED are now OFF.");
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
  pinMode(PIN_BUTTON, INPUT_PULLUP); // D4 Push Button (D4 आणि GND)
  pinMode(PIN_BUZZER, OUTPUT);       // D0 Buzzer
  pinMode(PIN_GREEN_LED, OUTPUT);    // D5 Green LED

  buzzerOff();
  greenLedOff();

  // 1. HARDWARE BOOT SELF-TEST (Green LED + Buzzer)
  Serial.println("[TEST] Testing Green LED (D5) & Buzzer (D0)...");
  greenLedOn();
  buzzerOn();
  delay(300);
  buzzerOff();
  greenLedOff();
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
    digitalWrite(PIN_GREEN_LED, !digitalRead(PIN_GREEN_LED)); // Blink Green LED while connecting
    attempts++;
  }
  greenLedOff();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected!");
    Serial.print("ESP8266 IP Address: ");
    Serial.println(WiFi.localIP());

    greenLedOn();
    updateLCD("WiFi Connected!", WiFi.localIP().toString());
    triggerBuzzerChime();
    delay(1500);
    greenLedOff();
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

  // 2. Alert Green LED & Buzzer pulsing when routine reminder is active
  if (isAlertActive) {
    if (millis() - lastBlinkTime > 500) {
      lastBlinkTime = millis();
      ledToggle = !ledToggle;

      if (ledToggle) {
        greenLedOn();
        buzzerOn();
        delay(180); // 180ms audible beep
        buzzerOff();
      } else {
        greenLedOff();
      }
    }
  }

  // 3. Periodic Poll from Server (every 3 seconds)
  // जेव्हा वेळ मॅच होईल, तेव्हा checkRoutineStatus() आपोआप LCD आणि Green LED चालू करेल.
  if (millis() - lastPollTime > POLL_INTERVAL_MS) {
    lastPollTime = millis();
    checkRoutineStatus();
  }

  yield();
}
