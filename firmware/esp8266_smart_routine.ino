/*
 * ======================================================================================
 * PROJECT: Smart Routine - Personal Lifestyle, Gym & Medicine Assistant
 * HARDWARE FIRMWARE: ESP8266 NodeMCU (I2C LCD + DS3231 RTC + 3 LEDs + Buzzer + Button)
 * ======================================================================================
 * 
 * ---------------- COMPLETE PIN CONFIGURATION CHART ----------------
 * ESP8266 Pin | Component       | Wiring Details
 * ------------+-----------------+-------------------------------------------------------
 * D0 (GPIO 16)| Buzzer          | Positive (+) leg to D0, Negative (-) to GND
 * D1 (GPIO 5) | I2C SCL         | Shared I2C Clock: Connect BOTH LCD SCL & RTC SCL to D1
 * D2 (GPIO 4) | I2C SDA         | Shared I2C Data:  Connect BOTH LCD SDA & RTC SDA to D2
 * D5 (GPIO 14)| LED 1 (Slot 1)  | Anode (+) via 220Ω to D5, Cathode (-) to GND (Box 1)
 * D6 (GPIO 12)| Push Button     | Pin 1 to D6, Pin 2 to GND (INPUT_PULLUP)
 * D7 (GPIO 13)| LED 2 (Slot 2)  | Anode (+) via 220Ω to D7, Cathode (-) to GND (Box 2)
 * D8 (GPIO 15)| LED 3 (Slot 3)  | Anode (+) via 220Ω to D8, Cathode (-) to GND (Box 3)
 * 3V3         | VCC (3.3V)      | Shared 3.3V Power for LCD VCC & RTC VCC
 * GND         | Ground          | Common GND for LCD, RTC, Buzzer, Button, and all 3 LEDs
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
#define D6 12
#define D7 13
#define D8 15
#endif

#define PIN_BUZZER       D0  // D0 (GPIO 16) -> Buzzer
#define PIN_LCD_SCL      D1  // D1 (GPIO 5)  -> I2C SCL (Shared: LCD + RTC)
#define PIN_LCD_SDA      D2  // D2 (GPIO 4)  -> I2C SDA (Shared: LCD + RTC)
#define PIN_LED_1        D5  // D5 (GPIO 14) -> LED 1 (Medicine Slot / Box 1)
#define PIN_BUTTON       D6  // D6 (GPIO 12) -> Push Button (INPUT_PULLUP to GND)
#define PIN_LED_2        D7  // D7 (GPIO 13) -> LED 2 (Medicine Slot / Box 2)
#define PIN_LED_3        D8  // D8 (GPIO 15) -> LED 3 (Medicine Slot / Box 3)

// ---------------- BUZZER TYPE CONFIGURATION ----------------
// बहुतांश Arduino Starter Kits मध्ये ACTIVE Buzzer असतो (digitalWrite HIGH ने वाजतो).
// जर तुमचा Buzzer Passive असेल (फक्त बारीक क्लिक येत असेल) तर खाली false करा:
bool IS_ACTIVE_BUZZER = true;

// ---------------- Hardware Objects ----------------
LiquidCrystal_I2C lcd(0x27, 16, 2); // बहुतांश I2C LCD चा पत्ता 0x27 किंवा 0x3F असतो
RTC_DS3231 rtc;
WiFiClient wifiClient;

// ---------------- State Variables ----------------
bool rtcDetected = false;
bool isAlertActive = false;
bool alertLed1 = false;
bool alertLed2 = false;
bool alertLed3 = false;
String activeReminderIds = "";
String activeRoutineName = "";
unsigned long lastPollTime = 0;
const unsigned long POLL_INTERVAL_MS = 3000; // दर ३ सेकंदांनी तपासणे
unsigned long lastBlinkTime = 0;
bool ledToggle = false;
unsigned long lastClockDisplayTime = 0;

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

// ---------------- Turn All 3 LEDs OFF ----------------
void allLedsOff() {
  digitalWrite(PIN_LED_1, LOW);
  digitalWrite(PIN_LED_2, LOW);
  digitalWrite(PIN_LED_3, LOW);
}

// ---------------- LCD Display Helper ----------------
void updateLCD(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print(line2.substring(0, 16));
}

// ---------------- Sound Initial Alert Chimes ----------------
void triggerBuzzerChime() {
  for (int i = 0; i < 3; i++) {
    if (alertLed1) digitalWrite(PIN_LED_1, HIGH);
    if (alertLed2) digitalWrite(PIN_LED_2, HIGH);
    if (alertLed3) digitalWrite(PIN_LED_3, HIGH);
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
    Serial.println("[WiFi] Reconnecting...");
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
            Serial.printf("⏰ [RTC] Auto-synced with Server Time: %02d:%02d:%02d\n", h, min, s);
          }
        }
      }

      // 2. Process Routine Alert State
      bool active = doc["active"] | false;
      String line1 = doc["lcdLine1"] | "Smart Routine";
      String line2 = doc["lcdLine2"] | "Ready";

      if (active) {
        // Read active LEDs for each compartment (Slot 1, 2, 3)
        alertLed1 = doc["led1"] | false;
        alertLed2 = doc["led2"] | false;
        alertLed3 = doc["led3"] | false;

        // Backward compatibility if single compartment was sent
        if (!alertLed1 && !alertLed2 && !alertLed3) {
          int comp = doc["compartment"] | 1;
          if (comp == 1) alertLed1 = true;
          else if (comp == 2) alertLed2 = true;
          else if (comp == 3) alertLed3 = true;
          else alertLed1 = true;
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
          Serial.printf("\n🔔 [ALERT] Reminder Time! Active Slots: [1:%s, 2:%s, 3:%s] - %s\n",
                        alertLed1 ? "ON" : "OFF",
                        alertLed2 ? "ON" : "OFF",
                        alertLed3 ? "ON" : "OFF",
                        activeRoutineName.c_str());
          updateLCD(line1, line2);
          triggerBuzzerChime();
        }
      } else {
        if (isAlertActive) {
          isAlertActive = false;
          alertLed1 = false;
          alertLed2 = false;
          alertLed3 = false;
          activeReminderIds = "";
          buzzerOff();
          allLedsOff();
        }
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

  Serial.println("\n👉 [BUTTON D6] Push Button Pressed! Confirming Routine...");
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
    updateLCD("All Done! OK", "Great Job!");
    
    // Stop ongoing alert alarm
    isAlertActive = false;
    alertLed1 = false;
    alertLed2 = false;
    alertLed3 = false;
    activeReminderIds = "";
    buzzerOff();
    allLedsOff();

    // Two short confirmation chimes
    for (int i = 0; i < 2; i++) {
      digitalWrite(PIN_LED_1, HIGH);
      digitalWrite(PIN_LED_2, HIGH);
      digitalWrite(PIN_LED_3, HIGH);
      buzzerOn();
      delay(120);
      buzzerOff();
      allLedsOff();
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
  pinMode(PIN_LED_1, OUTPUT);        // D5 LED 1 (Slot 1)
  pinMode(PIN_LED_2, OUTPUT);        // D7 LED 2 (Slot 2)
  pinMode(PIN_LED_3, OUTPUT);        // D8 LED 3 (Slot 3)

  buzzerOff();
  allLedsOff();

  // 1. HARDWARE SELF-TEST ON BOOT (Sequentially tests all 3 LEDs & Buzzer)
  Serial.println("\n[TEST] ---------------- HARDWARE BOOT SELF-TEST ----------------");
  
  // LED 1 Test
  Serial.println("[TEST] Testing LED 1 (D5 / Box 1)...");
  digitalWrite(PIN_LED_1, HIGH);
  delay(200);
  digitalWrite(PIN_LED_1, LOW);

  // LED 2 Test
  Serial.println("[TEST] Testing LED 2 (D7 / Box 2)...");
  digitalWrite(PIN_LED_2, HIGH);
  delay(200);
  digitalWrite(PIN_LED_2, LOW);

  // LED 3 Test
  Serial.println("[TEST] Testing LED 3 (D8 / Box 3)...");
  digitalWrite(PIN_LED_3, HIGH);
  delay(200);
  digitalWrite(PIN_LED_3, LOW);

  // All 3 LEDs + Buzzer Test
  Serial.println("[TEST] Testing All 3 LEDs + Buzzer...");
  digitalWrite(PIN_LED_1, HIGH);
  digitalWrite(PIN_LED_2, HIGH);
  digitalWrite(PIN_LED_3, HIGH);
  buzzerOn();
  delay(300);
  buzzerOff();
  allLedsOff();
  Serial.println("[TEST] Hardware Boot Self-Test Complete!\n");

  // 2. I2C Bus Initialize: SDA=D2, SCL=D1 (Shared for both LCD & RTC)
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  updateLCD("Smart Routine", "Starting RTC...");

  // Initialize DS3231 / DS1307 RTC
  if (rtc.begin()) {
    rtcDetected = true;
    Serial.println("✅ [RTC] DS3231 / DS1307 RTC Module detected & running!");
    if (rtc.lostPower()) {
      Serial.println("⚠️ [RTC] RTC lost power, setting compile time...");
      rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    DateTime now = rtc.now();
    Serial.printf("⏰ [RTC] Current RTC Time: %04d-%02d-%02d %02d:%02d:%02d\n",
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
    digitalWrite(PIN_LED_1, !digitalRead(PIN_LED_1)); // Blink LED 1 while connecting
    attempts++;
  }
  allLedsOff();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Wi-Fi Connected!");
    Serial.print("ESP8266 IP Address: ");
    Serial.println(WiFi.localIP());

    digitalWrite(PIN_LED_1, HIGH);
    digitalWrite(PIN_LED_2, HIGH);
    digitalWrite(PIN_LED_3, HIGH);
    updateLCD("WiFi Connected!", WiFi.localIP().toString());
    triggerBuzzerChime();
    delay(1500);
    allLedsOff();
  } else {
    Serial.println("\n⚠️ Wi-Fi Connection Timeout. Running in Offline Mode.");
    updateLCD("WiFi Failed", "Offline Mode");
    delay(1500);
  }

  updateLCD("Smart Routine", "Ready & Synced");
}

// ---------------- MAIN LOOP ----------------
void loop() {
  // 1. Check Push Button on D6 (Active LOW due to INPUT_PULLUP)
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
    if (millis() - lastBlinkTime > 500) {
      lastBlinkTime = millis();
      ledToggle = !ledToggle;

      if (ledToggle) {
        // Blink only the LED(s) corresponding to the active compartment(s)!
        // If 2 medicines are scheduled at the same time, BOTH LEDs blink!
        if (alertLed1) digitalWrite(PIN_LED_1, HIGH);
        if (alertLed2) digitalWrite(PIN_LED_2, HIGH);
        if (alertLed3) digitalWrite(PIN_LED_3, HIGH);

        buzzerOn();
        delay(180); // 180ms audible beep
        buzzerOff();
      } else {
        allLedsOff();
      }
    }
  } else {
    // 3. When Idle: Update real-time clock from RTC on LCD every second!
    if (rtcDetected && millis() - lastClockDisplayTime > 1000) {
      lastClockDisplayTime = millis();
      DateTime now = rtc.now();
      char timeBuffer[17];
      snprintf(timeBuffer, sizeof(timeBuffer), "%02d:%02d:%02d Ready", now.hour(), now.minute(), now.second());
      lcd.setCursor(0, 1);
      lcd.print(timeBuffer);
    }
  }

  // 4. Periodic Poll from Server (every 3 seconds)
  if (millis() - lastPollTime > POLL_INTERVAL_MS) {
    lastPollTime = millis();
    checkRoutineStatus();
  }

  yield();
}
