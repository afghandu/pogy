const postgres = require("../pgModel.js");

const nickSchema = postgres.Schema({
  
  discordId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  nicknames: {
    type: Array,
    default: [],
  },
 
});


module.exports = postgres.model('Nickname', nickSchema);