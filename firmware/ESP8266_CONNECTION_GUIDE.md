# ⚡ ESP8266 पिन जोडणी (Pin Summary)

खालील तक्त्याप्रमाणे तुमचे ESP8266 NodeMCU चे सर्व घटक अचूक जोडलेले आहेत:

---

## 📌 Final Pin Summary Chart

| ESP8266 Pin | GPIO | जोडायचा घटक (Component) | कनेक्शन पद्धत |
|---|---|---|---|
| **D0** | GPIO 16 | **Buzzer** | बझरचा (+) पाय D0 ला, (-) पाय GND ला |
| **D1** | GPIO 5 | **LCD SCL** | 16x2 I2C LCD ची SCL पिन |
| **D2** | GPIO 4 | **LCD SDA** | 16x2 I2C LCD ची SDA पिन |
| **D5** | GPIO 14 | **LED** | 220Ω रेझिस्टरद्वारे D5 ला, (-) पाय GND ला |
| **D6** | GPIO 12 | **Push Button** | बटणाचा एक पाय D6 ला, दुसरा पाय GND ला |
| **3V3** | 3.3V | **LCD VCC** | LCD ची पॉवर पिन |
| **GND** | Ground | **Common GND** | LCD, Buzzer, LED आणि Button चा कॉमन ग्राउंड |

---

## 🔊 Buzzer चा प्रकार (Active vs Passive):
- **Active Buzzer (डीफॉल्ट)**: या बझरवर काळा स्टिकर असतो. जेव्हा पिन HIGH होते, तेव्हा हा आपोआप बीप करतो. कोडमध्ये `bool IS_ACTIVE_BUZZER = true;` ठेवले आहे.
- **Passive Buzzer**: जर तुमचा बझर पॅसिव्ह असेल (फक्त क्लिक आवाज येत असेल), तर कोडमधील ओळ बदलून `bool IS_ACTIVE_BUZZER = false;` करा.

---

## ⚡ Hardware Boot Self-Test (चालू होताच तपासणी):
जेव्हा तुम्ही ESP8266 चालू करता किंवा USB जोडता:
1. **D5 चा LED लगेच पेटेल.**
2. **D0 चा Buzzer बीप करेल.** (अॅक्टिव्ह आणि पॅसिव्ह दोन्ही टेस्ट होतात).
3. **Serial Monitor (115200 baud)** वर `[TEST] Hardware Self-Test Complete!` संदेश येईल.
यामुळे तुम्हाला लगेच कळेल की बझर आणि एलईडीचे वायरिंग बरोबर जोडले आहे.

---

## 🚀 थेट टेस्टिंग कसे करावे?
1. वेबसाइटच्या वरील भागात (Navbar) **"Test Hardware Alarm"** हे पिवळे बटण दिले आहे.
2. त्यावर क्लिक करताच पुढील १५ सेकंदांसाठी ESP8266 चा बझर आणि LED लगेच वाजू लागेल.
3. D6 वरील पुश बटण दाबून तुम्ही हा अलार्म लगेच थांबवू शकता.

---

## 🛠️ Arduino IDE मधील सेटिंग:
- **Board**: `NodeMCU 1.0 (ESP-12E Module)`
- **Upload Speed**: `115200`
- **CPU Frequency**: `80 MHz`
- **Port**: तुमचा COM Port (उदा. `COM3` किंवा `COM4`)

## 🌐 कोडमधील Wi-Fi कॉन्फिगरेशन:
[`firmware/esp8266_smart_routine.ino`](esp8266_smart_routine.ino) फाईलमध्ये:
- `WIFI_SSID`: तुमच्या मोबाईल हॉटस्पॉट किंवा वायफाय चे नाव
- `WIFI_PASSWORD`: पासवर्ड
- `SERVER_BASE`: `http://10.99.33.207:5001` (आधीच सेट आहे)
