// Script to kill process on port 5000 (Windows)
const { exec } = require('child_process');
const PORT = process.env.PORT || 5000;

console.log(`🔍 Finding process on port ${PORT}...`);

// Find process using the port
exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error finding process:', error.message);
    console.log('\n💡 Try manually:');
    console.log(`   netstat -ano | findstr :${PORT}`);
    console.log(`   taskkill /PID <PID> /F`);
    return;
  }

  if (!stdout) {
    console.log(`✅ Port ${PORT} is free!`);
    return;
  }

  // Extract PID from output
  const lines = stdout.trim().split('\n');
  const pids = new Set();
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length > 0) {
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    }
  });

  if (pids.size === 0) {
    console.log('⚠️  Could not find PID. Try manually:');
    console.log(`   netstat -ano | findstr :${PORT}`);
    return;
  }

  console.log(`\n📋 Found ${pids.size} process(es) on port ${PORT}:`);
  pids.forEach(pid => console.log(`   PID: ${pid}`));

  // Kill each process
  pids.forEach(pid => {
    console.log(`\n🔪 Killing process ${pid}...`);
    exec(`taskkill /PID ${pid} /F`, (killError, killStdout, killStderr) => {
      if (killError) {
        console.error(`❌ Failed to kill PID ${pid}:`, killError.message);
      } else {
        console.log(`✅ Successfully killed PID ${pid}`);
      }
    });
  });

  console.log(`\n✅ Done! You can now start the server.`);
});
