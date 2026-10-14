const postgres = require("../pgModel.js");

const blacklistSchema = postgres.Schema({
  discordId: {
    type: String,
  },
  guildId: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  isBlacklisted: {
    type: Boolean,
    required: false
  },
  reason: {
    type: String,
    required: false
  },
   length: {
     type: Date,
   }
});


module.exports = postgres.model('Blacklist', blacklistSchema);