module.exports = {
  apps: [
    {
      name: 'flightlog-gateway',
      cwd: '/var/www/fs-manager/fs-rsolutionsbr.com/gateway',
      script: 'dist/index.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      time: true,
    },
    {
      name: 'flightlog-api',
      cwd: '/var/www/fs-manager/fs-rsolutionsbr.com/backend',
      script: 'dist/server.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      time: true,
    },
  ],
};
