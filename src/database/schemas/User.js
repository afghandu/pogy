const postgres = require("../pgModel.js");

const userSchema = postgres.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  badges: {
    type: Array,
    default: [],
  },
  rep: {
    type: Number,
    required: false,
  },
  lastVoted: { type: Number },
  votes: { type: Number },
});

module.exports = postgres.model("User", userSchema);
