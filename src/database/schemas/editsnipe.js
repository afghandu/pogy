const postgres = require("../pgModel");

const esnipe = postgres.Schema({

    guildId: {type: String},
    channel: {type: String},
    oldmessage: {type: Array, default: []},
    newmessage: {type: Array, default: []},
    id: {type: Array, default: []},
    url: {type: Array, default: []},
   
})

module.exports = postgres.model('edit-snipe', esnipe)