const appointmentOptimization = require('../../src/services/ai/appointmentOptimization');

describe('Appointment Optimization Service', () => {
  describe('predictNoShow', () => {
    it('should return a no-show prediction with required fields', () => {
      const result = appointmentOptimization.predictNoShow({
        patient_history_no_shows: 2,
        total_past_appointments: 5,
        days_until_appointment: 7,
        appointment_type: 'consultation',
      });

      expect(result).toHaveProperty('no_show_probability');
      expect(result).toHaveProperty('risk_level');
      expect(result).toHaveProperty('recommendations');
      expect(result.no_show_probability).toBeGreaterThanOrEqual(0);
      expect(result.no_show_probability).toBeLessThanOrEqual(1);
    });

    it('should return high risk for patients with history of no-shows', () => {
      const result = appointmentOptimization.predictNoShow({
        patient_history_no_shows: 4,
        total_past_appointments: 5,
        days_until_appointment: 20,
        appointment_type: 'routine_checkup',
        is_first_appointment: false,
      });

      expect(result.risk_level).toBe('high');
    });

    it('should return low risk for emergency appointments', () => {
      const result = appointmentOptimization.predictNoShow({
        patient_history_no_shows: 0,
        total_past_appointments: 1,
        days_until_appointment: 0,
        appointment_type: 'emergency',
      });

      expect(result.risk_level).toBe('low');
    });
  });

  describe('optimizeSchedule', () => {
    it('should return optimization data', () => {
      const appointments = [
        {
          appointment_date: '2024-01-15',
          appointment_time: '09:00',
          duration_minutes: 30,
          status: 'completed',
        },
        {
          appointment_date: '2024-01-15',
          appointment_time: '09:30',
          duration_minutes: 30,
          status: 'completed',
        },
        {
          appointment_date: '2024-01-15',
          appointment_time: '11:00',
          duration_minutes: 30,
          status: 'no_show',
        },
      ];

      const result = appointmentOptimization.optimizeSchedule(appointments);

      expect(result).toHaveProperty('utilization_rate');
      expect(result).toHaveProperty('efficiency_score');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('recommendations');
    });

    it('should handle empty appointment list', () => {
      const result = appointmentOptimization.optimizeSchedule([]);
      expect(result.utilization_rate).toBe(0);
    });
  });

  describe('findOptimalSlots', () => {
    it('should return empty array when no availability', () => {
      const result = appointmentOptimization.findOptimalSlots({
        doctorAvailability: null,
        existingAppointments: [],
        urgency: 'normal',
      });
      expect(result).toEqual([]);
    });

    it('should filter out booked slots', () => {
      const result = appointmentOptimization.findOptimalSlots({
        doctorAvailability: {
          slots: [
            { date: '2024-01-15', time: '09:00', time_period: 'morning', day_of_week: 'monday' },
            { date: '2024-01-15', time: '10:00', time_period: 'morning', day_of_week: 'monday' },
          ],
        },
        existingAppointments: [{ date: '2024-01-15', time: '09:00' }],
        urgency: 'normal',
      });

      expect(result).toHaveLength(1);
      expect(result[0].time).toBe('10:00');
    });
  });
});
