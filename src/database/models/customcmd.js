const postgres = require("../pgModel.js");

const customcmd = postgres.Schema({
  userID: { type: String },
  serverID: { type: String },
  command: { type: Array, default: [] },
  response: { type: Array, default: [] },
});

module.exports = postgres.model("cc", customcmd);
