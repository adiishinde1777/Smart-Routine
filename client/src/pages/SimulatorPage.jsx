import React from 'react';
import HardwareSimulator from '../components/HardwareSimulator';
import { useRoutine } from '../context/RoutineContext';
import { 
  Cpu, 
  Layers, 
  Radio, 
  CheckCircle2,
  Clock,
  Wifi,
  FileCode
} from 'lucide-react';

export default function SimulatorPage() {
  const { reminders } = useRoutine();
  const currentReminder = reminders.find(r => r.status === 'Upcoming' || r.status === 'Reminder Active') || reminders[0];

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-teal-600" />
            <span>ESP8266 Hardware Sync & Workbench</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synchronization testbench with NodeMCU ESP8266, 16x2 I2C LCD, Buzzer, LED, and Push Button.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span>ESP8266 Firmware v2.1 Ready</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Hardware Simulator GUI */}
      <HardwareSimulator currentReminder={currentReminder} />

      {/* ESP8266 Pinout Wiring Diagram & Circuit Specifications */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>NodeMCU ESP8266 Circuit Pinout Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your NodeMCU ESP8266 according to these exact pin assignments matching <code>firmware/esp8266_smart_routine.ino</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-code">
          
          {/* LCD & RTC Shared I2C */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 font-sans">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>16x2 LCD & DS3231 RTC</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>• SDA → <strong>D2 (GPIO 4)</strong> (Shared)</div>
              <div>• SCL → <strong>D1 (GPIO 5)</strong> (Shared)</div>
              <div>• VCC → <strong>3V3</strong> (Shared)</div>
              <div>• GND → <strong>GND</strong> (Shared)</div>
              <div className="text-[10px] text-teal-600 font-sans font-semibold pt-1">
                LCD (0x27) & RTC (0x68) on same I2C
              </div>
            </div>
          </div>

          {/* 3 LEDs for 3 Medicine Boxes */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 font-sans">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>3 LEDs (Boxes 1, 2, 3)</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>• LED 1 → <strong>D5 (GPIO 14)</strong> (Slot 1)</div>
              <div>• LED 2 → <strong>D6 (GPIO 12)</strong> (Slot 2)</div>
              <div>• LED 3 → <strong>D7 (GPIO 13)</strong> (Slot 3)</div>
              <div>• Resistors → <strong>220Ω</strong> to GND</div>
              <div className="text-[10px] text-purple-600 font-sans font-semibold pt-1">
                Multi-LED simultaneous blink
              </div>
            </div>
          </div>

          {/* Buzzer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 font-sans">
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Buzzer (Chime Alert)</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>• Positive (+) → <strong>D0 (GPIO 16)</strong></div>
              <div>• Negative (-) → <strong>GND</strong></div>
              <div className="text-[10px] text-amber-600 font-sans font-semibold pt-1">
                Beeps along with active LEDs
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Push Button (Confirm)</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>• Pin 1 → <strong>D4 (GPIO 2)</strong></div>
              <div>• Pin 2 → <strong>GND</strong></div>
              <div className="text-[10px] text-emerald-600 font-sans font-semibold pt-1">
                Acknowledge dose & stop alert
              </div>
            </div>
          </div>

        </div>

        {/* Step-by-Step Guide */}
        <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-200 text-xs text-slate-700 space-y-2 font-sans">
          <div className="font-bold text-teal-950 text-sm flex items-center space-x-1.5">
            <FileCode className="w-4 h-4 text-teal-700" />
            <span>How to Connect and Flash ESP8266 (Step-by-Step)</span>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-relaxed">
            <li>Open Arduino IDE and select <strong>NodeMCU 1.0 (ESP-12E Module)</strong> under Boards.</li>
            <li>Open <code>firmware/esp8266_smart_routine.ino</code>.</li>
            <li>Set your Wi-Fi SSID and Password on lines 29-30.</li>
            <li>Verify the backend server URL (preset to <code>http://10.99.33.207:5001</code>).</li>
            <li>Connect your NodeMCU board via USB, choose the COM port, and click <strong>Upload (➔)</strong>.</li>
            <li>Open Serial Monitor (115200 baud). Once connected, the LCD displays <strong>Smart Routine Ready</strong>!</li>
          </ol>
        </div>

      </div>

    </div>
  );
}
