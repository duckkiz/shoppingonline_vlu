require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');

const OrderDAO = {
  async insert(order) {
    order._id = new mongoose.Types.ObjectId();
    return Models.Order.create(order);
  },

  async selectByCustID(_cid) {
    const query = { 'customer._id': _cid };
    return Models.Order.find(query).sort({ cdate: -1 }).exec();
  },

  async selectAll() {
    const query = {};
    const mysort = { cdate: -1 };
    return Models.Order.find(query).sort(mysort).exec();
  },

  async update(id, newStatus) {
    const query = { _id: id, status: 'PENDING' };
    const newValues = { status: newStatus };
    return Models.Order.findOneAndUpdate(query, newValues, { new: true }).exec();
  }
};

module.exports = OrderDAO;
