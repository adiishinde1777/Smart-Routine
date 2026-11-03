import React, { useState } from 'react';
import { useRoutine } from '../context/RoutineContext';
import MedicineModal from '../components/MedicineModal';
import {
  Pill,
  Plus,
  Search,
  Utensils,
  Dumbbell,
  Edit3,
  Trash2,
  Clock,
  Info 
} from 'lucide-react';

export default function MedicinesPage() {
  const { routines, medicines, handleAddMedicine, handleUpdateMedicine, handleDeleteMedicine } = useRoutine();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = ['All', 'Medicines', 'Meals & Diet', 'Gym & Supplements'];

  // Combine routines
  const items = routines && routines.length > 0 ? routines : medicines;

  const filteredItems = items.filter(m => {
    const isMeal = m.itemType === 'meal' || m.category?.toLowerCase().includes('meal');
    const isWorkout = m.itemType === 'workout' || m.category?.toLowerCase().includes('gym') || m.category?.toLowerCase().includes('fitness');
    const isMed = !isMeal && !isWorkout;

    const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes || m.genericName || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'Medicines') matchesCategory = isMed;
    if (selectedCategory === 'Meals & Diet') matchesCategory = isMeal;
    if (selectedCategory === 'Gym & Supplements') matchesCategory = isWorkout;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (data) => {
    if (editingItem) {
      await handleUpdateMedicine(editingItem.id, data);
    } else {
      await handleAddMedicine(data);
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Medicines, Diet & Supplement Cabinet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily medicines, diet items, protein supplements, and timing preferences.
          </p>
        </div>

        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, composition or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isMeal = item.itemType === 'meal' || item.category?.toLowerCase().includes('meal');
          const isWorkout = item.itemType === 'workout' || item.category?.toLowerCase().includes('gym') || item.category?.toLowerCase().includes('fitness');

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isMeal ? 'bg-amber-100 text-amber-700' :
                      isWorkout ? 'bg-purple-100 text-purple-700' :
                        'bg-teal-100 text-teal-700'
                      }`}>
                      {isMeal ? <Utensils className="w-4 h-4" /> :
                        isWorkout ? <Dumbbell className="w-4 h-4" /> :
                          <Pill className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                    </div>
                  </div>

                  <span className="font-mono-code font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-lg">
                    {item.timeSlot || item.timingSlots?.[0] || '08:30'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  {item.dosage && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Portion / Dose:</span>
                      <span className="font-bold text-slate-800">{item.dosage}</span>
                    </div>
                  )}

                  {item.foodRelation && item.foodRelation !== 'None' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Meal Timing:</span>
                      <span className="font-bold text-teal-700">{item.foodRelation}</span>
                    </div>
                  )}

                  {item.mealType && item.mealType !== 'None' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Meal Category:</span>
                      <span className="font-bold text-amber-800">{item.mealType}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic">
                      "{item.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(item)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteMedicine(item.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No items found</p>
          <p className="text-xs text-slate-500 mt-1">Click the button above to add medicines or diet items</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <MedicineModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
      />

    </div>
  );
}
