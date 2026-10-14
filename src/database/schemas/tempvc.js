const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true,
  },
  channelId: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
  categoryID: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
});

module.exports = postgres.model("Temp Vc", guildConfigSchema);
