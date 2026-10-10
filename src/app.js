const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
app.disable('x-powered-by');
const startedAt = Date.now();

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/info', (req, res) => {
  res.json({
    service: 'shipit',
    version: process.env.APP_VERSION || 'dev',
    commit: process.env.GIT_SHA || 'local',
    environment: process.env.APP_ENV || 'local',
    pod: os.hostname(),
    runtime: process.version,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
  });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = app;