const MyConstants = {
  DB_SERVER: 'cluster0.3smcbdc.mongodb.net',
  DB_USER: 'Duc',
  DB_PASS: '123',
  DB_DATABASE: 'shoppingonline',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  JWT_SECRET: 'secretkey',
  JWT_EXPIRES: '365000000000000' // in milliseconds
};
module.exports = MyConstants;