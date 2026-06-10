const express = require('express');
require('express-async-errors');
const app = express();

const validateJD = (req, res, next) => { next(); };

const analyzeJD = async (req, res, next) => {
  console.log("typeof next is", typeof next);
  throw new Error("test error");
};

app.post('/analyze', validateJD, analyzeJD);

app.use((err, req, res, next) => {
  console.log("Caught:", err.message);
  res.send('error');
});

const request = require('http');
app.listen(5003, () => {
  const req = request.request({
    hostname: 'localhost',
    port: 5003,
    path: '/analyze',
    method: 'POST'
  }, res => {
    process.exit(0);
  });
  req.end();
});
