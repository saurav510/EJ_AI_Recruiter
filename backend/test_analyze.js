const { analyzeWithGemini } = require('./src/services/geminiService');
require('dotenv').config();

const jd = "We are looking for a Senior React Developer with 5 years of experience. You must be skilled in React, Node.js, and MongoDB. Nice to have skills include GraphQL and Docker. You will be responsible for building new features, maintaining the codebase, and mentoring junior developers. A Bachelors degree in Computer Science is required. This is a Full-time remote position in the FinTech industry.";

(async () => {
  try {
    const res = await analyzeWithGemini(jd);
    console.log(res);
  } catch(e) {
    console.log(e.stack);
  }
})();
