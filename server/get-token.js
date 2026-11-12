// Script tạm thời để lấy token của customer
// Chạy: node get-token.js
// Xóa file này sau khi dùng xong

require('./utils/MongooseUtil');
const Models = require('./models/Models');

setTimeout(async () => {
  try {
    const customers = await Models.Customer.find({}).select('_id username email active token').exec();
    
    console.log('\n========== DANH SÁCH CUSTOMERS ==========');
    customers.forEach(c => {
      console.log(`\nUsername : ${c.username}`);
      console.log(`Email    : ${c.email}`);
      console.log(`Active   : ${c.active} ${c.active === 1 ? '(đã active)' : '(chưa active)'}`);
      console.log(`ID       : ${c._id}`);
      console.log(`Token    : ${c.token}`);
      console.log('------------------------------------------');
    });

    console.log('\n✅ Copy ID và Token ở trên vào trang /active để kích hoạt tài khoản\n');
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
  process.exit(0);
}, 4000);

