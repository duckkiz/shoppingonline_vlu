require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');

const ProductDAO = {
  async selectAll() {
    return Models.Product.find({}).exec();
  },

  async selectByID(_id) {
    return Models.Product.findById(_id).exec();
  },

  async selectByCatID(_cid) {
    return Models.Product.find({ 'category._id': _cid }).exec();
  },

  async selectByKeyword(keyword) {
    return Models.Product.find({ name: { $regex: new RegExp(keyword, 'i') } }).exec();
  },

  async selectTopNew(top) {
    return Models.Product.find({}).sort({ cdate: -1 }).limit(top).exec();
  },

  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } },
      { $limit: top },
    ]);
    const products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      if (product) products.push(product);
    }
    return products;
  },

  async insert(product) {
    product._id = new mongoose.Types.ObjectId();
    return Models.Product.create(product);
  },

  async update(product) {
    const values = {
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    };
    return Models.Product.findByIdAndUpdate(product._id, values, { new: true }).exec();
  },

  async delete(_id) {
    return Models.Product.findByIdAndDelete(_id).exec();
  },
};

module.exports = ProductDAO;