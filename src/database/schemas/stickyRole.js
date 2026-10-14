const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true
  },
  stickyroleID: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: null
  },
  stickyroleToggle: {
    type: String,
    required: false,
    default: false
  },
  stickyroleUser: {
    type: Array,
    required: false,
    default: []
  }
});

module.exports = postgres.model('sticky', guildConfigSchema);