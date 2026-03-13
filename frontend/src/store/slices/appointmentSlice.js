import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await api.post(`/appointments/${id}/cancel`, { reason });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    currentAppointment: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    addAppointmentFromSocket: (state, action) => {
      state.appointments.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => { state.loading = true; })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.unshift(action.payload);
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.appointments[index] = action.payload;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const appointment = state.appointments.find((a) => a.id === action.payload);
        if (appointment) appointment.status = 'cancelled';
      });
  },
});

export const { clearError, addAppointmentFromSocket } = appointmentSlice.actions;
export default appointmentSlice.reducer;
