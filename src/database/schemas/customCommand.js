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
  json: {
    type: postgres.SchemaTypes.String,
    default: false,
  },
  content: {
    type: postgres.SchemaTypes.String,
    required: true,
  },
  title: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    description: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    color: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    footer: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    thumbnail: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    image: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
    timestamp: {
    type: postgres.SchemaTypes.String,
    required: false,
  },

});

module.exports = postgres.model('customCommand', customCommandSchema);