const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { query, isMySQLConnected } = require('../config/db');
const { generateChatResponse } = require('../services/geminiService');
const { v4: uuidv4 } = require('uuid');

// Global event broadcaster via socket.io attached on app
function broadcastEvent(req, eventName, payload) {
  const io = req.app.get('io');
  if (io) {
    io.emit(eventName, payload);
  }
}

// ---------------- AUTH ROUTES (CLEAN USER AUTH - NO DOCTOR) ----------------
router.post('/auth/login', async (req, res) => {
  const { email, password, profileType } = req.body;

  // Try MySQL if connected
  if (isMySQLConnected()) {
    try {
      const rows = await query('SELECT * FROM users WHERE email = ?', [email || '']);
      if (rows && rows.length > 0) {
        const u = rows[0];
        return res.json({ success: true, user: u, token: `jwt_${u.id}_${Date.now()}` });
      }
    } catch (e) {
      console.warn('MySQL auth query failed, using store fallback:', e.message);
    }
  }

  // Fallback to store
  let user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && profileType) {
    user = store.users.find(u => u.profileType === profileType);
  }
  if (!user) {
    user = store.users[0]; // default gym / patient user
  }
  return res.json({ success: true, user, token: `jwt_${user.id}_${Date.now()}` });
});

router.post('/auth/register', async (req, res) => {
  const { name, email, profileType, phone, goal } = req.body;
  const newUserId = `usr_${Date.now()}`;
  const newUser = {
    id: newUserId,
    name: name || 'New User',
    email: email || `user_${Date.now()}@smartroutine.com`,
    role: 'user',
    profileType: profileType || 'general',
    phone: phone || '+91 99999 00000',
    goal: goal || 'Daily Routine Tracking',
    deviceId: 'ESP8266-SR-01',
    createdAt: new Date().toISOString()
  };

  if (isMySQLConnected()) {
    try {
      await query(
        'INSERT INTO users (id, name, email, role, profile_type, phone, device_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newUser.id, newUser.name, newUser.email, newUser.role, newUser.profileType, newUser.phone, newUser.deviceId]
      );
    } catch (e) {
      console.warn('MySQL insert user failed:', e.message);
    }
  }

  store.users.push(newUser);
  return res.status(201).json({ success: true, user: newUser, token: `jwt_${newUser.id}` });
});

router.get('/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  const user = store.users.find(u => u.id === userId) || store.users[0];
  return res.json({ success: true, user });
});

// Switch profile (Gym Enthusiast, Patient, General User)
router.post('/auth/switch-profile', (req, res) => {
  const { profileId } = req.body;
  const user = store.users.find(u => u.id === profileId) || store.users[0];
  return res.json({ success: true, user });
});

// ---------------- DASHBOARD SUMMARY ----------------
router.get('/dashboard/summary', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  const user = store.users.find(u => u.id === userId) || store.users[0];

  let userRoutines = store.routines.filter(r => r.userId === user.id);
  let userReminders = store.reminders.filter(r => r.userId === user.id);

  if (isMySQLConnected()) {
    try {
      const dbRoutines = await query('SELECT * FROM routines WHERE user_id = ?', [user.id]);
      if (dbRoutines && dbRoutines.length > 0) {
        userRoutines = dbRoutines.map(r => ({
          id: r.id,
          userId: r.user_id,
          itemType: r.item_type,
          name: r.name,
          timeSlot: r.time_slot,
          category: r.category,
          dosage: r.dosage,
          mealType: r.meal_type,
          foodRelation: r.food_relation,
          compartment: r.compartment,
          notes: r.notes,
          isActive: !!r.is_active
        }));
      }
    } catch (e) {
      console.warn('MySQL query error:', e.message);
    }
  }

  const total = userReminders.length > 0 ? userReminders.length : userRoutines.length;
  const completed = userReminders.filter(r => r.status === 'Completed').length;
  const missed = userReminders.filter(r => r.status === 'Missed').length;
  const upcoming = userReminders.filter(r => r.status === 'Upcoming').length;
  const active = userReminders.filter(r => r.status === 'Reminder Active').length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Find next reminder
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const nextRoutine = userRoutines.find(r => r.timeSlot >= currentTimeStr) || userRoutines[0] || null;
  const device = store.devices[0];

  return res.json({
    success: true,
    user,
    stats: {
      totalScheduled: total,
      completed,
      missed,
      upcoming,
      activeReminders: active,
      completionPercentage
    },
    nextReminder: nextRoutine ? {
      scheduledTime: nextRoutine.timeSlot,
      name: nextRoutine.name,
      itemType: nextRoutine.itemType,
      dosage: nextRoutine.dosage,
      mealType: nextRoutine.mealType,
      foodRelation: nextRoutine.foodRelation,
      compartment: nextRoutine.compartment,
      notes: nextRoutine.notes
    } : null,
    device,
    weeklyAdherence: store.adherenceHistory
  });
});

