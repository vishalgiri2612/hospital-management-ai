const { Op } = require('sequelize');
const { Patient, User, Appointment, MedicalRecord, Bill } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');
const healthRiskService = require('../services/ai/healthRiskPrediction');
const logger = require('../utils/logger');

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 */
const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, risk_level } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { patient_id: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (risk_level) where.risk_level = risk_level;

    const { count, rows } = await Patient.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['current_medications'] },
    });

    res.json({
      success: true,
      ...paginatedResponse(rows, count, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: Appointment, as: 'appointments', limit: 5, order: [['appointment_date', 'DESC']] },
        { model: MedicalRecord, as: 'medical_records', limit: 10, order: [['record_date', 'DESC']] },
      ],
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Authorization check: patients can only view their own data
    if (req.user.role === 'patient') {
      const user = await User.findByPk(req.user.id);
      const patientRecord = await Patient.findOne({ where: { user_id: req.user.id } });
      if (!patientRecord || patientRecord.id !== patient.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 */
const createPatient = async (req, res, next) => {
  try {
    const patientData = { ...req.body };
    patientData.patient_id = generateUniqueId('PAT');

    const patient = await Patient.create(patientData);

    // Compute initial risk score
    const riskAssessment = await healthRiskService.predictRisk({
      age: patientData.age,
      chronic_conditions: patientData.chronic_conditions || [],
      allergies: patientData.allergies || [],
      current_medications: patientData.current_medications || [],
    });

    await patient.update({
      risk_score: riskAssessment.score,
      risk_level: riskAssessment.level,
    });

    logger.info(`Patient created: ${patient.patient_id}`);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await patient.update(req.body);

    // Recompute risk if health data changed
    if (req.body.chronic_conditions || req.body.allergies || req.body.current_medications) {
      const riskAssessment = await healthRiskService.predictRisk({
        chronic_conditions: patient.chronic_conditions,
        allergies: patient.allergies,
        current_medications: patient.current_medications,
      });
      await patient.update({
        risk_score: riskAssessment.score,
        risk_level: riskAssessment.level,
      });
    }

    res.json({ success: true, message: 'Patient updated successfully.', data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Deactivate patient
 *     tags: [Patients]
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    await patient.update({ is_active: false });
    res.json({ success: true, message: 'Patient deactivated successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients/{id}/risk-assessment:
 *   get:
 *     summary: Get AI risk assessment for a patient
 *     tags: [Patients]
 */
const getPatientRiskAssessment = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const age = patient.date_of_birth
      ? Math.floor((Date.now() - new Date(patient.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
      : null;

    const riskAssessment = await healthRiskService.predictRisk({
      age,
      chronic_conditions: patient.chronic_conditions || [],
      allergies: patient.allergies || [],
      current_medications: patient.current_medications || [],
    });

    const readmissionRisk = healthRiskService.assessReadmissionRisk({
      age,
      chronic_conditions: patient.chronic_conditions || [],
      current_medications: patient.current_medications || [],
    });

    // Update stored risk
    await patient.update({
      risk_score: riskAssessment.score,
      risk_level: riskAssessment.level,
    });

    res.json({
      success: true,
      data: {
        patient_id: patient.patient_id,
        health_risk: riskAssessment,
        readmission_risk: readmissionRisk,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /patients/{id}/vitals/emergency-check:
 *   post:
 *     summary: Check vital signs for emergency conditions
 *     tags: [Patients]
 */
const checkEmergency = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const emergencyResult = healthRiskService.detectEmergency(req.body);

    // Emit real-time alert if emergency detected
    if (emergencyResult.is_emergency) {
      const io = req.app.get('io');
      if (io) {
        io.emit('emergency_alert', {
          patient_id: patient.patient_id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
          ...emergencyResult,
        });
      }
    }

    res.json({ success: true, data: emergencyResult });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientRiskAssessment,
  checkEmergency,
};
