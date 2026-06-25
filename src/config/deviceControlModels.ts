import c2pvDevice from '../assets/devices/device_wybot_c2pv.png.png';
import c1Device from '../assets/devices/device_wybot_c1.png.png';
import s2Device from '../assets/devices/device_wybot_s2.png.png';
import s2svDevice from '../assets/devices/device_wybot_s2sv.png.png';
import s3Device from '../assets/devices/device_wybot_s3.png.png';
import u1Device from '../assets/devices/device_wybot_u1.png.png';
import b1Device from '../assets/devices/device_wybot_b1.png.png';
import s3ControlRobot from '../assets/devices/solar panel@3x.png';
import s3ControlStation from '../assets/devices/dock@3x.png';

export type DeviceControlModel = 'c2pv' | 'c1' | 's2' | 's2sv' | 's3' | 'u1' | 'g1' | 'b1' | 'c3pro';

export type DeviceCategory = 'pool' | 'lawn';

export const DEVICE_CATEGORY_MAP: Record<DeviceControlModel, DeviceCategory> = {
  c2pv: 'pool',
  c1: 'pool',
  s2: 'pool',
  s2sv: 'pool',
  s3: 'pool',
  u1: 'pool',
  g1: 'lawn',
  b1: 'pool',
  c3pro: 'pool',
};

/** WYBOT S3 控制页：左卡机器人 / 右卡基座（资源在 src/assets/devices/） */
export const S3_CONTROL_PLACEHOLDER_IMAGES = {
  robot: s3ControlRobot,
  station: s3ControlStation,
} as const;

export type DeviceControlThirdStatusIcon = 'wifi' | 'cloudCamera';
export type DeviceControlCleaningModeLabels = 'compact' | 'c2ProVisionLegacy';

export const DEVICE_CONTROL_CONFIG: Record<
  DeviceControlModel,
  {
    productName: string;
    productImage: string;
    showAiVisualCleaning: boolean;
    thirdStatusIcon: DeviceControlThirdStatusIcon;
    cleaningModeLabels: DeviceControlCleaningModeLabels;
    /** 设备信息页是否显示 Join Vision Program */
    showJoinVisionProgram: boolean;
    /** 控制页是否显示 Extra-dirty Pool Clean 卡片（C1/S2 为 false，Cycle Timer 全宽紧凑排布） */
    showExtraDirtyPoolClean: boolean;
  }
> = {
  c2pv: {
    productName: 'WYBOT C2Pro Vision',
    productImage: c2pvDevice,
    showAiVisualCleaning: true,
    thirdStatusIcon: 'cloudCamera',
    cleaningModeLabels: 'c2ProVisionLegacy',
    showJoinVisionProgram: true,
    showExtraDirtyPoolClean: true,
  },
  c1: {
    productName: 'WYBOT C1',
    productImage: c1Device,
    showAiVisualCleaning: false,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  s2: {
    productName: 'WYBOT S2',
    productImage: s2Device,
    showAiVisualCleaning: false,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  s2sv: {
    productName: 'WYBOT S2 Solar Vision',
    productImage: s2svDevice,
    showAiVisualCleaning: true,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: true,
    showExtraDirtyPoolClean: false,
  },
  s3: {
    productName: 'WYBOT S3',
    productImage: s3Device,
    showAiVisualCleaning: true,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  u1: {
    productName: 'WYBOT U1',
    productImage: u1Device,
    showAiVisualCleaning: true,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  g1: {
    productName: 'WYBOT G1',
    productImage: s3Device,
    showAiVisualCleaning: false,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  b1: {
    productName: 'WYBOT B1',
    productImage: b1Device,
    showAiVisualCleaning: false,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
  c3pro: {
    productName: 'WYBOT C3PRO',
    productImage: u1Device,
    showAiVisualCleaning: true,
    thirdStatusIcon: 'wifi',
    cleaningModeLabels: 'compact',
    showJoinVisionProgram: false,
    showExtraDirtyPoolClean: false,
  },
};
