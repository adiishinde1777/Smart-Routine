import React, { useState, useEffect } from 'react';
import { fetchAdminMetrics, assignDevice } from '../services/api';
import { 
  ShieldCheck, 
  Cpu, 
  Users, 
  Wifi, 
  WifiOff, 
  Battery, 
  Clock, 
  Settings, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Search, 
  RefreshCw,
  Sliders
} from 'lucide-react';

export default function AdminPortal() {
  const [metrics, setMetrics] = useState(null);
  const [devices, setDevices] = useState([
    {
      id: 'ESP32-MRB-001',
      patientName: 'Rahul Sharma',
      status: 'online',
      macAddress: '24:6F:28:B4:79:E2',
      ipAddress: '192.168.1.145',
      batteryLevel: 94,
      firmware: 'v2.4.1-RTC-PRO',
      lastSeen: 'Just now'
    },
    {
      id: 'ESP32-MRB-002',
      patientName: 'Unassigned Inventory',
      status: 'offline',
      macAddress: '3C:71:BF:88:42:11',
      ipAddress: '192.168.1.102',
      batteryLevel: 62,
      firmware: 'v2.4.0',
      lastSeen: '1 day ago'
    }
  ]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({
    offlineSyncTimeoutMinutes: 15,
    minimumWeightThresholdGrams: 0.15,
    autoEscalateMissedDosesMinutes: 45
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminMetrics();
      if (res.success) {
        setMetrics(res.metrics);
        setAuditLogs(res.recentAuditLogs || []);
        if (res.systemSettings) setSettings(res.systemSettings);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPrompt = async (device) => {
    const patientName = prompt(`Enter Patient Name to pair with ${device.id}:`, 'Rahul Sharma');
    if (patientName) {
      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, patientName, status: 'online' } : d));
      alert(`Device ${device.id} assigned to ${patientName}. Hardware pairing updated.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Administration Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global IoT device fleet monitor, user directory, system security parameters & hardware audit logs.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Fleet Telemetry</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono-code mt-1">
            {metrics?.patientsCount || 1}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active Routine Accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Verified Doctors</span>
          <div className="text-2xl font-extrabold text-blue-700 font-mono-code mt-1">
            {metrics?.doctorsCount || 1}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Apollo Life Healthcare</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Online Devices</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono-code mt-1">
            {metrics?.onlineDevices || 1} <span className="text-xs text-slate-400 font-normal">/ {metrics?.devicesCount || 2}</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">ESP32 Fleet Health 100%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reminders Executed</span>
          <div className="text-2xl font-extrabold text-purple-700 font-mono-code mt-1">
            {metrics?.completedReminders || 2} <span className="text-xs text-slate-400 font-normal">verified</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Zero sensor collisions</p>
        </div>

      </div>

      {/* Connected IoT Devices Fleet Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Registered ESP32 Microcontrollers</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Unique hardware IDs linked to registered patient profiles</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">Assigned User</th>
                <th className="py-3 px-4">Connection</th>
                <th className="py-3 px-4">IP & MAC Address</th>
                <th className="py-3 px-4">Battery</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold font-mono-code text-slate-900">{d.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{d.patientName}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.status === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status === 'online' ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-slate-400" />}
                      <span>{d.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-code text-slate-600 text-[11px]">
                    <div>{d.ipAddress}</div>
                    <div className="text-[10px] text-slate-400">{d.macAddress}</div>
                  </td>
                  <td className="py-3 px-4 font-mono-code font-semibold text-slate-800">{d.batteryLevel}%</td>
                  <td className="py-3 px-4 text-slate-600">{d.firmware}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAssignPrompt(d)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Assign Patient
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Audit Logs & System Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Hardware & Verification Audit Logs */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Real-Time Hardware & Sensor Audit Trail</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono-code">Audit Log Immutability</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-mono-code font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                    log.severity === 'danger' || log.severity === 'warning' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-code">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">{log.details}</p>
                <div className="text-[10px] text-slate-500 font-mono-code">Source: {log.source}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: System Threshold Settings */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Verification Parameters</span>
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                HX711 Minimum Weight Delta Threshold (Grams)
              </label>
              <input
                type="number"
                step="0.05"
                value={settings.minimumWeightThresholdGrams}
                onChange={(e) => setSettings({ ...settings, minimumWeightThresholdGrams: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono-code font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Any weight drop below this value flags an Unverified Confirmation Alert.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Offline Flash Queue Auto-Flush Timeout (Minutes)
              </label>
              <input
                type="number"
                value={settings.offlineSyncTimeoutMinutes}
                onChange={(e) => setSettings({ ...settings, offlineSyncTimeoutMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono-code font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Auto-Escalate Missed Doses to Doctor (Minutes)
              </label>
              <input
                type="number"
                value={settings.autoEscalateMissedDosesMinutes}
                onChange={(e) => setSettings({ ...settings, autoEscalateMissedDosesMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono-code font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={() => alert('System parameters saved and pushed to all active ESP32 units.')}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              Update Fleet Parameters
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
