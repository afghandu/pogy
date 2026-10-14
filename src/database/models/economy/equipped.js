const postgres = require("../../pgModel.js");

let bal = postgres.Schema({
  user: { type: String, required: true },
  itemEquipped: { type: String, default: "Default Shotgun" },
});

module.exports = postgres.model("equippedItem", bal);
