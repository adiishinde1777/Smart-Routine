# Smart Routine ⏰
### Daily Lifestyle, Diet, Gym & Medicine Planner
#### NodeMCU ESP8266 Wi-Fi सिंक आणि MySQL डेटाबेस समर्थनासह

**Smart Routine** हा एक आधुनिक, बहुउद्देशीय (Multi-Purpose) दिनक्रम व्यवस्थापक आहे. हा प्लॅटफॉर्म **जिम बॉईज / फिटनेस उत्साही (Gym Boys & Fitness)**, **रुग्ण (Patients)** तसेच **सामान्य वापरकर्ते (Daily Routine Users)** अशा सर्वांसाठी अत्यंत सोपा आणि उपयुक्त बनवला आहे.

---

## 🌟 प्रमुख वैशिष्ट्ये (Key Features)

1. **सर्वसमावेशक दिनक्रम निवड (Comprehensive Routine Types)**:
   - 💊 **औषध (Medicine)**: औषधाचे नाव, डोस, आणि महत्त्वाचे म्हणजे **जेवणापूर्वी (Before Meal)** का **जेवणानंतर (After Meal)** किंवा उपाशीपोटी घ्यायचे हे स्पष्ट दर्शवणे.
   - 🥗 **जेवण / डाएट (Meal / Diet)**: सकाळचा नाश्ता (Breakfast), दुपारचे जेवण (Lunch), संध्याकाळचा नाश्ता, रात्रीचे जेवण (Dinner), मेनू आयटम्स.
   - 🏋️ **जिम & सप्लिमेंट्स (Gym & Workout)**: Pre-Workout Meal, Post-Workout Whey Protein शेक, Creatine 5g, जिम वर्कआउट वेळ.
   - 💧 **दैनंदिन सवयी (Water & Habits)**: पाणी पिण्याची वेळ (Hydration), वॉक, झोप.

2. **स्वच्छ व आधुनिक युझर इंटरफेस (Clean & Modern UI)**:
   - युझरच्या स्क्रीनवर IoT किंवा सेन्सरचे तांत्रिक शब्द न दाखवता साधा, आकर्षक आणि वेळेवर आधारित दिनक्रम डॅशबोर्ड.
   - **Doctor Login काढून टाकले आहे**; त्याऐवजी युझर थेट आपली प्रोफाईल (Gym Boy, Patient Care, Daily Lifestyle) निवडून वापरू शकतो.

3. **MySQL डेटाबेस सपोर्ट (MySQL Database Integration)**:
   - बॅकएंडमध्ये `mysql2` द्वारे MySQL डेटाबेस कनेक्शन.
   - आपोआप `smart_routine_db` डेटाबेस, `users`, `routines`, `reminders`, आणि `device_logs` टेबल्स तयार करतो.
   - जर MySQL पासवर्ड अजून टाकला नसेल तर सर्व्हर क्रॅश न होता आपोआप Fallback Store वर चालू राहतो!

4. **NodeMCU ESP8266 मायक्रोकंट्रोलर सिंक (ESP8266 Wi-Fi Integration)**:
   - 16x2 I2C LCD वर औषध/जेवणाचे नाव आणि वेळ.
   - Buzzer द्वारे बीप अलार्म.
   - **Push Button** दाबून युझरने दिनक्रम पूर्ण केल्याची थेट सर्व्हरला पुष्टी (Confirmation).
   - कोड फाईल: `firmware/esp8266_smart_routine.ino`
   - सविस्तर पिन जोडणी: `firmware/ESP8266_CONNECTION_GUIDE.md`

---

## 🔌 ESP8266 Pin Summary (पिन जोडणी)

| ESP8266 Pin | GPIO | घटक (Component) | कनेक्शन तपशील |
|---|---|---|---|
| **D0** | GPIO 16 | **Buzzer** | Positive (+) leg to D0, Negative (-) to GND |
| **D1** | GPIO 5 | **LCD SCL** | 16x2 I2C LCD SCL Pin |
| **D2** | GPIO 4 | **LCD SDA** | 16x2 I2C LCD SDA Pin |
| **D5** | GPIO 14 | **LED** | Anode (+) via 220Ω resistor to D5, Cathode (-) to GND |
| **D6** | GPIO 12 | **Push Button** | Pin 1 to D6, Pin 2 to GND (INPUT_PULLUP) |
| **3V3** | 3.3V | **LCD VCC** | 16x2 I2C LCD Power Supply (3.3V) |
| **GND** | Ground | **Common Ground** | Common GND for LCD, Buzzer, LED, and Button |

---

## 🗄️ MySQL डेटाबेस कसा सेट करावा? (MySQL Setup)

1. तुमच्या कम्प्युटरमध्ये MySQL चालू असल्याची खात्री करा (`MySQL80`).
2. `server/.env` फाईल उघडा आणि तुमचा पासवर्ड टाका:
   ```env
   PORT=5001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=तुमचा_mysql_पासवर्ड
   DB_NAME=smart_routine_db
   DB_PORT=3306
   ```
3. सर्व्हर चालू झाल्यावर तो स्वतःहून `smart_routine_db` डेटाबेस आणि आवश्यक टेबल्स `server/schema.sql` द्वारे तयार करतो.
4. तुम्ही `server/schema.sql` फाईल MySQL Workbench मध्ये मॅन्युअली सुद्धा रन करू शकता.

---

## 🚀 ॲप्लिकेशन कसे चालवावे? (How to Run)

### पायरी १: डिपेंडन्सीज इन्स्टॉल करा (जर आधी केले नसेल)
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### पायरी २: सर्व्हर आणि क्लायंट एकत्र चालू करा
```bash
npm start
```
किंवा वेगवेगळ्या टर्मिनलमध्ये:
- **Backend**: `npm run server` (चालू होईल http://localhost:5001 वर)
- **Frontend**: `npm run client` (चालू होईल http://localhost:5173 वर)

---

## 🤖 ESP8266 Arduino IDE फ्लॅशिंग पद्धत
1. Arduino IDE मध्ये **NodeMCU 1.0 (ESP-12E Module)** बोर्ड निवडा.
2. `firmware/esp8266_smart_routine.ino` उघडा.
3. तुमचा Wi-Fi SSID, Password आणि लॅपटॉपचा IP टाका (उदा. `http://192.168.1.100:5001`).
4. कोड अपलोड करा आणि Serial Monitor (Baud: 115200) वर स्टेटस तपासा!
