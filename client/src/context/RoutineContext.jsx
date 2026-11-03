import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchSummary, fetchMedicines, fetchRoutines, fetchTodayReminders, addMedicine, updateMedicine, deleteMedicine } from '../services/api';
import { useAuth } from './AuthContext';

const RoutineContext = createContext();

export function RoutineProvider({ children }) {
  const { currentUser } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState(null);
  const [nextReminder, setNextReminder] = useState(null);
  const [weeklyAdherence, setWeeklyAdherence] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [summaryRes, medsRes, rtnsRes, remsRes] = await Promise.all([
        fetchSummary(currentUser.id),
        fetchMedicines(currentUser.id),
        fetchRoutines(currentUser.id),
        fetchTodayReminders(currentUser.id)
      ]);

      if (summaryRes?.success) {
        setStats(summaryRes.stats);
        setNextReminder(summaryRes.nextReminder);
        setWeeklyAdherence(summaryRes.weeklyAdherence || []);
      }
      if (medsRes?.success) setMedicines(medsRes.medicines);
      if (rtnsRes?.success) setRoutines(rtnsRes.routines);
      if (remsRes?.success) setReminders(remsRes.reminders);
    } catch (err) {
      console.error('Error loading routine data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAddMedicine = async (medData) => {
    const res = await addMedicine(medData, currentUser?.id);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const handleUpdateMedicine = async (id, medData) => {
    const res = await updateMedicine(id, medData);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const handleDeleteMedicine = async (id) => {
    const res = await deleteMedicine(id);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  return (
    <RoutineContext.Provider value={{
      medicines,
      routines,
      reminders,
      stats,
      nextReminder,
      weeklyAdherence,
      loading,
      refreshData,
      handleAddMedicine,
      handleUpdateMedicine,
      handleDeleteMedicine
    }}>
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  return useContext(RoutineContext);
}
