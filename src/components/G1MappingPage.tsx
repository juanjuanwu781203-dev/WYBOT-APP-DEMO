import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowLeft,
  Battery,
  Bluetooth,
  Camera,
  CheckCircle2,
  Eraser,
  Hand,
  Loader2,
  Map,
  MapPin,
  Pause,
  Play,
  Radar,
  RotateCcw,
  Route,
  ShieldCheck,
  Signal,
  Trash2,
  Wifi,
  Zap,
} from 'lucide-react';
import { StatusBar } from './StatusBar';
import { LandscapeShell, RemotePad } from './RemoteMappingShared';

type AreaType = 'mowing' | 'nogo' | 'passage' | 'recharge';
type MappingMode = 'select' | 'remote-start' | 'auto' | 'manual' | 'dock-route' | 'closure' | 'complete' | 'edit';
type PendingMode = 'auto' | 'manual';
type StartPoint = 'current' | 'lawn-edge' | 'custom';
type EraseSource = 'auto' | 'manual';

interface G1MappingPageProps {
  onBack: () => void;
  onMappingComplete: () => void;
  onMappingEditComplete?: () => void;
  initialAreaType?: AreaType;
  onLandscapeChange: (landscape: boolean) => void;
}

const AREA_TYPE_LABELS: Record<AreaType, string> = {
  mowing: 'Mowing area',
  nogo: 'No-Go zone',
  passage: 'Passage',
  recharge: 'Dock route',
};

const STATUS_ITEMS: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: 'Battery', value: '68%', icon: Battery },
  { label: 'Bluetooth', value: 'Connected', icon: Bluetooth },
  { label: 'Wi-Fi', value: 'Connected', icon: Wifi },
  { label: '4G', value: 'Online', icon: Signal },
  { label: 'Rain sensor', value: 'Dry', icon: AlertCircle },
  { label: 'LiDAR / Camera', value: 'Ready', icon: Camera },
];

const FAILURE_ALERTS: Array<{ label: string; title: string; message: string; action: string; icon: LucideIcon }> = [
  {
    label: 'Boundary',
    title: 'Boundary recognition failed',
    message: 'No valid lawn boundary was found. You can continue scanning or switch to manual mapping to record the boundary.',
    action: 'Manual mapping',
    icon: AlertCircle,
  },
  {
    label: 'Battery',
    title: 'Battery too low',
    message: 'G1Pro needs enough battery to complete mapping. Place the robot on the charging dock and try again after charging.',
    action: 'Go to charge',
    icon: Battery,
  },
  {
    label: 'Bluetooth',
    title: 'Bluetooth disconnected',
    message: 'Keep your phone near G1Pro and make sure Bluetooth is enabled. Mapping cannot start until Bluetooth reconnects.',
    action: 'Reconnect',
    icon: Bluetooth,
  },
  {
    label: 'Wi-Fi',
    title: 'Wi-Fi not connected',
    message: 'G1Pro must stay connected to a 2.4GHz Wi-Fi network for mapping status, alerts, and logs.',
    action: 'Set Wi-Fi',
    icon: Wifi,
  },
  {
    label: '4G',
    title: '4G signal unavailable',
    message: 'The 4G connection is unavailable. Move G1Pro to an open area or use Wi-Fi before starting mapping.',
    action: 'Check signal',
    icon: Signal,
  },
  {
    label: 'Rain sensor',
    title: 'Rain detected',
    message: 'Rain is detected. For safety and map accuracy, mapping is paused until the robot and lawn are dry.',
    action: 'Try later',
    icon: AlertCircle,
  },
  {
    label: 'LiDAR / Camera',
    title: 'Sensor view blocked',
    message: 'Clean the LiDAR and camera windows, then make sure the dock area is free of leaves, grass clippings, and dust.',
    action: 'Clean sensors',
    icon: Camera,
  },
];

const MANUAL_STEPS: Array<{ key: AreaType; title: string; desc: string; color: string; icon: LucideIcon }> = [
  { key: 'mowing', title: 'Mowing area', desc: 'Record and close the lawn boundary. One map supports up to 5 mowing areas.', color: '#4CAF50', icon: Map },
  { key: 'nogo', title: 'No-Go zone', desc: 'Mark pool, steps, flower beds, and risky boundaries.', color: '#EF4444', icon: ShieldCheck },
  { key: 'passage', title: 'Passage', desc: 'Connect separated lawn areas or garage-to-lawn routes.', color: '#2196F3', icon: Route },
  { key: 'recharge', title: 'Dock route', desc: 'Verify the route back to the charging dock.', color: '#FF9800', icon: Zap },
];