// ---------------- ROUTINES (MEDICINE, MEAL, GYM/SUPPLEMENT, OTHER) ----------------
router.get('/routines', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  let list = store.routines.filter(r => r.userId === userId);

  if (isMySQLConnected()) {
    try {
      const dbRows = await query('SELECT * FROM routines WHERE user_id = ? ORDER BY time_slot ASC', [userId]);
      if (dbRows && dbRows.length > 0) {
        list = dbRows.map(r => ({
          id: r.id,
          userId: r.user_id,
          itemType: r.item_type,
          name: r.name,
          timeSlot: r.time_slot,
          category: r.category,
          dosage: r.dosage,
          mealType: r.meal_type,
          foodRelation: r.food_relation,
          compartment: r.compartment,
          notes: r.notes,
          isActive: !!r.is_active
        }));
      }
    } catch (e) {
      console.warn('MySQL routines query error:', e.message);
    }
  }

  return res.json({ success: true, routines: list });
});

function formatTimeSlot(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return '09:00';
  const parts = timeStr.trim().split(':');
  const h = String(parseInt(parts[0], 10) || 0).padStart(2, '0');
  const m = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
  return `${h}:${m}`;
}

router.post('/routines', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  const newId = `rtn_${Date.now()}`;
  const timeSlot = formatTimeSlot(req.body.timeSlot);

  const newRoutine = {
    id: newId,
    userId,
    itemType: req.body.itemType || 'medicine', // 'medicine', 'meal', 'workout', 'other'
    name: req.body.name || 'New Routine Item',
    timeSlot,
    category: req.body.category || 'Daily Routine',
    dosage: req.body.dosage || '',
    mealType: req.body.mealType || '',
    foodRelation: req.body.foodRelation || 'None',
    compartment: Number(req.body.compartment) || 1,
    notes: req.body.notes || '',
    activeDays: req.body.activeDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isActive: true
  };

  // Save to MySQL
  if (isMySQLConnected()) {
    try {
      await query(
        `INSERT INTO routines (id, user_id, item_type, name, time_slot, category, dosage, meal_type, food_relation, compartment, notes, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newRoutine.id,
          newRoutine.userId,
          newRoutine.itemType,
          newRoutine.name,
          newRoutine.timeSlot,
          newRoutine.category,
          newRoutine.dosage,
          newRoutine.mealType,
          newRoutine.foodRelation,
          newRoutine.compartment,
          newRoutine.notes,
          newRoutine.isActive ? 1 : 0
        ]
      );
    } catch (e) {
      console.warn('MySQL routine insert error:', e.message);
    }
  }

  store.routines.push(newRoutine);

  // Also create a reminder for today
  const newReminder = {
    id: `rem_${Date.now()}`,
    userId,
    routineId: newRoutine.id,
    scheduledTime: newRoutine.timeSlot,
    scheduledDate: new Date().toISOString().split('T')[0],
    compartment: newRoutine.compartment,
    status: 'Upcoming',
    actualTime: null,
    confirmedBy: null,
    notes: newRoutine.notes || `${newRoutine.name} scheduled for ${newRoutine.timeSlot}`
  };
  store.reminders.push(newReminder);

  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_ADDED', routine: newRoutine });
  return res.status(201).json({ success: true, routine: newRoutine });
});

router.put('/routines/:id', async (req, res) => {
  const routineId = req.params.id;
  const index = store.routines.findIndex(r => r.id === routineId);
  if (index === -1) return res.status(404).json({ success: false, message: 'Routine not found' });

  const updatedTimeSlot = req.body.timeSlot ? formatTimeSlot(req.body.timeSlot) : store.routines[index].timeSlot;
  store.routines[index] = { 
    ...store.routines[index], 
    ...req.body,
    timeSlot: updatedTimeSlot
  };

  if (isMySQLConnected()) {
    try {
      const r = store.routines[index];
      await query(
        `UPDATE routines SET name = ?, time_slot = ?, category = ?, dosage = ?, meal_type = ?, food_relation = ?, compartment = ?, notes = ?
         WHERE id = ?`,
        [r.name, r.timeSlot, r.category, r.dosage, r.mealType, r.foodRelation, r.compartment, r.notes, r.id]
      );
    } catch (e) {
      console.warn('MySQL update error:', e.message);
    }
  }

  // Synchronize or reset reminders for this updated routine
  let rem = store.reminders.find(rm => rm.routineId === routineId);
  if (rem) {
    rem.scheduledTime = updatedTimeSlot;
    rem.compartment = store.routines[index].compartment;
    rem.status = 'Upcoming';
    rem.actualTime = null;
    rem.confirmedBy = null;
  } else {
    store.reminders.push({
      id: `rem_${Date.now()}`,
      userId: store.routines[index].userId,
      routineId,
      scheduledTime: updatedTimeSlot,
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: store.routines[index].compartment,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: store.routines[index].notes
    });
  }

  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_UPDATED', routine: store.routines[index] });
  return res.json({ success: true, routine: store.routines[index] });
});

router.delete('/routines/:id', async (req, res) => {
  const routineId = req.params.id;
  store.routines = store.routines.filter(r => r.id !== routineId);
  store.reminders = store.reminders.filter(r => r.routineId !== routineId);

  if (isMySQLConnected()) {
    try {
      await query('DELETE FROM routines WHERE id = ?', [routineId]);
      await query('DELETE FROM reminders WHERE routine_id = ?', [routineId]).catch(() => {});
    } catch (e) {
      console.warn('MySQL delete error:', e.message);
    }
  }

  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_DELETED', routineId });
  return res.json({ success: true, message: 'Routine item deleted' });
});

// ---------------- MEDICINES (COMPATIBILITY ADAPTER) ----------------
router.get('/medicines', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  // Map routines of type medicine or workout supplement to medicine objects
  const list = store.routines
    .filter(r => r.userId === userId && (r.itemType === 'medicine' || r.itemType === 'workout'))
    .map(r => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      genericName: r.notes || '',
      category: r.category,
      dosage: r.dosage,
      form: r.itemType === 'medicine' ? 'Tablet' : 'Supplement',
      frequency: 'Daily',
      timingSlots: [r.timeSlot],
      foodRelation: r.foodRelation,
      compartment: r.compartment,
      colorTag: r.itemType === 'workout' ? '#10B981' : '#3B82F6'
    }));
  return res.json({ success: true, medicines: list });
});

router.post('/medicines', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  const newId = `rtn_${Date.now()}`;
  const rawTime = req.body.timeSlot || (Array.isArray(req.body.timingSlots) ? req.body.timingSlots[0] : req.body.timingSlots) || '09:00';
  const timeSlot = formatTimeSlot(rawTime);

  const newRoutine = {
    id: newId,
    userId,
    itemType: req.body.itemType || 'medicine',
    name: req.body.name || 'New Routine Item',
    timeSlot,
    category: req.body.category || 'Medicine',
    dosage: req.body.dosage || '1 Tablet',
    mealType: req.body.mealType || '',
    foodRelation: req.body.foodRelation || 'After Meal',
    compartment: Number(req.body.compartment) || 1,
    notes: req.body.prescriptionNotes || req.body.notes || '',
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    isActive: true
  };

  // Save to MySQL
  if (isMySQLConnected()) {
    try {
      await query(
        `INSERT INTO routines (id, user_id, item_type, name, time_slot, category, dosage, meal_type, food_relation, compartment, notes, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newRoutine.id,
          newRoutine.userId,
          newRoutine.itemType,
          newRoutine.name,
          newRoutine.timeSlot,
          newRoutine.category,
          newRoutine.dosage,
          newRoutine.mealType,
          newRoutine.foodRelation,
          newRoutine.compartment,
          newRoutine.notes,
          1
        ]
      );
    } catch (e) {
      console.warn('MySQL routine insert error in /medicines:', e.message);
    }
  }

  store.routines.push(newRoutine);
  store.reminders.push({
    id: `rem_${Date.now()}`,
    userId,
    routineId: newRoutine.id,
    scheduledTime: newRoutine.timeSlot,
    scheduledDate: new Date().toISOString().split('T')[0],
    compartment: newRoutine.compartment,
    status: 'Upcoming',
    actualTime: null,
    confirmedBy: null,
    notes: newRoutine.notes
  });

  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_ADDED', routine: newRoutine });
  return res.status(201).json({ success: true, medicine: newRoutine, routine: newRoutine });
});

