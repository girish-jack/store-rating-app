// generateHash.js
const bcrypt = require('bcryptjs');

async function run() {
  const plain = process.argv[2] || 'J@ck1718';  // Use CLI arg or default
  try {
    const hash = await bcrypt.hash(plain, 10);  // 10 salt rounds
    console.log('Plain password:', plain);
    console.log('Generated hash:', hash);
  } catch (err) {
    console.error('Hash generation failed:', err.message);
  }
}

run();