export const G1MappingPage = ({
  onBack,
  onMappingComplete,
  onMappingEditComplete,
  initialAreaType,
  onLandscapeChange,
}: G1MappingPageProps) => {
  const [mode, setMode] = useState<MappingMode>(initialAreaType ? 'edit' : 'select');
  const [pendingMode, setPendingMode] = useState<PendingMode>('auto');
  const [startPoint, setStartPoint] = useState<StartPoint>('current');
  const [showStatusMask, setShowStatusMask] = useState(false);
  const [showStartMask, setShowStartMask] = useState(false);
  const [showDockChargeMask, setShowDockChargeMask] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showBoundaryWarning, setShowBoundaryWarning] = useState(false);
  const [activeMappingAlert, setActiveMappingAlert] = useState(0);
  const [showManualAlert, setShowManualAlert] = useState(false);
  const [activeManualAlert, setActiveManualAlert] = useState(1);
  const [showManualClosureConfirm, setShowManualClosureConfirm] = useState(false);
  const [manualStep, setManualStep] = useState(0);
  const [manualAreaIndex, setManualAreaIndex] = useState(1);
  const [manualStartConfirmed, setManualStartConfirmed] = useState(true);
  const [manualProgress, setManualProgress] = useState(0);
  const [eraseSource, setEraseSource] = useState<EraseSource>('auto');
  const [showEraseFlow, setShowEraseFlow] = useState(false);
  const [eraseStage, setEraseStage] = useState<'start' | 'end' | 'confirm'>('start');
  const [eraseProgress, setEraseProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetName, setDeleteTargetName] = useState('Mowing area 1');
  const [dockRouteStage, setDockRouteStage] = useState<'start' | 'driving'>('start');
  const [dockRouteProgress, setDockRouteProgress] = useState(0);
  const [showDockRouteConfirm, setShowDockRouteConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      onLandscapeChange(false);
    };
  }, [onLandscapeChange]);

  useEffect(() => {
    const shouldLandscape = mode === 'auto' || mode === 'manual' || mode === 'dock-route' || mode === 'remote-start' || mode === 'complete' || mode === 'edit';
    onLandscapeChange(shouldLandscape);
  }, [mode, onLandscapeChange]);

  useEffect(() => {
    if (mode !== 'auto' || isPaused) return;
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 2, 100);
        if (next === 56) setShowBoundaryWarning(true);
        if (next >= 100 && timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimeout(() => {
            onLandscapeChange(false);
            setMode('closure');
          }, 350);
        }
        return next;
      });
    }, 120);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [mode, isPaused, onLandscapeChange]);

  const chooseMode = (nextMode: PendingMode) => {
    setPendingMode(nextMode);
    setShowDockChargeMask(true);
  };

  const proceedFromDockCharge = () => {
    setShowDockChargeMask(false);
    setShowStatusMask(true);
  };

  const beginMapping = () => {
    setShowStartMask(false);
    if (pendingMode === 'auto') {
      setProgress(0);
      setIsPaused(false);
      setShowBoundaryWarning(false);
      setMode('auto');
      onLandscapeChange(true);
      return;
    }
    setManualStep(0);
    setManualAreaIndex(1);
    setManualStartConfirmed(true);
    setManualProgress(0);
    setShowManualAlert(false);
    setShowManualClosureConfirm(false);
    setMode('manual');
    onLandscapeChange(true);
  };

  const openRemoteStart = (point: StartPoint) => {
    setStartPoint(point);
    setShowStartMask(false);
    setMode('remote-start');
    onLandscapeChange(true);
  };

  const openManualEntry = (step: number) => {
    if (step === 3) {
      setDockRouteStage('start');
      setDockRouteProgress(0);
      setShowDockRouteConfirm(false);
      setMode('dock-route');
      onLandscapeChange(true);
      return;
    }
    setManualStep(step);
    if (step !== 0) setManualAreaIndex(1);
    setManualStartConfirmed(step === 2);
    setManualProgress(0);
    setShowManualAlert(false);
    setShowManualClosureConfirm(false);
    setMode('manual');
    onLandscapeChange(true);
  };

  const openEraseFlow = (source: EraseSource) => {
    setEraseSource(source);
    setEraseStage('start');
    setEraseProgress(0);
    setShowEraseFlow(true);
  };

  const applyErase = () => {
    if (eraseSource === 'auto') {
      setProgress((prev) => Math.max(prev - Math.max(eraseProgress, 18), 0));
    } else {
      setManualProgress((prev) => Math.max(prev - Math.max(eraseProgress, 18), 0));
      setShowManualClosureConfirm(false);
    }
    setShowEraseFlow(false);
  };

  const confirmDeleteContour = () => {
    setProgress(0);
    setManualProgress(0);
    setShowBoundaryWarning(false);
    setShowManualAlert(false);
    setShowManualClosureConfirm(false);
    setShowEraseFlow(false);
    setShowDeleteConfirm(false);
    setMode('select');
    setShowStatusMask(false);
    setShowStartMask(true);
  };

  const openDeleteConfirm = (targetName = 'Mowing area 1') => {
    setDeleteTargetName(targetName);
    setShowDeleteConfirm(true);
  };

  if (mode === 'edit' && initialAreaType) {
    return (
      <LandscapeShell
        title={`Set ${AREA_TYPE_LABELS[initialAreaType]}`}
        onBack={() => {
          onLandscapeChange(false);
          onMappingEditComplete?.();
        }}
      >
        <RemoteCanvas areaType={initialAreaType} />
        <RemotePad
          note={`Move the robot along the ${AREA_TYPE_LABELS[initialAreaType].toLowerCase()} boundary.`}
          buttonText="Done"
          onConfirm={() => {
            onLandscapeChange(false);
            onMappingEditComplete?.();
          }}
        />
      </LandscapeShell>
    );
  }

  if (mode === 'remote-start') {
    return (
      <LandscapeShell
        title={startPoint === 'custom' ? 'Move to custom start point' : 'Move to lawn edge'}
        onBack={() => {
          setMode('select');
          setShowStartMask(true);
          onLandscapeChange(false);
        }}
      >
        <RemoteCanvas startPoint={startPoint} />
        <RemotePad note="Drive G1Pro to the lawn edge, then confirm this position as the mapping start point." buttonText="Set as start point" onConfirm={beginMapping} />
      </LandscapeShell>
    );
  }

  if (mode === 'auto') {
    return (
      <LandscapeShell
        title="Auto mapping"
        onBack={() => {
          setMode('select');
          onLandscapeChange(false);
        }}
        trailing={
          <>
            <button
              onClick={() => {
                setMode('manual');
                setManualStep(0);
                setManualProgress(0);
                onLandscapeChange(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#E0F4FF] px-3 py-1.5 text-[12px] font-semibold text-[#0284C7]"
            >
              <Hand size={14} strokeWidth={2.2} />
              Manual mapping
            </button>
            <MappingToolButton
              icon={Eraser}
              label="Erase"
              onClick={() => openEraseFlow('auto')}
            />
            <MappingToolButton
              icon={Trash2}
              label="Delete"
              onClick={() => openDeleteConfirm('Mowing area 1')}
            />
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
              style={{ background: isPaused ? '#FFF3E0' : '#FEE2E2', color: isPaused ? '#FF9800' : '#EF4444' }}
            >
              {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </>
        }
      >
        <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-[#E8F5E9]">
          <svg width="100%" height="100%" viewBox="0 0 560 270" preserveAspectRatio="xMidYMid meet" fill="none">
            <rect x="24" y="22" width="512" height="226" rx="16" fill="#F7FFF5" stroke="#7EC87F" strokeWidth="2" strokeDasharray="8 5" />
            <path d="M74 73C141 48 236 56 307 83C381 111 467 99 499 146C531 193 461 233 346 225C231 217 104 239 66 185C36 142 32 91 74 73Z" fill="rgba(76,175,80,0.16)" stroke="#4CAF50" strokeWidth="3" strokeDasharray={progress < 80 ? '10 6' : '0'} />
            <path d="M90 88C160 92 214 115 285 112C355 109 434 121 482 153M94 137C165 153 242 151 317 153C382 155 433 171 472 191M111 190C195 201 290 198 395 208" stroke="#00A7E1" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 5" opacity={Math.max(0.15, progress / 100)} />
            <circle cx={88 + progress * 3.8} cy={92 + Math.sin(progress / 8) * 46} r="11" fill="#00C2FF" stroke="white" strokeWidth="4" />
            <rect x="466" y="224" width="58" height="28" rx="6" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
            <text x="495" y="242" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">Dock</text>
            <path d="M430 213C455 222 470 228 485 232" stroke="#FF9800" strokeWidth="2.5" strokeDasharray="6 4" />
          </svg>

          <div className="absolute bottom-3 left-4 right-4 rounded-[14px] bg-white/95 p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#111827]">Mapping progress</span>
              <span className="text-[13px] font-semibold text-[#00A7E1]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#00C2FF]" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#6B7280]">
              <Radar size={14} className="text-[#00A7E1]" />
              Edge distance is about 20cm. Obstacles are bypassed and recorded.
            </div>
          </div>
        </div>

        {showBoundaryWarning && (
          <MappingAlertPanel
            activeIndex={activeMappingAlert}
            onSelect={setActiveMappingAlert}
            onDismiss={() => setShowBoundaryWarning(false)}
            onManual={() => {
              setShowBoundaryWarning(false);
              setMode('manual');
              onLandscapeChange(true);
            }}
          />
        )}

        {showEraseFlow && (
          <EraseRouteFlow
            progress={eraseProgress}
            stage={eraseStage}
            onStageChange={setEraseStage}
            onProgressChange={setEraseProgress}
            onCancel={() => setShowEraseFlow(false)}
            onApply={applyErase}
          />
        )}

        {showDeleteConfirm && (
          <DeleteContourConfirm
            targetName={deleteTargetName}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDeleteContour}
          />
        )}
      </LandscapeShell>
    );
  }

  if (mode === 'manual') {
    const step = MANUAL_STEPS[manualStep];
    return (
      <LandscapeShell
        title="Manual mapping"
        onBack={() => {
          setMode('select');
          onLandscapeChange(false);
        }}
        trailing={
          <>
            <button
              onClick={() => {
                setProgress(Math.max(manualProgress, 8));
                setIsPaused(false);
                setShowBoundaryWarning(false);
                setMode('auto');
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 text-[12px] font-semibold text-[#16A34A]"
            >
              <Radar size={14} strokeWidth={2.2} />
              Auto mapping
            </button>
            <MappingToolButton
              icon={Eraser}
              label="Erase"
              onClick={() => openEraseFlow('manual')}
            />
            <MappingToolButton
              icon={Trash2}
              label="Delete"
              onClick={() => setShowDeleteConfirm(true)}
            />
          </>
        }
      >
        <ManualRemoteCanvas color={step.color} progress={manualProgress} />
        <RemotePad
          note={
            step.key === 'nogo'
              ? manualStartConfirmed
                ? 'Start point set. Remote-control G1Pro around the no-go zone. The app will detect closure automatically.'
                : 'Move G1Pro to the no-go zone start point, then confirm it.'
              : step.key === 'passage'
                ? 'Remote-control G1Pro along the passage between areas.'
                : manualAreaIndex > 1
                  ? manualStartConfirmed
                    ? `Start point set. Remote-control G1Pro along the boundary of mowing area ${manualAreaIndex}.`
                    : `Move G1Pro to the start point for mowing area ${manualAreaIndex}, then confirm it.`
                  : 'Remote-control G1Pro along the lawn boundary. The app will remind you when the robot returns to the start point.'
          }
          buttonText={!manualStartConfirmed && (step.key === 'mowing' || step.key === 'nogo') ? 'Set as start point' : 'Confirm'}
          hideConfirm={manualStartConfirmed || (step.key !== 'mowing' && step.key !== 'nogo')}
          onConfirm={() => setManualStartConfirmed(true)}
          onMove={() => {
            if (!manualStartConfirmed) return;
            setManualProgress((prev) => {
              const next = Math.min(prev + 12, 100);
              if (next >= 48 && next < 72) setShowManualAlert(true);
              if (next >= 100) setShowManualClosureConfirm(true);
              return next;
            });
          }}
        />

        <div className="absolute bottom-3 left-4 right-[244px] rounded-[14px] bg-white/95 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#111827]">
              {step.key === 'nogo'
                ? manualStartConfirmed ? 'No-Go recording' : 'No-Go start point'
                : manualAreaIndex > 1 && step.key === 'mowing'
                  ? manualStartConfirmed ? `Area ${manualAreaIndex} recording` : `Area ${manualAreaIndex} start point`
                  : 'Boundary recording'}
            </span>
            <span className="text-[13px] font-semibold" style={{ color: step.color }}>{manualProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${manualProgress}%`, background: step.color }} />
          </div>
        </div>

        {showManualAlert && (
          <MappingAlertPanel
            activeIndex={activeManualAlert}
            onSelect={setActiveManualAlert}
            onDismiss={() => setShowManualAlert(false)}
            onManual={() => setShowManualAlert(false)}
          />
        )}

        {showManualClosureConfirm && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
            <div className="w-[320px] rounded-[22px] bg-white p-5 text-center shadow-xl">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#E0F4FF]">
                <MapPin size={30} strokeWidth={2.2} className="text-[#00A7E1]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#111827]">Start point detected</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                {step.key === 'nogo'
                  ? 'G1Pro has returned to the no-go zone start point. Close this no-go zone and continue?'
                  : manualAreaIndex > 1 && step.key === 'mowing'
                  ? `G1Pro has returned to the start point of mowing area ${manualAreaIndex}. Close this new area and continue?`
                  : 'G1Pro has returned to the start point. Close this boundary and continue?'}
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowManualClosureConfirm(false)} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
                  Continue
                </button>
                <button
                  onClick={() => {
                    setShowManualClosureConfirm(false);
                    setMode('complete');
                  }}
                  className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white"
                >
                  Close boundary
                </button>
              </div>
            </div>
          </div>
        )}

        {showEraseFlow && (
          <EraseRouteFlow
            progress={eraseProgress}
            stage={eraseStage}
            onStageChange={setEraseStage}
            onProgressChange={setEraseProgress}
            onCancel={() => setShowEraseFlow(false)}
            onApply={applyErase}
          />
        )}

        {showDeleteConfirm && (
          <DeleteContourConfirm
            targetName={deleteTargetName}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDeleteContour}
          />
        )}
      </LandscapeShell>
    );
  }

  if (mode === 'dock-route') {
    return (
      <LandscapeShell
        title="Dock route"
        onBack={() => {
          setMode('complete');
          onLandscapeChange(false);
        }}
      >
        <RemoteCanvas areaType="recharge" dockRouteProgress={dockRouteProgress} />
        <RemotePad
          note={
            dockRouteStage === 'start'
              ? 'Set the current position as the return-to-dock route start point.'
              : 'Use the direction pad to draw the return route back to the charging dock.'
          }
          buttonText="Set route start"
          onConfirm={() => {
            if (dockRouteStage === 'start') {
              setDockRouteStage('driving');
              setDockRouteProgress(18);
              return;
            }
          }}
          onMove={
            dockRouteStage === 'driving'
              ? () => {
                  setDockRouteProgress((prev) => {
                    const next = Math.min(prev + 14, 100);
                    if (next >= 100) setShowDockRouteConfirm(true);
                    return next;
                  });
                }
              : undefined
          }
          hideConfirm={dockRouteStage === 'driving'}
        />

        <div className="absolute bottom-3 left-4 right-[244px] rounded-[14px] bg-white/95 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#111827]">
              {dockRouteStage === 'start' ? 'Route start point' : 'Return route recording'}
            </span>
            <span className="text-[13px] font-semibold text-[#FF9800]">{dockRouteProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <div className="h-full rounded-full bg-[#FF9800] transition-all duration-300" style={{ width: `${dockRouteProgress}%` }} />
          </div>
        </div>

        {showDockRouteConfirm && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
            <div className="w-[320px] rounded-[22px] bg-white p-5 text-center shadow-xl">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#FFF3E0]">
                <Zap size={30} strokeWidth={2} className="text-[#FF9800]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#111827]">Dock area detected</h3>
              <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                G1Pro is near the initial self-calibration position. Complete the return-to-dock route setup?
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowDockRouteConfirm(false)} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
                  Continue
                </button>
                <button
                  onClick={() => {
                    onLandscapeChange(false);
                    onMappingComplete();
                  }}
                  className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </LandscapeShell>
    );
  }

  if (mode === 'closure') {
    return (
      <PortraitShell title="Close boundary" onBack={() => setMode('select')}>
        <div className="flex flex-1 flex-col px-5 pt-5">
          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <div className="relative h-[270px] bg-[#E8F5E9]">
              <svg width="100%" height="100%" viewBox="0 0 335 270" fill="none">
                <rect width="335" height="270" fill="#E8F5E9" />
                <path d="M56 64C92 35 160 39 207 58C258 79 292 118 274 169C255 225 171 230 105 208C49 189 15 116 56 64Z" fill="rgba(76,175,80,0.16)" stroke="#4CAF50" strokeWidth="3" strokeDasharray="8 6" />
                <path d="M72 74C108 54 167 55 209 74C251 93 269 130 257 166C242 209 166 214 111 194C70 179 39 111 72 74Z" stroke="#00A7E1" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 6" />
                <circle cx="72" cy="74" r="12" fill="#00C2FF" stroke="white" strokeWidth="4" />
                <circle cx="76" cy="78" r="22" fill="none" stroke="#00C2FF" strokeWidth="2" strokeDasharray="5 5" />
                <path d="M103 88C94 81 85 77 76 78" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
                <rect x="208" y="212" width="58" height="28" rx="7" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
                <text x="237" y="230" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">Dock</text>
              </svg>
            </div>
            <div className="p-5 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#E0F4FF]">
                <MapPin size={30} strokeWidth={2.2} className="text-[#00A7E1]" />
              </div>
              <h2 className="text-[20px] font-semibold text-[#111827]">Start point detected</h2>
              <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
                G1Pro has returned to the mapping start point. Close the boundary to save this lawn outline.
              </p>
            </div>
          </div>

          <div className="mt-auto mb-5 flex gap-3">
            <button
              onClick={() => {
                setMode('manual');
                onLandscapeChange(true);
              }}
              className="flex-1 rounded-[14px] bg-white py-3 text-[14px] font-semibold text-[#6B7280] shadow-sm"
            >
              Continue mapping
            </button>
            <button onClick={() => setMode('complete')} className="flex-1 rounded-[14px] bg-[#00C2FF] py-3 text-[14px] font-semibold text-white">
              Close boundary
            </button>
          </div>
        </div>
      </PortraitShell>
    );
  }

  if (mode === 'complete') {
    return (
      <LandscapeShell
        title="Create map"
        onBack={() => {
          setMode('closure');
          onLandscapeChange(false);
        }}
        trailing={
          <div className="flex items-center gap-2 rounded-[12px] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#111827] shadow-sm">
            <Battery size={15} strokeWidth={2} className="text-[#111827]" />
            68%
          </div>
        }
      >
        <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[18px] bg-white">
          <svg width="100%" height="100%" viewBox="0 0 560 270" preserveAspectRatio="xMidYMid meet" fill="none">
            <rect width="560" height="270" fill="#FFFFFF" />
            <path d="M162 21C224 11 337 21 389 72C445 127 410 214 321 239C233 264 108 223 82 147C58 76 91 32 162 21Z" fill="#CFF6DF" stroke="#B9EBD0" strokeWidth="2" />
            <path d="M136 74C178 48 279 53 337 88C402 126 389 192 312 211C233 231 135 199 112 145C98 112 105 92 136 74Z" fill="rgba(76,175,80,0.18)" stroke="#4CAF50" strokeWidth="3" />
            <path d="M142 84C190 104 254 114 325 110M135 132C203 151 284 155 350 173" stroke="#7EC87F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 6" />
            <circle cx="142" cy="84" r="10" fill="#00C2FF" stroke="white" strokeWidth="4" />
            <path d="M142 84C200 133 295 176 438 211" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 6" />
            <rect x="430" y="198" width="62" height="30" rx="7" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
            <text x="461" y="217" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">Dock</text>
            <foreignObject x="24" y="18" width="220" height="44">
              <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#111827] shadow-sm">
                Boundary closed. Set dock route next.
              </div>
            </foreignObject>
          </svg>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-[18px] bg-white/95 p-2 shadow-[0_6px_24px_rgba(15,23,42,0.12)]">
            <MapEditTool icon={Trash2} label="Delete" onClick={() => openDeleteConfirm('Mowing area 1')} />
            <MapEditTool icon={ShieldCheck} label="No-Go" onClick={() => openManualEntry(1)} />
            <MapEditTool
              icon={Map}
              label="Area"
              onClick={() => {
                setManualAreaIndex(2);
                setManualStartConfirmed(false);
                openManualEntry(0);
              }}
            />
            <MapEditTool icon={Route} label="Passage" onClick={() => openManualEntry(2)} />
            <MapEditTool
              icon={RotateCcw}
              label="Reset"
              onClick={() => {
                setMode('closure');
                onLandscapeChange(false);
              }}
            />
          </div>
        </div>

        <div className="flex w-64 flex-col justify-center px-4">
          <div className="rounded-[18px] bg-white p-4 shadow-sm">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#FFF3E0]">
              <Zap size={26} strokeWidth={2} className="text-[#FF9800]" />
            </div>
            <h3 className="text-[18px] font-semibold text-[#111827]">Set dock route</h3>
            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
              Guide G1Pro from the lawn boundary back to the charging dock before generating the map.
            </p>
            <button onClick={() => openManualEntry(3)} className="mt-5 w-full rounded-full bg-[#D9C490] py-3 text-[15px] font-semibold text-[#6B4E16]">
              Set dock route
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <DeleteContourConfirm
            targetName={deleteTargetName}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDeleteContour}
          />
        )}
      </LandscapeShell>
    );
  }

  return (
    <PortraitShell title="Start mapping" onBack={onBack}>
      <div className="flex-1 overflow-auto px-5 pb-5">
        <div className="rounded-[24px] bg-gradient-to-br from-[#0F2A1B] via-[#1F6F3C] to-[#90D786] p-5 text-white shadow-[0_16px_36px_rgba(31,111,60,0.22)]">
          <h2 className="text-[24px] font-semibold">Create lawn map</h2>
          <p className="mt-2 text-[13px] leading-5 text-white/78">Choose a mapping mode. Status and start position will be confirmed in guided masks.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <MiniStatus icon={Battery} label="68%" />
            <MiniStatus icon={Bluetooth} label="BT" />
            <MiniStatus icon={Wifi} label="Wi-Fi" />
            <MiniStatus icon={Signal} label="4G" />
          </div>
        </div>

        <button onClick={() => chooseMode('auto')} className="mt-4 w-full rounded-[22px] bg-white p-5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.08)] active:opacity-90">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E0F4FF]">
              <Zap size={24} strokeWidth={2} className="text-[#00C2FF]" />
            </div>
            <div>
              <div className="text-[16px] font-semibold text-[#111827]">Auto mapping</div>
              <div className="mt-1 text-[13px] leading-5 text-[#6B7280]">Best for clear boundaries and simple yards. Switch to manual if boundary detection fails.</div>
            </div>
          </div>
        </button>

        <button onClick={() => chooseMode('manual')} className="mt-4 w-full rounded-[22px] bg-white p-5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.08)] active:opacity-90">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFF3E0]">
              <Hand size={24} strokeWidth={2} className="text-[#FF9800]" />
            </div>
            <div>
              <div className="text-[16px] font-semibold text-[#111827]">Manual mapping</div>
              <div className="mt-1 text-[13px] leading-5 text-[#6B7280]">Use remote control to record areas, no-go zones, passages, and dock route.</div>
            </div>
          </div>
        </button>
      </div>

      {showStatusMask && (
        <StatusMask
          onClose={() => setShowStatusMask(false)}
          onConfirm={() => {
            setShowStatusMask(false);
            setShowStartMask(true);
          }}
        />
      )}

      {showStartMask && (
        <StartPointMask
          onRemote={openRemoteStart}
          onClose={() => setShowStartMask(false)}
        />
      )}

      {showDockChargeMask && (
        <DockChargeMask
          pendingMode={pendingMode}
          onClose={() => setShowDockChargeMask(false)}
          onConfirm={proceedFromDockCharge}
        />
      )}
    </PortraitShell>
  );
};

function PortraitShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="relative flex h-[812px] w-[375px] flex-col bg-[#F5F6F8]">
      <StatusBar time="14:49" battery="61%" variant="dark" />
      <div className="flex items-center px-4 py-3">
        <button onClick={onBack} className="p-1" aria-label="返回">
          <ArrowLeft size={24} strokeWidth={2} className="text-[#000000]" />
        </button>
        <span className="flex-1 text-center text-[17px] font-semibold text-[#000000]">{title}</span>
        <div className="w-7" />
      </div>
      {children}
    </div>
  );
}

function MappingToolButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#374151] shadow-sm"
    >
      <Icon size={14} strokeWidth={2.2} />
      {label}
    </button>
  );
}

function MapEditTool({ icon: Icon, label, disabled = false, onClick }: { icon: LucideIcon; label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex min-w-[66px] flex-col items-center gap-1 rounded-[12px] px-3 py-2 text-[11px] font-semibold text-[#111827] disabled:opacity-45"
    >
      <Icon size={22} strokeWidth={2} />
      {label}
    </button>
  );
}

function EraseRouteFlow({
  progress,
  stage,
  onStageChange,
  onProgressChange,
  onCancel,
  onApply,
}: {
  progress: number;
  stage: 'start' | 'end' | 'confirm';
  onStageChange: (stage: 'start' | 'end' | 'confirm') => void;
  onProgressChange: (progress: number) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const title = stage === 'start' ? 'Set erase start point' : stage === 'end' ? 'Remote to erase end point' : 'Confirm erase segment';
  const note = stage === 'start'
    ? 'Move G1Pro to the beginning of the path segment to erase, then confirm the start point.'
    : stage === 'end'
      ? 'Remote-control along the previously recorded contour. The robot will check whether this segment belongs to an existing path.'
      : 'The selected segment overlaps a recorded contour. Confirm to erase this part of the path.';

  return (
    <div className="absolute inset-0 z-50 flex bg-black/35">
      <div className="m-4 flex flex-1 overflow-hidden rounded-[20px] bg-white shadow-xl">
        <div className="relative flex-1 bg-[#F3FBF5]">
          <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
            <rect width="520" height="270" fill="#F3FBF5" />
            <path d="M74 73C141 48 236 56 307 83C381 111 467 99 499 146C531 193 461 233 346 225C231 217 104 239 66 185C36 142 32 91 74 73Z" fill="rgba(76,175,80,0.12)" stroke="#4CAF50" strokeWidth="3" strokeDasharray="10 6" />
            <path d="M92 93C160 90 232 110 294 119C358 129 427 134 470 168" stroke="#9ADBEF" strokeWidth="4" strokeLinecap="round" strokeDasharray="9 7" />
            <path d="M150 99C200 108 256 116 314 124" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${Math.max(progress * 2.2, 1)} 260`} opacity={stage === 'start' ? 0.25 : 0.85} />
            <circle cx="150" cy="99" r="11" fill="#EF4444" stroke="white" strokeWidth="4" />
            <text x="150" y="126" textAnchor="middle" fill="#DC2626" fontSize="11" fontWeight="700">Start</text>
            {stage !== 'start' && (
              <>
                <circle cx={150 + progress * 1.65} cy={99 + progress * 0.25} r="11" fill="#00C2FF" stroke="white" strokeWidth="4" />
                <text x={150 + progress * 1.65} y={126 + progress * 0.25} textAnchor="middle" fill="#0284C7" fontSize="11" fontWeight="700">End</text>
              </>
            )}
          </svg>
          <div className="absolute bottom-3 left-4 right-4 rounded-[14px] bg-white/95 p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#111827]">Erase segment</span>
              <span className="text-[13px] font-semibold text-[#EF4444]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#FEE2E2]">
              <div className="h-full rounded-full bg-[#EF4444] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex w-64 flex-col justify-center px-4">
          <div className="mb-4">
            <div className="text-[12px] font-semibold text-[#EF4444]">Erase path</div>
            <h3 className="mt-1 text-[17px] font-semibold text-[#111827]">{title}</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#6B7280]">{note}</p>
          </div>
          <div className="rounded-[14px] bg-[#FFF7ED] px-3 py-2 text-[12px] leading-5 text-[#9A3412]">
            The robot will explore and verify that the selected segment is part of an existing contour before erasing.
          </div>
          {stage === 'end' && (
            <div className="mt-4">
              <RemotePad
                note="Use the direction pad to move along the segment to erase."
                buttonText="Set end point"
                onConfirm={() => onStageChange('confirm')}
                onMove={() => onProgressChange(Math.min(progress + 16, 100))}
              />
            </div>
          )}
          {stage !== 'end' && (
            <div className="mt-5 flex gap-3">
              <button onClick={onCancel} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[13px] font-semibold text-[#6B7280]">
                Cancel
              </button>
              {stage === 'start' ? (
                <button onClick={() => onStageChange('end')} className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[13px] font-semibold text-white">
                  Set start
                </button>
              ) : (
                <button onClick={onApply} className="flex-1 rounded-[12px] bg-[#EF4444] py-2.5 text-[13px] font-semibold text-white">
                  Erase
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteContourConfirm({ targetName, onCancel, onConfirm }: { targetName: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
      <div className="w-[320px] rounded-[22px] bg-white p-5 text-center shadow-xl">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#FEE2E2]">
          <Trash2 size={30} strokeWidth={2} className="text-[#EF4444]" />
        </div>
        <h3 className="text-[17px] font-semibold text-[#111827]">Delete {targetName}?</h3>
        <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">
          This created area will be deleted. After confirmation, you will return to start-point setup and create the contour again.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-[12px] bg-[#EF4444] py-2.5 text-[14px] font-semibold text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const MAPPING_ALERTS = FAILURE_ALERTS.slice(0, 6);

function MappingAlertPanel({
  activeIndex,
  onSelect,
  onDismiss,
  onManual,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
  onDismiss: () => void;
  onManual: () => void;
}) {
  const active = MAPPING_ALERTS[activeIndex] ?? MAPPING_ALERTS[0];
  const ActiveIcon = active.icon;
  const isManualAction = active.label === 'Boundary';

  return (
    <div className="w-60 pr-4">
      <div className="rounded-[18px] bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
            <AlertCircle size={17} className="text-[#F59E0B]" />
            Exception alerts
          </div>
          <button onClick={onDismiss} className="rounded-full bg-[#F3F4F6] px-2 py-1 text-[10px] font-semibold text-[#6B7280]">
            Hide
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {MAPPING_ALERTS.map((alert, index) => (
            <button
              key={alert.label}
              onClick={() => onSelect(index)}
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${index === activeIndex ? 'bg-[#E0F4FF] text-[#0284C7]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}
            >
              {alert.label}
            </button>
          ))}
        </div>

        <div className="rounded-[14px] bg-[#FFF7ED] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
              <ActiveIcon size={18} strokeWidth={2} className="text-[#F97316]" />
            </span>
            <h3 className="text-[13px] font-semibold leading-4 text-[#111827]">{active.title}</h3>
          </div>
          <p className="text-[11px] leading-4 text-[#6B7280]">{active.message}</p>
          <button
            onClick={isManualAction ? onManual : onDismiss}
            className="mt-3 w-full rounded-full bg-[#FF9800] py-2 text-[12px] font-semibold text-white"
          >
            {active.action}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusMask({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [checkedCount, setCheckedCount] = useState(0);
  const [showFailureList, setShowFailureList] = useState(false);
  const [previewAlert, setPreviewAlert] = useState<(typeof FAILURE_ALERTS)[number] | null>(null);
  const isComplete = checkedCount >= STATUS_ITEMS.length;
  const activeItem = STATUS_ITEMS[Math.min(checkedCount, STATUS_ITEMS.length - 1)];

  useEffect(() => {
    if (isComplete) return;
    const timer = window.setTimeout(() => {
      setCheckedCount((prev) => Math.min(prev + 1, STATUS_ITEMS.length));
    }, checkedCount === 0 ? 450 : 520);
    return () => window.clearTimeout(timer);
  }, [checkedCount, isComplete]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-6">
      <div className="w-full rounded-[24px] bg-white p-5 shadow-xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-[#E0F4FF]">
            {isComplete ? (
              <CheckCircle2 size={34} strokeWidth={2.2} className="text-[#16A34A]" />
            ) : (
              <Loader2 size={34} strokeWidth={2.2} className="animate-spin text-[#00A7E1]" />
            )}
          </div>
          <h3 className="text-[18px] font-semibold text-[#111827]">
            {isComplete ? 'Ready to map' : 'Checking machine status'}
          </h3>
          <p className="mt-1 text-[12px] text-[#6B7280]">
            {isComplete ? 'All required conditions are normal.' : `Checking ${activeItem.label.toLowerCase()}...`}
          </p>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#00A7E1] transition-all duration-500"
            style={{ width: `${(checkedCount / STATUS_ITEMS.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2.5">
          {STATUS_ITEMS.map((item, index) => {
            const ItemIcon = item.icon;
            const done = index < checkedCount;
            const active = index === checkedCount && !isComplete;
            return (
              <div key={item.label} className="flex items-center justify-between rounded-[14px] bg-[#F9FAFB] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[13px] font-medium text-[#111827]">
                  <ItemIcon size={17} strokeWidth={2} className={done ? 'text-[#16A34A]' : active ? 'text-[#00A7E1]' : 'text-[#9CA3AF]'} />
                  {item.label}
                </span>
                <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${done ? 'text-[#16A34A]' : active ? 'text-[#00A7E1]' : 'text-[#9CA3AF]'}`}>
                  {done ? <CheckCircle2 size={15} strokeWidth={2.2} /> : active ? <Loader2 size={15} strokeWidth={2.2} className="animate-spin" /> : <span className="h-[15px] w-[15px] rounded-full border border-[#D1D5DB]" />}
                  {done ? item.value : active ? 'Checking' : 'Waiting'}
                </span>
              </div>
            );
          })}
        </div>

        {!isComplete && (
          <div className="mt-3 rounded-[14px] bg-[#F0F9FF] px-3 py-2 text-[12px] leading-5 text-[#0369A1]">
            Mapping can start after battery, connection, rain sensor, and perception checks pass.
          </div>
        )}

        {isComplete && (
          <div className="mt-3 rounded-[14px] bg-[#ECFDF5] px-3 py-2 text-[12px] leading-5 text-[#166534]">
            Self-check passed. Continue to choose the mapping start position.
          </div>
        )}

        <button
          onClick={() => setShowFailureList(true)}
          className="mt-3 w-full rounded-[12px] border border-[#E0F2FE] bg-white py-2 text-[12px] font-semibold text-[#0284C7]"
        >
          View failed-check reminders
        </button>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!isComplete}
            className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white disabled:bg-[#C7DFF0] disabled:text-white/80"
          >
            Continue
          </button>
        </div>
      </div>

      {showFailureList && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full rounded-[22px] bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-[16px] font-semibold text-[#111827]">Failed-check reminders</h4>
                <p className="mt-0.5 text-[11px] text-[#6B7280]">Tap an item to preview the alert.</p>
              </div>
              <button onClick={() => setShowFailureList(false)} className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] font-semibold text-[#6B7280]">
                Close
              </button>
            </div>
            <div className="space-y-2">
              {FAILURE_ALERTS.map((alert) => {
                const AlertIcon = alert.icon;
                return (
                  <button
                    key={alert.label}
                    onClick={() => setPreviewAlert(alert)}
                    className="flex w-full items-center gap-3 rounded-[14px] bg-[#F9FAFB] px-3 py-2.5 text-left active:opacity-90"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFF7ED]">
                      <AlertIcon size={17} strokeWidth={2} className="text-[#F97316]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-[#111827]">{alert.title}</span>
                      <span className="block truncate text-[11px] text-[#6B7280]">{alert.message}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {previewAlert && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 px-7">
          <div className="w-full rounded-[22px] bg-white p-5 text-center shadow-xl">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#FFF7ED]">
              <previewAlert.icon size={30} strokeWidth={2} className="text-[#F97316]" />
            </div>
            <h4 className="text-[17px] font-semibold text-[#111827]">{previewAlert.title}</h4>
            <p className="mt-2 text-[13px] leading-5 text-[#6B7280]">{previewAlert.message}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setPreviewAlert(null)} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">
                Close
              </button>
              <button onClick={() => setPreviewAlert(null)} className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white">
                {previewAlert.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StartPointMask({
  onRemote,
  onClose,
}: {
  onRemote: (point: StartPoint) => void;
  onClose: () => void;
}) {
  const [dockStep, setDockStep] = useState<'exiting' | 'calibrating' | 'done'>('exiting');
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  useEffect(() => {
    if (dockStep === 'exiting') {
      const timer = window.setTimeout(() => setDockStep('calibrating'), 1500);
      return () => window.clearTimeout(timer);
    }
    if (dockStep === 'calibrating') {
      setCalibrationProgress(0);
      const timer = window.setInterval(() => {
        setCalibrationProgress((prev) => {
          const next = Math.min(prev + 20, 100);
          if (next >= 100) {
            window.clearInterval(timer);
            window.setTimeout(() => setDockStep('done'), 250);
          }
          return next;
        });
      }, 260);
      return () => window.clearInterval(timer);
    }
  }, [dockStep]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-6">
      <div className="w-full rounded-[24px] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#00A7E1]">Step 1 / 2</div>
            <h3 className="mt-1 text-[18px] font-semibold text-[#111827]">
              {dockStep === 'exiting' && 'Leaving the dock'}
              {dockStep === 'calibrating' && 'Self-calibrating'}
              {dockStep === 'done' && 'Ready for start point'}
            </h3>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#E0F4FF]">
            {dockStep === 'done' ? (
              <CheckCircle2 size={24} strokeWidth={2.2} className="text-[#16A34A]" />
            ) : (
              <Loader2 size={24} strokeWidth={2.2} className="animate-spin text-[#00A7E1]" />
            )}
          </div>
        </div>

        <DockExitSketch progress={dockStep} />

        <div className="mt-4 rounded-[16px] bg-[#F8FAFC] p-4">
          <div className="text-[15px] font-semibold text-[#111827]">
            {dockStep === 'exiting' && 'G1Pro is driving out'}
            {dockStep === 'calibrating' && 'Calibrating direction'}
            {dockStep === 'done' && 'Self-calibration complete'}
          </div>
          <p className="mt-1 text-[12px] leading-5 text-[#6B7280]">
            {dockStep === 'exiting' && 'The robot will leave the charging dock automatically. No manual action is needed.'}
            {dockStep === 'calibrating' && 'Please wait while the robot checks direction and positioning.'}
            {dockStep === 'done' && 'Next, remote-control the robot to the lawn edge and set that position as the start point.'}
          </p>
          {dockStep === 'calibrating' && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-[#0284C7]">
                <span>Self-calibration</span>
                <span>{calibrationProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#DCEBFA]">
                <div className="h-full rounded-full bg-[#00A7E1] transition-all duration-300" style={{ width: `${calibrationProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">Cancel</button>
          <button
            onClick={() => onRemote('lawn-edge')}
            disabled={dockStep !== 'done'}
            className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white disabled:bg-[#C7DFF0]"
          >
            Remote control
          </button>
        </div>
      </div>
    </div>
  );
}

function DockExitSketch({ progress }: { progress: 'exiting' | 'calibrating' | 'done' }) {
  const robotX = progress === 'exiting' ? 152 : 186;
  return (
    <div className="relative h-[178px] overflow-hidden rounded-[20px] bg-[#F3FBF5]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[length:22px_22px]" />
      <svg viewBox="0 0 295 178" className="relative h-full w-full" role="img" aria-label="Robot exits the charging dock">
        <path d="M38 70H116V114H38Z" fill="#E8F5EA" stroke="#7BC384" strokeWidth="2" />
        <path d="M38 70V114" stroke="#65A76D" strokeWidth="7" strokeLinecap="round" />
        <text x="77" y="136" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="700">Dock</text>

        <path d="M112 92H226" stroke="#00A7E1" strokeWidth="3" strokeLinecap="round" strokeDasharray="7 7" />
        <path d="M214 82L230 92L214 102" fill="none" stroke="#00A7E1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        <g style={{ transform: `translateX(${robotX - 118}px)`, transition: 'transform 700ms ease' }}>
          <rect x="108" y="73" width="68" height="38" rx="18" fill="#111827" />
          <rect x="116" y="81" width="52" height="22" rx="11" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" />
          <circle cx="126" cy="92" r="5" fill="#0F172A" stroke="#9CA3AF" strokeWidth="1.8" />
          <circle cx="158" cy="92" r="5" fill="#0F172A" stroke="#9CA3AF" strokeWidth="1.8" />
          <path d="M137 80H153" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        </g>

        {progress === 'calibrating' && (
          <>
            <circle cx="242" cy="92" r="18" fill="#E0F4FF" stroke="#00A7E1" strokeWidth="2" strokeDasharray="5 4" />
            <path d="M242 79V92L251 99" stroke="#00A7E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {progress === 'done' && (
          <g>
            <circle cx="242" cy="92" r="18" fill="#DCFCE7" />
            <path d="M234 92L240 98L252 85" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
    </div>
  );
}

function DockChargeMask({
  pendingMode,
  onClose,
  onConfirm,
}: {
  pendingMode: PendingMode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // 'checking' 检测中 / 'on-dock' 在桩 / 'off-dock' 不在桩
  const [status, setStatus] = useState<'checking' | 'on-dock' | 'off-dock'>('checking');

  useEffect(() => {
    // 模拟检测：机器目前在充电桩上
    const timer = window.setTimeout(() => setStatus('on-dock'), 900);
    return () => window.clearTimeout(timer);
  }, []);

  // 检测到在桩 → 直接进入下一步
  useEffect(() => {
    if (status !== 'on-dock') return;
    const timer = window.setTimeout(() => onConfirm(), 700);
    return () => window.clearTimeout(timer);
  }, [status, onConfirm]);

  const modeLabel = pendingMode === 'auto' ? '自动建图' : '手动建图';

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 px-6">
      <div className="w-full rounded-[24px] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#00A7E1]">建图前检测</div>
            <h3 className="mt-1 text-[18px] font-semibold text-[#111827]">机器是否在充电桩</h3>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: status === 'off-dock' ? '#FEE2E2' : '#FFF3E0' }}>
            {status === 'on-dock' ? (
              <CheckCircle2 size={24} strokeWidth={2.2} className="text-[#16A34A]" />
            ) : status === 'off-dock' ? (
              <AlertCircle size={24} strokeWidth={2.2} className="text-[#EF4444]" />
            ) : (
              <Loader2 size={24} strokeWidth={2.2} className="animate-spin text-[#FF9800]" />
            )}
          </div>
        </div>

        {/* 充电桩 + 机器插图 */}
        <div className="relative h-[150px] overflow-hidden rounded-[20px] bg-[#F3FBF5]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(rgba(34,197,94,0.08)_1px,transparent_1px)] bg-[length:22px_22px]" />
          <svg viewBox="0 0 295 150" className="relative h-full w-full" role="img" aria-label="机器在充电桩">
            <path d="M70 50H148V98H70Z" fill="#E8F5EA" stroke="#7BC384" strokeWidth="2" />
            <path d="M70 50V98" stroke="#65A76D" strokeWidth="6" strokeLinecap="round" />
            <text x="109" y="120" textAnchor="middle" fill="#166534" fontSize="11" fontWeight="700">充电桩</text>
            {/* 机器：在桩时贴在桩口，不在桩时移到远处并虚化 */}
            <g style={{ opacity: status === 'off-dock' ? 0.4 : 1, transform: status === 'off-dock' ? 'translateX(40px)' : 'translateX(0)', transition: 'all 500ms ease' }}>
              <rect x="150" y="54" width="64" height="36" rx="16" fill="#111827" />
              <rect x="158" y="61" width="48" height="22" rx="11" fill="#1F2937" stroke="#4B5563" strokeWidth="1.5" />
              <circle cx="167" cy="72" r="4.5" fill="#0F172A" stroke="#9CA3AF" strokeWidth="1.6" />
              <circle cx="197" cy="72" r="4.5" fill="#0F172A" stroke="#9CA3AF" strokeWidth="1.6" />
            </g>
            {status === 'on-dock' && (
              <g>
                <circle cx="232" cy="72" r="16" fill="#DCFCE7" />
                <path d="M224 72L230 78L242 65" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            {status === 'off-dock' && (
              <g>
                <circle cx="250" cy="72" r="16" fill="#FEE2E2" />
                <path d="M250 64V76" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
                <circle cx="250" cy="82" r="1.6" fill="#EF4444" />
              </g>
            )}
          </svg>
        </div>

        <div className="mt-4 rounded-[14px] p-3" style={{ background: status === 'off-dock' ? '#FEF2F2' : '#F8FAFC' }}>
          <div className="flex items-center justify-between text-[12px] font-semibold">
            <span className="text-[#111827]">充电桩检测</span>
            <span className={status === 'on-dock' ? 'text-[#16A34A]' : status === 'off-dock' ? 'text-[#EF4444]' : 'text-[#FF9800]'}>
              {status === 'on-dock' ? '在桩' : status === 'off-dock' ? '不在桩' : '检测中…'}
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-5" style={{ color: status === 'off-dock' ? '#B91C1C' : '#6B7280' }}>
            {status === 'off-dock'
              ? `未检测到机器在充电桩。请将机器放回充电桩后再开始${modeLabel}。`
              : `${modeLabel}需机器从充电桩出发。检测到机器在桩，即将进入下一步。`}
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-[12px] bg-[#F3F4F6] py-2.5 text-[14px] font-semibold text-[#6B7280]">取消</button>
          {status === 'off-dock' ? (
            <button
              onClick={() => setStatus('checking')}
              className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white"
            >
              已放回，重新检测
            </button>
          ) : (
            <button
              onClick={onConfirm}
              disabled={status === 'checking'}
              className="flex-1 rounded-[12px] bg-[#00A7E1] py-2.5 text-[14px] font-semibold text-white disabled:bg-[#C7DFF0] disabled:text-white/80"
            >
              {status === 'on-dock' ? '立即继续' : '检测中…'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStatus({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-[14px] bg-white/18 px-2 py-2 text-[12px] font-semibold backdrop-blur">
      <Icon size={16} strokeWidth={2.2} className="mx-auto mb-1" />
      {label}
    </div>
  );
}

function RemoteCanvas({ startPoint, areaType, dockRouteProgress = 0 }: { startPoint?: StartPoint; areaType?: AreaType; dockRouteProgress?: number }) {
  const label = areaType ? AREA_TYPE_LABELS[areaType] : startPoint === 'custom' ? 'Custom start' : 'Lawn edge';
  const routeEndX = 120 + dockRouteProgress * 0.65;
  const routeEndY = 60 + dockRouteProgress * 1.72;
  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[16px] bg-[#E8F5E9]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        <rect x="24" y="22" width="472" height="226" rx="14" fill="#F7FFF5" stroke="#7EC87F" strokeWidth="2" strokeDasharray="8 5" />
        <rect x="48" y="40" width="72" height="38" rx="6" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x="84" y="64" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">Dock</text>
        <path d="M190 72C258 48 386 77 420 137C454 197 366 229 254 216C143 203 106 125 190 72Z" fill="rgba(76,175,80,0.16)" stroke="#4CAF50" strokeWidth="2.5" />
        {areaType === 'recharge' ? (
          <>
            <path d="M120 60C154 96 180 150 185 232" stroke="#FF9800" strokeWidth="3" strokeDasharray="7 5" opacity="0.35" />
            <path d={`M120 60C154 96 ${routeEndX} ${routeEndY} ${routeEndX} ${routeEndY}`} stroke="#FF9800" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="7 5" />
            <circle cx={routeEndX} cy={routeEndY} r="11" fill="#00C2FF" stroke="white" strokeWidth="4" />
          </>
        ) : (
          <>
            <path d="M120 60C146 78 158 94 185 108" stroke="#FF9800" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="185" cy="108" r="11" fill="#00C2FF" stroke="white" strokeWidth="4" />
          </>
        )}
        <circle cx={areaType === 'recharge' ? 120 : 278} cy={areaType === 'nogo' ? 156 : 110} r="9" fill="#FF9800" stroke="white" strokeWidth="3" />
        <text x={areaType === 'recharge' ? 120 : 278} y={areaType === 'nogo' ? 181 : 135} textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="700">{label}</text>
      </svg>
    </div>
  );
}

function ManualRemoteCanvas({ color, progress }: { color: string; progress: number }) {
  const robotX = progress < 25 ? 92 + progress * 2.2 : progress < 55 ? 147 + (progress - 25) * 2.9 : progress < 82 ? 234 - (progress - 55) * 3.5 : 140 - (progress - 82) * 2.7;
  const robotY = progress < 25 ? 105 : progress < 55 ? 105 + (progress - 25) * 1.8 : progress < 82 ? 159 + (progress - 55) * 0.9 : 183 - (progress - 82) * 4.3;

  return (
    <div className="relative mx-4 my-2 flex-1 overflow-hidden rounded-[16px] bg-[#E8F5E9]">
      <svg width="100%" height="100%" viewBox="0 0 520 270" preserveAspectRatio="xMidYMid meet" fill="none">
        <rect x="24" y="22" width="472" height="226" rx="14" fill="#F7FFF5" stroke="#7EC87F" strokeWidth="2" strokeDasharray="8 5" />
        <path d="M92 105H250V184H92Z" fill="rgba(76,175,80,0.14)" stroke="#4CAF50" strokeWidth="2.5" strokeDasharray="8 6" />
        <path
          d="M92 105H250V184H92V105"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(progress * 4.8, 1)} 500`}
        />
        <circle cx="92" cy="105" r="12" fill="#00C2FF" stroke="white" strokeWidth="4" />
        <circle cx="92" cy="105" r="24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeDasharray="5 5" />
        <circle cx={robotX} cy={robotY} r="11" fill="#111827" stroke="white" strokeWidth="4" />
        <text x="92" y="142" textAnchor="middle" fill="#0284C7" fontSize="11" fontWeight="700">Start</text>
        <rect x="362" y="190" width="58" height="28" rx="7" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
        <text x="391" y="208" textAnchor="middle" fill="#E65100" fontSize="10" fontWeight="700">Dock</text>
      </svg>
    </div>
  );
}

