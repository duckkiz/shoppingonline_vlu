require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');

const CustomerDAO = {
  async selectAll() {
    const query = {};
    const customers = await Models.Customer.find(query).select('-password -token').exec();
    return customers;
  },

  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  async selectByID(id) {
    const customer = await Models.Customer.findById(id).exec();
    return customer;
  },

  async selectByUsername(username) {
    return Models.Customer.findOne({ username: username }).exec();
  },

  async insert(customer) {
    customer._id = new mongoose.Types.ObjectId();
    return Models.Customer.create(customer);
  },

  async deleteByID(_id) {
    return Models.Customer.findByIdAndDelete(_id).exec();
  },

  async update(customer) {
    const newValues = {
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email
    };
    if (customer.password) newValues.password = customer.password;
    return Models.Customer.findByIdAndUpdate(customer._id, newValues, {
      new: true
    }).exec();
  },

  async active(id, token, active) {
    const query = { _id: id, token: token };
    const newValues = { active: active };
    const result = await Models.Customer.findOneAndUpdate(query, newValues, {
      new: true
    });
    return result;
  },

  async deactiveByID(id) {
    return Models.Customer.findByIdAndUpdate(id, { active: 0 }, { new: true }).exec();
  },
};

module.exports = CustomerDAO;
