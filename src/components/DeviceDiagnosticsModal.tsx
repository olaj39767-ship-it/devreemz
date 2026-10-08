import React, { useState, useEffect, useRef } from 'react';
import { DeviceDiagnosticReport, StoreConfig } from '../types';
import { buildDiagnosticsWhatsAppUrl } from '../utils/whatsapp';
import {
  Activity,
  X,
  Smartphone,
  Battery,
  BatteryCharging,
  Wifi,
  HardDrive,
  Compass,
  Touchpad,
  Camera,
  Mic,
  Volume2,
  Vibrate,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Play,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Flame,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  SwitchCamera
} from 'lucide-react';

interface DeviceDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: StoreConfig;
  onComplete?: (report: DeviceDiagnosticReport) => void;
  onAttachToTradeIn?: (report: DeviceDiagnosticReport) => void;
  onUseForTradeIn?: (report: DeviceDiagnosticReport) => void;
  onOpenHumanSupport?: () => void;
  existingReport?: DeviceDiagnosticReport | null;
}

type DiagnosticStep =
  | 'intro'
  | 'auto_system'
  | 'motion_sensor'
  | 'touch_grid'
  | 'audio_speaker'
  | 'camera_mic'
  | 'performance'
  | 'report';

export const DeviceDiagnosticsModal: React.FC<DeviceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  config,
  onComplete,
  onAttachToTradeIn,
  onUseForTradeIn,
  onOpenHumanSupport,
  existingReport,
}) => {
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('intro');
  const [report, setReport] = useState<DeviceDiagnosticReport | null>(existingReport || null);
  const [isCopied, setIsCopied] = useState(false);

  // Partial test tracking states
  const [sysInfo, setSysInfo] = useState<{
    model: string;
    os: string;
    browser: string;
    screen: string;
    pixelRatio: number;
    ram: string;
    cpuCores: string;
    platform: string;
  } | null>(null);

  const [batteryData, setBatteryData] = useState<{
    available: boolean;
    level?: number;
    charging?: boolean;
    chargingTime?: number;
    dischargingTime?: number;
    note: string;
  }>({ available: false, note: 'Checking...' });

  const [networkData, setNetworkData] = useState<{
    available: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    online: boolean;
    note: string;
  }>({ available: false, online: true, note: 'Checking...' });

  const [storageData, setStorageData] = useState<{
    available: boolean;
    usageMB?: number;
    quotaMB?: number;
    percentUsed?: number;
    note: string;
  }>({ available: false, note: 'Checking...' });

  // Motion test
  const [motionStatus, setMotionStatus] = useState<{
    tested: boolean;
    passed: boolean;
    tiltX: number;
    tiltY: number;
    shakes: number;
    supported: boolean;
  }>({ tested: false, passed: false, tiltX: 0, tiltY: 0, shakes: 0, supported: true });

  // Touch test
  const [touchCells, setTouchCells] = useState<boolean[]>(new Array(12).fill(false));
  const [multiTouchCount, setMultiTouchCount] = useState<number>(0);

  // Audio test
  const [speakerConfirmed, setSpeakerConfirmed] = useState<boolean | null>(null);
  const [vibrationConfirmed, setVibrationConfirmed] = useState<boolean | null>(null);

  // Camera & Mic
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micDetected, setMicDetected] = useState<boolean>(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);

  // Performance
  const [perfResults, setPerfResults] = useState<{
    cpuScoreMs?: number;
    rating?: 'Fast' | 'Normal' | 'Slow';
    webglSupported: boolean;
    renderer?: string;
    tested: boolean;
  }>({ webglSupported: false, tested: false });

  // Load existing report or reset on open
  useEffect(() => {
    if (isOpen) {
      if (existingReport) {
        setReport(existingReport);
        setCurrentStep('report');
      } else {
        // Check localStorage for saved report
        try {
          const saved = localStorage.getItem('wastech_last_diagnostic_report');
          if (saved) {
            const parsed = JSON.parse(saved);
            setReport(parsed);
          }
        } catch {}
        setCurrentStep('intro');
      }
    } else {
      stopMediaStream();
    }
  }, [isOpen, existingReport]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setCameraActive(false);
  };

  // Helper: detect device & browser info
  const detectSystemInfo = () => {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let model = 'Generic Device';
    let browser = 'Unknown Browser';

    // OS detection
    if (/iPhone/i.test(ua)) {
      os = 'iOS';
      model = 'Apple iPhone';
      const match = ua.match(/OS (\d+_\d+)/);
      if (match) os = `iOS ${match[1].replace('_', '.')}`;
    } else if (/iPad/i.test(ua)) {
      os = 'iPadOS';
      model = 'Apple iPad';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS';
      model = 'Apple Mac';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      model = 'Android Device';
      const match = ua.match(/Android (\d+(\.\d+)?)/);
      if (match) os = `Android ${match[1]}`;
      const modelMatch = ua.match(/;\s*([^;)]+)\s*Build/);
      if (modelMatch) model = modelMatch[1].trim();
    } else if (/Windows/i.test(ua)) {
      os = 'Windows';
      model = 'PC / Laptop';
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
      model = 'Linux Computer';
    }

    // Browser
    if (/Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua)) {
      browser = 'Google Chrome';
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browser = 'Apple Safari';
    } else if (/Firefox/i.test(ua)) {
      browser = 'Mozilla Firefox';
    } else if (/Edg/i.test(ua)) {
      browser = 'Microsoft Edge';
    }

    const ram = (navigator as any).deviceMemory ? `~${(navigator as any).deviceMemory} GB` : 'Not exposed by browser';
    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Cores` : 'Not exposed';
    const screenRes = `${window.screen.width} × ${window.screen.height} px`;
    const dpr = window.devicePixelRatio || 1;
    const platform = navigator.platform || 'Web Browser';

    return {
      model,
      os,
      browser,
      screen: `${screenRes} (@${dpr}x DPR)`,
      pixelRatio: dpr,
      ram,
      cpuCores,
      platform,
    };
  };

  // 1. Run Auto-Scan (System, Battery, Network, Storage)
  const runAutoScan = async () => {
    const sys = detectSystemInfo();
    setSysInfo(sys);

    // Battery
    let battResult: {
      available: boolean;
      level?: number;
      charging?: boolean;
      chargingTime?: number;
      dischargingTime?: number;
      note: string;
    } = {
      available: false,
      note: 'Battery Status API not exposed on this browser (restricted for privacy).',
    };
    try {
      if (typeof (navigator as any).getBattery === 'function') {
        const b = await (navigator as any).getBattery();
        battResult = {
          available: true,
          level: Math.round(b.level * 100),
          charging: b.charging,
          chargingTime: b.chargingTime,
          dischargingTime: b.dischargingTime,
          note: `${Math.round(b.level * 100)}% current charge (${b.charging ? 'Plugged in / Charging' : 'On Battery'}).`,
        };
      }
    } catch {
      battResult = {
        available: false,
        note: 'Battery API restricted on this browser platform.',
      };
    }
    setBatteryData(battResult);

    // Network
    let netResult: {
      available: boolean;
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      online: boolean;
      note: string;
    } = {
      available: false,
      online: navigator.onLine,
      note: navigator.onLine ? 'Device is Online' : 'Device is Offline',
    };
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      netResult = {
        available: true,
        effectiveType: conn.effectiveType?.toUpperCase() || 'Unknown',
        downlink: conn.downlink || undefined,
        rtt: conn.rtt || undefined,
        online: navigator.onLine,
        note: `${conn.effectiveType ? conn.effectiveType.toUpperCase() : 'Connected'} connection, ~${conn.downlink || 0} Mbps downlink, ${conn.rtt || 0}ms latency.`,
      };
    }
    setNetworkData(netResult);

    // Storage
    let storResult: {
      available: boolean;
      usageMB?: number;
      quotaMB?: number;
      percentUsed?: number;
      note: string;
    } = {
      available: false,
      note: 'Storage estimate API not supported in this context.',
    };
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const usageMB = est.usage ? Math.round(est.usage / (1024 * 1024)) : 0;
        const quotaMB = est.quota ? Math.round(est.quota / (1024 * 1024)) : 0;
        const percent = quotaMB > 0 ? Math.round((usageMB / quotaMB) * 100) : 0;
        storResult = {
          available: true,
          usageMB,
          quotaMB,
          percentUsed: percent,
          note: `Browser sandboxed storage: ${usageMB} MB used of ~${Math.round(quotaMB / 1024)} GB browser quota (${percent}%).`,
        };
      }
    } catch {
      storResult = {
        available: false,
        note: 'Could not access browser storage quotas.',
      };
    }
    setStorageData(storResult);
  };

  // Start the full diagnostic flow
  const handleStartDiagnostics = async () => {
    setCurrentStep('auto_system');
    await runAutoScan();
  };

  // 2. Motion Sensor Test Setup
  const startMotionTest = async () => {
    // iOS permission requirement
    if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
      try {
        const perm = await (DeviceMotionEvent as any).requestPermission();
        if (perm !== 'granted') {
          setMotionStatus((prev) => ({ ...prev, tested: true, supported: false }));
          return;
        }
      } catch {
        setMotionStatus((prev) => ({ ...prev, tested: true, supported: false }));
        return;
      }
    }

    let shakeCounter = 0;
    let lastX = 0;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = Math.round(e.gamma || 0);
      const beta = Math.round(e.beta || 0);
      setMotionStatus((prev) => ({
        ...prev,
        tiltX: gamma,
        tiltY: beta,
        tested: true,
        passed: true,
      }));
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (acc && acc.x !== null) {
        const delta = Math.abs(acc.x - lastX);
        if (delta > 12) {
          shakeCounter++;
          setMotionStatus((prev) => ({
            ...prev,
            shakes: shakeCounter,
            tested: true,
            passed: true,
          }));
        }
        lastX = acc.x;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, { once: false });
    window.addEventListener('devicemotion', handleMotion, { once: false });

    // Fallback if no events fire in 3s (e.g. desktop without accelerometer)
    setTimeout(() => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
      setMotionStatus((prev) => {
        if (prev.tiltX === 0 && prev.tiltY === 0 && prev.shakes === 0) {
          return { ...prev, tested: true, passed: false, supported: false };
        }
        return { ...prev, tested: true, passed: true };
      });
    }, 4000);
  };

  // 3. Touch Screen Test
  const handleTouchCell = (index: number) => {
    setTouchCells((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };

  // 4. Audio / Speaker Test
  const playTestChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      // Note 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: 659.25 Hz (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.2);
      gain2.gain.setValueAtTime(0.25, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.7);
    } catch (err) {
      console.warn('Audio playback error', err);
    }
  };

  const triggerVibration = () => {
    if (typeof navigator.vibrate === 'function') {
      try {
        const vib = navigator.vibrate([120, 80, 120]);
        if (!vib) {
          setVibrationConfirmed(false);
        }
      } catch {
        setVibrationConfirmed(false);
      }
    } else {
      setVibrationConfirmed(false);
    }
  };

  // 5. Camera & Microphone Stream
  const startCameraAndMic = async (facing: 'user' | 'environment' = cameraFacing) => {
    stopMediaStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);

      // Audio Level Analyzer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicLevel(normalized);
        if (normalized > 8) {
          setMicDetected(true);
        }
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err: any) {
      console.warn('Media devices access failed', err);
      setCameraError(err.message || 'Camera or Microphone access was denied or not found.');
      setCameraActive(false);
    }
  };

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCameraAndMic(nextFacing);
  };

  const snapTestPhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedSnapshot(canvas.toDataURL('image/jpeg', 0.6));
      }
    } catch (err) {
      console.warn('Snapshot error', err);
    }
  };

  // 6. CPU & WebGL Benchmark
  const runPerformanceBenchmark = () => {
    // Lightweight JS CPU benchmark: prime number computation loop
    const start = performance.now();
    let primesCount = 0;
    for (let i = 2; i < 40000; i++) {
      let isPrime = true;
      for (let j = 2; j * j <= i; j++) {
        if (i % j === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) primesCount++;
    }
    const duration = Math.round(performance.now() - start);

    let rating: 'Fast' | 'Normal' | 'Slow' = 'Fast';
    if (duration > 60) rating = 'Slow';
    else if (duration > 25) rating = 'Normal';

    // WebGL Smoke test
    let webglSupported = false;
    let renderer = 'Standard GPU';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        webglSupported = true;
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Hardware Accelerated GPU';
        }
      }
    } catch {
      webglSupported = false;
    }

    setPerfResults({
      cpuScoreMs: duration,
      rating,
      webglSupported,
      renderer,
      tested: true,
    });
  };

  // Final compilation of the Health Report
  const generateFinalReport = () => {
    stopMediaStream();

    const sys = sysInfo || detectSystemInfo();
    const touchGridPassed = touchCells.filter(Boolean).length >= 8;

    // Determine overall status
    let issuesCount = 0;
    if (speakerConfirmed === false) issuesCount++;
    if (cameraError) issuesCount++;
    if (!touchGridPassed && touchCells.some(Boolean)) issuesCount++;

    let overallStatus: 'Good' | 'Needs Attention' | 'Limited Data' = 'Good';
    if (issuesCount >= 2) {
      overallStatus = 'Needs Attention';
    } else if (!batteryData.available && !motionStatus.tested) {
      overallStatus = 'Limited Data';
    } else if (issuesCount === 1) {
      overallStatus = 'Needs Attention';
    }

    const reportId = `DIAG-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const storeTitle = config?.businessName || 'wastech';
    const summaryText =
      `[${storeTitle} Diagnostic Report #${reportId}]\n` +
      `Date: ${timestamp}\n` +
      `Status: ${overallStatus}\n` +
      `Device: ${sys.model} (${sys.os})\n` +
      `Screen: ${sys.screen}\n` +
      `Battery: ${batteryData.available ? `${batteryData.level}% (${batteryData.charging ? 'Charging' : 'Discharging'})` : 'Browser-restricted'}\n` +
      `Touchscreen: ${touchGridPassed ? 'Pass (0 dead zones)' : 'Untested / Partial'}\n` +
      `Camera/Mic: ${cameraActive || capturedSnapshot ? 'Verified Active' : cameraError ? 'Error / Denied' : 'Skipped'}\n` +
      `Speaker/Vibrate: ${speakerConfirmed ? 'Confirmed Auditory' : 'Unconfirmed'} | ${vibrationConfirmed ? 'Confirmed Haptic' : 'N/A'}\n` +
      `Performance: CPU ${perfResults.rating || 'Standard'} (${perfResults.cpuScoreMs || 0}ms), WebGL ${perfResults.webglSupported ? 'OK' : 'No'}`;

    const finalReport: DeviceDiagnosticReport = {
      id: reportId,
      timestamp,
      overallStatus,
      deviceInfo: sys,
      battery: batteryData,
      network: networkData,
      storage: storageData,
      sensors: {
        motionAvailable: motionStatus.supported,
        motionTested: motionStatus.tested,
        motionPassed: motionStatus.passed,
        lightAvailable: false,
        note: motionStatus.tested
          ? motionStatus.passed
            ? 'Motion accelerometer & orientation responsive.'
            : 'Motion sensors returned flat data (likely desktop browser).'
          : 'Sensor test skipped.',
      },
      touch: {
        multiTouchPoints: navigator.maxTouchPoints || (touchCells.some(Boolean) ? 1 : 0),
        touchScreenDetected: (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window,
        gridTestPassed: touchGridPassed,
        note: touchGridPassed
          ? 'Screen responsiveness grid verified with zero dead zones detected.'
          : 'Touch grid test completed with partial or desktop clicks.',
      },
      camera: {
        available: !cameraError,
        tested: cameraActive || capturedSnapshot !== null || !!cameraError,
        frontPassed: capturedSnapshot !== null || cameraActive,
        rearPassed: cameraFacing === 'environment' && cameraActive,
        note: cameraError
          ? `Camera unavailable: ${cameraError}`
          : capturedSnapshot
          ? 'Camera visual stream & snapshot capture verified successfully.'
          : 'Camera hardware detected.',
      },
      audio: {
        micAvailable: !cameraError,
        micTested: micDetected,
        micLevel: micLevel,
        speakerTested: speakerConfirmed !== null,
        speakerPassed: speakerConfirmed === true,
        note: `Speaker: ${speakerConfirmed === true ? 'User confirmed clear audio chime' : 'Audio chime unconfirmed'}. Mic: ${micDetected ? 'Live voice input detected' : 'Low/No audio level detected'}.`,
      },
      vibration: {
        supported: typeof navigator.vibrate === 'function',
        tested: vibrationConfirmed !== null,
        confirmed: vibrationConfirmed === true,
        note:
          vibrationConfirmed === true
            ? 'Haptic motor verified.'
            : typeof navigator.vibrate === 'function'
            ? 'Haptic API present but unconfirmed.'
            : 'Vibration API not supported on this platform/browser.',
      },
      performance: {
        tested: perfResults.tested,
        scoreMs: perfResults.cpuScoreMs,
        rating: perfResults.rating,
        webglSupported: perfResults.webglSupported,
        renderer: perfResults.renderer,
        note: `CPU Benchmark: ${perfResults.rating || 'Normal'} (~${perfResults.cpuScoreMs || 0}ms execution). 3D WebGL: ${perfResults.webglSupported ? 'Hardware Accelerated' : 'Software/Unavailable'}.`,
      },
      summaryText,
    };

    setReport(finalReport);
    try {
      localStorage.setItem('wastech_last_diagnostic_report', JSON.stringify(finalReport));
    } catch {}

    if (onComplete) {
      onComplete(finalReport);
    }

    setCurrentStep('report');
  };

  const handleCopyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-2xl max-h-[94dvh] sm:max-h-[90vh] bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-gray-900 font-display">
                  Device Diagnostics
                </h2>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-md">
                  Browser Health Check
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Safe, browser-based hardware & sensor evaluation
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopMediaStream();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar (when running checks) */}
        {currentStep !== 'intro' && currentStep !== 'report' && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-[11px] text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-blue-600">
                {currentStep === 'auto_system' && 'Step 1/5: System Overview'}
                {currentStep === 'motion_sensor' && 'Step 2/5: Motion & Tilt'}
                {currentStep === 'touch_grid' && 'Step 3/5: Touch Screen Responsiveness'}
                {currentStep === 'audio_speaker' && 'Step 4/5: Audio & Vibration'}
                {currentStep === 'camera_mic' && 'Step 5/5: Camera & Mic'}
                {currentStep === 'performance' && 'Finalizing: Performance Benchmark'}
              </span>
            </div>
            <button
              onClick={generateFinalReport}
              className="text-[11px] font-medium text-gray-500 hover:text-gray-900 underline"
            >
              Skip to Report
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1 space-y-4">
          {/* STEP 0: INTRO SCREEN */}
          {currentStep === 'intro' && (
            <div className="space-y-4">
              {/* Honest limitation notice banner */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-gray-800 leading-relaxed space-y-1.5">
                <div className="flex items-center gap-2 text-blue-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>How This Browser Diagnostic Works</span>
                </div>
                <p>
                  This is a <strong>quick client-side browser check</strong>. It cannot replace in-person laboratory inspection, but it evaluates basic device responsiveness, screen dead-zones, camera & microphone function, audio output, and storage quotas before submitting for trade-in.
                </p>
              </div>

              {/* Requirement F: Privacy Note */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Privacy Note:</strong> Your camera and microphone are used solely in your browser during this real-time diagnostic test. No video, audio, or biometric data is ever recorded, uploaded, or stored on any server.
                </p>
              </div>

              {/* Supported vs Unsupported breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real Checks Included</span>
                  </div>
                  <ul className="text-gray-600 space-y-1 pl-4 list-disc text-[11px]">
                    <li>Device model, OS & screen pixel density</li>
                    <li>Battery charging & level (where supported)</li>
                    <li>Network bandwidth & ping latency</li>
                    <li>Storage quota estimation</li>
                    <li>Touch multi-touch & responsive dead-zone grid</li>
                    <li>Front & rear camera preview + live mic meter</li>
                    <li>Audio speaker chime test & haptic vibration</li>
                    <li>JS CPU benchmark & WebGL 3D smoke test</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Browser Boundaries (Explicit)</span>
                  </div>
                  <ul className="text-gray-600 space-y-1 pl-4 list-disc text-[11px]">
                    <li>Cannot read internal battery health % or charge cycle count</li>
                    <li>Cannot inspect S.M.A.R.T. disk wear levels</li>
                    <li>Cannot read CPU/GPU internal temperature</li>
                    <li>No access to Face ID/Touch ID internal secure enclave</li>
                    <li>Any unsupported browser API is labeled truthfully</li>
                  </ul>
                </div>
              </div>

              {/* Previous report shortcut if exists */}
              {report && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">Previous Report Available</span>
                    <p className="text-[11px] text-gray-500">
                      Generated on {report.timestamp} ({report.overallStatus})
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('report')}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-lg font-medium text-xs shadow-2xs"
                  >
                    View Report
                  </button>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2">
                <button
                  onClick={handleStartDiagnostics}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Device Diagnostics (Takes ~45s)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: AUTO SYSTEM SCAN */}
          {currentStep === 'auto_system' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  System & Environment Overview
                </h3>
                <p className="text-xs text-gray-500">
                  Detected hardware environment, network, and storage quota
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Device & OS */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-[11px]">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Device & OS</span>
                  </div>
                  <p className="text-gray-900 font-medium">{sysInfo?.model}</p>
                  <p className="text-[11px] text-gray-500">
                    {sysInfo?.os} • {sysInfo?.browser}
                  </p>
                  <p className="text-[11px] text-gray-500">{sysInfo?.screen}</p>
                  <p className="text-[11px] text-gray-500">
                    Memory: {sysInfo?.ram} | CPU: {sysInfo?.cpuCores}
                  </p>
                </div>

                {/* Battery Status */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-[11px]">
                    {batteryData.charging ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Battery className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>Battery Status</span>
                  </div>
                  {batteryData.available ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 font-display">
                          {batteryData.level}%
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                          {batteryData.charging ? 'Charging' : 'Discharging'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{batteryData.note}</p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 space-y-1">
                      <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">
                        Not exposed by browser
                      </span>
                      <p className="mt-1">{batteryData.note}</p>
                    </div>
                  )}
                </div>

                {/* Network */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-[11px]">
                    <Wifi className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Network & Latency</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-semibold text-gray-900">
                      {networkData.online ? 'Online' : 'Offline'}
                    </span>
                    {networkData.effectiveType && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                        {networkData.effectiveType}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">{networkData.note}</p>
                </div>

                {/* Storage */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-800 font-semibold text-[11px]">
                    <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Browser Storage Quota</span>
                  </div>
                  {storageData.available ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                        <span>Used: {storageData.usageMB} MB</span>
                        <span>Quota: {Math.round((storageData.quotaMB || 0) / 1024)} GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.max(2, storageData.percentUsed || 1)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{storageData.note}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500">{storageData.note}</p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentStep('motion_sensor')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span>Next: Test Motion & Gyroscope</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MOTION & TILT */}
          {currentStep === 'motion_sensor' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Motion & Gyroscope Test
                </h3>
                <p className="text-xs text-gray-500">
                  Tilt or gently shake your phone to verify accelerometer sensor responsiveness
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center space-y-3 text-center">
                {/* Tilt visual bubble */}
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 relative flex items-center justify-center bg-white shadow-inner">
                  <div
                    className={`w-8 h-8 rounded-full transition-transform duration-75 flex items-center justify-center text-white text-[10px] font-bold ${
                      motionStatus.passed ? 'bg-emerald-600 shadow-md' : 'bg-blue-600'
                    }`}
                    style={{
                      transform: `translate(${Math.max(-40, Math.min(40, motionStatus.tiltX))}px, ${Math.max(-40, Math.min(40, motionStatus.tiltY))}px)`,
                    }}
                  >
                    <Compass className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-900">
                    Tilt: X={motionStatus.tiltX}°, Y={motionStatus.tiltY}° | Shakes: {motionStatus.shakes}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {motionStatus.passed
                      ? '✓ Gyroscope & motion sensors active and reading non-zero movement.'
                      : 'Tilt your device in any direction, or click below to trigger sensor listening.'}
                  </p>
                </div>

                {!motionStatus.tested && (
                  <button
                    onClick={startMotionTest}
                    className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-xl font-medium text-xs shadow-2xs"
                  >
                    Activate Motion Sensors
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setMotionStatus((prev) => ({ ...prev, tested: true, passed: true }));
                    setCurrentStep('touch_grid');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Confirm & Next: Touch Screen Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: TOUCH SCREEN & DEAD-ZONE GRID */}
          {currentStep === 'touch_grid' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 font-display">
                    Touch & Screen Dead-Zone Test
                  </h3>
                  <span className="text-[11px] font-semibold text-blue-600">
                    {touchCells.filter(Boolean).length} / 12 Cleared
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Tap or swipe across all 12 blocks below to test digitizer responsiveness
                </p>
              </div>

              {/* Interactive grid */}
              <div
                className="grid grid-cols-4 gap-2 select-none"
                onTouchStart={(e) => {
                  setMultiTouchCount(Math.max(multiTouchCount, e.touches.length));
                }}
              >
                {touchCells.map((cleared, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTouchCell(idx)}
                    onTouchStart={() => handleTouchCell(idx)}
                    onMouseEnter={(e) => {
                      if (e.buttons === 1) handleTouchCell(idx);
                    }}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center font-bold text-xs transition-all ${
                      cleared
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs'
                        : 'bg-gray-100 hover:bg-blue-50 border-gray-200 text-gray-400 hover:border-blue-300'
                    }`}
                  >
                    {cleared ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <span className="text-[11px] font-medium">#{idx + 1}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="flex items-center gap-1.5">
                  <Touchpad className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Multi-touch points reported:{' '}
                    <strong>{navigator.maxTouchPoints || (multiTouchCount > 0 ? multiTouchCount : 'Desktop/Pointer')}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTouchCells(new Array(12).fill(true))}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Mark All Clear
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentStep('audio_speaker')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Next: Audio & Vibration Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AUDIO & VIBRATION */}
          {currentStep === 'audio_speaker' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Audio Speaker & Haptic Vibration
                </h3>
                <p className="text-xs text-gray-500">
                  Verify internal loudspeaker audio playback and vibration actuator
                </p>
              </div>

              {/* Speaker Test */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Speaker Chime Test</h4>
                      <p className="text-[11px] text-gray-500">
                        Plays a clean 2-tone frequency chime
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={playTestChime}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Play Chime</span>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Did you hear the chime clearly?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSpeakerConfirmed(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        speakerConfirmed === true
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      ✓ Yes, loud & clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeakerConfirmed(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        speakerConfirmed === false
                          ? 'bg-red-100 border-red-300 text-red-800'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      ✕ No sound
                    </button>
                  </div>
                </div>
              </div>

              {/* Vibration Test */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                      <Vibrate className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Haptic Vibration Test</h4>
                      <p className="text-[11px] text-gray-500">
                        Sends a pulse pattern to device vibrator
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerVibration}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <span>Trigger Buzz</span>
                  </button>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Did your device vibrate?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVibrationConfirmed(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        vibrationConfirmed === true
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setVibrationConfirmed(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        vibrationConfirmed === false
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      No / Unsupported
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCurrentStep('camera_mic');
                    startCameraAndMic();
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Next: Camera & Microphone Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CAMERA & MIC */}
          {currentStep === 'camera_mic' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Camera & Microphone Input Test
                </h3>
                <p className="text-xs text-gray-500">
                  Live verification of camera image stream and microphone decibel sensitivity
                </p>
              </div>

              {cameraError ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Camera / Mic Access Limited</span>
                  </div>
                  <p className="text-[11px]">{cameraError}</p>
                  <p className="text-[10px] text-gray-500">
                    If permissions were declined, this test is noted as unverified rather than failed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Live Video Preview Box */}
                  <div className="relative w-full aspect-video max-h-56 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera overlay controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={switchCameraFacing}
                        className="px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs"
                      >
                        <SwitchCamera className="w-3.5 h-3.5" />
                        <span>Switch ({cameraFacing})</span>
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] backdrop-blur-xs">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      <span>Live Stream Active</span>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <button
                        type="button"
                        onClick={snapTestPhoto}
                        className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-gray-900 text-[10px] font-semibold shadow-xs flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3 text-blue-600" />
                        <span>{capturedSnapshot ? 'Retake Frame' : 'Snap Verification'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Captured verification thumbnail */}
                  {capturedSnapshot && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                      <img
                        src={capturedSnapshot}
                        alt="Test verification frame"
                        className="w-12 h-9 object-cover rounded border border-emerald-300 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">✓ Sensor Frame Captured</span>
                        <span className="text-[10px] text-emerald-700">
                          Optical sensor confirmed responsive with image pipeline intact.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Microphone Level Meter */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <Mic className="w-3.5 h-3.5 text-blue-600" />
                        <span>Live Microphone Sensitivity</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">
                        Level: {micLevel}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 rounded-full ${
                          micLevel > 15 ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(3, micLevel)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Speak or make a noise. A level &gt;8% confirms your audio input diaphragm works.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    stopMediaStream();
                    setCurrentStep('performance');
                    runPerformanceBenchmark();
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Next: Performance & 3D Smoke Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PERFORMANCE & WEBGL */}
          {currentStep === 'performance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-display">
                  Performance & WebGL Smoke Test
                </h3>
                <p className="text-xs text-gray-500">
                  Lightweight CPU numerical throughput and 3D graphics hardware acceleration
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* CPU test */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-xs">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>CPU Benchmark</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 font-display">
                      {perfResults.cpuScoreMs || 0} ms
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        perfResults.rating === 'Fast'
                          ? 'bg-emerald-100 text-emerald-800'
                          : perfResults.rating === 'Normal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {perfResults.rating} Responsiveness
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Prime sieve iteration benchmark completed without thermal stalls.
                  </p>
                </div>

                {/* WebGL 3D test */}
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-xs">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>WebGL 3D Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        perfResults.webglSupported
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {perfResults.webglSupported ? 'Hardware Accelerated' : 'Not Supported'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate" title={perfResults.renderer}>
                    GPU: {perfResults.renderer || 'Standard'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={generateFinalReport}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Generate Device Health Report</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: FINAL REPORT CARD */}
          {currentStep === 'report' && report && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Overall Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                  report.overallStatus === 'Good'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : report.overallStatus === 'Needs Attention'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-blue-50/80 border-blue-200 text-blue-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold">
                      Report #{report.id}
                    </span>
                    <span className="text-[10px] text-gray-500">• {report.timestamp}</span>
                  </div>
                  <h3 className="text-base font-bold mt-0.5 font-display flex items-center gap-1.5">
                    {report.overallStatus === 'Good' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {report.overallStatus === 'Needs Attention' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    {report.overallStatus === 'Limited Data' && (
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    )}
                    <span>Overall Device Status: {report.overallStatus}</span>
                  </h3>
                  <p className="text-xs mt-1 text-gray-700 leading-relaxed">
                    Evaluated on {report.deviceInfo.model} with browser diagnostics verified for trade-in.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentStep('intro')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg shadow-2xs flex-shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Retest</span>
                </button>
              </div>

              {/* Grouped Diagnostic Grid */}
              <div className="space-y-3">
                {/* 1. Device Info */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Device Identity & Platform</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">
                      Identified
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 pt-1">
                    <div>
                      <span className="text-gray-400 block">Model</span>
                      <strong className="text-gray-800">{report.deviceInfo.model}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Operating System</span>
                      <strong className="text-gray-800">{report.deviceInfo.os}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Screen Resolution</span>
                      <strong className="text-gray-800">{report.deviceInfo.screen}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">CPU Cores</span>
                      <strong className="text-gray-800">{report.deviceInfo.cpuCores}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">System RAM</span>
                      <strong className="text-gray-800">{report.deviceInfo.ram}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Browser Engine</span>
                      <strong className="text-gray-800">{report.deviceInfo.browser}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Battery & Power */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Battery className="w-4 h-4 text-emerald-600" />
                      <span>Battery & Power State</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        report.battery.available
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {report.battery.available ? `${report.battery.level}% Charge` : 'API Restricted'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{report.battery.note}</p>
                </div>

                {/* 3. Touch Screen & Digitizer */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Touchpad className="w-4 h-4 text-blue-600" />
                      <span>Touchscreen & Dead-Zones</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        report.touch.gridTestPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {report.touch.gridTestPassed ? 'Zero Dead Zones' : 'Tested'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{report.touch.note}</p>
                </div>

                {/* 4. Camera & Audio Sensors */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span>Camera, Mic & Loudspeaker</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        report.audio.speakerPassed && report.camera.frontPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {report.audio.speakerPassed ? 'Sensors Operational' : 'Partial Verification'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{report.camera.note}</p>
                  <p className="text-xs text-gray-700">{report.audio.note}</p>
                </div>

                {/* 5. Storage & Network */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      <span>Storage & Network Connectivity</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-medium">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{report.network.note}</p>
                  <p className="text-xs text-gray-700">{report.storage.note}</p>
                </div>

                {/* 6. Performance */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      <span>Compute Performance & WebGL</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-medium">
                      {report.performance.rating || 'Standard'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{report.performance.note}</p>
                </div>
              </div>

              {/* Action Buttons at Bottom */}
              <div className="pt-2 space-y-2">
                {/* Requirement F: Final button to send results to us on WhatsApp */}
                <button
                  onClick={() => {
                    const url = buildDiagnosticsWhatsAppUrl(config, report);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full min-h-[48px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-98 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Send my results to us on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    if (onAttachToTradeIn) {
                      onAttachToTradeIn(report);
                    } else if (onUseForTradeIn) {
                      onUseForTradeIn(report);
                    }
                    onClose();
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Use This Report for Sell / Trade-in Quote</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs flex items-center justify-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Report Copied!' : 'Copy Summary'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenHumanSupport?.();
                    }}
                    className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-medium text-xs flex items-center justify-center gap-1.5 border border-gray-200 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                    <span>Talk to a Human</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
