import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginPage } from './components/LoginPage';
import { MainPage } from './components/MainPage';
import { SelectDevicePage } from './components/SelectDevicePage';
import { SelectNetworkPage } from './components/SelectNetworkPage';
import { ProfilePage } from './components/ProfilePage';
import { PoolSetupPage } from './components/PoolSetupPage';
import { GeneralPage } from './components/GeneralPage';
import { NoticePage } from './components/NoticePage';
import { AboutModal } from './components/AboutModal';
import { AddPoolPage } from './components/AddPoolPage';
import { DeviceControlPage } from './components/DeviceControlPage';
import { S2SolarVisionControlPage } from './components/S2SolarVisionControlPage';
import { S3ControlPage } from './components/S3ControlPage';
import { CycleTimerPage, type CycleTimerFrequency } from './components/CycleTimerPage';
import { DeviceInformationPage } from './components/DeviceInformationPage';
import { AfterSalesVerificationPage } from './components/AfterSalesVerificationPage';
import { ExpertModePage } from './components/ExpertModePage';
import { DevicePoolSetupPage } from './components/DevicePoolSetupPage';
import { U1ControlPage } from './components/U1ControlPage';
import { RemoteControlPage } from './components/RemoteControlPage';
import { G1InitializationPage } from './components/G1InitializationPage';
import { G1DevicePage } from './components/G1DevicePage';
import { G1MappingPage } from './components/G1MappingPage';
import { G1MapAreaPage, type G1MapAreaType } from './components/G1MapAreaPage';
import { G1SchedulePage } from './components/G1SchedulePage';
import { G1MowingParametersPage } from './components/G1MowingParametersPage';
import { G1MapManagementPage } from './components/G1MapManagementPage';
import { G1NoGoSetupPage } from './components/G1NoGoSetupPage';
import { G1AreaSettingsPage } from './components/G1AreaSettingsPage';
import { G1PassageSetupPage } from './components/G1PassageSetupPage';
import { G1DockRouteSetupPage } from './components/G1DockRouteSetupPage';
import { G1RemoteControlPage } from './components/G1RemoteControlPage';
import { G1AntiTheftPage } from './components/G1AntiTheftPage';
import { G1PatrolPage } from './components/G1PatrolPage';
import { G1DeviceInfoPage } from './components/G1DeviceInfoPage';
import { G1WorkLogPage } from './components/G1WorkLogPage';
import { B1DevicePage } from './components/B1DevicePage';
import { C3ProDevicePage } from './components/C3ProDevicePage';
import { C3ProSetupPage } from './components/C3ProSetupPage';
import { C3ProMapSettingsPage } from './components/C3ProMapSettingsPage';
import { C3ProWeeklyCleaningPage } from './components/C3ProWeeklyCleaningPage';
import { C3ProCleaningHistoryPage } from './components/C3ProCleaningHistoryPage';
import { C3ProDockSettingsPage } from './components/C3ProDockSettingsPage';

import {
  DEVICE_CONTROL_CONFIG,
  S3_CONTROL_PLACEHOLDER_IMAGES,
  type DeviceControlModel,
} from './config/deviceControlModels';
import poolDiamondThumb from './assets/pools/pool-diamond.png.png';

export type { DeviceControlModel };

const DESIGN_W = 375;
const DESIGN_H = 812;

function useAppFrameScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      const vw = Math.max(0, (vv?.width ?? window.innerWidth) - 16);
      const vh = Math.max(0, (vv?.height ?? window.innerHeight) - 16);
      setScale(Math.min(1, vw / DESIGN_W, vh / DESIGN_H));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    const vv = window.visualViewport;
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
    };
  }, []);

  return scale;
}

