const postgres = require("../../pgModel.js");

let appID = postgres.model({
  guildID: { type: String },
  userID: { type: String },
  appID: { type: String },
});

module.exports = postgres.model("appID", appID);
