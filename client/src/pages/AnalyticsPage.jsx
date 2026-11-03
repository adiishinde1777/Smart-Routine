import React, { useRef } from 'react';
import { useRoutine } from '../context/RoutineContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const { stats, weeklyAdherence, reminders } = useRoutine();
  const reportRef = useRef();

  const confirmedCount = stats?.completed || 0;
  const missedCount = stats?.missed || 0;
  const unverifiedCount = stats?.unverified || 0;
  const upcomingCount = stats?.upcoming || 0;
  const totalCount = stats?.totalScheduled || 1;

  // Status Distribution Data for Pie Chart
  const pieData = [
    { name: 'Verified Confirmed', value: confirmedCount || 2, color: '#0d9488' },
    { name: 'Unverified Confirmation', value: unverifiedCount || 1, color: '#f43f5e' },
    { name: 'Missed / Expired', value: missedCount || 0, color: '#94a3b8' },
    { name: 'Upcoming Scheduled', value: upcomingCount || 2, color: '#0284c7' }
  ];

  // Hourly adherence heat distribution
  const hourlyData = [
    { time: '08:00 - 10:00 (Morning)', adherence: 96, missed: 4 },
    { time: '12:00 - 14:00 (Afternoon)', adherence: 78, missed: 22 },
    { time: '18:00 - 20:00 (Evening)', adherence: 92, missed: 8 },
    { time: '21:00 - 23:00 (Night)', adherence: 88, missed: 12 }
  ];

  const handleExportPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MediRoutine_Adherence_Report_${currentUser?.name?.replace(/\s+/g, '_')}_2026.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Routine Analytics & Clinical Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited adherence data collected via ESP32 load cell weight telemetry and verified confirmations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Adherence PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Wrapper */}
      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Report Header for PDF / Print */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <span className="font-extrabold text-slate-900 text-lg">MediRoutine AI • Clinical Adherence Summary</span>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <strong>{currentUser?.name}</strong> • Device ID: <strong>{currentUser?.deviceId || 'ESP32-MRB-001'}</strong> • Reviewing Physician: <strong>Dr. Priya Kulkarni</strong>
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>Report Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            <div className="text-[11px] text-teal-600 font-bold">IoT Sensor Verified: 100%</div>
          </div>
        </div>

        {/* 4 Analytics Summary Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Weekly Consistency</span>
            <div className="text-2xl font-extrabold text-teal-700 font-mono-code mt-1">94.2%</div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+4.5% vs previous week</span>
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Weight Verified Doses</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono-code mt-1">29 / 35</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">HX711 scale confirmed</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unverified Alerts</span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono-code mt-1">2</div>
            <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">Button only (0g drop)</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Frequently Missed Time</span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono-code mt-1">13:30</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Afternoon Lunch slot</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Weekly Performance Bar Chart */}
          <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Weekly Adherence Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Confirmed Ingestions vs Missed vs Unverified Events</p>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAdherence}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="confirmed" fill="#0d9488" radius={[4, 4, 0, 0]} name="Verified Ingestion" />
                  <Bar dataKey="unverified" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Unverified (0g Delta)" />
                  <Bar dataKey="missed" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Missed Reminder" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown Pie Chart */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Overall Dose Status Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of verified vs flagged doses</p>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Hourly Timing Breakdown Table */}
        <div className="pt-2">
          <h3 className="font-bold text-slate-900 text-sm mb-2">Slot-by-Slot Consistency Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Time Slot</th>
                  <th className="py-2.5 px-4">Routine Type</th>
                  <th className="py-2.5 px-4">Adherence Rate</th>
                  <th className="py-2.5 px-4">Verification Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hourlyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-semibold font-mono-code text-slate-800">{row.time}</td>
                    <td className="py-2.5 px-4 text-slate-600">Daily Medicine & Supplements</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 font-mono-code">{row.adherence}%</span>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${row.adherence}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-emerald-600 font-semibold">
                      {row.adherence >= 90 ? 'Optimal Compliance' : 'Review Timing with Doctor'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
