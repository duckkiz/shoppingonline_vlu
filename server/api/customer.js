const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

router.post('/signup', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;

  if (!EmailUtil.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Email service is not configured. Set EMAIL_USER and EMAIL_PASS in the server environment.'
    });
  }

  const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);

  if (dbCust) {
    return res.status(409).json({ success: false, message: 'Exists username or email' });
  } else {
    const now = new Date().getTime();
    const token = CryptoUtil.md5(now.toString());

    const newCust = {
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email,
      active: 0,
      token: token
    };

    const result = await CustomerDAO.insert(newCust);

    if (result) {
      try {
        await EmailUtil.send(email, result._id, token);
        return res.json({ success: true, message: 'Please check email' });
      } catch (error) {
        console.error('Signup email delivery failed:', error);
        try {
          await CustomerDAO.deleteByID(result._id);
        } catch (cleanupError) {
          console.error('Could not remove customer after signup email failure:', cleanupError);
        }
        return res.status(502).json({
          success: false,
          message: 'Could not send activation email. Verify the email settings and try again.'
        });
      }
    } else {
      return res.status(500).json({ success: false, message: 'Insert failure' });
    }
  }
});

router.post('/active', async function (req, res) {
  const _id = req.body.id;
  const token = req.body.token;
  const result = await CustomerDAO.active(_id, token, 1);
  res.json(result);
});

router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);

    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken(customer.username);
        const customerInfo = {
          _id: customer._id,
          username: customer.username,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          active: customer.active
        };

        res.json({
          success: true,
          message: 'Authentication successful',
          token: token,
          customer: customerInfo
        });
      } else {
        res.json({ success: false, message: 'Account is deactive' });
      }
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } else {
    res.json({ success: false, message: 'Please input username and password' });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token
  });
});

router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const { username, password, name, phone, email } = req.body;

  if ([username, name, phone, email].some(
    (value) => typeof value !== 'string' || value.trim() === ''
  ) || (password !== undefined && typeof password !== 'string')) {
    return res.status(400).json({
      success: false,
      message: 'Please input valid customer details'
    });
  }

  const existingCustomer = await CustomerDAO.selectByID(_id);
  if (!existingCustomer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  if (existingCustomer.username !== req.decoded.username) {
    return res.status(403).json({ success: false, message: 'You cannot update this customer' });
  }

  const duplicateCustomer = await CustomerDAO.selectByUsernameOrEmail(
    username.trim(),
    email.trim()
  );
  if (duplicateCustomer && duplicateCustomer._id.toString() !== _id) {
    return res.status(409).json({
      success: false,
      message: 'Username or email is already in use'
    });
  }

  const customerUpdates = {
    _id: _id,
    username: username.trim(),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim()
  };
  if (password) customerUpdates.password = password;

  const result = await CustomerDAO.update(customerUpdates);

  if (!result) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const token = JwtUtil.genToken(result.username);
  const customerInfo = {
    _id: result._id,
    username: result.username,
    name: result.name,
    phone: result.phone,
    email: result.email,
    active: result.active
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    token: token,
    customer: customerInfo
  });
});

router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Your cart is empty'
    });
  }

  if (items.some((item) =>
    !item ||
    !item.product ||
    typeof item.product._id !== 'string' ||
    !mongoose.isValidObjectId(item.product._id) ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > 99
  )) {
    return res.status(400).json({
      success: false,
      message: 'Please provide valid cart items'
    });
  }

  const customer = await CustomerDAO.selectByUsername(req.decoded.username);
  if (!customer || customer.active !== 1) {
    return res.status(401).json({
      success: false,
      message: 'Customer account is not available'
    });
  }

  const orderItems = [];
  let total = 0;
  for (const item of items) {
    const product = await ProductDAO.selectByID(item.product._id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'A product in your cart no longer exists'
      });
    }

    orderItems.push({ product: product.toObject(), quantity: item.quantity });
    total += product.price * item.quantity;
  }

  if (!Number.isFinite(total)) {
    return res.status(400).json({
      success: false,
      message: 'Order total is invalid'
    });
  }

  const order = {
    cdate: Date.now(),
    total: total,
    status: 'PENDING',
    customer: {
      _id: customer._id,
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      active: customer.active
    },
    items: orderItems
  };

  const result = await OrderDAO.insert(order);
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: {
      _id: result._id,
      cdate: result.cdate,
      total: result.total,
      status: result.status,
      customer: order.customer,
      items: orderItems
    }
  });
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  if (!mongoose.isValidObjectId(_cid)) {
    return res.status(400).json({ success: false, message: 'Invalid customer ID' });
  }

  const customer = await CustomerDAO.selectByUsername(req.decoded.username);
  if (!customer || customer._id.toString() !== _cid) {
    return res.status(403).json({
      success: false,
      message: 'You cannot view orders for this customer'
    });
  }

  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.get('/products/new', async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
});

router.get('/products/hot', async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
});

router.get('/products/category/:cid', async function (req, res) {
  const products = await ProductDAO.selectByCatID(req.params.cid);
  res.json(products);
});

router.get('/products/search/:keyword', async function (req, res) {
  const products = await ProductDAO.selectByKeyword(req.params.keyword);
  res.json(products);
});

router.get('/products/:id', async function (req, res) {
  const product = await ProductDAO.selectByID(req.params.id);
  res.json(product);
});

module.exports = router;
