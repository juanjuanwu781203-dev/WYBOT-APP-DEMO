import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Bluetooth,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Signal,
  Wifi,
  X,
} from 'lucide-react';
import { StatusBar } from './StatusBar';

const SKY_BLUE = '#00C2FF';
const GREEN = '#22C55E';

type SetupStep = 'station' | 'docking' | 'bt-scan' | 'complete';

/** Progress step indicator */
function StepBar({ step }: { step: SetupStep }) {
  const steps: { key: SetupStep | 'robot'; label: string; hint: string }[] = [
    { key: 'station', label: 'Station', hint: 'Online' },
    { key: 'robot', label: 'Robot', hint: 'Bind' },
    { key: 'complete', label: 'Ready', hint: 'Use' },
  ];

  const activeIndex =
    step === 'station' ? 0 : step === 'docking' || step === 'bt-scan' ? 1 : 2;
  const progress = ((activeIndex + 1) / steps.length) * 100;

  return (
    <div className="mx-4 mb-3 mt-1 rounded-[22px] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(0,128,255,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[#111827]">Setup progress</span>
        <span className="rounded-full bg-[#EAF8FF] px-2 py-0.5 text-[10px] font-semibold text-[#0080FF]">
          Step {activeIndex + 1}/3
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E6F3FA]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #00C2FF 0%, #0080FF 100%)',
          }}
        />
      </div>
      <div className="relative flex items-start justify-between">
        <div className="absolute left-[34px] right-[34px] top-[13px] h-[3px] rounded-full bg-[#E6F3FA]" />
        <div
          className="absolute left-[34px] top-[13px] h-[3px] rounded-full transition-all duration-300"
          style={{
            width: activeIndex === 0 ? '0%' : activeIndex === 1 ? '50%' : 'calc(100% - 68px)',
            background: 'linear-gradient(90deg, #00C2FF 0%, #0080FF 100%)',
          }}
        />
        {steps.map((s, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div key={s.key} className="relative z-10 flex w-[72px] flex-col items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: done
                    ? '#EAF8FF'
                    : active
                    ? 'linear-gradient(180deg, #00C2FF 0%, #0080FF 100%)'
                    : '#F4F7FA',
                  color: done ? '#0080FF' : active ? '#FFFFFF' : '#A6B0BA',
                  boxShadow: active ? '0 6px 14px rgba(0,128,255,0.22)' : 'none',
                }}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: i <= activeIndex ? '#111827' : '#A6B0BA' }}
              >
                {s.label}
              </span>
              <span className="text-[9px] leading-none text-[#A6B0BA]">{s.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Connection icon, matching the device page status style */
function ConnPill({
  icon: Icon,
  label,
  connected,
}: {
  icon: React.ElementType;
  label: string;
  connected: boolean;
}) {
  return (
    <div
      className="flex items-center"
      aria-label={label}
      title={label}
    >
      <Icon
        size={17}
        strokeWidth={2.5}
        className={connected ? 'text-[#2555D1]' : 'text-[#9CA3AF]'}
        aria-hidden
      />
    </div>
  );
}

/** Mock BT device list item */
const BT_DEVICES = [
  { id: 'c3pro-a1b2', name: 'C3PRO-A1B2', signal: 3 },
  { id: 'c3pro-c3d4', name: 'C3PRO-C3D4', signal: 2 },
  { id: 'c3pro-e5f6', name: 'C3PRO-E5F6', signal: 1 },
];

interface C3ProSetupPageProps {
  robotImage: string;
  onBack: () => void;
  onComplete: () => void;
}

export const C3ProSetupPage = ({ robotImage, onBack, onComplete }: C3ProSetupPageProps) => {
  const [step, setStep] = useState<SetupStep>('station');
  const [pairingId, setPairingId] = useState<string | null>(null);
  const [bindingError, setBindingError] = useState<string | null>(null);
  const [dockProgress, setDockProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Docking auto-detect: ramp progress 0→100 over ~3 s, then complete */
  useEffect(() => {
    if (step !== 'docking') {
      setDockProgress(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setDockProgress(0);
    timerRef.current = setInterval(() => {
      setDockProgress((prev) => {
        const next = prev + 2.5;
        if (next >= 100) {
          clearInterval(timerRef.current!);
          setTimeout(() => setStep('complete'), 400);
          return 100;
        }
        return next;
      });
    }, 75);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  /** BT pairing simulation */
  const handleBtSelect = (id: string) => {
    setBindingError(null);
    setPairingId(id);
    setTimeout(() => {
      setPairingId(null);
      const device = BT_DEVICES.find((item) => item.id === id);
      if (device?.signal === 1) {
        setBindingError('Binding failed. Move the robot closer, wake it up, then try again.');
        return;
      }
      setStep('complete');
    }, 1500);
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBindingError(null);
    setPairingId(null);
    setStep('station');
  };

  const handleStartDocking = () => {
    setBindingError(null);
    setStep('docking');
  };

  const handleStartBluetooth = () => {
    setBindingError(null);
    setStep('bt-scan');
  };

  const stationConnected = true;
  const robotConnected = step === 'complete';

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#F5F6F8]">
      <StatusBar time="14:50" battery="61%" />

      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-4 pb-1 pt-0">
        <button type="button" onClick={onBack} className="p-0.5" aria-label="返回">
          <ArrowLeft size={22} strokeWidth={2} className="text-[#111827]" />
        </button>
        <span className="flex-1 text-[16px] font-semibold text-[#111827]">Add WYBOT C3PRO</span>
      </div>

      {/* Step bar */}
      <StepBar step={step} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 pb-4">
        {step !== 'bt-scan' && (
          <>

        {/* Station card */}
        <div
          className="flex shrink-0 items-center gap-3 rounded-[18px] bg-white p-4 transition-all"
          style={{
            boxShadow: stationConnected
              ? `0 0 0 2px ${GREEN}22, 0 4px 14px rgba(0,0,0,0.06)`
              : '0 4px 14px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[16px]"
            style={{ background: 'linear-gradient(180deg, #EAF8FF 0%, #F7FCFF 100%)' }}
          >
            <div className="absolute bottom-2 h-2 w-10 rounded-full bg-[#00C2FF]/20" />
            <img
              src={robotImage}
              alt="Charging station"
              className="relative z-10 max-h-[42px] max-w-[46px] object-contain"
              draggable={false}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-semibold text-[#111827]">Charging Station</span>
              <div
                className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: stationConnected ? '#DCFCE7' : '#F3F4F6' }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: stationConnected ? GREEN : '#9CA3AF' }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: stationConnected ? '#15803D' : '#6B7280' }}
                >
                  {stationConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Pulsing docking ring indicator */}
            {step === 'docking' && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${dockProgress}%`, background: SKY_BLUE }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <ConnPill icon={Wifi} label="WiFi" connected />
              <ConnPill icon={Bluetooth} label="BT" connected />
            </div>
          </div>
        </div>

        {/* Robot setup card */}
        <div
          className="flex shrink-0 flex-col gap-3 rounded-[22px] bg-white p-4 transition-all"
          style={{
            border: robotConnected ? `1px solid ${GREEN}44` : '1px solid #E7EDF3',
            boxShadow: robotConnected
              ? '0 8px 24px rgba(34,197,94,0.12)'
              : '0 10px 26px rgba(15,23,42,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[18px]"
              style={{ background: robotConnected ? '#EBF8FF' : '#F6F9FC' }}
            >
              <img
                src={robotImage}
                alt="C3PRO Robot"
                className="max-h-[48px] max-w-[48px] object-contain transition-all"
                style={{ opacity: robotConnected ? 1 : 0.48 }}
                draggable={false}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#111827]">Robot</span>
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: robotConnected ? '#DCFCE7' : bindingError ? '#FEF2F2' : '#F3F4F6' }}
                >
                  {step === 'docking' || pairingId ? (
                    <Loader2 size={10} strokeWidth={2.5} className="animate-spin text-[#6B7280]" />
                  ) : (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: robotConnected ? GREEN : bindingError ? '#EF4444' : '#D1D5DB' }}
                    />
                  )}
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: robotConnected ? '#15803D' : bindingError ? '#B91C1C' : '#6B7280' }}
                  >
                    {step === 'docking'
                      ? 'Detecting...'
                      : pairingId
                      ? 'Pairing...'
                      : robotConnected
                      ? 'Online'
                      : bindingError
                      ? 'Binding failed'
                      : 'Not added'}
                  </span>
                </div>
              </div>

              {robotConnected ? (
                <div className="flex flex-wrap gap-1.5">
                  <ConnPill icon={Wifi} label="WiFi" connected />
                  <ConnPill icon={Bluetooth} label="BT" connected />
                </div>
              ) : (
                <span className="text-[11px] text-[#64748B]">
                  {step === 'docking'
                    ? 'Keep the robot seated on the charging station.'
                    : 'Add your robot to complete the smart home setup.'}
                </span>
              )}
            </div>
          </div>

          {!robotConnected && (
            <div className="rounded-[18px] bg-[#F7FAFC] p-3">
              {bindingError && (
                <div className="mb-3 rounded-[14px] bg-[#FEF2F2] px-3 py-2 text-[11px] leading-snug text-[#B91C1C]">
                  {bindingError}
                </div>
              )}

              {step === 'docking' && (
                <div className="mb-3 rounded-[14px] bg-white px-3 py-2">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-[#64748B]">
                    <span>Auto detecting</span>
                    <span>{Math.round(dockProgress)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full transition-all duration-75"
                      style={{ width: `${dockProgress}%`, background: SKY_BLUE }}
                    />
                  </div>
                  {dockProgress > 55 && (
                    <p className="mt-2 text-[11px] leading-snug text-[#F97316]">
                      Still not detected? Make sure the robot is powered on and aligned with the station contacts.
                    </p>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-[#111827]">Add robot</div>
                  <div className="text-[10px] text-[#94A3B8]">Choose the method that matches what you are doing now.</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleStartDocking}
                  className="flex w-full items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition-opacity active:opacity-80"
                  style={{
                    background: step === 'docking' ? '#F0FAFF' : '#FFFFFF',
                    borderColor: step === 'docking' ? SKY_BLUE : '#E7EDF3',
                    boxShadow: step === 'docking' ? '0 6px 16px rgba(0,194,255,0.14)' : '0 2px 8px rgba(15,23,42,0.04)',
                  }}
                >
                  <div
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
                    style={{
                      background: step === 'docking' ? 'linear-gradient(180deg, #DDF6FF 0%, #F7FCFF 100%)' : '#EAF8FF',
                    }}
                  >
                    <div className="absolute bottom-1.5 h-1.5 w-7 rounded-full bg-[#00C2FF]/20" />
                    <img
                      src={robotImage}
                      alt=""
                      className="relative z-10 max-h-8 max-w-8 object-contain"
                      draggable={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#111827]">Dock on charging station</span>
                      <span className="rounded-full bg-[#EAF8FF] px-1.5 py-0.5 text-[9px] font-semibold text-[#0080FF]">
                        Recommended
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-[#64748B]">
                      Place C3PRO on the station. The station will identify the robot and finish binding automatically.
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#A6B0BA]" />
                </button>
                <button
                  type="button"
                  onClick={handleStartBluetooth}
                  className="flex w-full items-center gap-3 rounded-[16px] border bg-white px-3 py-3 text-left transition-opacity active:opacity-80"
                  style={{
                    borderColor: '#E7EDF3',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                    style={{
                      background: '#EAF8FF',
                    }}
                  >
                    <Bluetooth size={18} strokeWidth={2} style={{ color: SKY_BLUE }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#111827]">Search via Bluetooth</div>
                    <div className="mt-0.5 text-[10px] leading-snug text-[#64748B]">
                      Use this when the robot is nearby but not on the station. Keep Bluetooth on and select the robot name.
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-[#A6B0BA]" />
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* ---- Step-specific content ---- */}

        {/* STATION STEP — add robot options */}
        {step === 'station' && null}

        {/* DOCKING STEP — animated wait */}
        {step === 'docking' && (
          <div className="flex shrink-0 flex-col items-center gap-4 pt-2">
            {/* Pulsing ring animation */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute h-20 w-20 animate-ping rounded-full opacity-20"
                style={{ background: SKY_BLUE }}
              />
              <div
                className="absolute h-14 w-14 animate-ping rounded-full opacity-15"
                style={{ background: SKY_BLUE, animationDelay: '0.5s' }}
              />
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${SKY_BLUE}22`, border: `2px solid ${SKY_BLUE}` }}
              >
                <Loader2 size={22} strokeWidth={2} style={{ color: SKY_BLUE }} className="animate-spin" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[14px] font-semibold text-[#111827]">Waiting for robot...</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Place your robot on the charging station.
                <br />
                The app will detect it automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-[13px] font-medium text-[#6B7280] transition-opacity active:opacity-70"
              style={{ background: '#F3F4F6' }}
            >
              <X size={14} strokeWidth={2} />
              Cancel
            </button>
          </div>
        )}

        {/* BT SCAN STEP */}
        {step === 'bt-scan' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Scan header */}
            <div className="flex shrink-0 items-center justify-between pb-2 pt-1">
              <div className="flex items-center gap-2">
                <Loader2 size={14} strokeWidth={2.5} style={{ color: SKY_BLUE }} className="animate-spin" />
                <span className="text-[13px] font-semibold text-[#111827]">Scanning for robots...</span>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[12px] font-medium text-[#6B7280] transition-opacity active:opacity-70"
              >
                Back
              </button>
            </div>

            <div className="mb-3 shrink-0 rounded-[18px] bg-white p-4 shadow-[0_8px_22px_rgba(0,128,255,0.08)]">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
                  style={{ background: 'linear-gradient(180deg, #00C2FF 0%, #0080FF 100%)' }}
                >
                  <Bluetooth size={21} strokeWidth={2.2} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-[#111827]">Select your C3PRO</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                    Keep the robot awake and nearby. Choose the name shown on the robot label.
                  </div>
                </div>
              </div>
            </div>

            {/* Device list */}
            <div className="min-h-0 flex-1 overflow-y-auto pb-2">
              {BT_DEVICES.map((device) => {
                const isPairing = pairingId === device.id;
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => !pairingId && handleBtSelect(device.id)}
                    disabled={!!pairingId}
                    className="flex w-full items-center gap-3 rounded-[14px] bg-white p-3.5 mb-2 text-left transition-opacity active:opacity-80 disabled:opacity-60"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ background: '#EFF6FF' }}
                    >
                      <Bluetooth size={18} strokeWidth={2} className="text-[#2555D1]" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[14px] font-semibold text-[#111827]">{device.name}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="rounded-sm"
                            style={{
                              width: 4,
                              height: 4 + i * 3,
                              background: i < device.signal ? '#2555D1' : '#D1D5DB',
                            }}
                          />
                        ))}
                        <span className="ml-1 text-[10px] text-[#9CA3AF]">
                          {device.signal === 3 ? 'Strong' : device.signal === 2 ? 'Medium' : 'Weak'}
                        </span>
                      </div>
                    </div>
                    {isPairing ? (
                      <Loader2 size={18} strokeWidth={2} style={{ color: SKY_BLUE }} className="shrink-0 animate-spin" />
                    ) : (
                      <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-[#9CA3AF]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* COMPLETE STEP */}
        {step === 'complete' && (
          <div className="flex shrink-0 flex-col items-center gap-4 pt-2">
            {/* Success icon */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute h-20 w-20 rounded-full opacity-15"
                style={{ background: GREEN }}
              />
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: '#DCFCE7', border: `2px solid ${GREEN}` }}
              >
                <CheckCircle2 size={28} strokeWidth={2} style={{ color: GREEN }} />
              </div>
            </div>

            <div className="text-center">
              <p className="text-[17px] font-bold text-[#111827]">C3PRO is Ready!</p>
              <p className="mt-1 text-[12px] text-[#6B7280]">
                Both your station and robot are connected
                <br />
                and ready for daily cleaning.
              </p>
            </div>

            {/* Connection summary */}
            <div className="w-full rounded-[14px] bg-white px-4 py-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {[
                { label: 'Charging Station', detail: 'WiFi · BT' },
                { label: 'Robot', detail: 'WiFi · BT' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 first:border-b first:border-[#F3F4F6]">
                  <span className="text-[13px] text-[#374151]">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#9CA3AF]">{row.detail}</span>
                    <div
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: GREEN }}
                    >
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="w-full rounded-[16px] py-4 text-[15px] font-semibold text-white transition-opacity active:opacity-80"
              style={{
                background: SKY_BLUE,
                boxShadow: '0 4px 14px rgba(0,194,255,0.35)',
              }}
            >
              Start Using C3PRO
              <Signal size={16} strokeWidth={2} className="ml-2 inline-block" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
