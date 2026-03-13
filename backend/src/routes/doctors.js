const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSchedule,
} = require('../controllers/doctorController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

router.use(authenticate);

router.get('/', getDoctors);
router.post(
  '/',
  authorize('admin'),
  [
    body('first_name').notEmpty().trim(),
    body('last_name').notEmpty().trim(),
    body('specialization').notEmpty().trim(),
    body('user_id').isUUID(),
    validateRequest,
  ],
  createDoctor
);
router.get('/:id', getDoctorById);
router.put('/:id', authorize('admin', 'doctor'), updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);
router.get('/:id/schedule', getDoctorSchedule);

module.exports = router;