router.put('/medicines/:id', async (req, res) => {
  const routineId = req.params.id;
  const index = store.routines.findIndex(r => r.id === routineId);
  const rawTime = req.body.timeSlot || (Array.isArray(req.body.timingSlots) ? req.body.timingSlots[0] : req.body.timingSlots);
  const timeSlot = rawTime ? formatTimeSlot(rawTime) : (index !== -1 ? store.routines[index].timeSlot : '09:00');

  const updatedData = {
    name: req.body.name,
    timeSlot,
    category: req.body.category,
    dosage: req.body.dosage,
    mealType: req.body.mealType,
    foodRelation: req.body.foodRelation,
    compartment: Number(req.body.compartment) || 1,
    notes: req.body.prescriptionNotes || req.body.notes || ''
  };

  if (index !== -1) {
    store.routines[index] = { ...store.routines[index], ...updatedData };
  } else {
    store.routines.push({
      id: routineId,
      userId: req.headers['x-user-id'] || 'usr_patient_1',
      itemType: req.body.itemType || 'medicine',
      ...updatedData,
      isActive: true
    });
  }

  // Update MySQL
  if (isMySQLConnected()) {
    try {
      await query(
        `UPDATE routines SET name = ?, time_slot = ?, category = ?, dosage = ?, meal_type = ?, food_relation = ?, compartment = ?, notes = ?
         WHERE id = ?`,
        [updatedData.name, updatedData.timeSlot, updatedData.category, updatedData.dosage, updatedData.mealType, updatedData.foodRelation, updatedData.compartment, updatedData.notes, routineId]
      );
    } catch (e) {
      console.warn('MySQL update error in /medicines/:id:', e.message);
    }
  }

  // Synchronize and reset reminder status to Upcoming
  let rem = store.reminders.find(rm => rm.routineId === routineId);
  if (rem) {
    rem.scheduledTime = updatedData.timeSlot;
    rem.compartment = updatedData.compartment;
    rem.status = 'Upcoming';
    rem.actualTime = null;
    rem.confirmedBy = null;
  } else {
    store.reminders.push({
      id: `rem_${Date.now()}`,
      userId: req.headers['x-user-id'] || 'usr_patient_1',
      routineId,
      scheduledTime: updatedData.timeSlot,
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: updatedData.compartment,
      status: 'Upcoming',
      actualTime: null,
      confirmedBy: null,
      notes: updatedData.notes
    });
  }

  const updatedItem = store.routines.find(r => r.id === routineId) || updatedData;
  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_UPDATED', routine: updatedItem });
  return res.json({ success: true, medicine: updatedItem, routine: updatedItem });
});

