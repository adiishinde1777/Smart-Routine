import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  Clock,
  Lock,
  Mail,
  User,
  Dumbbell,
  Pill,
  Coffee,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone
} from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const { login, switchProfile } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('patient');
  const [email, setEmail] = useState('rahul.sharma@smartroutine.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Rahul Sharma');
  const [phone, setPhone] = useState('+91 98765 22222');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, selectedProfile);
    onLoginSuccess();
  };

  const handleQuickDemo = (profileKey) => {
    switchProfile(profileKey);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/25 text-white mx-auto mb-3">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Smart Routine
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
          Intelligent daily routine planner for gym fitness, diet schedules, medicines, and healthy habits.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-slate-200">

          {/* Quick 1-Click Profile Selection */}
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick 1-Click Profile Demo
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('gym')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <Dumbbell className="w-4 h-4 text-amber-600 mb-1" />
                <div className="font-bold text-[11px]">Gym & Fitness</div>
                <div className="text-[10px] text-amber-700 truncate">Rohan (Diet)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 text-teal-900 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <Pill className="w-4 h-4 text-teal-600 mb-1" />
                <div className="font-bold text-[11px]">Patient Care</div>
                <div className="text-[10px] text-teal-700 truncate">Rahul (Meds)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('general')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <Coffee className="w-4 h-4 text-blue-600 mb-1" />
                <div className="font-bold text-[11px]">Daily Routine</div>
                <div className="text-[10px] text-blue-700 truncate">Aditya (Habits)</div>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe / Alex"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
