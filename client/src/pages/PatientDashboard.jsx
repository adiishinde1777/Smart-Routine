import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRoutine } from '../context/RoutineContext';
import { useDevice } from '../context/DeviceContext';
import RoutineTimeline from '../components/RoutineTimeline';
import MedicineModal from '../components/MedicineModal';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Dumbbell,
  Pill,
  Utensils,
  Cpu
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function PatientDashboard({ onOpenSimulator, onOpenChat, onSelectTab }) {
  const { currentUser } = useAuth();
  const { stats, nextReminder, reminders, weeklyAdherence, handleAddMedicine, refreshData } = useRoutine();
  const { device } = useDevice();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const completionRate = stats?.completionPercentage || 0;

  // Filter reminders for Today's view
  const filteredReminders = reminders.filter(r => {
    if (selectedFilter === 'all') return true;
    const type = r.routine?.itemType || (r.medicine?.category?.includes('Meal') ? 'meal' : 'medicine');
    if (selectedFilter === 'medicine') return type === 'medicine';
    if (selectedFilter === 'meal') return type === 'meal';
    if (selectedFilter === 'workout') return type === 'workout';
    return true;
  });

  const handleConfirmReminder = async (reminderId) => {
    try {
      await fetch(`/api/reminders/${reminderId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedBy: 'web' })
      });
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const isFitnessUser = currentUser?.profileType === 'fitness';

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Smart Routine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="mt-2 text-sm text-teal-100/90 max-w-xl leading-relaxed">
              {isFitnessUser
                ? 'Your daily fitness schedule: workout meals, whey protein, creatine, and nutrition timing.'
                : 'Your personalized daily routine: prescription medicines, meals, hydration, and healthy lifestyle habits.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-md hover:bg-teal-50 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-teal-700" />
              <span>+ Add Routine Item</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl bg-teal-500/30 hover:bg-teal-500/40 text-teal-100 font-bold text-xs border border-teal-400/30 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>AI Routine Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Scheduled */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scheduled</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-code">
            {stats?.totalScheduled || reminders.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Routines for today</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono-code">
            {stats?.completed || reminders.filter(r => r.status === 'Completed').length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Confirmed on time</p>
        </div>

        {/* Upcoming */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Routines</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono-code">
            {stats?.upcoming || reminders.filter(r => r.status === 'Upcoming').length}
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Remaining today</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Daily Progress</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-700 font-mono-code">
            {completionRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Routine List (Left 7 Cols) + Weekly Adherence (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Dynamic Schedule */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Today's Schedule</h3>
                <p className="text-xs text-slate-500">Track your daily medicines, diet, and fitness intake</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({reminders.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('medicine')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedFilter === 'medicine'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  💊 Medicines
                </button>
                <button
                  onClick={() => setSelectedFilter('meal')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedFilter === 'meal'
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🥗 Meals & Diet
                </button>
                <button
                  onClick={() => setSelectedFilter('workout')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedFilter === 'workout'
                      ? 'bg-purple-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🏋️ Gym & Supplements
                </button>
              </div>
            </div>

            {/* Routine Timeline */}
            <RoutineTimeline
              reminders={filteredReminders}
              onConfirmReminder={handleConfirmReminder}
            />

          </div>
        </div>

        {/* Right Column: Next Reminder Card & Weekly Chart */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Next Immediate Routine Card */}
          {nextReminder && (
            <div className="bg-gradient-to-br from-teal-50 via-cyan-50/50 to-white p-5 rounded-3xl border border-teal-200 shadow-xs">
              <div className="flex items-center justify-between text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Next Routine Item</span>
                </span>
                <span className="font-mono-code font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-lg">
                  {nextReminder.scheduledTime}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 mt-1">
                {nextReminder.name}
              </h4>

              <div className="mt-2 text-xs text-slate-600 space-y-1">
                {nextReminder.dosage && (
                  <div>Portion / Dose: <span className="font-semibold text-slate-800">{nextReminder.dosage}</span></div>
                )}
                {nextReminder.foodRelation && nextReminder.foodRelation !== 'None' && (
                  <div className="text-teal-800 font-bold">
                    Timing: {nextReminder.foodRelation}
                  </div>
                )}
                {nextReminder.notes && (
                  <div className="text-slate-500 text-[11px] italic">
                    "{nextReminder.notes}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weekly Adherence Chart */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-sm mb-1">Weekly Routine Adherence</h4>
            <p className="text-xs text-slate-500 mb-3">Completion consistency over the last 7 days</p>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAdherence} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Adherence']} 
                    contentStyle={{ borderRadius: 12, fontSize: 12 }} 
                  />
                  <Bar dataKey="rate" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Add / Edit Routine Modal */}
      <MedicineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={async (data) => {
          await handleAddMedicine(data);
        }}
      />

    </div>
  );
}
