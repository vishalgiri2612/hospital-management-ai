const { Op } = require('sequelize');
const { Doctor, User, Appointment } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, specialization, department } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = { is_active: true };
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } },
        { doctor_id: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (specialization) where.specialization = { [Op.iLike]: `%${specialization}%` };
    if (department) where.department = { [Op.iLike]: `%${department}%` };

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['last_name', 'ASC']],
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const doctorData = { ...req.body };
    doctorData.doctor_id = generateUniqueId('DOC');
    const doctor = await Doctor.create(doctorData);
    logger.info(`Doctor created: ${doctor.doctor_id}`);
    res.status(201).json({ success: true, message: 'Doctor created successfully.', data: doctor });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    await doctor.update(req.body);
    res.json({ success: true, message: 'Doctor updated successfully.', data: doctor });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    await doctor.update({ is_active: false });
    res.json({ success: true, message: 'Doctor deactivated.' });
  } catch (error) {
    next(error);
  }
};

const getDoctorSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    const where = { doctor_id: req.params.id };
    if (date) where.appointment_date = date;

    const appointments = await Appointment.findAll({
      where,
      order: [['appointment_time', 'ASC']],
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSchedule,
};
