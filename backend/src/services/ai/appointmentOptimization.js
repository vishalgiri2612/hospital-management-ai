/**
 * AI Service for Appointment Optimization
 * Analyzes patterns to optimize scheduling
 */
const logger = require('../../utils/logger');

class AppointmentOptimizationService {
  /**
   * Find the optimal appointment slot for a patient
   * @param {Object} params - doctor availability, patient preferences, urgency
   * @returns {Array} - Ranked list of optimal time slots
   */
  findOptimalSlots({ doctorAvailability, existingAppointments, patientPreferences, urgency = 'normal' }) {
    try {
      const availableSlots = this._getAvailableSlots(doctorAvailability, existingAppointments);
      const scoredSlots = availableSlots.map((slot) => ({
        ...slot,
        score: this._scoreSlot(slot, patientPreferences, urgency),
      }));

      return scoredSlots
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      logger.error('Error in appointment optimization:', error);
      return [];
    }
  }

  /**
   * Predict no-show probability for an appointment
   * @param {Object} appointmentData
   * @returns {Object}
   */
  predictNoShow(appointmentData) {
    const {
      patient_history_no_shows = 0,
      total_past_appointments = 1,
      days_until_appointment = 7,
      appointment_type = 'consultation',
      is_first_appointment = false,
    } = appointmentData;

    let probability = 0;

    // Historical no-show rate
    const historicalRate = patient_history_no_shows / Math.max(1, total_past_appointments);
    probability += historicalRate * 0.5;

    // Lead time factor - longer lead time = more likely to no-show
    if (days_until_appointment > 14) probability += 0.2;
    else if (days_until_appointment > 7) probability += 0.1;

    // Appointment type
    if (appointment_type === 'routine_checkup') probability += 0.1;
    if (appointment_type === 'emergency') probability -= 0.2;

    // First appointment
    if (is_first_appointment) probability += 0.1;

    probability = Math.max(0, Math.min(1, probability));

    return {
      no_show_probability: parseFloat(probability.toFixed(3)),
      risk_level: probability > 0.5 ? 'high' : probability > 0.25 ? 'medium' : 'low',
      recommendations: this._getNoShowRecommendations(probability),
    };
  }

  /**
   * Optimize doctor's schedule for maximum efficiency
   * @param {Array} appointments - List of appointments
   * @returns {Object} - Optimization results
   */
  optimizeSchedule(appointments) {
    const totalSlots = appointments.length;
    const utilization = appointments.filter(
      (a) => a.status !== 'cancelled' && a.status !== 'no_show'
    ).length / Math.max(1, totalSlots);

    const gaps = this._findScheduleGaps(appointments);
    const overloaded = this._detectOverloading(appointments);

    return {
      utilization_rate: parseFloat(utilization.toFixed(3)),
      efficiency_score: this._computeEfficiencyScore(appointments),
      gaps,
      overloaded_periods: overloaded,
      recommendations: this._getScheduleRecommendations(utilization, gaps, overloaded),
    };
  }

  // ---- Private helpers ----

  _getAvailableSlots(availability, existingAppointments) {
    if (!availability || !availability.slots) return [];
    const bookedTimes = new Set(
      (existingAppointments || []).map((a) => `${a.date}-${a.time}`)
    );

    return availability.slots.filter(
      (slot) => !bookedTimes.has(`${slot.date}-${slot.time}`)
    );
  }

  _scoreSlot(slot, preferences, urgency) {
    let score = 1.0;

    if (preferences) {
      if (preferences.preferred_time === slot.time_period) score += 0.3;
      if (preferences.preferred_days && preferences.preferred_days.includes(slot.day_of_week))
        score += 0.2;
    }

    if (urgency === 'urgent') {
      // Prefer earlier slots
      const hoursFromNow = slot.hours_from_now || 24;
      score += Math.max(0, (48 - hoursFromNow) / 48) * 0.5;
    }

    return parseFloat(score.toFixed(3));
  }

  _getNoShowRecommendations(probability) {
    if (probability > 0.5) {
      return [
        'Send reminder 48 hours before appointment',
        'Send SMS reminder 2 hours before',
        'Consider overbooking this slot',
        'Call patient to confirm',
      ];
    }
    if (probability > 0.25) {
      return [
        'Send reminder 24 hours before',
        'Send day-of reminder',
      ];
    }
    return ['Standard reminder 24 hours before'];
  }

  _findScheduleGaps(appointments) {
    const gaps = [];
    const sorted = [...appointments].sort(
      (a, b) => new Date(`${a.appointment_date} ${a.appointment_time}`) -
                new Date(`${b.appointment_date} ${b.appointment_time}`)
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const prevEnd = new Date(`${prev.appointment_date} ${prev.appointment_time}`);
      prevEnd.setMinutes(prevEnd.getMinutes() + (prev.duration_minutes || 30));
      const currStart = new Date(`${curr.appointment_date} ${curr.appointment_time}`);
      const gapMinutes = (currStart - prevEnd) / 60000;

      if (gapMinutes >= 30) {
        gaps.push({
          start: prevEnd.toISOString(),
          end: currStart.toISOString(),
          duration_minutes: gapMinutes,
        });
      }
    }

    return gaps;
  }

  _detectOverloading(appointments) {
    const appointmentsByHour = {};
    appointments.forEach((apt) => {
      const hour = apt.appointment_time ? apt.appointment_time.split(':')[0] : '00';
      appointmentsByHour[hour] = (appointmentsByHour[hour] || 0) + 1;
    });

    return Object.entries(appointmentsByHour)
      .filter(([, count]) => count > 3)
      .map(([hour, count]) => ({ hour: `${hour}:00`, appointment_count: count }));
  }

  _computeEfficiencyScore(appointments) {
    if (!appointments.length) return 0;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;

    const score = (completed - (cancelled + noShow) * 0.5) / appointments.length;
    return Math.max(0, parseFloat(score.toFixed(3)));
  }

  _getScheduleRecommendations(utilization, gaps, overloaded) {
    const recs = [];
    if (utilization < 0.6) recs.push('Schedule more appointments to improve utilization');
    if (utilization > 0.9) recs.push('Consider adding additional appointment slots');
    if (gaps.length > 2) recs.push('Fill scheduling gaps with walk-in appointments');
    if (overloaded.length > 0) recs.push('Redistribute appointments from peak hours');
    return recs;
  }
}

module.exports = new AppointmentOptimizationService();
