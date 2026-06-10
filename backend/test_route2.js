const express = require('express');
require('express-async-errors');
const app = express();

const validateJD = (req, res, next) => { next(); };

const analyzeJD = async (req, res, next) => {
  try {
    throw new Error('API key not valid');
  } catch (error) {
    next(error);
  }
};

app.post('/analyze', validateJD, analyzeJD);

const errorHandler = require('./src/middleware/errorHandler');
app.use(errorHandler);

const request = require('http');
app.listen(5004, () => {
  const req = request.request({
    hostname: 'localhost',
    port: 5004,
    path: '/analyze',
    method: 'POST'
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      process.exit(0);
    });
  });
  req.end();
});
