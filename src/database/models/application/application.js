const postgres = require("../../pgModel.js");

const app = postgres.Schema({
  guildID: {
    type: String,
  },
  questions: {
    type: Array,
    default: [],
  },
  appToggle: {
    type: Boolean,
    default: false,
  },
  appLogs: {
    type: String,
    default: null,
  },
  add_role: {
    type: String,
    default: null,
  },
  remove_role: {
    type: String,
    default: null,
  },
  dm: {
    type: Boolean,
    default: true,
  },
});

module.exports = postgres.model("app", app);
