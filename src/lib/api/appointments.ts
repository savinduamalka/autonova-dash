import { AppointmentRequestDto, AppointmentResponseDto, AppointmentStatus, Vehicle } from "@/types";
import { api } from "@/lib/api/axios-config";

export const appointmentApi = {
  create: async (data: AppointmentRequestDto) => {
    const response = await api.post<AppointmentResponseDto>("/appointments", data);
    return response.data;
  },

  reschedule: async (id: string, start: string, end: string) => {
    const response = await api.post<AppointmentResponseDto>(
      `/appointments/${id}/reschedule`,
      null,
      { params: { start, end } }
    );
    return response.data;
  },

  cancel: async (id: string, cancelledBy?: string) => {
    await api.post(`/appointments/${id}/cancel`, null, {
      params: { cancelledBy },
    });
  },

  updateStatus: async (id: string, status: AppointmentStatus) => {
    const response = await api.post<AppointmentResponseDto>(
      `/appointments/${id}/status`,
      { status }
    );
    return response.data;
  },

  listByCustomer: async (customerId: string) => {
    const response = await api.get<AppointmentResponseDto[]>(
      `/appointments/customer/${customerId}`
    );
    return response.data;
  },

  listAll: async (params?: {
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<AppointmentResponseDto[]>("/appointments", {
      params,
    });
    return response.data;
  },

  checkAvailability: async (start: string, end: string) => {
    const response = await api.get<boolean>("/appointments/availability", {
      params: { start, end },
    });
    return response.data;
  },
};

// Vehicle API for fetching customer vehicles
export const vehicleApi = {
  listByCustomer: async (customerId: string) => {
    const response = await api.get<Vehicle[]>(`/vehicles/customer/${customerId}`);
    return response.data;
  },
};