import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Utensils, 
  Dumbbell, 
  Droplet, 
  X, 
  Plus, 
  Clock, 
  Check, 
  Sparkles 
} from 'lucide-react';

const MEAL_TYPES = [
  { id: 'Breakfast', label: '🥞 Breakfast' },
  { id: 'Lunch', label: '🍛 Lunch' },
  { id: 'Snack', label: '☕ Evening Snack' },
  { id: 'Dinner', label: '🥗 Dinner' },
  { id: 'Pre-Workout', label: '⚡ Pre-Workout Meal' },
  { id: 'Post-Workout', label: '🥛 Post-Workout Meal' }
];

const FOOD_RELATIONS = [
  { id: 'After Meal', label: '🍲 After Meal', desc: 'Take within 30 mins after food' },
  { id: 'Before Meal', label: '🍽️ Before Meal', desc: 'Take 30 mins before food' },
  { id: 'With Food', label: '🥪 With Food', desc: 'Take during or with meal' },
  { id: 'Empty Stomach', label: '🌅 Empty Stomach', desc: 'Take early morning before eating' },
  { id: 'None', label: 'No Restriction', desc: 'Can be taken anytime' }
];

export default function MedicineModal({ isOpen, onClose, onSave, initialData }) {
  const [itemType, setItemType] = useState('medicine'); // 'medicine', 'meal', 'workout', 'other'
  
  const [name, setName] = useState('');
  const [timeSlot, setTimeSlot] = useState('08:30');
  const [category, setCategory] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [mealType, setMealType] = useState('Breakfast');
  const [foodRelation, setFoodRelation] = useState('After Meal');
  const [compartment, setCompartment] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setItemType(initialData.itemType || (initialData.category?.includes('Meal') ? 'meal' : 'medicine'));
      setName(initialData.name || '');
      setTimeSlot(initialData.timeSlot || initialData.timingSlots?.[0] || '08:30');
      setCategory(initialData.category || '');
      setDosage(initialData.dosage || '');
      setMealType(initialData.mealType || 'Breakfast');
      setFoodRelation(
        initialData.foodRelation?.includes('After') ? 'After Meal' :
        initialData.foodRelation?.includes('Before') ? 'Before Meal' :
        initialData.foodRelation?.includes('With') ? 'With Food' :
        initialData.foodRelation?.includes('Empty') ? 'Empty Stomach' : 'None'
      );
      setCompartment(initialData.compartment || 1);
      setNotes(initialData.notes || initialData.prescriptionNotes || '');
    } else {
      resetForType('medicine');
    }
  }, [initialData, isOpen]);

  const resetForType = (type) => {
    setItemType(type);
    if (type === 'medicine') {
      setName('');
      setTimeSlot('08:30');
      setCategory('Prescription Medicine');
      setDosage('1 Tablet');
      setMealType('Breakfast');
      setFoodRelation('After Meal');
      setCompartment(1);
      setNotes('');
    } else if (type === 'meal') {
      setName('');
      setTimeSlot('13:00');
      setCategory('Lunch Meal');
      setDosage('2 Chapatis, Dal, Rice & Salad');
      setMealType('Lunch');
      setFoodRelation('None');
      setCompartment(2);
      setNotes('Healthy balanced diet');
    } else if (type === 'workout') {
      setName('Whey Protein Shake');
      setTimeSlot('19:00');
      setCategory('Gym & Fitness');
      setDosage('1 Scoop (24g Protein) + 5g Creatine');
      setMealType('Post-Workout');
      setFoodRelation('After Meal');
      setCompartment(3);
      setNotes('Take with 250ml cold water right after workout');
    } else {
      setName('Drink 2 Glasses of Water');
      setTimeSlot('11:00');
      setCategory('Hydration & Habit');
      setDosage('500 ml');
      setMealType('None');
      setFoodRelation('None');
      setCompartment(1);
      setNotes('Stay hydrated throughout the day');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      itemType,
      name,
      timeSlot,
      timingSlots: [timeSlot],
      category: category || (itemType === 'medicine' ? 'Medicine' : itemType === 'meal' ? 'Meal' : 'Gym Supplement'),
      dosage,
      mealType,
      foodRelation,
      compartment: Number(compartment) || 1,
      notes,
      prescriptionNotes: notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-teal-700 via-cyan-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Clock className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {initialData ? 'Edit Routine Schedule' : 'Add New Routine Item'}
              </h3>
              <p className="text-xs text-teal-100">Set medicine, meals, workout supplements, or daily habits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* 1. SELECT TYPE: Medicine, Meal, Gym, Other */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. What would you like to schedule?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => resetForType('medicine')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                  itemType === 'medicine'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Pill className={`w-5 h-5 mb-1 ${itemType === 'medicine' ? 'text-teal-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Medicine</span>
                <span className="text-[10px] text-slate-500">Pills & Syrups</span>
              </button>

              <button
                type="button"
                onClick={() => resetForType('meal')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                  itemType === 'meal'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Utensils className={`w-5 h-5 mb-1 ${itemType === 'meal' ? 'text-amber-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Meal / Diet</span>
                <span className="text-[10px] text-slate-500">Breakfast, Lunch</span>
              </button>

              <button
                type="button"
                onClick={() => resetForType('workout')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                  itemType === 'workout'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Dumbbell className={`w-5 h-5 mb-1 ${itemType === 'workout' ? 'text-purple-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Gym & Fitness</span>
                <span className="text-[10px] text-slate-500">Whey & Creatine</span>
              </button>

              <button
                type="button"
                onClick={() => resetForType('other')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                  itemType === 'other'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Droplet className={`w-5 h-5 mb-1 ${itemType === 'other' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Habit / Water</span>
                <span className="text-[10px] text-slate-500">Hydration, Walk</span>
              </button>
            </div>
          </div>

          {/* 2. DYNAMIC INPUTS BASED ON TYPE */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            
            {/* Title / Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {itemType === 'medicine' && 'Medicine Name & Dosage'}
                {itemType === 'meal' && 'Food Menu or Meal Items'}
                {itemType === 'workout' && 'Supplement or Workout Name'}
                {itemType === 'other' && 'Activity or Habit Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  itemType === 'medicine' ? 'e.g., Metformin 500mg, Multivitamin, BP Tablet...' :
                  itemType === 'meal' ? 'e.g., Oatmeal with 3 Boiled Eggs, Chicken Rice, Chapati & Dal...' :
                  itemType === 'workout' ? 'e.g., Whey Protein Shake, Creatine Monohydrate, Chest Workout...' :
                  'e.g., Drink 500ml Water, 20 Min Evening Walk...'
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            {/* Time Slot & Dosage in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Scheduled Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono-code focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {itemType === 'medicine' ? 'Dose (e.g., 1 Tablet, 5ml)' :
                   itemType === 'meal' ? 'Portion (e.g., 2 Bowls, 1 Plate)' :
                   itemType === 'workout' ? 'Serving (e.g., 1 Scoop / 5g)' : 'Quantity (e.g., 500 ml)'}
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 1 Tablet / 1 Scoop / 500ml"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>

            {/* IF MEAL: Meal Type Selector */}
            {itemType === 'meal' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Which meal is this?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MEAL_TYPES.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMealType(m.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        mealType === m.id
                          ? 'border-amber-500 bg-amber-100/70 text-amber-900 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* IF MEDICINE: Before / After Food Timing Relation */}
            {itemType === 'medicine' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <Utensils className="w-3.5 h-3.5 text-teal-600" />
                  <span>When should it be taken? (Meal Relation)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FOOD_RELATIONS.map((fr) => (
                    <button
                      type="button"
                      key={fr.id}
                      onClick={() => setFoodRelation(fr.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-center ${
                        foodRelation === fr.id
                          ? 'border-teal-600 bg-teal-100/60 text-teal-950 font-bold ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{fr.label}</span>
                        {foodRelation === fr.id && <Check className="w-3.5 h-3.5 text-teal-700" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{fr.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* IF WORKOUT: Timing Context */}
            {itemType === 'workout' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Workout Timing Context
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pre-Workout', 'Post-Workout', 'Bedtime'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setMealType(t)}
                      className={`p-2 rounded-lg border text-center text-xs transition-colors cursor-pointer ${
                        mealType === t
                          ? 'border-purple-600 bg-purple-100 text-purple-900 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Dispenser Box / Slot Allocation */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-600 font-medium">Smart Dispenser Slot (Optional)</span>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setCompartment(slot)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      compartment === slot
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    #{slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Instructions or Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Take with a full glass of water, do not skip..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Add to Routine'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
