const { Op } = require('sequelize');
const { Appointment, Patient, Doctor } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');
const appointmentOptimization = require('../services/ai/appointmentOptimization');
const logger = require('../utils/logger');

const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, doctor_id, patient_id, date } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = {};
    if (status) where.status = status;
    if (doctor_id) where.doctor_id = doctor_id;
    if (patient_id) where.patient_id = patient_id;
    if (date) where.appointment_date = date;

    // Patients can only view their own appointments
    if (req.user.role === 'patient') {
      const { Patient: PatientModel } = require('../models');
      const patientRecord = await PatientModel.findOne({ where: { user_id: req.user.id } });
      if (patientRecord) where.patient_id = patientRecord.id;
    }

    // Doctors can only view their own appointments
    if (req.user.role === 'doctor') {
      const doctorRecord = await Doctor.findOne({ where: { user_id: req.user.id } });
      if (doctorRecord) where.doctor_id = doctorRecord.id;
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'patient_id'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'first_name', 'last_name', 'specialization'] },
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']],
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

    // Check for conflicts
    const conflict = await Appointment.findOne({
      where: {
        doctor_id,
        appointment_date,
        appointment_time,
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Doctor already has an appointment at this time.',
      });
    }

    const appointment = await Appointment.create({
      ...req.body,
      appointment_id: generateUniqueId('APT'),
    });

    // AI: Predict no-show risk
    const noShowPrediction = appointmentOptimization.predictNoShow({
      days_until_appointment: Math.ceil(
        (new Date(appointment_date) - new Date()) / (1000 * 60 * 60 * 24)
      ),
      appointment_type: req.body.type,
    });

    await appointment.update({
      ai_risk_assessment: noShowPrediction,
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('appointment_created', { appointment_id: appointment.appointment_id });
    }

    logger.info(`Appointment created: ${appointment.appointment_id}`);
    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully.',
      data: appointment,
      ai_insights: noShowPrediction,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await appointment.update(req.body);

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment_updated', {
        appointment_id: appointment.appointment_id,
        status: appointment.status,
      });
    }

    res.json({ success: true, message: 'Appointment updated.', data: appointment });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    await appointment.update({
      status: 'cancelled',
      cancellation_reason: req.body.reason,
    });

    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (error) {
    next(error);
  }
};

const getOptimalSlots = async (req, res, next) => {
  try {
    const { doctor_id, patient_id, urgency } = req.query;

    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const existingAppointments = await Appointment.findAll({
      where: {
        doctor_id,
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
        appointment_date: { [Op.gte]: new Date() },
      },
      attributes: ['appointment_date', 'appointment_time', 'duration_minutes'],
    });

    const slots = appointmentOptimization.findOptimalSlots({
      doctorAvailability: doctor.availability_schedule,
      existingAppointments,
      urgency,
    });

    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getOptimalSlots,
};
