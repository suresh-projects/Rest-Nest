export type Role = 'GUEST' | 'HOST' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface AuthResponse {
  token: string;
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Photo { id: number; url: string; }

export interface Property {
  id: number;
  title: string;
  description: string | null;
  area: string;
  address: string | null;
  nearestHub: string;
  pricePerHour: number;
  maxGuests: number;
  minHours: number;
  availableFrom: string;
  availableTo: string;
  amenities: string[];
  houseRules: string[];
  photos: Photo[];
  hostId: number;
  hostName: string;
  active: boolean;
  createdAt: string;
}

export interface PropertyRequest {
  title: string;
  description: string;
  area: string;
  address: string;
  nearestHub: string;
  pricePerHour: number;
  maxGuests: number;
  minHours: number;
  availableFrom: string;
  availableTo: string;
  amenities: string[];
  houseRules: string[];
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchParams {
  q: string;
  area: string;
  hub: string;
  minPrice: number | null;
  maxPrice: number | null;
  guests: number | null;
  amenities: string[];
  rules: string[];
  sort: string;
  page: number;
  size: number;
}

export interface Booking {
  id: number;
  propertyId: number;
  propertyTitle: string;
  area: string;
  address: string | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  guests: number;
  purpose: string;
  note: string | null;
  status: BookingStatus;
  statusReason: string | null;
  totalAmount: number;
  guestId: number;
  guestName: string;
  guestPhone: string | null;
  hostName: string;
  hostPhone: string | null;
  createdAt: string;
}

export interface BookingRequest {
  propertyId: number;
  date: string;
  startTime: string;
  hours: number;
  guests: number;
  purpose: string;
  note: string | null;
  rulesAccepted: boolean;
}

export interface Availability {
  date: string;
  availableFrom: string;
  availableTo: string;
  minHours: number;
  bookedSlots: { startTime: string; endTime: string }[];
}

export interface Meta { areas: string[]; }
