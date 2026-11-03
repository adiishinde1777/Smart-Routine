/**
 * MediRoutine AI - Gemini Health Assistant Service
 * Multi-lingual (English, Marathi, Hindi), strictly safety-guarded healthcare routine assistant.
 */

const SYSTEM_INSTRUCTION = `
You are "MediRoutine AI Assistant", a smart, empathetic, and knowledgeable IoT health routine & medicine companion.
You work alongside an ESP32 smart pill dispenser and patient dashboard.

CORE CAPABILITIES:
1. Explain general medicine information (e.g., how Metformin works, common side effects, when to take it).
2. Explain supplements and vitamins (e.g., Omega-3, Multivitamins, Whey Protein, Vitamin D3).
3. Answer questions about the user's active routine, scheduled reminders, and adherence reports.
4. Support English, Hindi (हिंदी), and Marathi (मराठी). Always reply in the language the user asked in or requested.

STRICT MEDICAL SAFETY GUARDRAILS (CRITICAL):
- NEVER diagnose diseases or medical conditions.
- NEVER independently prescribe medicines or recommend prescription drugs.
- NEVER tell a user to change their prescribed dosage or alter their timing without doctor approval.
- NEVER advise stopping a prescribed medicine.
- ALWAYS refer treatment decisions to the user's qualified treating physician (e.g. Dr. Priya Kulkarni).
- IN MEDICAL EMERGENCIES (severe chest pain, breathing difficulty, allergic shock, loss of consciousness, stroke symptoms): immediately advise the user to call emergency medical services (112 / 108 in India, 911 in US) and reach the nearest emergency room.
- ALWAYS append a brief medical disclaimer note when discussing medications.
`;

// Curated healthcare fallback knowledge base for instant response when GEMINI_API_KEY is not configured
const KNOWLEDGE_BASE = {
  medicines: {
    metformin: {
      en: "Metformin is an oral biguanide medicine used to manage blood sugar in Type 2 Diabetes. It works by reducing glucose production in the liver and improving insulin sensitivity. Take it with or immediately after meals to reduce stomach upset. Never alter your dosage without Dr. Priya's consultation.",
      hi: "मेटफॉर्मिन (Metformin) टाइप 2 डायबिटीज में ब्लड शुगर नियंत्रित करने वाली मुख्य दवा है। यह लिवर में ग्लूकोज उत्पादन को कम करती है। इसे हमेशा भोजन के साथ या तुरंत बाद लें ताकि पेट में असुविधा न हो।",
      mr: "मेटफॉर्मिन (Metformin) ही टाईप २ मधुमेहामध्ये रक्तातील साखर नियंत्रित ठेवणारी औषध आहे. हे यकृतात ग्लुकोज निर्मिती कमी करते. पोटात त्रास होऊ नये म्हणून हे नेहमी जेवणानंतर किंवा जेवणासोबत घ्यावे."
    },
    atorvastatin: {
      en: "Atorvastatin is a statin medication that lowers LDL ('bad') cholesterol and triglycerides while raising HDL ('good') cholesterol. It helps prevent cardiovascular events. Usually prescribed once daily at bedtime because cholesterol synthesis peaks at night.",
      hi: "एटोरवास्टेटिन (Atorvastatin) कोलेस्ट्रॉल कम करने वाली दवा है। यह हृदय रोगों और स्ट्रोक के खतरे को घटाती है। इसे आमतौर पर रात को सोने से पहले लिया जाता है।",
      mr: "एटोरवास्टेटिन (Atorvastatin) हे कोलेस्टेरॉल कमी करणारे औषध आहे. ते हृदयविकाराचा झटका आणि पक्षाघाताचा धोका कमी करते. हे सामान्यतः रात्री झोपण्यापूर्वी घेतले जाते."
    },
    omega3: {
      en: "Omega-3 fatty acids (EPA & DHA) support heart health, lower triglyceride levels, reduce joint inflammation, and support brain function. Best taken with meals containing dietary fats for maximum absorption.",
      hi: "ओमेगा-3 (Omega-3) फैटी एसिड हृदय स्वास्थ्य, जोड़ों के लचीलेपन और मस्तिष्क के लिए बहुत लाभकारी हैं। इसे वसायुक्त भोजन के बाद लें।",
      mr: "ओमेगा-3 फॅटी ऍसिड हे हृदयाचे आरोग्य, सांधेदुखी आणि मेंदूच्या कार्यासाठी अत्यंत फायदेशीर आहे. हे दुपारच्या जेवणानंतर घेणे सर्वोत्तम ठरते."
    },
    multivitamin: {
      en: "Daily multivitamins help fill micronutrient gaps (Zinc, B-Complex, Vitamin C, Vitamin D3). They support energy metabolism and immune defense. Take in the morning after breakfast to avoid nausea.",
      hi: "दैनिक मल्टीविटामिन शरीर की पोषण संबंधी कमियों को पूरा करते हैं और रोग प्रतिरोधक क्षमता बढ़ाते हैं। इन्हें सुबह नाश्ते के बाद लें।",
      mr: "दैनिक मल्टीव्हिटॅमिन शरीराला आवश्यक पोषण पुरवतात आणि रोगप्रतिकारशक्ती वाढवतात. हे सकाळी नाश्त्यानंतर घ्यावे."
    }
  }
};

