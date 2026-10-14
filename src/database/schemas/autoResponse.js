const postgres = require("../pgModel.js");

const customCommandSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: false
  },
  name: {
    type: postgres.SchemaTypes.String,
    required: true,
  },
  content: {
    type: postgres.SchemaTypes.String,
    required: true,
  },
});

module.exports = postgres.model('autoResponse', customCommandSchema);