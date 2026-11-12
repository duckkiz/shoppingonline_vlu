const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// utils
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
// daos
const AdminDAO = require('../models/AdminDAO')
const CategoryDAO = require('../models/CategoryDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');
const ProductDAO = require('../models/ProductDAO');

// login
router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken();
      res.json({ success: true, message: 'Authentication successful', token: token });
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } else {
    res.json({ success: false, message: 'Please input username and password' });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
});

router.get('/customers/sendmail/:id', JwtUtil.checkToken, async function (req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  const customer = await CustomerDAO.selectByID(id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer does not exist' });
  }
  if (!EmailUtil.isConfigured()) {
    return res.status(503).json({ success: false, message: 'Email service is not configured' });
  }

  try {
    await EmailUtil.send(customer.email, customer._id, customer.token);
    return res.json({ success: true, message: 'Please check email' });
  } catch (error) {
    console.error('Customer activation email delivery failed:', error);
    return res.status(502).json({ success: false, message: 'Email failure' });
  }
});

router.put('/customers/deactive/:id', JwtUtil.checkToken, async function (req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  const result = await CustomerDAO.deactiveByID(id);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  res.json({
    success: true,
    customer: { _id: result._id, active: result.active }
  });
});

router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectAll();
  res.json(orders);
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  if (!mongoose.isValidObjectId(_cid)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

router.put('/orders/status/:id', JwtUtil.checkToken, async function (req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }
  if (!['APPROVED', 'CANCELED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be APPROVED or CANCELED'
    });
  }

  const order = await OrderDAO.update(id, status);
  if (!order) {
    return res.status(409).json({
      success: false,
      message: 'Order not found or is no longer pending'
    });
  }

  res.json(order);
});

router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ success: false, message: 'Please input name' });
  }
  const category = await CategoryDAO.insert({ name: name });
  res.json(category);
});

router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) {
    return res.status(400).json({ success: false, message: 'Please input name' });
  }
  const category = await CategoryDAO.update({ _id: req.params.id, name: name });
  res.json(category);
});

router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const category = await CategoryDAO.delete(req.params.id);
  res.json(category);
});

router.get('/products', JwtUtil.checkToken, async function (req, res) {
  const products = await ProductDAO.selectAll();
  const sizePage = 4;
  const noPages = Math.ceil(products.length / sizePage);
  const requestedPage = Number.parseInt(req.query.page, 10) || 1;
  const curPage = noPages === 0 ? 1 : Math.min(Math.max(requestedPage, 1), noPages);
  const offset = (curPage - 1) * sizePage;
  res.json({
    products: products.slice(offset, offset + sizePage),
    noPages: noPages,
    curPage: curPage,
  });
});

router.post('/products', JwtUtil.checkToken, async function (req, res) {
  const { name, price, category: categoryId, image } = req.body;
  const parsedPrice = Number(price);
  if (typeof name !== 'string' || !name.trim() || price === '' || price == null ||
      !Number.isFinite(parsedPrice) || parsedPrice < 0 || !categoryId || !image) {
    return res.status(400).json({ success: false, message: 'Please input valid product details' });
  }
  const category = await CategoryDAO.selectByID(categoryId);
  if (!category) {
    return res.status(400).json({ success: false, message: 'Category not found' });
  }
  const product = await ProductDAO.insert({
    name: String(name).trim(),
    price: parsedPrice,
    image: image,
    cdate: Date.now(),
    category: category,
  });
  res.json(product);
});

router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const { name, price, category: categoryId, image } = req.body;
  const parsedPrice = Number(price);
  if (typeof name !== 'string' || !name.trim() || price === '' || price == null ||
      !Number.isFinite(parsedPrice) || parsedPrice < 0 || !categoryId || !image) {
    return res.status(400).json({ success: false, message: 'Please input valid product details' });
  }
  const category = await CategoryDAO.selectByID(categoryId);
  if (!category) {
    return res.status(400).json({ success: false, message: 'Category not found' });
  }
  const product = await ProductDAO.update({
    _id: req.params.id,
    name: String(name).trim(),
    price: parsedPrice,
    image: image,
    category: category,
  });
  res.json(product);
});

router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const product = await ProductDAO.delete(req.params.id);
  res.json(product);
});

module.exports = router;