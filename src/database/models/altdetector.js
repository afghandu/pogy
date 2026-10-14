const postgres = require("../pgModel.js");

let altDetector = postgres.Schema({
  guildID: { type: postgres.SchemaTypes.String, required: true, unique: true },
  altDays: { type: String, default: 7 },
  altModlog: { type: String, default: null },
  allowedAlts: { type: Array, default: [] },
  altAction: { type: String, default: "none" },
  altToggle: { type: Boolean, default: false },
  notifier: { type: Boolean, default: false },
});

module.exports = postgres.model("altDetector", altDetector);
