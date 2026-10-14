const postgres = require("../pgModel.js");

const uSchema = postgres.Schema({
  
  discordId: {
    type: String,
    required: true,
  },
  usernames: {
    type: Array,
    default: [],
  },
 
});


module.exports = postgres.model('Username', uSchema);