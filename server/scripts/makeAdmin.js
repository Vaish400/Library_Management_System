const pool = require('../config/db');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function makeAdmin() {
  try {
    console.log('🔐 Make User Admin');
    console.log('==================\n');

    // Get user email
    rl.question('Enter the email of the user to make admin: ', async (email) => {
      if (!email) {
        console.error('❌ Email is required');
        rl.close();
        process.exit(1);
      }

      try {
        // Check if user exists
        const [users] = await pool.execute(
          'SELECT id, name, email, role FROM users WHERE email = ?',
          [email]
        );

        if (users.length === 0) {
          console.error(`❌ User with email "${email}" not found`);
          rl.close();
          process.exit(1);
        }

        const user = users[0];
        console.log(`\nFound user: ${user.name} (${user.email})`);
        console.log(`Current role: ${user.role}`);

        if (user.role === 'admin') {
          console.log('✅ User is already an admin');
          rl.close();
          process.exit(0);
        }

        // Update role to admin
        await pool.execute(
          'UPDATE users SET role = ? WHERE email = ?',
          ['admin', email]
        );

        console.log('✅ User role updated to admin successfully!');
        console.log('\n⚠️  Note: User must logout and login again for changes to take effect.');

      } catch (error) {
        console.error('❌ Error:', error.message);
      } finally {
        rl.close();
        await pool.end();
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

makeAdmin();
