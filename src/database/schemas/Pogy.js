const postgres = require("../pgModel.js");

const SlayBotSchema = postgres.Schema({
  news: {
    type: postgres.SchemaTypes.String,
    required: true,
  },
  time: {
    type: postgres.SchemaTypes.String,
    required: true,
  },
});

module.exports = postgres.model("PogyNews", SlayBotSchema);