router.delete('/medicines/:id', async (req, res) => {
  const routineId = req.params.id;
  store.routines = store.routines.filter(r => r.id !== routineId);
  store.reminders = store.reminders.filter(r => r.routineId !== routineId);

  if (isMySQLConnected()) {
    try {
      await query('DELETE FROM routines WHERE id = ?', [routineId]);
      await query('DELETE FROM reminders WHERE routine_id = ?', [routineId]).catch(() => {});
    } catch (e) {
      console.warn('MySQL delete error in /medicines/:id:', e.message);
    }
  }

  broadcastEvent(req, 'DATA_UPDATED', { type: 'ROUTINE_DELETED', routineId });
  return res.json({ success: true, message: 'Routine item deleted' });
});

// ---------------- TODAY'S REMINDERS ----------------
router.get('/reminders/today', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_patient_1';

  // Sync reminders with routines if empty
  const userRoutines = store.routines.filter(r => r.userId === userId);
  let list = store.reminders.filter(r => r.userId === userId);

  if (list.length === 0 && userRoutines.length > 0) {
    list = userRoutines.map(r => ({
      id: `rem_${r.id}`,
      userId: r.userId,
      routineId: r.id,
      scheduledTime: r.timeSlot,
      scheduledDate: new Date().toISOString().split('T')[0],
      compartment: r.compartment,
      status: 'Upcoming',
      notes: r.notes
    }));
    store.reminders.push(...list);
  }

  const enriched = list.map(rem => {
    const routine = userRoutines.find(r => r.id === rem.routineId) || {};
    return {
      ...rem,
      routine,
      medicine: {
        id: routine.id,
        name: routine.name,
        category: routine.category,
        dosage: routine.dosage,
        mealType: routine.mealType,
        foodRelation: routine.foodRelation,
        compartment: routine.compartment,
        notes: routine.notes
      }
    };
  });

  return res.json({ success: true, reminders: enriched });
});

