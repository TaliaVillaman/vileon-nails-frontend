import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VileonNailsService } from './services/vileon-nails.service';
import { ServiceItem, Manicurist, NailDesign, Appointment, DashboardSummary, WhatsAppNotification } from './models/vileon.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'VILEON NAILS';
  activeMainTab: 'client' | 'admin' | 'whatsapp' = 'client';
  clientSubTab: 'home' | 'services' | 'gallery' | 'book' | 'my-appointments' = 'home';
  adminSubTab: 'dashboard' | 'appointments' | 'services-crud' | 'designs-crud' | 'schedule' = 'dashboard';

  // Data streams
  services: ServiceItem[] = [];
  manicurists: Manicurist[] = [];
  designs: NailDesign[] = [];
  appointments: Appointment[] = [];
  summary: DashboardSummary = {
    totalAppointmentsToday: 0,
    totalAppointmentsTomorrow: 0,
    totalRevenueRD: 0,
    confirmedCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0
  };
  notifications: WhatsAppNotification[] = [];

  // Gallery Filters
  selectedCategory: string = 'Todas';
  selectedDesignModal: NailDesign | null = null;

  // Booking Wizard Form State
  bookingStep: number = 1;
  selectedService: ServiceItem | null = null;
  selectedManicurist: Manicurist | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedTimeSlot: string = '09:00 AM';
  clientName: string = '';
  clientPhone: string = '';
  bookingNotes: string = '';
  createdBooking: Appointment | null = null;

  timeSlots: string[] = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:00 PM', '05:30 PM'];

  // My Appointments Lookup State
  searchQuery: string = '';
  searchedAppointment: Appointment | null = null;
  searchError: string = '';

  // Admin New Service Form
  newService: ServiceItem = {
    id: 0,
    name: '',
    category: 'Acrílicas',
    description: '',
    priceRD: 1500,
    durationMinutes: 90,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
    isActive: true
  };

  constructor(public nailsService: VileonNailsService) {}

  ngOnInit(): void {
    this.nailsService.services$.subscribe(s => this.services = s);
    this.nailsService.manicurists$.subscribe(m => this.manicurists = m);
    this.nailsService.designs$.subscribe(d => this.designs = d);
    this.nailsService.appointments$.subscribe(a => this.appointments = a);
    this.nailsService.summary$.subscribe(s => this.summary = s);
    this.nailsService.notifications$.subscribe(n => this.notifications = n);
  }

  // Navigation handlers
  setMainTab(tab: 'client' | 'admin' | 'whatsapp'): void {
    this.activeMainTab = tab;
  }

  setClientSubTab(sub: 'home' | 'services' | 'gallery' | 'book' | 'my-appointments'): void {
    this.clientSubTab = sub;
  }

  setAdminSubTab(sub: 'dashboard' | 'appointments' | 'services-crud' | 'designs-crud' | 'schedule'): void {
    this.adminSubTab = sub;
  }

  // Booking Wizard logic
  selectServiceForBooking(service: ServiceItem): void {
    this.selectedService = service;
    this.bookingStep = 2;
    this.clientSubTab = 'book';
  }

  selectManicuristForBooking(manicurist: Manicurist): void {
    this.selectedManicurist = manicurist;
    this.bookingStep = 3;
  }

  confirmBookingDetails(): void {
    if (!this.selectedService || !this.selectedManicurist) return;
    if (!this.clientName || !this.clientPhone) {
      alert('Por favor completa tu nombre y número de WhatsApp');
      return;
    }

    const dto = {
      clientName: this.clientName,
      clientPhone: this.clientPhone,
      serviceId: this.selectedService.id,
      manicuristId: this.selectedManicurist.id,
      appointmentDate: this.selectedDate,
      timeSlot: this.selectedTimeSlot,
      notes: this.bookingNotes
    };

    this.nailsService.createAppointment(dto).subscribe(appt => {
      this.createdBooking = appt;
      this.bookingStep = 5;
    });
  }

  resetBooking(): void {
    this.bookingStep = 1;
    this.selectedService = null;
    this.selectedManicurist = null;
    this.clientName = '';
    this.clientPhone = '';
    this.bookingNotes = '';
    this.createdBooking = null;
  }

  // Client Portal Search
  searchAppointment(): void {
    this.searchError = '';
    this.searchedAppointment = null;
    if (!this.searchQuery) return;

    const code = this.searchQuery.trim().toLowerCase();
    const found = this.appointments.find(a => 
      a.bookingCode.toLowerCase() === code || a.clientPhone.includes(code)
    );

    if (found) {
      this.searchedAppointment = found;
    } else {
      this.searchError = 'No se encontró ninguna cita registrada con este código o número de teléfono.';
    }
  }

  updateAppointmentStatus(id: number, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled'): void {
    this.nailsService.updateAppointmentStatus(id, status).subscribe(() => {
      if (this.searchedAppointment && this.searchedAppointment.id === id) {
        this.searchedAppointment.status = status;
      }
    });
  }

  // WhatsApp Webhook Simulation
  triggerWhatsAppResponse(appointmentId: number, action: 'CONFIRM' | 'CANCEL' | 'RESCHEDULE'): void {
    this.nailsService.respondWhatsAppWebhook(appointmentId, action).subscribe();
  }

  // Gallery filtering
  get filteredDesigns(): NailDesign[] {
    if (this.selectedCategory === 'Todas') return this.designs;
    return this.designs.filter(d => d.category === this.selectedCategory);
  }

  // Admin CRUD
  saveService(): void {
    if (!this.newService.name || !this.newService.priceRD) {
      alert('Ingresa el nombre del servicio y el precio en RD$');
      return;
    }
    this.nailsService.saveService({ ...this.newService });
    this.newService = {
      id: 0,
      name: '',
      category: 'Acrílicas',
      description: '',
      priceRD: 1500,
      durationMinutes: 90,
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
      isActive: true
    };
    alert('Servicio guardado exitosamente en el catálogo');
  }
}
