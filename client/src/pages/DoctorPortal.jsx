import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDoctorPatients, addDoctorNote, addPrescription } from '../services/api';
import { 
  Stethoscope, 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Send, 
  MessageSquare,
  Activity,
  UserCheck
} from 'lucide-react';

export default function DoctorPortal() {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({
    diagnosis: 'Type 2 Diabetes Mellitus & Dyslipidemia',
    medicinesText: 'Metformin HCl 500mg ER - 1 tab twice daily after food\nAtorvastatin 10mg - 1 tab bedtime',
    lifestyleAdvice: '30 min brisk walk, maintain hydration, low glycemic index diet.'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetchDoctorPatients();
      if (res.success && res.patients) {
        setPatients(res.patients);
        if (!selectedPatient && res.patients.length > 0) {
          setSelectedPatient(res.patients[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedPatient) return;
    await addDoctorNote(selectedPatient.id, currentUser?.id || 'usr_doc_1', newNoteText);
    setNewNoteText('');
    await loadPatients();
  };

  const handleIssueRx = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const medsArray = rxForm.medicinesText.split('\n').filter(Boolean).map(line => {
      const parts = line.split('-');
      return {
        name: parts[0]?.trim() || line,
        dosage: parts[1]?.trim() || 'As directed',
        duration: '90 days'
      };
    });

    await addPrescription({
      patientId: selectedPatient.id,
      doctorId: currentUser?.id || 'usr_doc_1',
      diagnosis: rxForm.diagnosis,
      medicines: medsArray,
      lifestyleAdvice: rxForm.lifestyleAdvice
    });

    setShowRxModal(false);
    await loadPatients();
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Doctor Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}
            alt="Doctor Avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-400/40 shadow-lg"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser?.name || 'Dr. Priya Kulkarni'}</h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-400/30 uppercase">
                Verified Physician
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {currentUser?.specialty || 'Internal Medicine & Endocrinology'} • {currentUser?.hospital || 'Apollo Life Healthcare Centre'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono-code">
              MCI Reg: {currentUser?.registrationNo || 'MCI-2015-84920'} • Active Tele-monitoring
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-xs flex items-center space-x-4">
          <div>
            <div className="text-[11px] text-blue-200">Assigned Patients</div>
            <div className="text-xl font-bold font-mono-code text-white">{patients.length}</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <div className="text-[11px] text-blue-200">Unverified Alerts</div>
            <div className="text-xl font-bold font-mono-code text-rose-400">
              {patients.reduce((acc, p) => acc + (p.unverifiedAlertsCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Patient List & Patient Clinical Audit View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4 Columns: Assigned Patients List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Assigned Patients ({patients.length})</span>
              </span>
              <span className="text-[10px] text-slate-500">Consent Verified</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Patient Cards */}
            <div className="space-y-2">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const hasUnverifiedAlert = (p.unverifiedAlertsCount || 0) > 0;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                          <span className="text-[10px] font-mono-code font-bold text-teal-700">
                            {p.adherenceRate}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          ID: {p.deviceId || 'ESP32-MRB-001'} • Age {p.age || 42}
                        </div>
                        {hasUnverifiedAlert && (
                          <div className="inline-flex items-center space-x-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded mt-1 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Unverified Confirmation Flagged</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right 8 Columns: Selected Patient Audit & Prescription Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Details & Status Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{selectedPatient.name}</h3>
                      <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-bold">
                        Consent Given
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Blood Group: <strong>{selectedPatient.bloodGroup || 'B+'}</strong> • Phone: <strong>{selectedPatient.phone}</strong> • Device: <strong>{selectedPatient.deviceId}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRxModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Prescription</span>
                  </button>
                </div>

                {/* Patient Audit Numbers */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Adherence</span>
                    <div className="text-xl font-bold font-mono-code text-teal-700 mt-0.5">
                      {selectedPatient.adherenceRate}%
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Active Medicines</span>
                    <div className="text-xl font-bold font-mono-code text-slate-900 mt-0.5">
                      {selectedPatient.activeMedicinesCount || 4}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-center">
                    <span className="text-[11px] text-rose-700 uppercase font-semibold">Unverified Alerts</span>
                    <div className="text-xl font-bold font-mono-code text-rose-600 mt-0.5">
                      {selectedPatient.unverifiedAlertsCount || 0}
                    </div>
                  </div>
                </div>

                {/* Unverified Confirmation Warning Banner */}
                {selectedPatient.unverifiedAlertsCount > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 mb-4">
                    <div className="flex items-center space-x-2 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Sensor Discrepancy Detected by Verification Engine</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed pl-6">
                      Patient pressed the confirmation button, but the HX711 scale registered 0.00g delta. The medicine was not removed from the drawer. Review ingestion with patient.
                    </p>
                  </div>
                )}

                {/* Active Prescriptions Table */}
                <div className="mt-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Prescriptions On Record</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedPatient.prescriptions?.map((rx) => (
                      <div key={rx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-bold text-slate-900">{rx.diagnosis}</span>
                          <span className="text-[11px] font-mono-code text-slate-500">{rx.date}</span>
                        </div>
                        <div className="space-y-1">
                          {rx.medicines?.map((m, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                              <span className="font-medium">• {m.name}</span>
                              <span className="italic">{m.dosage}</span>
                            </div>
                          ))}
                        </div>
                        {rx.lifestyleAdvice && (
                          <div className="text-[11px] text-teal-800 bg-teal-50/80 p-2 rounded-lg border border-teal-100">
                            <strong>Lifestyle Directive:</strong> {rx.lifestyleAdvice}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Doctor Clinical Notes Module */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Clinical Audit Notes & Directives</span>
                </h4>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-4 space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add clinical observation or alert follow-up note..."
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Note</span>
                    </button>
                  </div>
                </form>

                {/* Past Notes */}
                <div className="space-y-2.5">
                  {selectedPatient.latestNote ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                        <span className="font-bold text-slate-700">Dr. Priya Kulkarni</span>
                        <span>{new Date(selectedPatient.latestNote.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{selectedPatient.latestNote.text}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes recorded yet for this patient.</p>
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Select a patient from the directory to review routines.</p>
            </div>
          )}
        </div>

      </div>

      {/* Issue Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Issue Electronic Prescription</h3>
            <p className="text-xs text-slate-500">Patient: <strong>{selectedPatient?.name}</strong></p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Diagnosis</label>
              <input
                type="text"
                value={rxForm.diagnosis}
                onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Prescribed Medicines (1 per line: Name - Dosage)</label>
              <textarea
                rows={3}
                value={rxForm.medicinesText}
                onChange={(e) => setRxForm({ ...rxForm, medicinesText: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Lifestyle Advice</label>
              <textarea
                rows={2}
                value={rxForm.lifestyleAdvice}
                onChange={(e) => setRxForm({ ...rxForm, lifestyleAdvice: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueRx}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Sign & Transmit Prescription
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
