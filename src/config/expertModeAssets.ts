import floorBg2 from '../assets/expert-mode/floor-pattern-card-bg@2x.png';
import floorBg3 from '../assets/expert-mode/floor-pattern-card-bg@3x.png';
import wallBg2 from '../assets/expert-mode/wall-pattern-card-bg@2x.png';
import wallBg3 from '../assets/expert-mode/wall-pattern-card-bg@3x.png';

import floorStar2 from '../assets/expert-mode/floor-pattern-card-bg-start pattern@2x.png';
import floorStar3 from '../assets/expert-mode/floor-pattern-card-bg-start pattern@3x.png';
import floorCross2 from '../assets/expert-mode/floor-pattern-card-bg-cross pattern@2x.png';
import floorCross3 from '../assets/expert-mode/floor-pattern-card-bg-cross pattern@3x.png';
import floorS2 from '../assets/expert-mode/floor-pattern-card-bg-s pattern@2x.png';
import floorS3 from '../assets/expert-mode/floor-pattern-card-bg-s pattern@3x.png';

import wallH2 from '../assets/expert-mode/wall-pattern-card-bg-h pattern@2x.png';
import wallH3 from '../assets/expert-mode/wall-pattern-card-bg-h pattern@3x.png';
import wallN2 from '../assets/expert-mode/wall-pattern-card-bg-n pattern@2x.png';
import wallN3 from '../assets/expert-mode/wall-pattern-card-bg-n pattern@3x.png';

export type FloorExpertPattern = 'star' | 'cross' | 's';
export type WallExpertPattern = 'h' | 'n';

export type ExpertImagePair = { src: string; srcSet: string };

function pair(a: string, b: string): ExpertImagePair {
  return { src: a, srcSet: `${a} 2x, ${b} 3x` };
}

export const expertModePageBackgrounds = {
  floor: pair(floorBg2, floorBg3),
  wall: pair(wallBg2, wallBg3),
};

export const expertModeFloorCardImages: Record<FloorExpertPattern, ExpertImagePair> = {
  star: pair(floorStar2, floorStar3),
  cross: pair(floorCross2, floorCross3),
  s: pair(floorS2, floorS3),
};

export const expertModeWallCardImages: Record<WallExpertPattern, ExpertImagePair> = {
  h: pair(wallH2, wallH3),
  n: pair(wallN2, wallN3),
};
