const postgres = require("../pgModel.js");

const shortUrlSchema = new postgres.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  guildID: String,
  memberID: String,
});

module.exports = postgres.model("ShortUrl", shortUrlSchema);
