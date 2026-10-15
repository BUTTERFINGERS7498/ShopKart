const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn, spawnSync } = require('child_process');

(async () => {
  const memoryServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 120000 },
  });
  const uri = memoryServer.getUri();
  console.log(`MEMORY_URI ${uri}`);

  const env = { ...process.env, MONGO_URI: uri, PORT: '5000', NODE_ENV: 'development' };

  spawnSync(process.execPath, ['seed.js'], { cwd: __dirname, env, stdio: 'inherit' });

  const child = spawn(process.execPath, ['index.js'], {
    cwd: __dirname,
    env,
    stdio: 'inherit',
  });

  const shutdown = async () => {
    child.kill();
    await memoryServer.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
