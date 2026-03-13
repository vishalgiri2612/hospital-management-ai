const { Op } = require('sequelize');
const { Bill, Patient, Appointment } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');

const getBills = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, patient_id } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = {};
    if (status) where.status = status;
    if (patient_id) where.patient_id = patient_id;

    if (req.user.role === 'patient') {
      const patientRecord = await Patient.findOne({ where: { user_id: req.user.id } });
      if (patientRecord) where.patient_id = patientRecord.id;
    }

    const { count, rows } = await Bill.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'first_name', 'last_name', 'patient_id'] },
      ],
      order: [['bill_date', 'DESC']],
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }],
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};

const createBill = async (req, res, next) => {
  try {
    const { items = [], tax_rate = 0.1, discount_amount = 0 } = req.body;

    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const tax_amount = subtotal * tax_rate;
    const total_amount = subtotal + tax_amount - discount_amount;

    const bill = await Bill.create({
      ...req.body,
      bill_number: generateUniqueId('BILL'),
      bill_date: new Date(),
      subtotal,
      tax_amount,
      total_amount,
    });

    res.status(201).json({ success: true, message: 'Bill created.', data: bill });
  } catch (error) {
    next(error);
  }
};

const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    await bill.update(req.body);
    res.json({ success: true, message: 'Bill updated.', data: bill });
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const { amount, payment_method } = req.body;
    const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(amount);
    const remaining = parseFloat(bill.total_amount) - newPaidAmount;

    let status = 'partial';
    if (remaining <= 0) status = 'paid';
    else if (new Date(bill.due_date) < new Date()) status = 'overdue';

    await bill.update({
      paid_amount: newPaidAmount,
      status,
      payment_method,
    });

    res.json({
      success: true,
      message: 'Payment processed.',
      data: {
        bill_number: bill.bill_number,
        total_amount: bill.total_amount,
        paid_amount: newPaidAmount,
        remaining_balance: Math.max(0, remaining),
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBills, getBillById, createBill, updateBill, processPayment };
