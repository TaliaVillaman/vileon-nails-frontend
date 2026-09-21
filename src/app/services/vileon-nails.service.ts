import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Appointment, ServiceItem, Manicurist, NailDesign, DashboardSummary, WhatsAppNotification } from '../models/vileon.models';

@Injectable({
  providedIn: 'root'
})
export class VileonNailsService {
  private apiUrl = 'https://vileon-nails-backend.onrender.com/api';

  // Reactive State Streams
  private servicesSubject = new BehaviorSubject<ServiceItem[]>([]);
  public services$ = this.servicesSubject.asObservable();

  private manicuristsSubject = new BehaviorSubject<Manicurist[]>([]);
  public manicurists$ = this.manicuristsSubject.asObservable();

  private designsSubject = new BehaviorSubject<NailDesign[]>([]);
  public designs$ = this.designsSubject.asObservable();

  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<WhatsAppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private summarySubject = new BehaviorSubject<DashboardSummary>({
    totalAppointmentsToday: 2,
    totalAppointmentsTomorrow: 1,
    totalRevenueRD: 5100,
    confirmedCount: 2,
    pendingCount: 1,
    completedCount: 1,
    cancelledCount: 0
  });
  public summary$ = this.summarySubject.asObservable();

  constructor(private http: HttpClient) {
    this.initMockData();
    this.loadAllData();
  }

