const app = require('./src/app');
const request = require('supertest');

request(app)
  .post('/api/jd/analyze')
  .send({
    jobDescription: "We are looking for a Senior React Developer with 5 years of experience. You must be skilled in React, Node.js, and MongoDB. Nice to have skills include GraphQL and Docker. You will be responsible for building new features, maintaining the codebase, and mentoring junior developers. A Bachelors degree in Computer Science is required. This is a Full-time remote position in the FinTech industry."
  })
  .expect(500)
  .end((err, res) => {
    if (err) throw err;
    console.log(res.body);
    process.exit(0);
  });
