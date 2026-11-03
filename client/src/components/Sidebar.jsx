import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import {
  LayoutDashboard,
  CalendarClock,
  Pill,
  BarChart3,
  Cpu,
  Sparkles,
  Wifi,
  Dumbbell
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenSimulator, onOpenChat }) {
  const { currentUser } = useAuth();
  const { device } = useDevice();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routine', label: 'Daily Routines', icon: CalendarClock },
    { 
      id: 'medicines', 
      label: currentUser?.profileType === 'fitness' ? 'Diet & Supplements' : 'Medicines & Diet', 
      icon: currentUser?.profileType === 'fitness' ? Dumbbell : Pill 
    },
    { id: 'analytics', label: 'Progress & Reports', icon: BarChart3 },
    { id: 'simulator', label: 'ESP8266 Device', icon: Cpu }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">

      {/* Navigation List */}
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Smart Routine Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                    ? 'bg-teal-50 text-teal-900 shadow-xs border border-teal-200/80 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Assistant Quick Launcher Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/20">
          <div className="flex items-center space-x-2 text-teal-800 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Smart Routine AI</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
            Ask questions about medicine timing, meal nutrition, protein, or diet plans.
          </p>
          <button
            onClick={onOpenChat}
            className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Bottom Subtle Device Status */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">ESP8266 Sync</div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready & Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('simulator')}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            View →
          </button>
        </div>
      </div>

    </aside>
  );
}
