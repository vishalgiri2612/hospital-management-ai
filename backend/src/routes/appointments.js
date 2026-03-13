const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getOptimalSlots,
} = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment scheduling
 */

router.use(authenticate);

router.get('/', getAppointments);
router.post(
  '/',
  [
    body('patient_id').isUUID(),
    body('doctor_id').isUUID(),
    body('appointment_date').isDate(),
    body('appointment_time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    validateRequest,
  ],
  createAppointment
);
router.get('/optimal-slots', getOptimalSlots);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.post('/:id/cancel', cancelAppointment);

module.exports = router;
