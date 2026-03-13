const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientRiskAssessment,
  checkEmergency,
} = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

router.use(authenticate);

router.get('/', authorize('admin', 'doctor', 'nurse', 'receptionist'), getPatients);
router.post(
  '/',
  authorize('admin', 'receptionist'),
  [
    body('first_name').notEmpty().trim(),
    body('last_name').notEmpty().trim(),
    body('date_of_birth').isDate(),
    body('gender').isIn(['male', 'female', 'other']),
    validateRequest,
  ],
  createPatient
);

router.get('/:id', getPatientById);
router.put('/:id', authorize('admin', 'doctor', 'receptionist'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

router.get('/:id/risk-assessment', authorize('admin', 'doctor', 'nurse'), getPatientRiskAssessment);
router.post('/:id/vitals/emergency-check', authorize('admin', 'doctor', 'nurse'), checkEmergency);

module.exports = router;
