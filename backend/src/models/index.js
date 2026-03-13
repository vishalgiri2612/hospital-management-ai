const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Bill = require('./Bill');
const InventoryItem = require('./InventoryItem');
const Staff = require('./Staff');

// User associations
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient_profile' });
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctor_profile' });
User.hasOne(Staff, { foreignKey: 'user_id', as: 'staff_profile' });

Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Staff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Appointment associations
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });

// Medical record associations
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment',
});
Patient.hasMany(MedicalRecord, {
  foreignKey: 'patient_id',
  as: 'medical_records',
});
Doctor.hasMany(MedicalRecord, {
  foreignKey: 'doctor_id',
  as: 'medical_records',
});

// Bill associations
Bill.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
Bill.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
Patient.hasMany(Bill, { foreignKey: 'patient_id', as: 'bills' });

module.exports = {
  User,
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  Bill,
  InventoryItem,
  Staff,
};
