export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  description: string;
  priceRD: number;
  durationMinutes: number;
  imageUrl: string;
  isActive: boolean;
}

export interface Manicurist {
  id: number;
  fullName: string;
  specialty: string;
  rating: number;
  photoUrl: string;
  workingHours: string;
  isAvailable?: boolean;
}

export interface NailDesign {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  likesCount: number;
  manicuristId: number;
  manicuristName: string;
}

export interface Appointment {
  id: number;
  bookingCode: string;
  clientName: string;
  clientPhone: string;
  serviceId: number;
  serviceName: string;
  manicuristId: number;
  manicuristName: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';
  totalAmountRD: number;
  notes?: string;
  createdAt?: string;
}

export interface DashboardSummary {
  totalAppointmentsToday: number;
  totalAppointmentsTomorrow: number;
  totalRevenueRD: number;
  confirmedCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface WhatsAppNotification {
  id: number;
  appointmentId: number;
  phone: string;
  messageType: string;
  content: string;
  sentAt: string;
  status: string;
}
