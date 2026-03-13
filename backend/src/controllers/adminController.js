const { sequelize } = require('../config/database');
const { Patient, Doctor, Appointment, Bill, InventoryItem } = require('../models');
const { Op } = require('sequelize');
const resourceAllocation = require('../services/ai/resourceAllocation');

const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
      .toISOString()
      .split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingBills,
      lowStockItems,
      recentAppointments,
    ] = await Promise.all([
      Patient.count({ where: { is_active: true } }),
      Doctor.count({ where: { is_active: true } }),
      Appointment.count({ where: { appointment_date: today } }),
      Bill.count({ where: { status: { [Op.in]: ['pending', 'overdue'] } } }),
      InventoryItem.count({ where: { status: { [Op.in]: ['low_stock', 'out_of_stock'] } } }),
      Appointment.findAll({
        where: { appointment_date: { [Op.gte]: thirtyDaysAgo } },
        attributes: ['appointment_date', 'status'],
        order: [['appointment_date', 'DESC']],
        limit: 100,
      }),
    ]);

    // Aggregate appointment stats
    const appointmentsByStatus = recentAppointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Revenue stats
    const revenueData = await Bill.findAll({
      where: {
        bill_date: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.in]: ['paid', 'partial'] },
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
        [sequelize.fn('SUM', sequelize.col('paid_amount')), 'collected_revenue'],
      ],
    });

    const revenue = revenueData[0]?.dataValues || {
      total_revenue: 0,
      collected_revenue: 0,
    };

    // Patient risk distribution
    const riskDistribution = await Patient.findAll({
      attributes: [
        'risk_level',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['risk_level'],
    });

    res.json({
      success: true,
      data: {
        overview: {
          total_patients: totalPatients,
          total_doctors: totalDoctors,
          today_appointments: todayAppointments,
          pending_bills: pendingBills,
          low_stock_alerts: lowStockItems,
        },
        appointments: {
          by_status: appointmentsByStatus,
          total_last_30_days: recentAppointments.length,
        },
        revenue: {
          total_billed: parseFloat(revenue.total_revenue || 0),
          total_collected: parseFloat(revenue.collected_revenue || 0),
          collection_rate:
            revenue.total_revenue > 0
              ? parseFloat(
                  ((revenue.collected_revenue / revenue.total_revenue) * 100).toFixed(1)
                )
              : 0,
        },
        patient_risk_distribution: riskDistribution.map((r) => ({
          level: r.risk_level,
          count: parseInt(r.dataValues.count),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCapacityForecast = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    // Get historical admission data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const historicalAppointments = await Appointment.findAll({
      where: {
        appointment_date: { [Op.gte]: thirtyDaysAgo },
        status: 'completed',
      },
      attributes: ['appointment_date'],
    });

    // Group by day
    const dailyCounts = {};
    historicalAppointments.forEach((apt) => {
      const d = apt.appointment_date;
      dailyCounts[d] = (dailyCounts[d] || 0) + 1;
    });

    const forecast = resourceAllocation.predictResourceDemand(
      { daily_admissions: Object.values(dailyCounts) },
      parseInt(days)
    );

    res.json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const where = {};
    if (start_date) where.appointment_date = { [Op.gte]: start_date };
    if (end_date) where.appointment_date = { ...where.appointment_date, [Op.lte]: end_date };

    const appointments = await Appointment.findAll({
      where,
      attributes: ['appointment_date', 'status', 'type', 'doctor_id'],
    });

    // Analytics calculations
    const byType = appointments.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});

    const completionRate =
      appointments.length > 0
        ? appointments.filter((a) => a.status === 'completed').length / appointments.length
        : 0;

    res.json({
      success: true,
      data: {
        total_appointments: appointments.length,
        completion_rate: parseFloat((completionRate * 100).toFixed(1)),
        appointments_by_type: byType,
        period: { start_date, end_date },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getCapacityForecast, getAnalytics };