export type Page =
  | 'login'
  | 'main'
  | 'select-device'
  | 'select-network'
  | 'pool-setup'
  | 'add-pool'
  | 'profile'
  | 'general'
  | 'notice'
  | 'feedback'
  | 'help'
  | 'device-control'
  | 'cycle-timer'
  | 'device-information'
  | 'after-sales-verification'
  | 'expert-mode'
  | 'device-pool-setup'
  | 'remote-control'
  | 'g1-initialization'
  | 'g1-device'
  | 'g1-mapping'
  | 'g1-map-area'
  | 'g1-schedule'
  | 'g1-mowing-parameters'
  | 'g1-map-management'
  | 'g1-nogo-setup'
  | 'g1-area-settings'
  | 'g1-passage-setup'
  | 'g1-dock-route-setup'
  | 'g1-remote-control'
  | 'g1-patrol'
  | 'g1-device-information'
  | 'g1-work-log'
  | 'g1-anti-theft'
  | 'b1-device'
  | 'c3pro-device'
  | 'c3pro-setup'
  | 'c3pro-map-settings'
  | 'c3pro-weekly-cleaning'
  | 'c3pro-cleaning-history'
  | 'c3pro-dock-settings';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [showAbout, setShowAbout] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'user'>('home');
  const [landscapeMode, setLandscapeMode] = useState(false);
  const [pools, setPools] = useState([
    { id: 1, name: 'Tile', image: poolDiamondThumb, selected: false },
    { id: 2, name: 'My pool', image: poolDiamondThumb, selected: false },
    { id: 3, name: 'My pool 3', image: poolDiamondThumb, selected: true },
  ]);
  const [addPoolReturnTarget, setAddPoolReturnTarget] = useState<'pool-setup' | 'device-pool-setup'>('pool-setup');
  const [cycleTimerByDevice, setCycleTimerByDevice] = useState<
    Record<DeviceControlModel, CycleTimerFrequency>
  >({
    c2pv: null,
    c1: null,
    s2: null,
    s2sv: null,
    s3: null,
    u1: null,
    g1: null,
    b1: null,
    c3pro: null,
  });
  const [deviceControlModel, setDeviceControlModel] = useState<DeviceControlModel>('c2pv');
  const [setupDeviceModel, setSetupDeviceModel] = useState<string>('');
  const [g1Initialized, setG1Initialized] = useState(false);
  const [g1HasMap, setG1HasMap] = useState(false);
  const [g1MapAreaType, setG1MapAreaType] = useState<G1MapAreaType | undefined>(undefined);
  const [g1MappingReturn, setG1MappingReturn] = useState<'g1-device' | 'g1-map-management'>('g1-device');
  const [c3proReturnToShore, setC3proReturnToShore] = useState(true);

  const frameWidth = landscapeMode ? DESIGN_H : DESIGN_W;
  const frameHeight = landscapeMode ? DESIGN_W : DESIGN_H;

  const goMain = () => setPage('main');
  const openDeviceControl = (model: DeviceControlModel) => {
    setDeviceControlModel(model);
    if (model === 'g1') {
      if (!g1Initialized) {
        setPage('g1-initialization');
      } else {
        setPage('g1-device');
      }
      return;
    }
    if (model === 'b1') {
      setPage('b1-device');
      return;
    }
    if (model === 'c3pro') {
      setPage('c3pro-device');
      return;
    }
    setPage('device-control');
  };

  const cycleTimerFrequency = cycleTimerByDevice[deviceControlModel];
  const cycleTimerActive = cycleTimerFrequency !== null;

  const handleCycleTimerFrequencyChange = (freq: CycleTimerFrequency) => {
    setCycleTimerByDevice((prev) => ({
      ...prev,
      [deviceControlModel]: freq,
    }));
  };
  const goSelectDevice = () => setPage('select-device');
  const goSelectNetwork = () => setPage('select-network');
  const goAddPool = () => {
    setAddPoolReturnTarget('pool-setup');
    setPage('add-pool');
  };
  const goAddPoolFromDevicePoolSetup = () => {
    setAddPoolReturnTarget('device-pool-setup');
    setPage('add-pool');
  };
  const goProfile = () => setPage('profile');
  const goGeneral = () => setPage('general');
  const goNotice = () => setPage('notice');
  const goBack = () => {
    if (page === 'select-device') setPage('main');
    else if (page === 'select-network') setPage('select-device');
    else if (page === 'pool-setup') setPage('select-network');
    else if (page === 'add-pool') setPage(addPoolReturnTarget);
    else if (page === 'profile') {
      setActiveTab('user');
      setPage('main');
    }
    else if (page === 'general') setPage('main');
    else if (page === 'notice') setPage('main');
    else if (page === 'device-control') setPage('main');
    else if (page === 'device-pool-setup') {
      if (deviceControlModel === 'c3pro') setPage('c3pro-device');
      else setPage('device-control');
    }
    else if (page === 'cycle-timer') setPage('device-control');
    else if (page === 'device-information') {
      if (deviceControlModel === 'c3pro') setPage('c3pro-device');
      else setPage('device-control');
    }
    else if (page === 'after-sales-verification') setPage('device-information');
    else if (page === 'expert-mode') setPage('device-control');
    else if (page === 'remote-control') {
      if (deviceControlModel === 'c3pro') setPage('c3pro-device');
      else setPage('device-control');
    }
    else if (page === 'g1-initialization') setPage('main');
    else if (page === 'g1-device') setPage('main');
    else if (page === 'g1-mapping') setPage(g1MappingReturn);
    else if (page === 'g1-map-area') setPage('g1-device');
    else if (page === 'g1-schedule') setPage('g1-device');
    else if (page === 'g1-mowing-parameters') setPage('g1-device');
    else if (page === 'g1-map-management') setPage('g1-device');
    else if (page === 'g1-nogo-setup') setPage('g1-map-management');
    else if (page === 'g1-area-settings') setPage('g1-map-management');
    else if (page === 'g1-passage-setup') setPage('g1-map-management');
    else if (page === 'g1-dock-route-setup') setPage('g1-map-management');
    else if (page === 'g1-remote-control') setPage('g1-device');
    else if (page === 'g1-patrol') setPage('g1-device');
    else if (page === 'g1-device-information') setPage('g1-device');
    else if (page === 'g1-work-log') setPage('g1-device-information');
    else if (page === 'g1-anti-theft') setPage('g1-device-information');
    else if (page === 'b1-device') setPage('main');
    else if (page === 'c3pro-setup') setPage('select-network');
    else if (page === 'c3pro-map-settings') setPage('c3pro-device');
    else if (page === 'c3pro-weekly-cleaning') setPage('c3pro-device');
    else if (page === 'c3pro-cleaning-history') setPage('c3pro-device');
    else if (page === 'c3pro-dock-settings') setPage('c3pro-device');
    else if (page === 'c3pro-device') setPage('main');
  };

  const handleSetLater = () => setPage('pool-setup');
  const handleSelectNetwork = (_network: string) => {
    if (setupDeviceModel === 'WYBOT C3PRO') setPage('c3pro-setup');
    else if (setupDeviceModel === 'WYBOT G1') {
      setDeviceControlModel('g1');
      setPage('g1-initialization');
    }
    else setPage('pool-setup');
  };
  const handleExitAccount = () => setPage('login');
  const handleDeleteAccount = () => setPage('login');
  const handleAddPool = (pool: { name: string; image: string }) => {
    const newPool = {
      id: pools.length + 1,
      name: pool.name,
      image: pool.image,
      selected: true
    };
    setPools([...pools.map(p => ({ ...p, selected: false })), newPool]);
    setPage(addPoolReturnTarget);
  };

  const handleG1Activated = () => {
    setG1Initialized(true);
    setPage('g1-device');
  };

  const handleG1MappingComplete = () => {
    setG1HasMap(true);
    setLandscapeMode(false);
    setPage(g1MappingReturn);
  };

  const handleG1MappingEditComplete = () => {
    setLandscapeMode(false);
    setPage('g1-map-management');
  };

  const handleG1StartMapping = () => {
    setG1MapAreaType(undefined);
    setG1MappingReturn('g1-device');
    setLandscapeMode(false);
    setPage('g1-mapping');
  };

  const handleG1StartNewArea = () => {
    setG1MapAreaType(undefined);
    setG1MappingReturn('g1-map-management');
    setLandscapeMode(false);
    setPage('g1-mapping');
  };

  const deviceControlCfg = DEVICE_CONTROL_CONFIG[deviceControlModel];
  const { showJoinVisionProgram: _omitJoinVisionForControlPage, ...deviceControlPageConfig } =
    deviceControlCfg;

  const frameScale = useAppFrameScale();

  return (
    <div
      className="box-border flex h-dvh min-h-dvh w-full items-center justify-center p-2"
      style={{ background: '#1a1a1a' }}
    >
      <div
        className="relative overflow-hidden rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300"
        style={{
          width: frameWidth * frameScale,
          height: frameHeight * frameScale,
          background: '#F7F7F7',
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden rounded-[40px] transition-all duration-300"
          style={{
            width: landscapeMode ? DESIGN_H : DESIGN_W,
            height: landscapeMode ? DESIGN_W : DESIGN_H,
            transform: `scale(${frameScale})`,
            transformOrigin: landscapeMode ? 'top left' : 'top left',
          }}
        >
          <div className="relative" style={{ width: landscapeMode ? DESIGN_H : DESIGN_W, height: landscapeMode ? DESIGN_W : DESIGN_H, overflow: 'hidden', background: '#F7F7F7' }}>
        <AnimatePresence mode="wait">
          {page === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoginPage onLogin={goMain} />
            </motion.div>
          )}
          {page === 'main' && (
            <motion.div
              key="main"
              className="h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <MainPage
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNotice={goNotice}
                onAddDevice={goSelectDevice}
                onGeneral={goGeneral}
                onFeedback={() => {}}
                onHelp={() => {}}
                onAbout={() => setShowAbout(true)}
                onProfile={goProfile}
                onOpenDeviceControl={openDeviceControl}
              />
            </motion.div>
          )}
          {page === 'select-device' && (
            <motion.div
              key="select-device"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SelectDevicePage
                onBack={goBack}
                onSelectDevice={(model) => {
                  setSetupDeviceModel(model);
                  goSelectNetwork();
                }}
              />
            </motion.div>
          )}
          {page === 'select-network' && (
            <motion.div
              key="select-network"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SelectNetworkPage
                onBack={goBack}
                onSetLater={handleSetLater}
                onSelectNetwork={handleSelectNetwork}
                selectedDeviceModel={setupDeviceModel}
              />
            </motion.div>
          )}
          {page === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProfilePage
                onBack={goBack}
                onExitAccount={handleExitAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            </motion.div>
          )}
          {page === 'pool-setup' && (
            <motion.div
              key="pool-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <PoolSetupPage
                onBack={goBack}
                onAddPool={goAddPool}
                onComplete={goMain}
                pools={pools}
                setPools={setPools}
              />
            </motion.div>
          )}
          {page === 'add-pool' && (
            <motion.div
              key="add-pool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AddPoolPage
                onBack={goBack}
                onAddPool={handleAddPool}
              />
            </motion.div>
          )}
          {page === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <GeneralPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'notice' && (
            <motion.div
              key="notice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <NoticePage onBack={goBack} />
            </motion.div>
          )}
          {page === 'device-control' && (
            <motion.div
              key="device-control"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {deviceControlModel === 's2sv' ? (
                <S2SolarVisionControlPage
                  productImage={DEVICE_CONTROL_CONFIG.s2sv.productImage}
                  onBack={goBack}
                  onOpenDeviceInfo={() => setPage('device-information')}
                  onOpenExpertMode={() => setPage('expert-mode')}
                  onOpenPoolSetup={() => setPage('device-pool-setup')}
                />
              ) : deviceControlModel === 's3' ? (
                <S3ControlPage
                  robotImage={S3_CONTROL_PLACEHOLDER_IMAGES.robot}
                  stationImage={S3_CONTROL_PLACEHOLDER_IMAGES.station}
                  onBack={goBack}
                  onOpenDeviceInfo={() => setPage('device-information')}
                  onOpenMap={() => setPage('device-pool-setup')}
                  onOpenCycleTimer={() => setPage('cycle-timer')}
                  onOpenExpertMode={() => setPage('expert-mode')}
                  cycleTimerActive={cycleTimerActive}
                />
              ) : deviceControlModel === 'u1' ? (
                <U1ControlPage
                  productImage={DEVICE_CONTROL_CONFIG.u1.productImage}
                  onBack={goBack}
                  onOpenDeviceInfo={() => setPage('device-information')}
                  onOpenPoolSetup={() => setPage('device-pool-setup')}
                  onOpenExpertMode={() => setPage('expert-mode')}
                  onOpenRemoteControl={() => setPage('remote-control')}
                />
              ) : (
                <DeviceControlPage
                  {...deviceControlPageConfig}
                  onBack={goBack}
                  onOpenCycleTimer={() => setPage('cycle-timer')}
                  onOpenDeviceInfo={() => setPage('device-information')}
                  onOpenExpertMode={() => setPage('expert-mode')}
                  onOpenPoolSetup={() => setPage('device-pool-setup')}
                  cycleTimerActive={cycleTimerActive}
                />
              )}
            </motion.div>
          )}
          {page === 'cycle-timer' && (
            <motion.div
              key="cycle-timer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CycleTimerPage
                key={deviceControlModel}
                onBack={goBack}
                initialFrequency={cycleTimerFrequency}
                onFrequencyChange={handleCycleTimerFrequencyChange}
              />
            </motion.div>
          )}
          {page === 'device-information' && (
            <motion.div
              key="device-information"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <DeviceInformationPage
                onBack={goBack}
                deviceName={deviceControlCfg.productName}
                showJoinVisionProgram={deviceControlCfg.showJoinVisionProgram}
                showAfterSalesTab={deviceControlModel === 's2'}
                onOpenAfterSales={() => setPage('after-sales-verification')}
              />
            </motion.div>
          )}
          {page === 'after-sales-verification' && (
            <motion.div
              key="after-sales-verification"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AfterSalesVerificationPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'expert-mode' && (
            <motion.div
              key="expert-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ExpertModePage onBack={goBack} />
            </motion.div>
          )}
          {page === 'device-pool-setup' && (
            <motion.div
              key="device-pool-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <DevicePoolSetupPage
                onBack={goBack}
                onAddPool={goAddPoolFromDevicePoolSetup}
                pools={pools}
                setPools={setPools}
              />
            </motion.div>
          )}
          {page === 'remote-control' && (
            <motion.div
              key="remote-control"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <RemoteControlPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'g1-initialization' && (
            <motion.div
              key="g1-initialization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1InitializationPage
                onBack={goBack}
                onActivated={handleG1Activated}
              />
            </motion.div>
          )}
          {page === 'g1-device' && (
            <motion.div
              key="g1-device"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1DevicePage
                onBack={goBack}
                onOpenDeviceInfo={() => setPage('g1-device-information')}
                onOpenMapping={handleG1StartMapping}
                onOpenSchedule={() => setPage('g1-schedule')}
                onOpenMowingParameters={() => setPage('g1-mowing-parameters')}
                onOpenMapManagement={() => setPage('g1-map-management')}
                onOpenPatrol={() => setPage('g1-patrol')}
                onOpenRemoteControl={() => setPage('g1-remote-control')}
                hasMap={g1HasMap}
              />
            </motion.div>
          )}
          {page === 'g1-mapping' && (
            <motion.div
              key="g1-mapping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1MappingPage
                onBack={() => { setLandscapeMode(false); goBack(); }}
                onMappingComplete={handleG1MappingComplete}
                onMappingEditComplete={handleG1MappingEditComplete}
                initialAreaType={g1MapAreaType}
                onLandscapeChange={setLandscapeMode}
              />
            </motion.div>
          )}
          {page === 'g1-map-area' && (
            <motion.div
              key="g1-map-area"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1MapAreaPage
                onBack={goBack}
                areaType={g1MapAreaType || 'mowing'}
              />
            </motion.div>
          )}
          {page === 'g1-schedule' && (
            <motion.div
              key="g1-schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1SchedulePage onBack={goBack} />
            </motion.div>
          )}
          {page === 'g1-mowing-parameters' && (
            <motion.div
              key="g1-mowing-parameters"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1MowingParametersPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'g1-map-management' && (
            <motion.div
              key="g1-map-management"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1MapManagementPage
                onBack={goBack}
                onOpenNoGoSetup={() => setPage('g1-nogo-setup')}
                onOpenAreaSettings={() => setPage('g1-area-settings')}
                onStartNewArea={handleG1StartNewArea}
                onOpenPassageSetup={() => setPage('g1-passage-setup')}
                onOpenDockRouteSetup={() => setPage('g1-dock-route-setup')}
              />
            </motion.div>
          )}
          {page === 'g1-nogo-setup' && (
            <motion.div
              key="g1-nogo-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1NoGoSetupPage onBack={goBack} onLandscapeChange={setLandscapeMode} />
            </motion.div>
          )}
          {page === 'g1-area-settings' && (
            <motion.div
              key="g1-area-settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1AreaSettingsPage onBack={goBack} onLandscapeChange={setLandscapeMode} />
            </motion.div>
          )}
          {page === 'g1-passage-setup' && (
            <motion.div
              key="g1-passage-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1PassageSetupPage onBack={goBack} onLandscapeChange={setLandscapeMode} />
            </motion.div>
          )}
          {page === 'g1-dock-route-setup' && (
            <motion.div
              key="g1-dock-route-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1DockRouteSetupPage onBack={goBack} onLandscapeChange={setLandscapeMode} />
            </motion.div>
          )}
          {page === 'g1-remote-control' && (
            <motion.div
              key="g1-remote-control"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1RemoteControlPage onBack={goBack} onLandscapeChange={setLandscapeMode} />
            </motion.div>
          )}
          {page === 'g1-patrol' && (
            <motion.div
              key="g1-patrol"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1PatrolPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'g1-device-information' && (
            <motion.div
              key="g1-device-information"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1DeviceInfoPage
                onBack={goBack}
                onWorkLog={() => setPage('g1-work-log')}
                onOpenAntiTheft={() => setPage('g1-anti-theft')}
                deviceName="WYBOT G1"
              />
            </motion.div>
          )}
          {page === 'g1-work-log' && (
            <motion.div
              key="g1-work-log"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1WorkLogPage
                onBack={goBack}
              />
            </motion.div>
          )}
          {page === 'g1-anti-theft' && (
            <motion.div
              key="g1-anti-theft"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <G1AntiTheftPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'b1-device' && (
            <motion.div
              key="b1-device"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <B1DevicePage
                onBack={goBack}
                onOpenDeviceInfo={() => setPage('device-information')}
              />
            </motion.div>
          )}
          {page === 'c3pro-setup' && (
            <motion.div
              key="c3pro-setup"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProSetupPage
                robotImage={DEVICE_CONTROL_CONFIG.c3pro.productImage}
                onBack={goBack}
                onComplete={() => {
                  setDeviceControlModel('c3pro');
                  setPage('c3pro-device');
                }}
              />
            </motion.div>
          )}
          {page === 'c3pro-device' && (
            <motion.div
              key="c3pro-device"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProDevicePage
                robotImage={DEVICE_CONTROL_CONFIG.c3pro.productImage}
                onBack={goBack}
                onOpenDeviceInfo={() => setPage('device-information')}
                onOpenPoolSetup={() => setPage('device-pool-setup')}
                onOpenRemoteControl={() => setPage('remote-control')}
                onOpenMapSettings={() => setPage('c3pro-map-settings')}
                onOpenWeeklyCleaning={() => setPage('c3pro-weekly-cleaning')}
                onOpenCleaningHistory={() => setPage('c3pro-cleaning-history')}
                returnToShore={c3proReturnToShore}
                onReturnToShoreChange={setC3proReturnToShore}
              />
            </motion.div>
          )}
          {page === 'c3pro-map-settings' && (
            <motion.div
              key="c3pro-map-settings"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProMapSettingsPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'c3pro-weekly-cleaning' && (
            <motion.div
              key="c3pro-weekly-cleaning"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProWeeklyCleaningPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'c3pro-cleaning-history' && (
            <motion.div
              key="c3pro-cleaning-history"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProCleaningHistoryPage onBack={goBack} />
            </motion.div>
          )}
          {page === 'c3pro-dock-settings' && (
            <motion.div
              key="c3pro-dock-settings"
              className="absolute inset-0 flex min-h-0 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <C3ProDockSettingsPage
                onBack={goBack}
                returnToShore={c3proReturnToShore}
                onReturnToShoreChange={setC3proReturnToShore}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showAbout && (
          <AboutModal onClose={() => setShowAbout(false)} />
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
