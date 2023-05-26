const mongoose = require("mongoose");

const calSchema = new mongoose.Schema({
    name: String,
    calculation: String,
    result: Number
  });
  
module.exports = mongoose.model('Cal', calSchema);