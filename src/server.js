const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`shipit listening on ${port}`);
});

// Kubernetes sends SIGTERM before killing a pod; finish in-flight requests first.
const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);