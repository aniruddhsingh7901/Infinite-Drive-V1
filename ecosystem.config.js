module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: '/infinite-drive-v2/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,  // Changed to port 3001 to avoid conflicts
        NEXT_PUBLIC_API_URL: 'https://infinitedriven.com/api',
        NEXT_PUBLIC_FRONTEND_URL: 'https://infinitedriven.com'
      },
    },
    {
      name: 'backend',
      cwd: '/infinite-drive-v2/backend',
      script: './dist/app.js',  // Changed to point to compiled TypeScript
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '750M',
      env: {
        NODE_ENV: 'production',
        PORT: 5002,  // Changed to port 5002 to avoid conflicts
        API_URL: 'https://infinitedriven.com/api',
        FRONTEND_URL: 'https://infinitedriven.com'
      },
    }
  ]
};
