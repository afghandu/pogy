const postgres = require("../pgModel");

const maintenance = postgres.Schema({

    maintenance: {type: String, default: 'maintenance'},
    toggle: {type: String, default: 'false'},
   
})

module.exports = postgres.model('maintenance', maintenance)