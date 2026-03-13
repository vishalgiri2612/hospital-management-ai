import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patient');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/create',
  async (patientData, { rejectWithValue }) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/patients/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update patient');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState: {
    patients: [],
    currentPatient: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentPatient: (state) => { state.currentPatient = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.loading = true; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPatientById.pending, (state) => { state.loading = true; })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.patients.unshift(action.payload);
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        const index = state.patients.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.patients[index] = action.payload;
        if (state.currentPatient?.id === action.payload.id) {
          state.currentPatient = action.payload;
        }
      });
  },
});

export const { clearCurrentPatient, clearError } = patientSlice.actions;
export default patientSlice.reducer;
