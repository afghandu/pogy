const postgres = require("../../pgModel.js");

let bal = postgres.Schema({
  user: { type: String },
  balance: { type: Number, default: 0 },
});

module.exports = postgres.model("balance", bal);
