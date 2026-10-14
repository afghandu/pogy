const postgres = require("../pgModel.js");

let robSchema = postgres.Schema({
  userID: { type: String },
  hasPadlock: { type: Boolean, default: false },
});

module.exports = postgres.model("EcoRob", robSchema);
