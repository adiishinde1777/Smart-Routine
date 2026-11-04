import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  User, 
  ChevronDown,
  Dumbbell,
  Pill,
  Coffee,
  Check,
  Wifi,
  Sparkles,
  Cpu,
  Zap
} from 'lucide-react';

export default function Navbar({ onOpenSimulator, onOpenChat }) {
  const { currentUser, switchProfile } = useAuth();
  const { device, soundEnabled, setSoundEnabled } = useDevice();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [testingHardware, setTestingHardware] = useState(false);

  const handleTestHardware = async () => {
    try {
      setTestingHardware(true);
      await fetch('/api/esp8266/trigger-test', { method: 'POST' });
      setTimeout(() => setTestingHardware(false), 15000);
    } catch (e) {
      setTestingHardware(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand: Smart Routine */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Smart Routine</span>
                <span className="bg-teal-500/10 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-teal-500/20">
                  Assistant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                Daily Routine, Diet, Gym & Medicine Planner
              </p>
            </div>
          </div>

          {/* Central Live Clock & Subtle Device Connection Indicator */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Live Clock */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-medium">{formattedDate}</span>
              <span className="font-mono-code font-bold text-slate-900">{formattedTime}</span>
            </div>

            {/* Live Hardware Buzzer & LED Test Button */}
            <button
              onClick={handleTestHardware}
              disabled={testingHardware}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                testingHardware 
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse shadow-md shadow-amber-500/30' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title="Test Buzzer & LED on ESP8266 for 15 seconds"
            >
              <Zap className={`w-3.5 h-3.5 ${testingHardware ? 'text-white' : 'text-amber-600'}`} />
              <span>{testingHardware ? 'Testing Alarm (15s)...' : 'Test Hardware Alarm'}</span>
            </button>

            {/* Subtle ESP8266 Device Status */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="ESP8266 Device Connected & Synced"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>ESP8266</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          {/* Right Action Tools: Sound, AI Assistant & User Profile Switcher */}
          <div className="flex items-center space-x-2.5">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute reminder chime' : 'Enable reminder chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenChat}
              className="p-2 text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer flex items-center space-x-1 text-xs font-bold"
              title="Open Smart Routine AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">AI Helper</span>
            </button>

            {/* User Profile Badge (Mayur - Daily Routine) */}
            <div className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser?.name || 'Mayur'}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || 'Mayur'}
                </div>
                <div className="text-[10px] text-teal-600 font-semibold leading-tight">
                  Daily Routine
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
