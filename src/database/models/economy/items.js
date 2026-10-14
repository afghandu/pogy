const postgres = require("../../pgModel.js");

let bal = postgres.Schema({
  user: { type: String },
  Inventory: { type: Object },
});

module.exports = postgres.model("ecoitems", bal);
