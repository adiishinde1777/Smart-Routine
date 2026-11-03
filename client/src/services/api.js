/**
 * MediRoutine AI - API Client
 */

const API_BASE = '/api';

export async function fetchSummary(userId) {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: { 'x-user-id': userId || 'usr_patient_1' }
  });
  return res.json();
}

export async function fetchMedicines(userId) {
  const res = await fetch(`${API_BASE}/medicines`, {
    headers: { 'x-user-id': userId || 'usr_patient_1' }
  });
  return res.json();
}

export async function addMedicine(medicineData, userId) {
  const res = await fetch(`${API_BASE}/medicines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId || 'usr_patient_1'
    },
    body: JSON.stringify(medicineData)
  });
  return res.json();
}

export async function updateMedicine(id, medicineData) {
  const res = await fetch(`${API_BASE}/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicineData)
  });
  return res.json();
}

export async function deleteMedicine(id) {
  const res = await fetch(`${API_BASE}/medicines/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchRoutines(userId) {
  const res = await fetch(`${API_BASE}/routines`, {
    headers: { 'x-user-id': userId || 'usr_patient_1' }
  });
  return res.json();
}

export async function fetchTodayReminders(userId) {
  const res = await fetch(`${API_BASE}/reminders/today`, {
    headers: { 'x-user-id': userId || 'usr_patient_1' }
  });
  return res.json();
}

export async function fetchDevices() {
  const res = await fetch(`${API_BASE}/devices`);
  return res.json();
}

export async function syncDeviceSchedule(deviceId) {
  const res = await fetch(`${API_BASE}/devices/${deviceId}/sync`, {
    method: 'POST'
  });
  return res.json();
}

export async function sendSimulationEvent(eventType, reminderId, deviceId, payload = {}) {
  const res = await fetch(`${API_BASE}/simulation/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, reminderId, deviceId, payload })
  });
  return res.json();
}

export async function fetchDoctorPatients() {
  const res = await fetch(`${API_BASE}/doctor/patients`);
  return res.json();
}

export async function addDoctorNote(patientId, doctorId, text) {
  const res = await fetch(`${API_BASE}/doctor/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, doctorId, text })
  });
  return res.json();
}

export async function addPrescription(data) {
  const res = await fetch(`${API_BASE}/doctor/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchAdminMetrics() {
  const res = await fetch(`${API_BASE}/admin/metrics`);
  return res.json();
}

export async function assignDevice(deviceId, userId) {
  const res = await fetch(`${API_BASE}/admin/devices/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, userId })
  });
  return res.json();
}

export async function sendChatMessage(message, history, userId) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId || 'usr_patient_1'
    },
    body: JSON.stringify({ message, history })
  });
  return res.json();
}
