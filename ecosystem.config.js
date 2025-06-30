// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'fe-admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 1314', // Quan trọng: Chỉ định port ở đây nếu cần
      instances: '1',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};