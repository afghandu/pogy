const postgres = require("../pgModel");

const snipe = postgres.Schema({

    guildId: {type: String},
    channel: {type: String},
    message: {type: Array, default: []},
    tag: {type: Array, default: []},
    image: {type: Array, default: []},
   
})

module.exports = postgres.model('snipe', snipe)