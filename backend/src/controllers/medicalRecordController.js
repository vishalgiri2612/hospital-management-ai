const { Op } = require('sequelize');
const { MedicalRecord, Patient, Doctor } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');

const getMedicalRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patient_id, record_type } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = {};
    if (patient_id) where.patient_id = patient_id;
    if (record_type) where.record_type = record_type;

    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ where: { user_id: req.user.id } });
      if (patientRecord) where.patient_id = patientRecord.id;
    }

    const { count, rows } = await MedicalRecord.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'patient_id'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'first_name', 'last_name', 'specialization'] },
      ],
      order: [['record_date', 'DESC']],
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
      ],
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const createMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      record_id: generateUniqueId('REC'),
    });

    res.status(201).json({
      success: true,
      message: 'Medical record created.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    await record.update(req.body);
    res.json({ success: true, message: 'Medical record updated.', data: record });
  } catch (error) {
    next(error);
  }
};

const deleteMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found.' });
    }

    await record.destroy();
    res.json({ success: true, message: 'Medical record deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
};