  private initMockData() {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const mockServices: ServiceItem[] = [
      { id: 1, name: 'Acrílico + Gel Polish', category: 'Acrílicas', description: 'Set completo de uñas acrílicas con acabado en gel de alta duración.', priceRD: 1500, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 2, name: 'Manicura Rusa Combinada', category: 'Manicura Rusa', description: 'Limpieza profunda de cutícula con torno y esmaltado impecable bajo cutícula.', priceRD: 1200, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 3, name: 'Soft Gel Extensions (Tips)', category: 'Soft Gel', description: 'Extensión de uñas flexibles en gel premoldeado. Súper livianas y duraderas.', priceRD: 1800, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 4, name: 'Pedicura Spa & Gel', category: 'Pedicura Spa', description: 'Exfoliación profunda, baño de sales, hidratación y esmaltado permanente.', priceRD: 1400, durationMinutes: 75, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', isActive: true },
      { id: 5, name: 'Nail Art 3D & Cristales (Set Completo)', category: 'Nail Art', description: 'Diseño artístico personalizado con pedrería Swarosvki y relieves 3D.', priceRD: 2200, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80', isActive: true }
    ];

    const mockManicurists: Manicurist[] = [
      { id: 1, fullName: 'Valeria Morales', specialty: 'Especialista en Acrílico & 3D Art', rating: 4.9, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', workingHours: '9:00 AM - 7:00 PM', isAvailable: true },
      { id: 2, fullName: 'Carolina Gómez', specialty: 'Master en Manicura Rusa & Soft Gel', rating: 5.0, photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', workingHours: '9:00 AM - 7:00 PM', isAvailable: true },
      { id: 3, fullName: 'Ana Luisa Reyes', specialty: 'Pedicura Spa & Esmaltado Permanente', rating: 4.8, photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', workingHours: '9:00 AM - 5:00 PM', isAvailable: true }
    ];

    const mockDesigns: NailDesign[] = [
      { id: 1, title: 'Francés Moderno con Hoja de Oro', category: 'Acrílicas', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', likesCount: 142, manicuristId: 1, manicuristName: 'Valeria Morales' },
      { id: 2, title: 'Nude Elegante Manicura Rusa', category: 'Manicura Rusa', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', likesCount: 98, manicuristId: 2, manicuristName: 'Carolina Gómez' },
      { id: 3, title: 'Glamour 3D con Cristales Swarosvki', category: 'Nail Art', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80', likesCount: 210, manicuristId: 1, manicuristName: 'Valeria Morales' }
    ];

    const mockAppointments: Appointment[] = [
      { id: 1, bookingCode: 'VN-1001', clientName: 'María Rodríguez', clientPhone: '+18095550192', serviceId: 1, serviceName: 'Acrílico + Gel Polish', manicuristId: 1, manicuristName: 'Valeria Morales', appointmentDate: todayStr, timeSlot: '09:00 AM', status: 'Confirmed', totalAmountRD: 1500, notes: 'Preferencia por forma almendrada' },
      { id: 2, bookingCode: 'VN-1002', clientName: 'Ana Martínez', clientPhone: '+18095550188', serviceId: 2, serviceName: 'Manicura Rusa Combinada', manicuristId: 2, manicuristName: 'Carolina Gómez', appointmentDate: todayStr, timeSlot: '10:30 AM', status: 'Pending', totalAmountRD: 1200, notes: 'Primera vez en el estudio' },
      { id: 3, bookingCode: 'VN-1003', clientName: 'Carolina Peña', clientPhone: '+18095550177', serviceId: 4, serviceName: 'Pedicura Spa & Gel', manicuristId: 3, manicuristName: 'Ana Luisa Reyes', appointmentDate: todayStr, timeSlot: '12:00 PM', status: 'Completed', totalAmountRD: 1400, notes: 'Clienta VIP' },
      { id: 4, bookingCode: 'VN-1004', clientName: 'Laura Torres', clientPhone: '+18095550144', serviceId: 3, serviceName: 'Soft Gel Extensions', manicuristId: 2, manicuristName: 'Carolina Gómez', appointmentDate: tomorrowStr, timeSlot: '02:00 PM', status: 'Confirmed', totalAmountRD: 1800, notes: '' }
    ];

    this.servicesSubject.next(mockServices);
    this.manicuristsSubject.next(mockManicurists);
    this.designsSubject.next(mockDesigns);
    this.appointmentsSubject.next(mockAppointments);
    this.recalculateSummary(mockAppointments);
  }

  public loadAllData(): void {
    this.http.get<ServiceItem[]>(`${this.apiUrl}/services`).pipe(
      catchError(() => of(null))
    ).subscribe(data => { if (data) this.servicesSubject.next(data); });

    this.http.get<Manicurist[]>(`${this.apiUrl}/manicurists`).pipe(
      catchError(() => of(null))
    ).subscribe(data => { if (data) this.manicuristsSubject.next(data); });

    this.http.get<NailDesign[]>(`${this.apiUrl}/naildesigns`).pipe(
      catchError(() => of(null))
    ).subscribe(data => { if (data) this.designsSubject.next(data); });

    this.http.get<Appointment[]>(`${this.apiUrl}/appointments`).pipe(
      catchError(() => of(null))
    ).subscribe(data => {
      if (data) {
        this.appointmentsSubject.next(data);
        this.recalculateSummary(data);
      }
    });

    this.http.get<WhatsAppNotification[]>(`${this.apiUrl}/whatsapp/notifications`).pipe(
      catchError(() => of(null))
    ).subscribe(data => { if (data) this.notificationsSubject.next(data); });
  }

  public createAppointment(dto: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, dto).pipe(
      tap(newAppt => {
        const current = this.appointmentsSubject.value;
        const updated = [newAppt, ...current];
        this.appointmentsSubject.next(updated);
        this.recalculateSummary(updated);
        this.triggerWhatsAppMockNotification(newAppt);
      }),
      catchError(() => {
        // Fallback local creation if API server is connecting
        const service = this.servicesSubject.value.find(s => s.id === dto.serviceId);
        const manicurist = this.manicuristsSubject.value.find(m => m.id === dto.manicuristId);
        const newId = Math.floor(Math.random() * 9000) + 1000;
        const mockAppt: Appointment = {
          id: newId,
          bookingCode: `VN-${newId}`,
          clientName: dto.clientName,
          clientPhone: dto.clientPhone,
          serviceId: dto.serviceId,
          serviceName: service?.name || 'Servicio de Uñas',
          manicuristId: dto.manicuristId,
          manicuristName: manicurist?.fullName || 'Manicurista Asignada',
          appointmentDate: dto.appointmentDate,
          timeSlot: dto.timeSlot,
          status: 'Pending',
          totalAmountRD: service?.priceRD || 1500,
          notes: dto.notes
        };
        const current = this.appointmentsSubject.value;
        const updated = [mockAppt, ...current];
        this.appointmentsSubject.next(updated);
        this.recalculateSummary(updated);
        this.triggerWhatsAppMockNotification(mockAppt);
        return of(mockAppt);
      })
    );
  }

  public updateAppointmentStatus(id: number, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled'): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}/status`, { status }).pipe(
      tap(() => this.localUpdateStatus(id, status)),
      catchError(() => {
        this.localUpdateStatus(id, status);
        return of({ success: true });
      })
    );
  }

  public respondWhatsAppWebhook(appointmentId: number, action: 'CONFIRM' | 'CANCEL' | 'RESCHEDULE'): Observable<any> {
    return this.http.post(`${this.apiUrl}/whatsapp/webhook/respond`, { appointmentId, action }).pipe(
      tap(res => {
        const newStatus = action === 'CONFIRM' ? 'Confirmed' : action === 'CANCEL' ? 'Cancelled' : 'Rescheduled';
        this.localUpdateStatus(appointmentId, newStatus);
      }),
      catchError(() => {
        const newStatus = action === 'CONFIRM' ? 'Confirmed' : action === 'CANCEL' ? 'Cancelled' : 'Rescheduled';
        this.localUpdateStatus(appointmentId, newStatus);
        return of({ success: true, newStatus });
      })
    );
  }

  public saveService(service: ServiceItem): void {
    const current = this.servicesSubject.value;
    if (!service.id) {
      service.id = current.length + 1;
      this.servicesSubject.next([...current, service]);
    } else {
      const idx = current.findIndex(s => s.id === service.id);
      if (idx >= 0) {
        current[idx] = service;
        this.servicesSubject.next([...current]);
      }
    }
  }

  public addNailDesign(design: NailDesign): void {
    const current = this.designsSubject.value;
    design.id = current.length + 1;
    this.designsSubject.next([design, ...current]);
  }

  private localUpdateStatus(id: number, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled') {
    const current = this.appointmentsSubject.value;
    const appt = current.find(a => a.id === id);
    if (appt) {
      appt.status = status;
      this.appointmentsSubject.next([...current]);
      this.recalculateSummary(current);
    }
  }

  private triggerWhatsAppMockNotification(appt: Appointment) {
    const notif: WhatsAppNotification = {
      id: Math.floor(Math.random() * 1000),
      appointmentId: appt.id,
      phone: appt.clientPhone,
      messageType: 'BookingConfirmation',
      content: `💅 Hola, ${appt.clientName}.\nTu cita en Vileon Nails ha sido registrada.\n\n📅 ${appt.appointmentDate}\n🕐 ${appt.timeSlot}\n💅 ${appt.serviceName}\n💰 RD$ ${appt.totalAmountRD.toLocaleString()}\n\n¿Deseas confirmar tu cita?`,
      sentAt: new Date().toISOString(),
      status: 'Sent'
    };
    const currentNotifs = this.notificationsSubject.value;
    this.notificationsSubject.next([notif, ...currentNotifs]);
  }

  private recalculateSummary(appointments: Appointment[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const todayList = appointments.filter(a => a.appointmentDate === todayStr);
    const tomorrowList = appointments.filter(a => a.appointmentDate === tomorrowStr);

    this.summarySubject.next({
      totalAppointmentsToday: todayList.length,
      totalAppointmentsTomorrow: tomorrowList.length,
      totalRevenueRD: todayList.filter(a => a.status !== 'Cancelled').reduce((sum, a) => sum + a.totalAmountRD, 0),
      confirmedCount: appointments.filter(a => a.status === 'Confirmed').length,
      pendingCount: appointments.filter(a => a.status === 'Pending').length,
      completedCount: appointments.filter(a => a.status === 'Completed').length,
      cancelledCount: appointments.filter(a => a.status === 'Cancelled').length
    });
  }
}
