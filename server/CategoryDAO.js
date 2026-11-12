require('../utils/MongooseUtil');
const Models = require('./Models');

const CategoryDAO = {
  async selectAll() {
    const query = {};
    const categories = await Models.Category.find(query).exec();
    return categories;
  },
  async delete(_id) {
	    const result = await Models.Category.findByIdAndDelete(_id);
	    return result;
	}
};

module.exports = CategoryDAO;