router.post('/reminders/:id/confirm', (req, res) => {
  const rem = store.reminders.find(r => r.id === req.params.id);
  if (!rem) return res.status(404).json({ success: false, message: 'Reminder not found' });

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  rem.status = 'Completed';
  rem.actualTime = timeStr;
  rem.confirmedBy = req.body.confirmedBy || 'web';
  rem.notes = 'Confirmed and completed on time';

  broadcastEvent(req, 'DATA_UPDATED', { type: 'REMINDER_CONFIRMED', reminder: rem });
  return res.json({ success: true, reminder: rem });
});

// ---------------- ESP8266 DEDICATED HARDWARE ENDPOINTS ----------------
let manualTestActiveUntil = 0;

// Test trigger endpoint to test Buzzer and LED at any second
router.post('/esp8266/trigger-test', (req, res) => {
  manualTestActiveUntil = Date.now() + 15000; // 15 seconds test window
  console.log('⚡ [ESP8266] Manual hardware test alert triggered for 15 seconds!');
  return res.json({ success: true, message: 'Hardware Buzzer & LED test triggered for 15 seconds' });
});

// 1. ESP8266 Poll/Check Endpoint: GET /api/esp8266/check
// Returns active routine alert if current time matches scheduled routine, or returns next routine
router.get('/esp8266/check', async (req, res) => {
  const deviceId = req.query.deviceId || 'ESP8266-SR-01';

  // 1. Check for manual test trigger
  if (Date.now() < manualTestActiveUntil) {
    return res.json({
      active: true,
      reminderId: 'test_alert',
      routineName: 'TEST ALARM',
      itemType: 'test',
      time: 'NOW',
      foodRelation: 'Testing Hardware',
      compartment: 1,
      buzzer: true,
      led: true,
      lcdLine1: 'TESTING ALARM',
      lcdLine2: 'Buzzer & LED ON!'
    });
  }

  // 2. Local time calculation
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const todayStr = now.toISOString().split('T')[0];

  // 3. Load all active routines (combine MySQL routines + store.routines)
  let allRoutines = [];
  if (isMySQLConnected()) {
    try {
      const dbRows = await query('SELECT * FROM routines WHERE is_active = 1');
      if (dbRows && dbRows.length > 0) {
        dbRows.forEach(r => {
          allRoutines.push({
            id: r.id,
            userId: r.user_id,
            itemType: r.item_type,
            name: r.name,
            timeSlot: formatTimeSlot(r.time_slot),
            category: r.category,
            dosage: r.dosage,
            mealType: r.meal_type,
            foodRelation: r.food_relation,
            compartment: r.compartment,
            notes: r.notes,
            isActive: true
          });
        });
      }
    } catch (e) {
      console.warn('MySQL routines query error in esp8266 check:', e.message);
    }
  }

  // Add any routines from store.routines that aren't already loaded
  store.routines.forEach(r => {
    if (r.isActive && !allRoutines.some(rt => rt.id === r.id)) {
      allRoutines.push({
        ...r,
        timeSlot: formatTimeSlot(r.timeSlot)
      });
    }
  });

  // 4. Find triggered routine within active reminder window (diff >= 0 && diff <= 30 mins)
  let triggeredRoutine = null;

  for (const r of allRoutines) {
    if (!r.timeSlot || !r.timeSlot.includes(':')) continue;

    const parts = r.timeSlot.split(':');
    const rH = parseInt(parts[0], 10);
    const rM = parseInt(parts[1], 10);
    if (isNaN(rH) || isNaN(rM)) continue;

    const routineMinutes = rH * 60 + rM;
    let diff = currentTotalMinutes - routineMinutes;
    // Handle midnight wrap-around (e.g., scheduled at 23:55, current time 00:05)
    if (diff < -720) diff += 1440;

    // Check if THIS SPECIFIC routine was already confirmed/completed today for this exact time
    const completedReminder = store.reminders.find(rem => 
      rem.routineId === r.id && 
      rem.status === 'Completed' && 
      rem.scheduledDate === todayStr &&
      rem.scheduledTime === r.timeSlot
    );

    if (completedReminder) {
      continue; // Routine was already taken / confirmed today!
    }

    // Trigger alert if current time has reached routine time and is within 30 minutes
    if (diff >= 0 && diff <= 30) {
      triggeredRoutine = r;
      break;
    }
  }

  if (triggeredRoutine) {
    // Find or create reminder in store
    let activeRem = store.reminders.find(rem => rem.routineId === triggeredRoutine.id && rem.scheduledDate === todayStr);
    if (!activeRem) {
      activeRem = {
        id: `rem_${triggeredRoutine.id}`,
        userId: triggeredRoutine.userId,
        routineId: triggeredRoutine.id,
        scheduledTime: triggeredRoutine.timeSlot,
        scheduledDate: todayStr,
        compartment: triggeredRoutine.compartment || 1,
        status: 'Upcoming',
        actualTime: null,
        confirmedBy: null,
        notes: triggeredRoutine.notes
      };
      store.reminders.push(activeRem);
    }

    // Return active = true so buzzer sounds and LED lights up!
    return res.json({
      active: true,
      reminderId: activeRem.id,
      routineId: triggeredRoutine.id,
      routineName: triggeredRoutine.name || 'Routine Item',
      itemType: triggeredRoutine.itemType || 'medicine',
      time: triggeredRoutine.timeSlot,
      foodRelation: triggeredRoutine.foodRelation || '',
      compartment: triggeredRoutine.compartment || 1,
      buzzer: true,
      led: true,
      lcdLine1: (triggeredRoutine.name || 'Routine Alert').substring(0, 16),
      lcdLine2: `${triggeredRoutine.timeSlot} ${triggeredRoutine.foodRelation || 'Take Now!'}`.substring(0, 16)
    });
  }

  // If no routine currently active, find upcoming routine
  const upcomingRoutines = allRoutines
    .filter(r => {
      if (!r.timeSlot || !r.timeSlot.includes(':')) return false;
      const [rH, rM] = r.timeSlot.split(':').map(Number);
      return (rH * 60 + rM) > currentTotalMinutes;
    })
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const nextRtn = upcomingRoutines[0] || null;

  return res.json({
    active: false,
    currentTime,
    buzzer: false,
    led: false,
    lcdLine1: 'Smart Routine',
    lcdLine2: nextRtn ? `${nextRtn.timeSlot} ${nextRtn.name}`.substring(0, 16) : `Time: ${currentTime}`
  });
});

