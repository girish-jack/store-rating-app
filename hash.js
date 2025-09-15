const bcrypt = require('bcryptjs');

(async () => {
  const password = 'Girish@18';  // Replace with your desired password
  const hashed = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashed);  // Copy this output
})();
