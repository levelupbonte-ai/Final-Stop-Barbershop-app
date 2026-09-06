export interface Reservation {
  id?: string;
  userId: string;
  name: string;
  email: string;
  service: string;
  date: string; // ISO Date String
  time: string; // "10:00"
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: any;
}
