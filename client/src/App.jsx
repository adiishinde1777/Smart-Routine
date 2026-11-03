import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeviceProvider } from './context/DeviceContext';
import { RoutineProvider } from './context/RoutineContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HardwareSimulator from './components/HardwareSimulator';
import GeminiChatbot from './components/GeminiChatbot';

import LandingPage from './pages/LandingPage';
import PatientDashboard from './pages/PatientDashboard';
import MedicinesPage from './pages/MedicinesPage';
import RoutinePage from './pages/RoutinePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SimulatorPage from './pages/SimulatorPage';
import AuthPage from './pages/AuthPage';

import { Sparkles, Bot, Clock } from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('app'); // 'landing', 'app', 'auth'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorTargetReminder, setSimulatorTargetReminder] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenSimulator = (reminder = null) => {
    setSimulatorTargetReminder(reminder);
    setIsSimulatorOpen(true);
  };

  // If user clicked landing view or logged out
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setViewMode('app')}
          onOpenSimulator={() => {
            setViewMode('app');
            setActiveTab('simulator');
          }}
        />
        {/* Floating Quick Entry to Dashboard if user is logged in */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setViewMode('app')}
            className="px-5 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xl shadow-teal-500/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Open Dashboard</span>
          </button>
        </div>
      </>
    );
  }

  if (viewMode === 'auth' || !currentUser) {
    return <AuthPage onLoginSuccess={() => setViewMode('app')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Application Navbar */}
      <Navbar
        onOpenSimulator={() => handleOpenSimulator()}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Body with Sidebar + Active Page */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSimulator={() => handleOpenSimulator()}
          onOpenChat={() => setIsChatOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Top Quick Navigation Pill for Landing Showcase */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setViewMode('landing')}
                className="text-slate-500 hover:text-teal-700 font-semibold transition-colors cursor-pointer"
              >
                ← Back to Landing Showcase
              </button>
            </div>
          </div>

          {/* Clean User Routine Views */}
          {activeTab === 'dashboard' && (
            <PatientDashboard
              onOpenSimulator={handleOpenSimulator}
              onOpenChat={() => setIsChatOpen(true)}
              onSelectTab={setActiveTab}
            />
          )}
          {activeTab === 'routine' && <RoutinePage onOpenSimulator={handleOpenSimulator} />}
          {activeTab === 'medicines' && <MedicinesPage />}
          {activeTab === 'analytics' && <AnalyticsPage />}
          {activeTab === 'simulator' && <SimulatorPage />}
        </main>
      </div>

      {/* Floating AI Chatbot Bubble Trigger */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-3.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-xl shadow-teal-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-2 group"
          title="Open Smart Routine AI Assistant"
        >
          <Bot className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-1">
            Smart Routine AI
          </span>
        </button>
      </div>

      {/* Gemini AI Assistant Drawer */}
      <GeminiChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Floating ESP8266 Hardware Workbench Modal */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <HardwareSimulator
              onClose={() => setIsSimulatorOpen(false)}
              currentReminder={simulatorTargetReminder}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <RoutineProvider>
          <AppContent />
        </RoutineProvider>
      </DeviceProvider>
    </AuthProvider>
  );
}
