const postgres = require("../pgModel.js");
const config = require("../../../config.json");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true,
  },
  disabledCommands: {
    type: postgres.SchemaTypes.Array,
    default: [],
  },
  prefix: {
    type: postgres.SchemaTypes.String,
    required: true,
    default: config.prefix || "p!",
  },
  isPremium: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false,
  },
  premium: {
    redeemedBy: {
      id: { type: postgres.SchemaTypes.String, default: null },
      tag: { type: postgres.SchemaTypes.String, default: null },
    },

    redeemedAt: { type: postgres.SchemaTypes.String, default: null },

    expiresAt: { type: postgres.SchemaTypes.String, default: null },

    plan: { type: postgres.SchemaTypes.String, default: null },
  },
  logChannelID: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
  modlogcolor: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: "#000000",
  },
  greetChannelID: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
  farewellChannelID: {
    type: postgres.SchemaTypes.String,
    required: false,
  },
  antiInvites: {
    type: postgres.SchemaTypes.Boolean,
  },
  antiLinks: {
    type: postgres.SchemaTypes.Boolean,
  },
  leaves: {
    type: postgres.SchemaTypes.Array,
    default: [],
  },
  suggestion: {
    suggestionChannelID: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: null,
    },
    suggestioncolor: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: "#000000",
    },
    suggestionlogChannelID: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: null,
    },
    decline: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: true,
    },
    deleteSuggestion: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: true,
    },
    description: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: `{suggestion}`,
    },
    footer: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: `Suggested by {user_tag}`,
    },
    timestamp: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: false,
    },
    reaction: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: `1`,
    },
  },
  report: {
    reportChannelID: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: null,
    },
    reportcolor: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: "#000000",
    },
    disableUser: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: false,
    },
    disableIssue: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: false,
    },
    upvote: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: false,
    },
    reaction: {
      type: postgres.SchemaTypes.String,
      required: false,
      default: `1`,
    },
    reportCase: {
      type: postgres.SchemaTypes.Number,
      default: "1",
    },
  },
  dashboardLogID: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: null,
  },
  cases: {
    type: postgres.SchemaTypes.Number,
  },
  language: {
    type: postgres.SchemaTypes.String,
    default: "english",
  },
  reactionDM: {
    type: Boolean,
    default: true,
  },
  reactionLogs: {
    type: postgres.SchemaTypes.String,
    default: null,
    required: false,
  },
  reactionColor: {
    type: postgres.SchemaTypes.String,
    default: "#000000",
    required: false,
  },
  autoroleID: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: null,
  },
  autoroleToggle: {
    type: Boolean,
    required: false,
    default: false,
  },
});

module.exports = postgres.model("guild", guildConfigSchema);
