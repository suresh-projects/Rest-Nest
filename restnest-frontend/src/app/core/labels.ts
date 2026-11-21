export interface Opt { code: string; label: string; icon?: string; }

export const HUBS: Opt[] = [
  { code: 'CHENNAI_CENTRAL', label: 'Chennai Central' },
  { code: 'EGMORE', label: 'Egmore' },
  { code: 'KOYAMBEDU_CMBT', label: 'Koyambedu CMBT' },
  { code: 'KILAMBAKKAM_KCBT', label: 'Kilambakkam KCBT' },
  { code: 'AIRPORT', label: 'Chennai Airport' },
  { code: 'TAMBARAM', label: 'Tambaram' },
  { code: 'GUINDY', label: 'Guindy' },
  { code: 'MAMBALAM', label: 'Mambalam' },
  { code: 'NONE', label: 'None' },
];

export const AMENITIES: Opt[] = [
  { code: 'AC', label: 'AC Room', icon: '❄️' },
  { code: 'ATTACHED_BATHROOM', label: 'Attached Bathroom', icon: '🚿' },
  { code: 'HOT_WATER', label: 'Hot Water', icon: '♨️' },
  { code: 'WIFI', label: 'WiFi', icon: '📶' },
  { code: 'BED', label: 'Bed', icon: '🛏️' },
  { code: 'KIDS_FRIENDLY', label: 'Kids Friendly', icon: '🧸' },
  { code: 'BABY_CARE_SPACE', label: 'Baby Feeding / Care Space', icon: '🍼' },
  { code: 'PARKING', label: 'Parking', icon: '🅿️' },
  { code: 'TV', label: 'TV', icon: '📺' },
  { code: 'KITCHEN_ACCESS', label: 'Kitchen Access', icon: '🍳' },
];

export const RULES: Opt[] = [
  { code: 'NO_ALCOHOL', label: 'No Alcohol', icon: '🚫' },
  { code: 'NO_SMOKING', label: 'No Smoking', icon: '🚭' },
  { code: 'FAMILY_ONLY', label: 'Family Only', icon: '👨‍👩‍👧' },
  { code: 'NO_PETS', label: 'No Pets', icon: '🐾' },
  { code: 'NO_LOUD_MUSIC', label: 'No Loud Music', icon: '🔇' },
  { code: 'ID_REQUIRED', label: 'ID Proof Required', icon: '🪪' },
];

export const PURPOSES: Opt[] = [
  { code: 'TRAVEL_REST', label: 'Travel Rest / Fresh Up' },
  { code: 'TRAIN_BUS_WAIT', label: 'Waiting for Train / Bus' },
  { code: 'MEDICAL_VISIT', label: 'Medical Visit' },
  { code: 'EVENT', label: 'Function / Event' },
  { code: 'OTHER', label: 'Other' },
];

export const STATUSES: Opt[] = [
  { code: 'PENDING', label: 'Pending' },
  { code: 'CONFIRMED', label: 'Confirmed' },
  { code: 'REJECTED', label: 'Rejected' },
  { code: 'CANCELLED', label: 'Cancelled' },
];

export const CHENNAI_AREAS = [
  'Egmore', 'Chennai Central', 'Koyambedu', 'Tambaram', 'Guindy', 'Mambalam', 'T Nagar', 'Meenambakkam',
  'Velachery', 'Anna Nagar', 'Adyar', 'Chromepet', 'Perungudi', 'Kilambakkam', 'Porur', 'Saidapet',
];
