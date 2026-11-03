import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { sendSimulationEvent, syncDeviceSchedule } from '../services/api';
import confetti from 'canvas-confetti';

const DeviceContext = createContext();

// Simple Web Audio API Synthesizer for ESP32 Buzzer Simulation
function playBuzzerTone(frequency, durationMs) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    // Audio context may require user interaction
  }
}

export function DeviceProvider({ children }) {
  const [device, setDevice] = useState({
    id: 'ESP32-MRB-001',
    patientName: 'Rahul Sharma',
    firmwareVersion: 'v2.4.1-RTC-PRO',
    status: 'online',
    ipAddress: '192.168.1.145',
    macAddress: '24:6F:28:B4:79:E2',
    wifiSSID: 'Apollo_Home_Mesh_5G',
    signalStrengthDbm: -62,
    batteryLevel: 94,
    isCharging: true,
    compartments: 4,
    activeCompartmentServoAngle: 0,
    reedSwitchState: 'closed',
    currentScaleWeightGrams: 27.85,
    buzzerActive: false,
    ledStatus: 'idle_green',
    lcdLine1: 'MediRoutine AI',
    lcdLine2: 'System Ready 22:06',
    lastHeartbeat: new Date().toISOString(),
    offlinePendingLogsCount: 0,
    hardwareComponents: {
      rtc: 'DS3231 I2C OK',
      lcd: '1602 I2C 0x27 OK',
      hx711: 'Load Cell Calibrated OK',
      servo: 'SG90 PWM Pin 18 OK',
      reedSwitch: 'Pin 19 Hall Magnetic OK',
      buzzer: 'PWM Pin 23 OK',
      leds: 'RGB Status LEDs Pin 2,4,5 OK'
    }
  });

  const [activeSimulationLog, setActiveSimulationLog] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to MediRoutine IoT WebSocket server');
    });

    socket.on('INIT_STATE', (data) => {
      if (data?.devices?.[0]) {
        setDevice(data.devices[0]);
      }
    });

    socket.on('SIMULATION_UPDATE', (data) => {
      if (data.device) {
        setDevice(data.device);
      }
      if (data.logs) {
        setActiveSimulationLog(data.logs);
      }

      // Audio feedback based on event
      if (soundEnabled) {
        if (data.eventType === 'TRIGGER_REMINDER') {
          playBuzzerTone(2000, 400);
        } else if (data.eventType === 'PRESS_BUTTON') {
          if (data.reminder?.status?.includes('Confirmed')) {
            playBuzzerTone(1500, 150);
            setTimeout(() => playBuzzerTone(2500, 300), 200);
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          } else {
            playBuzzerTone(600, 600);
          }
        }
      }
    });

    socket.on('DEVICE_STATUS_CHANGE', (data) => {
      if (data.device) {
        setDevice(data.device);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

  const handleSimulate = async (eventType, reminderId, payload) => {
    try {
      const res = await sendSimulationEvent(eventType, reminderId, device.id, payload);
      if (res.success && res.device) {
        setDevice(res.device);
      }
      return res;
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleSyncSchedule = async () => {
    try {
      const res = await syncDeviceSchedule(device.id);
      if (res.success) {
        setDevice(prev => ({ ...prev, status: 'online', offlinePendingLogsCount: 0 }));
      }
      return res;
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  return (
    <DeviceContext.Provider value={{
      device,
      activeSimulationLog,
      soundEnabled,
      setSoundEnabled,
      handleSimulate,
      handleSyncSchedule
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