// 2. ESP8266 Push Button Confirmation: POST /api/esp8266/confirm
router.post('/esp8266/confirm', (req, res) => {
  const { deviceId, reminderId, routineId, compartment } = req.body;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let targetReminder = null;
  if (reminderId) {
    targetReminder = store.reminders.find(r => r.id === reminderId || r.routineId === reminderId);
  } else if (routineId) {
    targetReminder = store.reminders.find(r => r.routineId === routineId);
  } else if (compartment) {
    targetReminder = store.reminders.find(r => r.compartment === Number(compartment) && r.status !== 'Completed');
  } else {
    // Find first active or upcoming reminder
    targetReminder = store.reminders.find(r => r.status === 'Reminder Active') || store.reminders.find(r => r.status === 'Upcoming');
  }

  if (targetReminder) {
    targetReminder.status = 'Completed';
    targetReminder.actualTime = timeStr;
    targetReminder.confirmedBy = 'esp8266_button';
    targetReminder.notes = 'Confirmed via ESP8266 push button';

    // Log to MySQL device_logs if connected
    if (isMySQLConnected()) {
      query('INSERT INTO device_logs (device_id, action, details) VALUES (?, ?, ?)', [
        deviceId || 'ESP8266-SR-01',
        'BUTTON_CONFIRM',
        `Reminder ${targetReminder.id} confirmed at ${timeStr}`
      ]).catch(() => { });
    }

    broadcastEvent(req, 'DATA_UPDATED', {
      type: 'ESP8266_CONFIRMED',
      reminder: targetReminder,
      deviceId: deviceId || 'ESP8266-SR-01'
    });

    return res.json({
      success: true,
      message: 'Dose / Routine confirmed successfully via ESP8266 push button!',
      confirmedReminderId: targetReminder.id,
      time: timeStr
    });
  }

  return res.json({
    success: true,
    message: 'Button pressed acknowledged, no active reminder pending',
    time: timeStr
  });
});