async function generateChatResponse({ message, userContext, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // If a valid Gemini API key is configured, invoke the official Gemini REST endpoint
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY' && apiKey.length > 15) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${SYSTEM_INSTRUCTION}
                    
CURRENT USER CONTEXT:
Patient: ${userContext?.name || 'Rahul Sharma'}
Active Medicines: ${JSON.stringify(userContext?.medicines || [])}
Today's Reminders: ${JSON.stringify(userContext?.reminders || [])}
Doctor: ${userContext?.doctorName || 'Dr. Priya Kulkarni'}

CONVERSATION HISTORY:
${history.map(h => `${h.role}: ${h.text}`).join('\n')}

USER MESSAGE:
${message}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return {
            reply: replyText,
            isAiLive: true,
            model: 'gemini-1.5-flash'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local health engine:', err.message);
    }
  }

  // Graceful Local Medical Routine Assistant Engine
  return generateLocalSmartResponse(message, userContext);
}

function generateLocalSmartResponse(message, userContext) {
  const lower = message.toLowerCase();
  const userName = userContext?.name || 'Rahul';
  const medicines = userContext?.medicines || [];
  const reminders = userContext?.reminders || [];

  // Check language preference
  const isMarathi = /कधी|औषध|कसे|माहिती|नमस्कार|आरोग्य|मराठी|घ्यावे/i.test(message);
  const isHindi = /कब|दवा|कैसे|नमस्ते|जानकारी|स्वास्थ्य|हिंदी|लेना/i.test(message);

  // Emergency safety trigger
  if (/emergency|heart attack|chest pain|can't breathe|choking|unconscious|छातीत दुखणे|सांस फूलना|बेहोश/i.test(lower)) {
    if (isMarathi) {
      return {
        reply: `🚨 **तातडीची वैद्यकीय आणीबाणी सूचना!**
तुम्हाला तीव्र छातीत दुखणे, श्वास घेण्यास अडचण किंवा चक्कर येत असल्यास, कृपया **ताबडतोब 108 किंवा 112 वर कॉल करा** किंवा जवळच्या रुग्णालयाच्या आपत्कालीन कक्षात (Emergency Room) पोहोचा. स्वतःहून कोणतीही गोळी घेऊ नका.`,
        isAiLive: false
      };
    }
    if (isHindi) {
      return {
        reply: `🚨 **आपातकालीन चिकित्सा चेतावनी!**
यदि आपको सीने में गंभीर दर्द, सांस लेने में अत्यधिक कठिनाई या बेहोशी महसूस हो रही है, तो कृपया **तुरंत 108 या 112 पर कॉल करें** अथवा नजदीकी अस्पताल के आपातकालीन विभाग में जाएं। तुरंत चिकित्सकीय सहायता लें।`,
        isAiLive: false
      };
    }
    return {
      reply: `🚨 **CRITICAL MEDICAL EMERGENCY ALERT!**
If you are experiencing severe chest pain, shortness of breath, sudden numbness, or loss of consciousness, **call 112 / 108 / 911 IMMEDIATELY** or proceed to the nearest emergency department. Do not wait for routine reminders.`,
      isAiLive: false
    };
  }

  // Routine & Next reminder queries
  if (lower.includes('next') || lower.includes('routine') || lower.includes('schedule') || lower.includes('पुढील') || lower.includes('अगली')) {
    const upcoming = reminders.find(r => r.status === 'Upcoming') || reminders[0];
    if (upcoming) {
      const timeStr = upcoming.scheduledTime || upcoming.time || '20:30';
      if (isMarathi) {
        return {
          reply: `नमस्ते ${userName}, तुमची पुढील गोळी **कम्पार्टमेंट ${upcoming.compartment}** मध्ये **${timeStr}** वाजता नियोजित आहे. ती घेतल्यानंतर ईएसपी३२ वरील बटण दाबून नोंद करा.\n\n*टीप: औषधांच्या वेळा डॉक्टरांच्या सल्ल्यानुसार निश्चित केल्या आहेत.*`,
          isAiLive: false
        };
      }
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}, आपकी अगली दवा **कम्पार्टमेंट ${upcoming.compartment}** में **${timeStr}** पर निर्धारित है। दवा लेने के बाद ईएसपी32 बटन दबाकर पुष्टि करें।\n\n*सलाह: दवाएं डॉक्टर के निर्देशानुसार ही लें।*`,
          isAiLive: false
        };
      }
      return {
        reply: `Hello ${userName}! Your next scheduled medication is at **${timeStr}** in **Compartment #${upcoming.compartment}**. Your ESP32 smart dispenser will alert you with a gentle chime and LED indicator.\n\n*Medical Disclaimer: MediRoutine AI assists with schedule reminders and does not replace medical supervision.*`,
        isAiLive: false
      };
    }
  }

  // Metformin query
  if (lower.includes('metformin') || lower.includes('diabetes') || lower.includes('मधुमेह') || lower.includes('डायबिटीज')) {
    const lang = isMarathi ? 'mr' : (isHindi ? 'hi' : 'en');
    return {
      reply: `${KNOWLEDGE_BASE.medicines.metformin[lang]}\n\n⚠️ *Disclaimer: Always consult your physician (Dr. Priya Kulkarni) before making any modifications.*`,
      isAiLive: false
    };
  }

  // Atorvastatin / Cholesterol query
  if (lower.includes('atorvastatin') || lower.includes('cholesterol') || lower.includes('कोलेस्ट्रॉल') || lower.includes('हृदय')) {
    const lang = isMarathi ? 'mr' : (isHindi ? 'hi' : 'en');
    return {
      reply: `${KNOWLEDGE_BASE.medicines.atorvastatin[lang]}\n\n⚠️ *Disclaimer: Do not stop statins abruptly without consulting your doctor.*`,
      isAiLive: false
    };
  }

  // Omega 3 query
  if (lower.includes('omega') || lower.includes('fish oil') || lower.includes('ओमेगा') || lower.includes('supplement')) {
    const lang = isMarathi ? 'mr' : (isHindi ? 'hi' : 'en');
    return {
      reply: `${KNOWLEDGE_BASE.medicines.omega3[lang]}\n\n⚠️ *Disclaimer: Dietary supplements should supplement a balanced diet, not replace prescribed therapies.*`,
      isAiLive: false
    };
  }

  // Multivitamin query
  if (lower.includes('vitamin') || lower.includes('multivitamin') || lower.includes('व्हिटॅमिन') || lower.includes('विटामिन')) {
    const lang = isMarathi ? 'mr' : (isHindi ? 'hi' : 'en');
    return {
      reply: `${KNOWLEDGE_BASE.medicines.multivitamin[lang]}\n\n⚠️ *Disclaimer: Micronutrient balance is individualized. Consult your doctor or dietitian.*`,
      isAiLive: false
    };
  }

  // Default helpful response
  if (isMarathi) {
    return {
      reply: `नमस्कार ${userName}! मी तुमचा **MediRoutine AI** वैयक्तिक आरोग्य सहाय्यक आहे. मी तुमच्या औषधांच्या वेळा, गोळ्यांचे सामान्य उपयोग, पूरक आहार (व्हिटॅमिन्स, ओमेगा-3) आणि ईएसपी३२ उपकरणाच्या स्थितीबद्दल माहिती देऊ शकतो.\n\nतुम्ही मला इंग्रजी, मराठी किंवा हिंदीमध्ये विचारू शकता.\n\n*टीप: मी रोगांचे निदान करत नाही; उपचारासाठी नेहमी डॉ. प्रिया कुलकर्णी किंवा तुमच्या डॉक्टरांचा सल्ला घ्या.*`,
      isAiLive: false
    };
  }
  if (isHindi) {
    return {
      reply: `नमस्ते ${userName}! मैं आपका **MediRoutine AI** स्वास्थ्य और रूटीन सहायक हूँ। मैं आपकी दवाओं के शेड्यूल, सामान्य उपयोग, पोषण व विटामिन्स और ईएसपी32 स्मार्ट डिस्पेंसर की स्थिति समझाने में मदद कर सकता हूँ।\n\nआप मुझसे हिंदी, मराठी या अंग्रेजी में पूछ सकते हैं।\n\n*सूचना: यह केवल सूचनात्मक मार्गदर्शन है। चिकित्सा सलाह हेतु अपने डॉक्टर से संपर्क करें।*`,
      isAiLive: false
    };
  }

  return {
    reply: `Hello ${userName}! I am **MediRoutine AI Assistant**. I can help you understand your scheduled medicines, nutrition & supplement benefits (like Multivitamins and Omega-3), dosage guidelines, and how your ESP32 smart dispenser verifies each dose.\n\nFeel free to ask me:\n- *"What is my next medicine?"*\n- *"Explain why I take Metformin after food"*\n- *"Why is taking Atorvastatin at bedtime recommended?"*\n- Or ask in Hindi (हिंदी) or Marathi (मराठी)!\n\n*Medical Disclaimer: MediRoutine AI is an educational assistant. Never change your prescribed medication regimen without consulting Dr. Priya Kulkarni.*`,
    isAiLive: false
  };
}

module.exports = {
  generateChatResponse
};
