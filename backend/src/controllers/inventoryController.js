const { Op } = require('sequelize');
const { InventoryItem } = require('../models');
const { generateUniqueId, getPagination, paginatedResponse } = require('../utils/helpers');
const resourceAllocation = require('../services/ai/resourceAllocation');

const getInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const { offset, limit: parsedLimit } = getPagination(page, limit);

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { item_code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await InventoryItem.findAndCountAll({
      where,
      limit: parsedLimit,
      offset,
      order: [['name', 'ASC']],
    });

    res.json({ success: true, ...paginatedResponse(rows, count, page, limit) });
  } catch (error) {
    next(error);
  }
};

const getInventoryItemById = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const createInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create({
      ...req.body,
      item_code: generateUniqueId('INV'),
    });
    res.status(201).json({ success: true, message: 'Inventory item created.', data: item });
  } catch (error) {
    next(error);
  }
};

const updateInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await item.update(req.body);

    // Update status based on stock level
    const status =
      item.quantity_in_stock === 0
        ? 'out_of_stock'
        : item.quantity_in_stock <= item.minimum_stock_level
        ? 'low_stock'
        : 'in_stock';
    await item.update({ status });

    res.json({ success: true, message: 'Inventory item updated.', data: item });
  } catch (error) {
    next(error);
  }
};

const restockItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const { quantity } = req.body;
    const newQuantity = item.quantity_in_stock + quantity;
    const status = newQuantity > item.minimum_stock_level ? 'in_stock' : 'low_stock';

    await item.update({
      quantity_in_stock: newQuantity,
      last_restocked: new Date(),
      status,
    });

    res.json({ success: true, message: 'Item restocked.', data: item });
  } catch (error) {
    next(error);
  }
};

const getLowStockAlerts = async (req, res, next) => {
  try {
    const { rows } = await InventoryItem.findAndCountAll({
      where: {
        status: { [Op.in]: ['low_stock', 'out_of_stock'] },
      },
      order: [['quantity_in_stock', 'ASC']],
    });

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

const getPredictedDemand = async (req, res, next) => {
  try {
    const items = await InventoryItem.findAll({
      where: { status: { [Op.ne]: 'discontinued' } },
    });

    const forecast = resourceAllocation.predictInventoryDemand(
      [{ predicted_admissions: 20 }], // Default forecast
      items
    );

    res.json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  restockItem,
  getLowStockAlerts,
  getPredictedDemand,
};
