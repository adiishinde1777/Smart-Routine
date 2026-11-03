import React, { useState } from 'react';
import { useDevice } from '../context/DeviceContext';
import { 
  Cpu, 
  Radio, 
  Scale, 
  RotateCw, 
  DoorClosed, 
  DoorOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Zap, 
  Clock, 
  Wifi, 
  WifiOff, 
  Layers, 
  Terminal,
  Activity
} from 'lucide-react';

export default function HardwareSimulator({ onClose, currentReminder }) {
  const { device, handleSimulate, soundEnabled, setSoundEnabled } = useDevice();
  const [activeStep, setActiveStep] = useState(1);
  const [serialLogs, setSerialLogs] = useState([
    `[00:00:01] ESP8266-SR-01 Booted. Wi-Fi: Connected. I2C LCD 0x27: OK.`,
    `[00:00:02] Smart Routine Schedules Synced with Server.`,
    `[00:00:03] Push Button (D3) & Buzzer (D5) Armed. Standby.`
  ]);

  const addSerialLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setSerialLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 15)]);
  };

  const runStep = async (stepNumber, eventType, payload = {}) => {
    setActiveStep(stepNumber);
    addSerialLog(`Executing Event: ${eventType} (Step ${stepNumber}/7)`);
    await handleSimulate(eventType, currentReminder?.id, payload);
  };

  const isBuzzerOn = device.buzzerActive;
  const isBlueLedOn = device.ledStatus === 'alert_blue';
  const isGreenLedOn = device.ledStatus === 'idle_green';
  const isRedLedOn = device.ledStatus === 'warning_red';

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 overflow-hidden">
      
      {/* Hardware Header & Enclosure Screws */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono-code font-bold text-white text-base tracking-wide">ESP8266 Hardware Workbench</span>
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono-code">ID: {device.id} • FW: {device.firmwareVersion} • RTC DS3231 Active</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs font-mono-code flex items-center space-x-1.5 transition-colors cursor-pointer ${
              soundEnabled ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Beep ON' : 'Muted'}</span>
          </button>

          <button
            onClick={() => {
              handleSimulate('RESET_DEVICE');
              addSerialLog('Device state reset to idle baseline.');
              setActiveStep(1);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-code flex items-center space-x-1 transition-colors cursor-pointer"
            title="Reset ESP32 Hardware State"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-sm px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Hardware Board Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        
        {/* Left Column: 16x2 LCD, LEDs, Actuators */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 16x2 Character LCD Display (Authentic Retro Green Backlight) */}
          <div className="bg-emerald-950/80 p-4 rounded-xl border-4 border-emerald-900 shadow-inner relative font-mono-code select-none">
            <div className="absolute top-2 right-3 text-[10px] text-emerald-500/60 uppercase tracking-widest font-bold">
              HD44780 16x2 I2C 0x27
            </div>
            <div className="space-y-1 py-1">
              <div className="text-emerald-400 text-lg md:text-xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] h-7">
                {device.lcdLine1.padEnd(16, ' ')}
              </div>
              <div className="text-emerald-400 text-lg md:text-xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] h-7">
                {device.lcdLine2.padEnd(16, ' ')}
              </div>
            </div>
          </div>

          {/* LED Indicators & Buzzer Dashboard */}
          <div className="grid grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono-code text-xs">
            {/* Green LED */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-7 h-7 rounded-full border-2 transition-all ${
                isGreenLedOn 
                  ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_15px_rgba(52,211,153,1)] scale-110' 
                  : 'bg-emerald-950 border-emerald-900 opacity-40'
              }`} />
              <span className="text-[11px] text-slate-300 font-semibold">Green (OK)</span>
            </div>

            {/* Blue LED */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-7 h-7 rounded-full border-2 transition-all ${
                isBlueLedOn 
                  ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_18px_rgba(34,211,238,1)] animate-ping scale-110' 
                  : 'bg-cyan-950 border-cyan-900 opacity-40'
              }`} />
              <span className="text-[11px] text-slate-300 font-semibold">Blue (Alert)</span>
            </div>

            {/* Red LED */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-7 h-7 rounded-full border-2 transition-all ${
                isRedLedOn 
                  ? 'bg-rose-500 border-rose-200 shadow-[0_0_18px_rgba(244,63,94,1)] scale-110' 
                  : 'bg-rose-950 border-rose-900 opacity-40'
              }`} />
              <span className="text-[11px] text-slate-300 font-semibold">Red (Warn)</span>
            </div>

            {/* Active Buzzer */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                isBuzzerOn 
                  ? 'bg-amber-400 border-amber-200 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,1)] animate-bounce' 
                  : 'bg-amber-950 border-amber-900 text-amber-800 opacity-40'
              }`}>
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-300 font-semibold">Buzzer 2kHz</span>
            </div>
          </div>

          {/* SG90 Servo & Reed Switch Visual State */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* SG90 Servo Compartment Lock */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-slate-400 flex items-center space-x-1">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SG90 Servo (PWM Pin 18)</span>
                </span>
                <span className="text-xs font-mono-code font-bold text-cyan-400">{device.activeCompartmentServoAngle}°</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative w-14 h-14 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center">
                  <div 
                    className="w-1 h-6 bg-cyan-400 rounded-full origin-bottom transition-transform duration-500 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                    style={{ transform: `rotate(${device.activeCompartmentServoAngle}deg)` }}
                  />
                  <div className="absolute w-3 h-3 bg-slate-300 rounded-full border border-slate-900" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white">
                    {device.activeCompartmentServoAngle === 90 ? 'Compartment UNLOCKED' : 'Compartment LOCKED'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {device.activeCompartmentServoAngle === 90 ? 'Servo rotated 90° for access' : 'Servo engaged at 0°'}
                  </div>
                </div>
              </div>
            </div>

            {/* Magnetic Reed Switch */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-slate-400 flex items-center space-x-1">
                  {device.reedSwitchState === 'open' ? (
                    <DoorOpen className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Reed Switch (Pin 19)</span>
                </span>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  device.reedSwitchState === 'open' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {device.reedSwitchState}
                </span>
              </div>
              <button
                onClick={() => runStep(3, device.reedSwitchState === 'open' ? 'RESET_DEVICE' : 'OPEN_COMPARTMENT')}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer ${
                  device.reedSwitchState === 'open'
                    ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 hover:bg-teal-600/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {device.reedSwitchState === 'open' ? 'Simulate Drawer Closed' : 'Pull Open Drawer'}
              </button>
            </div>

          </div>

          {/* HX711 Load Cell Scale Readout & Push Button */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* HX711 Load Cell */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-slate-400 flex items-center space-x-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HX711 Scale (24-bit ADC)</span>
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-mono-code font-extrabold text-white">
                  {device.currentScaleWeightGrams.toFixed(2)}
                </span>
                <span className="text-xs font-mono-code text-slate-400">grams</span>
              </div>
              <div className="mt-2 flex space-x-1">
                <button
                  onClick={() => runStep(4, 'REMOVE_MEDICINE', { weightDropGrams: 0.65 })}
                  className="flex-1 text-[10px] font-mono-code bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 py-1 px-1.5 rounded border border-emerald-500/30 transition-colors cursor-pointer"
                  title="Simulate removing 1 Metformin tablet (0.65g)"
                >
                  -0.65g (Metformin)
                </button>
                <button
                  onClick={() => runStep(4, 'REMOVE_MEDICINE', { weightDropGrams: 1.40 })}
                  className="flex-1 text-[10px] font-mono-code bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 py-1 px-1.5 rounded border border-amber-500/30 transition-colors cursor-pointer"
                  title="Simulate removing 1 Omega-3 Softgel (1.40g)"
                >
                  -1.40g (Omega-3)
                </button>
              </div>
            </div>

            {/* Tactile Push Button */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-slate-400">Push Button (GPIO 23)</span>
                <span className="text-[10px] text-slate-500">Pull-Up</span>
              </div>
              <button
                onClick={() => runStep(5, 'PRESS_BUTTON')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 active:scale-95 text-white font-mono-code font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>CONFIRM DOSE (CLICK)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: 7-Step Interactive Verification Pipeline & Serial Terminal */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-mono-code uppercase font-bold text-teal-400 tracking-wider flex items-center space-x-1.5 mb-3">
              <Layers className="w-4 h-4" />
              <span>7-Step Verification Workflow</span>
            </h4>

            <div className="space-y-2 text-xs font-mono-code">
              
              <button
                onClick={() => runStep(1, 'TRIGGER_REMINDER')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeStep === 1 
                    ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-md' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>1. Trigger Reminder (Alarm)</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Buzzer/LED</span>
              </button>

              <button
                onClick={() => runStep(2, 'OPEN_COMPARTMENT')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeStep === 2 
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200 shadow-md' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>2. Open Compartment</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">Servo 90°</span>
              </button>

              <button
                onClick={() => runStep(3, 'OPEN_COMPARTMENT')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeStep === 3 
                    ? 'bg-teal-950/80 border-teal-500 text-teal-200 shadow-md' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>3. Detect Drawer Pull</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">Reed Switch</span>
              </button>

              <button
                onClick={() => runStep(4, 'REMOVE_MEDICINE', { weightDropGrams: 0.65 })}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeStep === 4 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>4. Weight Decrease Check</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">HX711 -0.65g</span>
              </button>

              <button
                onClick={() => runStep(5, 'PRESS_BUTTON')}
                className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeStep === 5 
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 shadow-md' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>5. Button Acknowledgment</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">GPIO 23</span>
              </button>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Fast Edge Case Simulations:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      addSerialLog('[EDGE CASE] Button pressed WITHOUT pill removal!');
                      runStep(5, 'PRESS_BUTTON'); // Weight unchanged
                    }}
                    className="p-2 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-[10px] font-bold text-left cursor-pointer"
                  >
                    ⚠️ Unverified Cheat (Button only, 0g loss)
                  </button>

                  <button
                    onClick={() => runStep(6, 'SIMULATE_MISSED')}
                    className="p-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-[10px] font-bold text-left cursor-pointer"
                  >
                    ⏰ Timeout (Missed Dose)
                  </button>
                </div>
              </div>

              {/* Wi-Fi & Offline RTC Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => runStep(7, 'TOGGLE_DEVICE_OFFLINE')}
                  className="w-full p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-code flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {device.status === 'online' ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{device.status === 'online' ? 'Disconnect Wi-Fi (Test Offline RTC Mode)' : 'Reconnect Wi-Fi & Flush Logs'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Live UART Serial Monitor */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono-code">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5 text-teal-400">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-bold">UART Serial Monitor (115200 Baud)</span>
              </span>
              <span className="text-[10px] text-slate-500">Live</span>
            </div>
            <div className="h-32 overflow-y-auto space-y-1 text-[11px] text-slate-300">
              {serialLogs.map((log, idx) => (
                <div key={idx} className="leading-tight truncate">
                  <span className="text-slate-500">{log.split(' ')[0]}</span>{' '}
                  <span className={log.includes('ALERT') || log.includes('UNVERIFIED') ? 'text-rose-400 font-bold' : log.includes('CONFIRMED') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {log.substring(log.indexOf(' ') + 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <div className="text-[11px] text-slate-500 text-center font-mono-code border-t border-slate-800/80 pt-3">
        * Sensor verification engine: Never assumes button click alone confirms ingestion. Weight differential must exceed 0.15g.
      </div>

    </div>
  );
}
