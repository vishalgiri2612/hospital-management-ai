const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getMedicalRecords);
router.post('/', authorize('admin', 'doctor', 'nurse'), createMedicalRecord);
router.get('/:id', getMedicalRecordById);
router.put('/:id', authorize('admin', 'doctor'), updateMedicalRecord);
router.delete('/:id', authorize('admin'), deleteMedicalRecord);

module.exports = router;
