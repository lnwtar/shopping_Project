const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function runSqlFile(fileName) {
  const filePath = path.join(__dirname, '..', 'database', fileName);
  const statements = fs.readFileSync(filePath, 'utf8')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function main() {
  await runSqlFile('schema.sql');
  await runSqlFile('seed.sql');
  console.log('Database schema and demo catalog are ready.');
}

main()
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
