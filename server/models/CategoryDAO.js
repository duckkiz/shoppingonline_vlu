require("../utils/MongooseUtil");
const mongoose = require("mongoose");
const Models = require("./Models");

const CategoryDAO = {
  async selectAll() {
    return Models.Category.find({}).exec();
  },

  async selectByID(_id) {
    return Models.Category.findById(_id).exec();
  },

  async insert(category) {
    category._id = new mongoose.Types.ObjectId();
    return Models.Category.create(category);
  },

  async update(category) {
    return Models.Category.findByIdAndUpdate(
      category._id,
      { name: category.name },
      { new: true },
    ).exec();
  },

  async delete(_id) {
    return Models.Category.findByIdAndDelete(_id).exec();
  },
};

module.exports = CategoryDAO;
