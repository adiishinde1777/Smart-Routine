# ⚡ ESP8266 + RTC Module + 3 LEDs पिन जोडणी (Pin Summary)

या सर्किटमध्ये **NodeMCU ESP8266**, **DS3231/DS1307 RTC Module**, **16x2 I2C LCD**, **३ स्वतंत्र LEDs (३ औषधांचे बॉक्स/कप्पे)**, **Buzzer** आणि **Push Button** वापरले आहेत.

---

## 📌 संपूर्ण पिन जोडणी तक्ता (Full Pin Connection Chart)

| ESP8266 Pin | GPIO | जोडायचा घटक (Component) | सविस्तर कनेक्शन पद्धत |
|---|---|---|---|
| **D0** | GPIO 16 | **Buzzer** | बझरचा (+) पाय `D0` ला, (-) पाय `GND` ला |
| **D1** | GPIO 5 | **I2C SCL (Shared)** | **LCD चा SCL आणि RTC चा SCL** हे दोन्ही एकत्र `D1` ला जोडा |
| **D2** | GPIO 4 | **I2C SDA (Shared)** | **LCD चा SDA आणि RTC चा SDA** हे दोन्ही एकत्र `D2` ला जोडा |
| **D5** | GPIO 14 | **LED 1 (Slot 1)** | 220Ω रेझिस्टरद्वारे (+) पाय `D5` ला, (-) पाय `GND` ला |
| **D6** | GPIO 12 | **Push Button** | बटणाचा पहिला पाय `D6` ला, दुसरा पाय `GND` ला (INPUT_PULLUP) |
| **D7** | GPIO 13 | **LED 2 (Slot 2)** | 220Ω रेझिस्टरद्वारे (+) पाय `D7` ला, (-) पाय `GND` ला |
| **D8** | GPIO 15 | **LED 3 (Slot 3)** | 220Ω रेझिस्टरद्वारे (+) पाय `D8` ला, (-) पाय `GND` ला |
| **3V3** | 3.3V | **VCC Power** | LCD चा `VCC` आणि RTC चा `VCC` दोन्ही एकत्र `3V3` ला जोडा |
| **GND** | Ground | **Common Ground** | LCD, RTC, Buzzer, Button आणि सर्व ३ LEDs चा एकत्र `GND` |

---

## 💡 I2C बस कशी कार्य करते? (LCD आणि RTC एकत्र कसे जोडायचे?):
- **I2C Protocol** मध्ये एकाच दोन वायर्सवर (`SCL` आणि `SDA`) अनेक डिव्हायसेस काम करू शकतात.
- LCD चा पत्ता `0x27` असतो आणि RTC चा पत्ता `0x68` असतो.
- त्यामुळे:
  - LCD ची **SCL** आणि RTC ची **SCL** वायर एकत्र जोडून NodeMCU च्या **D1** पिनला द्या.
  - LCD ची **SDA** आणि RTC ची **SDA** वायर एकत्र जोडून NodeMCU च्या **D2** पिनला द्या.

---

## 🚦 ३ LEDs चे कार्य (Slot 1, 2, 3 Blinking Logic):
- **Slot 1 औषध/डाएटचा वेळ झाल्यास**: फक्त **LED 1 (D5)** ब्लिंक होईल.
- **Slot 2 औषध/डाएटचा वेळ झाल्यास**: फक्त **LED 2 (D7)** ब्लिंक होईल.
- **Slot 3 औषध/डाएटचा वेळ झाल्यास**: फक्त **LED 3 (D8)** ब्लिंक होईल.
- **दोन औषधांचा वेळ एकाच वेळी आल्यास**: त्या दोन्ही औषधांचे **दोन्ही LEDs (उदा. LED 1 आणि LED 2) एकाच वेळी सोबत ब्लिंक होतील!**
- **तिन्ही औषधे एकाच वेळी असल्यास**: तिन्ही LEDs आणि Buzzer एकत्र वाजतील.
- **D6 चे पुश बटण दाबल्यावर**: सर्व LEDs बंद होऊन LCD वर "All Done! OK" असा संदेश येईल.

---

## ⏰ RTC Module चे वैशिष्ट्य:
1. **Offline Clock**: जरी Wi-Fi बंद पडले, तरी DS3231 RTC मुळे अचूक सेकंदासह खरी वेळ चालू राहते.
2. **Auto Server Sync**: Wi-Fi कनेक्ट होताच सर्व्हरच्या वेळेनुसार RTC आपोआप सिंक होते.
3. **LCD Real-Time Clock**: जेव्हा कोणताही अलार्म चालू नसतो, तेव्हा LCD च्या दुसऱ्या ओळीवर **घड्याळाची खरी वेळ (उदा. `14:30:15 Ready`)** सेकंदासह सतत दिसत राहील!

---

## 🛠️ Arduino IDE मधील लायब्ररी (Libraries):
Arduino IDE मध्ये **Sketch -> Include Library -> Manage Libraries** वर जाऊन खालील लायब्ररी इन्स्टॉल करा:
1. **RTClib** (by Adafruit) — RTC DS3231 / DS1307 साठी.
2. **LiquidCrystal_I2C** (by Frank de Brabander किंवा Marco Schwartz)
3. **ArduinoJson** (by Benoit Blanchon - Version 6.x)
4. **ESP8266WiFi** (ESP8266 Board पॅकेजसह येते)

---

## ⚡ Hardware Boot Self-Test (चालू होताच तपासणी):
NodeMCU चालू होताच खालील क्रमाने टेस्टिंग होते:
1. LED 1 (D5) पेटेल व बंद होईल.
2. LED 2 (D7) पेटेल व बंद होईल.
3. LED 3 (D8) पेटेल व बंद होईल.
4. तिन्ही LEDs एकत्र पेटतील आणि Buzzer बीप करेल.
यामुळे सर्व ३ LEDs, Buzzer आणि वायरिंग चालू असल्याचे लगेच समजेल.
