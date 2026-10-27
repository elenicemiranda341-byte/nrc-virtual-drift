export type DriftCategoryType = 'PRO' | 'STREET';

export const CATEGORY_TRACKS: Record<DriftCategoryType, string> = {
  PRO: 'FDC Stadium X W1',
  STREET: 'Emerlaw Circuit',
};

export const FR_LEGENDS_CARS: readonly string[] = [
  'Nissan Silvia S15',
  'Nissan Silvia S14 Kouki',
  'Nissan Silvia S14 Zenki',
  'Nissan Silvia S13',
  'Nissan 180SX',
  'Nissan Skyline R32',
  'Toyota Chaser JZX100',
  'Toyota Mark II JZX100',
  'Toyota AE86 Trueno',
  'Toyota Altezza / IS200',
  'Toyota GT86 / Subaru BRZ',
  'Mazda RX-7 FD3S',
  'Mazda RX-7 FC3S',
  'Mazda MX-5 Miata NA',
  'BMW E30 M3',
  'Lada 2105 VFTS',
] as const;

export interface ChampionshipSettingsData {
  isOpen: boolean;
  totalMaxSpots: number;
  proMaxSpots: number;
  streetMaxSpots: number;
  updatedAt: string;
}

export interface PilotRegistration {
  id: number;
  pilotName: string;
  nickname: string;
  frLegendsId: string;
  carModel: string;
  category: DriftCategoryType;
  track: string;
  createdAt: string;
}

export interface ChampionshipStats {
  totalRegistered: number;
  proRegistered: number;
  streetRegistered: number;
  remainingTotal: number;
  remainingPro: number;
  remainingStreet: number;
  isEffectivelyOpen: boolean;
  occupancyPercent: number;
  latestRegistrationAt: string | null;
}

export interface ChampionshipStatePayload {
  settings: ChampionshipSettingsData;
  registrations: PilotRegistration[];
  stats: ChampionshipStats;
  serverTime: string;
}

export interface CreateRegistrationInput {
  pilotName: string;
  nickname: string;
  frLegendsId: string;
  carModel: string;
  category: DriftCategoryType;
}

export interface UpdateSettingsInput {
  isOpen?: boolean;
  totalMaxSpots?: number;
  proMaxSpots?: number;
  streetMaxSpots?: number;
}

export interface WsServerMessage {
  type: 'championship:sync';
  reason: 'initial' | 'registration:created' | 'registration:deleted' | 'settings:updated';
  payload: ChampionshipStatePayload;
}
