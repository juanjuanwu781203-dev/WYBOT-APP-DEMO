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
import { ExpertModePage } from './components/ExpertModePage';
import { DevicePoolSetupPage } from './components/DevicePoolSetupPage';

import {
  DEVICE_CONTROL_CONFIG,
  S3_CONTROL_PLACEHOLDER_IMAGES,
  type DeviceControlModel,
} from './config/deviceControlModels';
import poolDiamondThumb from './assets/pools/pool-diamond.png.png';

export type { DeviceControlModel };

/** 设计稿尺寸；在浏览器中按比例缩小以适配可视区域（含移动端地址栏） */
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
  | 'expert-mode'
  | 'device-pool-setup';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [showAbout, setShowAbout] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'user'>('home');
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
  });
  const [deviceControlModel, setDeviceControlModel] = useState<DeviceControlModel>('c2pv');

  const goMain = () => setPage('main');
  const openDeviceControl = (model: DeviceControlModel) => {
    setDeviceControlModel(model);
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
    else if (page === 'device-pool-setup') setPage('device-control');
    else if (page === 'cycle-timer') setPage('device-control');
    else if (page === 'device-information') setPage('device-control');
    else if (page === 'expert-mode') setPage('device-control');
  };
  
  const handleSetLater = () => setPage('pool-setup');
  const handleSelectNetwork = (_network: string) => setPage('pool-setup');
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
        className="relative overflow-hidden rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
        style={{
          width: DESIGN_W * frameScale,
          height: DESIGN_H * frameScale,
          background: '#F7F7F7',
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden rounded-[40px]"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${frameScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="relative h-[812px] w-[375px] overflow-hidden bg-[#F7F7F7]">
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
                onSelectDevice={goSelectNetwork}
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
              />
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
