const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({

code: {type: postgres.SchemaTypes.String, default: null},

expiresAt: {type: postgres.SchemaTypes.String, default: Date.now() + 2592000000},

plan: {type: postgres.SchemaTypes.String, default: null},


  

});

module.exports = postgres.model('premium-guild', guildConfigSchema);