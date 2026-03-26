import iconAiVisual2 from '../assets/device-control/icon-ai-visual-cleaning@2x.png';
import iconAiVisual3 from '../assets/device-control/icon-ai-visual-cleaning@3x.png';
import iconCloudCamera2 from '../assets/device-control/icon-cloud-camera@2x.png';
import iconCloudCamera3 from '../assets/device-control/icon-cloud-camera@3x.png';
import iconDeviceInfo2 from '../assets/device-control/icon-device-info@2x.png';
import iconDeviceInfo3 from '../assets/device-control/icon-device-info@3x.png';
import iconRobot2 from '../assets/device-control/icon-robot@2x.png';
import iconRobot3 from '../assets/device-control/icon-robot@3x.png';

import cleaningFloor2h2 from '../assets/device-control/cleaning-floor-2h@2x.png';
import cleaningFloor2h3 from '../assets/device-control/cleaning-floor-2h@3x.png';
import cleaningWall2 from '../assets/device-control/cleaning-wall@2x.png';
import cleaningWall3 from '../assets/device-control/cleaning-wall@3x.png';
import cleaningWallThenFloor2 from '../assets/device-control/cleaning-wall-then-floor@2x.png';
import cleaningWallThenFloor3 from '../assets/device-control/cleaning-wall-then-floor@3x.png';
import cleaningStandard2 from '../assets/device-control/cleaning-standard-full-pool@2x.png';
import cleaningStandard3 from '../assets/device-control/cleaning-standard-full-pool@3x.png';
import cleaningWaterLine2 from '../assets/device-control/cleaning-water-line@2x.png';
import cleaningWaterLine3 from '../assets/device-control/cleaning-water-line@3x.png';
import cleaningTurbo2 from '../assets/device-control/cleaning-turbo-floor-1h@2x.png';
import cleaningTurbo3 from '../assets/device-control/cleaning-turbo-floor-1h@3x.png';
import cleaningEco2 from '../assets/device-control/cleaning-eco-floor-3h@2x.png';
import cleaningEco3 from '../assets/device-control/cleaning-eco-floor-3h@3x.png';

import cleaningFloor2hAi2 from '../assets/device-control/cleaning-floor-2h-ai-visual@2x.png';
import cleaningFloor2hAi3 from '../assets/device-control/cleaning-floor-2h-ai-visual@3x.png';
import cleaningTurboAi2 from '../assets/device-control/cleaning-turbo-floor-1h-ai-visual@2x.png';
import cleaningTurboAi3 from '../assets/device-control/cleaning-turbo-floor-1h-ai-visual@3x.png';
import cleaningEcoAi2 from '../assets/device-control/cleaning-eco-floor-3h-ai-visual@2x.png';
import cleaningEcoAi3 from '../assets/device-control/cleaning-eco-floor-3h-ai-visual@3x.png';
import cleaningWallThenFloorAi2 from '../assets/device-control/cleaning-wall-then-floor-ai-visual@2x.png';
import cleaningWallThenFloorAi3 from '../assets/device-control/cleaning-wall-then-floor-ai-visual@3x.png';

export type DeviceCleaningModeId =
  | 'floor-2h'
  | 'wall'
  | 'wall-floor'
  | 'standard'
  | 'waterline'
  | 'turbo-1h'
  | 'eco-3h';

export type DeviceImagePair = { src: string; srcSet: string };

function pair(a: string, b: string): DeviceImagePair {
  return { src: a, srcSet: `${a} 2x, ${b} 3x` };
}

export const deviceControlAiVisualIcon = pair(iconAiVisual2, iconAiVisual3);
export const deviceControlCloudCameraIcon = pair(iconCloudCamera2, iconCloudCamera3);
export const deviceControlDeviceInfoIcon = pair(iconDeviceInfo2, iconDeviceInfo3);
/** 机器人电量条左侧图标（可替换为设计稿 icon-robot@2x/@3x） */
export const deviceControlRobotIcon = pair(iconRobot2, iconRobot3);

export const deviceControlCleaningModeImages: Record<DeviceCleaningModeId, DeviceImagePair> = {
  'floor-2h': pair(cleaningFloor2h2, cleaningFloor2h3),
  wall: pair(cleaningWall2, cleaningWall3),
  'wall-floor': pair(cleaningWallThenFloor2, cleaningWallThenFloor3),
  standard: pair(cleaningStandard2, cleaningStandard3),
  waterline: pair(cleaningWaterLine2, cleaningWaterLine3),
  'turbo-1h': pair(cleaningTurbo2, cleaningTurbo3),
  'eco-3h': pair(cleaningEco2, cleaningEco3),
};

const deviceControlCleaningModeImagesAiVisual: Partial<Record<DeviceCleaningModeId, DeviceImagePair>> = {
  'floor-2h': pair(cleaningFloor2hAi2, cleaningFloor2hAi3),
  'wall-floor': pair(cleaningWallThenFloorAi2, cleaningWallThenFloorAi3),
  'turbo-1h': pair(cleaningTurboAi2, cleaningTurboAi3),
  'eco-3h': pair(cleaningEcoAi2, cleaningEcoAi3),
};

/** Modes that can be selected when Extra-dirty is on */
export const EXTRA_DIRTY_ALLOWED_MODES: DeviceCleaningModeId[] = ['floor-2h', 'turbo-1h', 'eco-3h'];

const AI_VISUAL_HIDE_LABEL_MODES: DeviceCleaningModeId[] = [
  'floor-2h',
  'wall-floor',
  'turbo-1h',
  'eco-3h',
];

export function resolveCleaningModeImage(
  modeId: DeviceCleaningModeId,
  aiVisual: boolean,
): DeviceImagePair {
  if (aiVisual && deviceControlCleaningModeImagesAiVisual[modeId]) {
    return deviceControlCleaningModeImagesAiVisual[modeId]!;
  }
  return deviceControlCleaningModeImages[modeId];
}

export function shouldHideCleaningModeLabel(modeId: DeviceCleaningModeId, aiVisual: boolean): boolean {
  return aiVisual && AI_VISUAL_HIDE_LABEL_MODES.includes(modeId);
}
