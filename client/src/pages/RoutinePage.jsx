import React, { useState } from 'react';
import { useRoutine } from '../context/RoutineContext';
import { useDevice } from '../context/DeviceContext';
import MedicineModal from '../components/MedicineModal';
import {
  CalendarClock,
  Plus,
  Clock,
  Trash2,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Utensils,
  Pill,
  Dumbbell
} from 'lucide-react';

export default function RoutinePage({ onOpenSimulator }) {
  const { routines, handleAddMedicine, handleDeleteMedicine, refreshData } = useRoutine();
  const { handleSyncSchedule } = useDevice();
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const onSync = async () => {
    setSyncing(true);
    await handleSyncSchedule();
    setTimeout(() => setSyncing(false), 800);
  };

  const morningRoutines = routines.filter(r => r.timeSlot < '12:00');
  const afternoonRoutines = routines.filter(r => r.timeSlot >= '12:00' && r.timeSlot < '17:00');
  const eveningRoutines = routines.filter(r => r.timeSlot >= '17:00' && r.timeSlot < '21:00');
  const nightRoutines = routines.filter(r => r.timeSlot >= '21:00');

  const renderRoutineCard = (r) => {
    const isMeal = r.itemType === 'meal' || r.category?.includes('Meal');
    const isWorkout = r.itemType === 'workout';

    return (
      <div
        key={r.id}
        className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between gap-3"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono-code shadow-xs">
            <span className="text-xs font-bold">{r.timeSlot}</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-extrabold text-slate-900 text-sm">{r.name}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isMeal ? 'bg-amber-50 text-amber-800 border-amber-200' :
                isWorkout ? 'bg-purple-50 text-purple-800 border-purple-200' :
                  'bg-teal-50 text-teal-800 border-teal-200'
                }`}>
                {isMeal ? '🥗 Meal' : isWorkout ? '🏋️ Gym & Fitness' : '💊 Medicine'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600 mt-1">
              {r.dosage && <span>Serving: {r.dosage}</span>}
              {r.foodRelation && r.foodRelation !== 'None' && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-teal-700">{r.foodRelation}</span>
                </>
              )}
              {r.notes && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 text-[11px] italic">"{r.notes}"</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => handleDeleteMedicine(r.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Delete Routine Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Routine Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure medicines, breakfast, lunch, dinner, gym supplements, and hydration reminders.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync ESP8266'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Routine Item</span>
          </button>
        </div>
      </div>

      {/* Routine Slots Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs mb-1.5">
            <Sun className="w-4 h-4 text-amber-600" />
            <span>Morning Routines</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 font-mono-code">{morningRoutines.length}</div>
          <p className="text-[11px] text-amber-800/80 mt-0.5">Breakfast & Morning Doses</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 p-4 rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center space-x-2 text-blue-800 font-bold text-xs mb-1.5">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Afternoon Routines</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono-code">{afternoonRoutines.length}</div>
          <p className="text-[11px] text-blue-800/80 mt-0.5">Lunch & Multivitamins</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center space-x-2 text-purple-800 font-bold text-xs mb-1.5">
            <Sunset className="w-4 h-4 text-purple-600" />
            <span>Evening & Workout</span>
          </div>
          <div className="text-2xl font-extrabold text-purple-900 font-mono-code">{eveningRoutines.length}</div>
          <p className="text-[11px] text-purple-800/80 mt-0.5">Gym, Pre & Post-Workout Diet</p>
        </div>

        <div className="bg-gradient-to-br from-slate-100 to-slate-200/50 p-4 rounded-2xl border border-slate-300 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs mb-1.5">
            <Moon className="w-4 h-4 text-slate-600" />
            <span>Night & Sleep</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-code">{nightRoutines.length}</div>
          <p className="text-[11px] text-slate-700/80 mt-0.5">Dinner & Bedtime Medicine</p>
        </div>
      </div>

      {/* Routine Sections by Time of Day */}
      <div className="space-y-6">

        {/* Morning Section */}
        {morningRoutines.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2.5 flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Morning Schedule (06:00 - 12:00)</span>
            </h3>
            <div className="space-y-2.5">
              {morningRoutines.map(renderRoutineCard)}
            </div>
          </div>
        )}

        {/* Afternoon Section */}
        {afternoonRoutines.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2.5 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Afternoon Schedule (12:00 - 17:00)</span>
            </h3>
            <div className="space-y-2.5">
              {afternoonRoutines.map(renderRoutineCard)}
            </div>
          </div>
        )}

        {/* Evening Section */}
        {eveningRoutines.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2.5 flex items-center space-x-1.5">
              <Sunset className="w-4 h-4 text-purple-600" />
              <span>Evening & Gym Diet Schedule (17:00 - 21:00)</span>
            </h3>
            <div className="space-y-2.5">
              {eveningRoutines.map(renderRoutineCard)}
            </div>
          </div>
        )}

        {/* Night Section */}
        {nightRoutines.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center space-x-1.5">
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Night & Bedtime Schedule (After 21:00)</span>
            </h3>
            <div className="space-y-2.5">
              {nightRoutines.map(renderRoutineCard)}
            </div>
          </div>
        )}

        {routines.length === 0 && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700">No routine items added yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click the button above to add your first routine item</p>
          </div>
        )}

      </div>

      {/* Add Routine Modal */}
      <MedicineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={async (data) => {
          await handleAddMedicine(data);
          await refreshData();
        }}
      />

    </div>
  );
}
