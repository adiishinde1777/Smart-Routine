import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Bell, 
  Utensils, 
  Pill,
  Dumbbell,
  Droplet,
  Check,
  Sparkles
} from 'lucide-react';

export function getStatusBadge(status) {
  switch (status) {
    case 'Completed':
    case 'Removal Detected + User Confirmed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        label: 'Completed',
        badgeColor: 'bg-emerald-500'
      };
    case 'Reminder Active':
      return {
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-200 animate-pulse',
        icon: Bell,
        label: 'Active (Take Now!)',
        badgeColor: 'bg-cyan-500'
      };
    case 'Missed':
    case 'Missed / Not Confirmed':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: XCircle,
        label: 'Missed Window',
        badgeColor: 'bg-rose-500'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        icon: Clock,
        label: 'Upcoming',
        badgeColor: 'bg-slate-400'
      };
  }
}

export function getItemTypeIcon(itemType) {
  switch (itemType) {
    case 'meal':
      return { icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-100/70', border: 'border-amber-200', label: '🥗 Meal & Diet' };
    case 'workout':
      return { icon: Dumbbell, color: 'text-purple-600', bg: 'bg-purple-100/70', border: 'border-purple-200', label: '🏋️ Gym & Supplements' };
    case 'other':
      return { icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-100/70', border: 'border-blue-200', label: '💧 Habit / Water' };
    default:
      return { icon: Pill, color: 'text-teal-600', bg: 'bg-teal-100/70', border: 'border-teal-200', label: '💊 Medicine' };
  }
}

export default function RoutineTimeline({ reminders = [], onConfirmReminder, onTestReminder }) {
  if (!reminders || reminders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
        <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">No scheduled routines for today</p>
        <p className="text-xs text-slate-500 mt-1">Add medicines, meals, or fitness supplements to build your daily plan</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((rem, index) => {
        const badge = getStatusBadge(rem.status);
        const StatusIcon = badge.icon;
        const isCompleted = rem.status === 'Completed' || rem.status === 'Removal Detected + User Confirmed';
        const isActive = rem.status === 'Reminder Active';

        const itemType = rem.routine?.itemType || (rem.medicine?.category?.includes('Meal') ? 'meal' : 'medicine');
        const typeMeta = getItemTypeIcon(itemType);
        const TypeIcon = typeMeta.icon;

        const itemName = rem.medicine?.name || rem.routine?.name || 'Scheduled Item';
        const foodRelation = rem.routine?.foodRelation || rem.medicine?.foodRelation;
        const mealType = rem.routine?.mealType || rem.medicine?.mealType;
        const dosage = rem.routine?.dosage || rem.medicine?.dosage;
        const notes = rem.notes || rem.routine?.notes || rem.medicine?.notes;

        return (
          <div
            key={rem.id || index}
            className={`p-4 rounded-2xl bg-white border transition-all ${
              isCompleted
                ? 'border-emerald-200/80 bg-emerald-50/10'
                : isActive
                ? 'border-cyan-400 bg-cyan-50/25 ring-2 ring-cyan-400/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Left Side: Time Badge + Icon + Routine Info */}
              <div className="flex items-start space-x-3.5">
                
                {/* Clean Time Badge */}
                <div className={`rounded-xl px-3 py-2 text-center min-w-[72px] shadow-xs flex flex-col justify-center ${
                  isCompleted
                    ? 'bg-emerald-700 text-white'
                    : isActive
                    ? 'bg-cyan-600 text-white animate-pulse'
                    : 'bg-slate-900 text-white'
                }`}>
                  <div className="text-xs font-bold font-mono-code leading-none">
                    {rem.scheduledTime || '09:00'}
                  </div>
                  <div className="text-[9px] font-semibold tracking-wider mt-1 opacity-85 uppercase">
                    {rem.scheduledTime >= '12:00' && rem.scheduledTime < '17:00' ? 'Afternoon' :
                     rem.scheduledTime >= '17:00' && rem.scheduledTime < '21:00' ? 'Evening' :
                     rem.scheduledTime >= '21:00' ? 'Night' : 'Morning'}
                  </div>
                </div>

                {/* Routine Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {itemName}
                    </h4>
                    
                    {/* Category Type Pill */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeMeta.bg} ${typeMeta.color} ${typeMeta.border}`}>
                      {typeMeta.label}
                    </span>

                    {/* Meal Type Pill */}
                    {mealType && mealType !== 'None' && (
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        {mealType}
                      </span>
                    )}

                    {/* Food Relation Badge */}
                    {foodRelation && foodRelation !== 'None' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        foodRelation.includes('After')
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {foodRelation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1">
                    {dosage && (
                      <span className="font-semibold text-slate-700">
                        Portion/Dose: {dosage}
                      </span>
                    )}
                    {notes && (
                      <span className="text-slate-500 text-[11px] font-medium">
                        • {notes}
                      </span>
                    )}
                  </div>

                  {rem.actualTime && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Taken at {rem.actualTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Status Badge & Quick Confirm Button */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${badge.bg}`}>
                  <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{badge.label}</span>
                </div>

                {!isCompleted && onConfirmReminder && (
                  <button
                    onClick={() => onConfirmReminder(rem.id)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                    title="Mark as Taken / Completed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
