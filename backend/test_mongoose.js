const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  originalJD: String,
  wordCount: Number
});

schema.pre('save', { document: true, query: false }, function(next) {
  this.wordCount = this.originalJD.split(' ').length;
  next();
});

const Model = mongoose.model('Test', schema);

(async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:admin@cluster.mongodb.net/test', {
      serverSelectionTimeoutMS: 1000
    });
  } catch(e) {
    // ignore connect error if any, we just want to test save
  }
  
  try {
    const doc = new Model({ originalJD: "hello world" });
    await doc.validate();
    console.log("Validate ok");
    try {
        await doc.save();
    } catch(e) {
        console.log("Save error:", e.message);
    }
  } catch(e) {
    console.log(e.stack);
  }
  process.exit(0);
})();
