import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  Dumbbell, 
  Pill, 
  Utensils, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Flame,
  Activity,
  HeartHandshake
} from 'lucide-react';

export default function LandingPage({ onEnterApp, onOpenSimulator }) {
  const { switchProfile } = useAuth();

  const handleProfileStart = (profileKey) => {
    switchProfile(profileKey);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Top Notice Bar */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 text-white text-xs py-2 px-4 text-center border-b border-teal-500/30">
        <span className="bg-teal-500/20 text-teal-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase mr-2 border border-teal-500/40">
          Smart Routine
        </span>
        Intelligent planner for gym nutrition, prescription medicines, meal schedules, and daily habits.
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Built for Gym Enthusiasts, Patients & Everyday Users</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              The Right Routine. The Right Time. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
                Effortless with Smart Routine.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Never miss your morning prescription, pre-workout meal, post-workout protein shake, or lunch timing. Smart Routine keeps your daily life, fitness diet, and health regimen perfectly organized.
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleProfileStart('gym')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Launch Gym & Fitness Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleProfileStart('patient')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Pill className="w-4 h-4" />
                <span>Launch Patient Care Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Profile Selection Badges */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-2">Quick 1-Click Entry:</span>
              <button
                onClick={() => handleProfileStart('gym')}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Dumbbell className="w-3.5 h-3.5 text-amber-600" />
                <span>Gym Boy (Rohan)</span>
              </button>

              <button
                onClick={() => handleProfileStart('patient')}
                className="px-3 py-1.5 rounded-xl bg-white border border-teal-200 hover:bg-teal-50 text-teal-900 font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Care (Rahul)</span>
              </button>

              <button
                onClick={() => handleProfileStart('general')}
                className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-900 font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Daily Routine (Aditya)</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              One Smart Platform for Every Lifestyle
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Tailored for athletes, patients, and health-conscious individuals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Gym Boys */}
            <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Gym, Fitness & Supplements</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Schedule pre-workout meals, post-workout Whey protein shakes, 5g creatine timing, multivitamins, and high-protein diet schedules with precision.
              </p>
              <div className="mt-4 pt-3 border-t border-amber-200/60 text-xs font-bold text-amber-800">
                ✓ Pre & Post Workout Shake Timing
              </div>
            </div>

            {/* Feature 2: Patients & Medicine */}
            <div className="p-6 rounded-3xl bg-teal-50/40 border border-teal-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 mb-4">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Patient Care & Medicines</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear distinction on whether medications must be taken Before Meal, After Meal, or on an Empty Stomach, keeping doses strictly on track.
              </p>
              <div className="mt-4 pt-3 border-t border-teal-200/60 text-xs font-bold text-teal-800">
                ✓ Before & After Food Clarity
              </div>
            </div>

            {/* Feature 3: Meals & Lifestyle */}
            <div className="p-6 rounded-3xl bg-blue-50/40 border border-blue-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Meals, Hydration & Habits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Maintain consistent breakfast, lunch, and dinner times. Get reminders for water intake, light evening walks, and timely sleep.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-200/60 text-xs font-bold text-blue-800">
                ✓ Healthy Dietary Discipline
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p className="font-bold text-slate-200">Smart Routine • Daily Routine, Diet, Gym & Medicine Planner</p>
          <p className="mt-1">NodeMCU ESP8266 Wi-Fi Hardware Sync & MySQL Database Supported</p>
        </div>
      </footer>

    </div>
  );
}
