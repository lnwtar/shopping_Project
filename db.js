const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // ใส่รหัสผ่านของคุณ
  database: 'shop_platform'
});

module.exports = pool;
