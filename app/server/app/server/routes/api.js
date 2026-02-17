const express = require('express');
const configCache = require('../utilities/configCache');

function sendCachedData(res, key, message) {
  const data = configCache.get(key);
  if (!data) return res.status(503).json({ message });

  res.set({
    'Content-Type': 'application/json',
    'Content-Encoding': 'gzip',
  });
  res.send(data);
}

module.exports = function (app) {
  const router = express.Router();

  router.get('/health', function (req, res, next) {
    res.json({ status: 'UP' });
  });

  // --- get static content from S3
  router.get('/configFiles', (req, res) => {
    sendCachedData(res, 'configFiles', 'Config file cache not available...');
  });

  // --- get static content from S3
  router.get('/supportedBrowsers', (req, res) => {
    sendCachedData(
      res,
      'supportedBrowsers',
      'Supported Browsers cache not available...',
    );
  });

  router.use((req, res) => {
    res.status(404).json({ message: 'The api route does not exist.' });
  });

  app.use('/api', router);
};
