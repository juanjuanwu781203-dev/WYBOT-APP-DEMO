export const devices = [
  { id: '001', model: 'WYBOT C1', sn: 'A7B3C9D2E1F' },
  { id: '002', model: 'WYBOT C2', sn: 'B8C4D0E3F2A' },
  { id: '003', model: 'WYBOT C2V', sn: 'C9D5E1F4A3B' },
  { id: '004', model: 'WYBOT C2P', sn: 'D0E6F2A5B4C' },
  { id: '005', model: 'WYBOT C2PV', sn: 'E1F7A3B6C5D' },
  { id: '006', model: 'WYBOT S2', sn: 'F2A8B4C7D6E' },
  { id: '007', model: 'WYBOT M2', sn: 'A3B9C5D8E7F' },
  { id: '008', model: 'WYBOT F1', sn: 'B4C0D6E9F8A' },
  { id: '009', model: 'WYBOT S2S', sn: 'C5D1E7F0A9B' },
  { id: '010', model: 'WYBOT S2SV', sn: 'D6E2F8A1B0C' },
  { id: '011', model: 'WYBOT S3', sn: 'E7F3A9B2C1D' },
];

export const networks = [
  { ssid: 'MERCURY_2.4G_99D9' },
  { ssid: 'wangyuankeji' },
  { ssid: '泳池实验' },
  { ssid: 'FAST_2.4G_F89A' },
  { ssid: '中南家属院大屋' },
];

/** 简短标签（WYBOT C1、S2 等） */
export const cleaningModes = [
  { id: 'floor-2h', label: 'Floor:', icon: 'floor' },
  { id: 'wall', label: 'Wall', icon: 'wall' },
  { id: 'wall-floor', label: 'Wall then Floor', icon: 'wall-floor', active: true },
  { id: 'standard', label: 'Standard Full-Pool', icon: 'standard' },
  { id: 'waterline', label: 'Water Line', icon: 'waterline' },
  { id: 'turbo-1h', label: 'Turbo Floor', icon: 'turbo' },
  { id: 'eco-3h', label: 'Eco Floor', icon: 'eco' },
];

/** WYBOT C2 Pro Vision 原版文案（含括号时长） */
export const cleaningModesC2ProVision = [
  { id: 'floor-2h', label: 'Floor(2H):', icon: 'floor' },
  { id: 'wall', label: 'Wall', icon: 'wall' },
  { id: 'wall-floor', label: 'Wall then Floor', icon: 'wall-floor', active: true },
  { id: 'standard', label: 'Standard Full-Pool', icon: 'standard' },
  { id: 'waterline', label: 'Water Line', icon: 'waterline' },
  { id: 'turbo-1h', label: 'Turbo Floor(1H)', icon: 'turbo' },
  { id: 'eco-3h', label: 'Eco Floor(3H)', icon: 'eco' },
];

export const pools = [
  { id: '1', name: 'Tile' },
  { id: '2', name: 'My pool' },
  { id: '3', name: 'My pool 3', selected: true },
];

export const userProfile = {
  name: 'wowbot',
  email: 'wowbot@wybot.com',
};

export const appVersion = '2.3.14(1704)';