// 3. ESP8266 Heartbeat
router.post('/esp8266/heartbeat', (req, res) => {
  const { deviceId, ipAddress, wifiSSID, status } = req.body;
  const dev = store.devices[0];
  if (dev) {
    dev.lastHeartbeat = new Date().toISOString();
    if (ipAddress) dev.ipAddress = ipAddress;
    if (wifiSSID) dev.wifiSSID = wifiSSID;
    dev.status = 'online';
  }
  return res.json({ success: true, timestamp: new Date().toISOString() });
});

// ---------------- DEVICES ----------------
router.get('/devices', (req, res) => {
  return res.json({ success: true, devices: store.devices });
});

router.post('/devices/:id/sync', (req, res) => {
  const device = store.devices.find(d => d.id === req.params.id) || store.devices[0];
  device.lastHeartbeat = new Date().toISOString();
  device.status = 'online';

  const userRoutines = store.routines.filter(r => r.userId === device.userId);
  broadcastEvent(req, 'DEVICE_SYNCED', { deviceId: device.id, routinesCount: userRoutines.length });

  return res.json({
    success: true,
    message: 'ESP8266 Device synced with Smart Routine schedules',
    syncedRoutines: userRoutines.length
  });
});

// ---------------- AI ASSISTANT (GEMINI ROUTINE HELPER) ----------------
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  const userId = req.headers['x-user-id'] || 'usr_patient_1';
  const user = store.users.find(u => u.id === userId) || store.users[0];
  const userRoutines = store.routines.filter(r => r.userId === user.id);

  try {
    const reply = await generateChatResponse(message, history || [], {
      userName: user.name,
      profileType: user.profileType,
      goal: user.goal,
      routines: userRoutines
    });
    return res.json({ success: true, reply });
  } catch (err) {
    return res.json({
      success: true,
      reply: `Hello! I am your Smart Routine AI assistant. You can ask me anything about workout nutrition, protein supplements, meal timings, or medicine schedules (e.g., Before/After meals).`
    });
  }
});

module.exports = router;
