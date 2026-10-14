const postgres = require("../../../database/pgModel.js");

const reactionSchema = new postgres.Schema({
  guildid: { type: String },
  msgid: { type: String },
  roleid: { type: String },
  reaction: { type: String },
  dm: { type: Boolean },
  option: { type: Number },
});

module.exports = postgres.model("reaction", reactionSchema);
