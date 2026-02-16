import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as API from '@/utils/api';

// User queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => API.authAPI.me(),
  });
};

// Doctors queries
export const useDoctors = () => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => API.doctorAPI.getAll(),
  });
};

export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => API.doctorAPI.getById(id),
    enabled: !!id,
  });
};

export const useDoctorSchedule = (id: string) => {
  return useQuery({
    queryKey: ['doctor', id, 'schedule'],
    queryFn: () => API.doctorAPI.getSchedule(id),
    enabled: !!id,
  });
};

// Appointments queries
export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => API.appointmentAPI.getAll(),
  });
};

export const useAvailableSlots = (doctorId: string, date: string) => {
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => API.appointmentAPI.getSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  });
};

// Appointments mutations
export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => API.appointmentAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => API.appointmentAPI.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Medical records queries
export const useMedicalRecords = (patientId: string) => {
  return useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: () => API.medicalRecordAPI.getByPatient(patientId),
    enabled: !!patientId,
  });
};

// Prescriptions queries
export const usePrescriptions = () => {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => API.prescriptionAPI.getAll(),
  });
};

// Billing queries
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => API.billingAPI.getInvoices(),
  });
};

// Notifications queries
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => API.notificationAPI.getAll(),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => API.notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Authentication mutations
export const useLogin = () => {
  return useMutation({
    mutationFn: (data) => API.authAPI.login(data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => API.authAPI.register(data),
  });
};
