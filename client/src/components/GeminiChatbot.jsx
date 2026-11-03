import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/api';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Languages, 
  AlertCircle, 
  Trash2, 
  X, 
  PhoneCall, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

export default function GeminiChatbot({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${currentUser?.name?.split(' ')[0] || 'there'}! I am your **Smart Routine AI Assistant**.\n\nI can assist you with your medicine timing, gym workout nutrition, meals, and daily healthy routines. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map(m => ({ role: m.role, text: m.text }));
      const res = await sendChatMessage(query, historyPayload, currentUser?.id);
      
      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: res?.reply || 'I am having trouble connecting to the medical health engine right now. Please check back shortly.',
        model: res?.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          text: 'An error occurred while communicating with the health assistant. Please consult your physician for medical advice.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is my next scheduled routine?",
    "When should I take my post-workout protein shake?",
    "Why should diabetes medicine be taken after meals?",
    "How should I organize my meal and hydration schedule?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-800 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base">MediRoutine AI</span>
              <span className="bg-teal-400/20 text-teal-200 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Assistant</span>
            </div>
            <p className="text-xs text-teal-100/80">Gemini-Powered Personal Health Bot</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Multilingual Selector Bar */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
          <Languages className="w-3.5 h-3.5 text-teal-600" />
          <span>Languages Supported:</span>
        </div>
        <div className="flex space-x-1">
          {['English', 'मराठी', 'हिंदी'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                selectedLanguage === lang ? 'bg-teal-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        
        {/* Emergency Alert Banner */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5">
          <PhoneCall className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Medical Emergency?</span> If you experience severe chest pain, shortness of breath, or sudden illness, call <strong>112 / 108</strong> immediately.
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white shadow-sm'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line">{msg.text}</div>
              <div className={`text-[10px] mt-1.5 flex items-center justify-between ${
                msg.role === 'user' ? 'text-blue-200' : 'text-slate-600'
              }`}>
                <span>{msg.timestamp}</span>
                {msg.model && (
                  <span className="text-[9px] opacity-75">{msg.model}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-600 text-xs pl-2">
            <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 flex items-center space-x-1.5">
              <span>Assistant is researching medicine data</span>
              <span className="inline-flex space-x-1">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="text-[11px] text-slate-600 font-semibold mb-2">Suggested Questions:</div>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors text-left truncate max-w-full cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about medicines, routines, vitamins in ${selectedLanguage}...`}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Medical Safety Disclaimer Footer */}
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-600 leading-tight text-center">
        ⚠️ <strong>Medical Disclaimer:</strong> MediRoutine AI provides informational routine guidance and does not replace professional medical diagnosis. Consult Dr. Priya Kulkarni before altering medications.
      </div>

    </div>
  );
}
