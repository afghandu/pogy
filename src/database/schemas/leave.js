const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true,
  },
  leaveToggle: {
    type: postgres.SchemaTypes.String,
    default: false,
  },
  leaveDM: {
    type: postgres.SchemaTypes.String,
    default: false,
  },
  leaveChannel: {
    type: postgres.SchemaTypes.String,
    default: null,
  },
  leaveMessage: {
    type: postgres.SchemaTypes.String,
    default: `{user_tag} just left {guild}, we now have {memberCount} Members!`,
  },
  leaveEmbed: {
    type: postgres.SchemaTypes.String,
    default: false,
  },

  embed: {
    title: {
      type: postgres.SchemaTypes.String,
      default: `Goodbye!`,
    },

    titleURL: {
      type: postgres.SchemaTypes.String,
      default: ``,
    },

    description: {
      type: postgres.SchemaTypes.String,
      default: `{user_tag} just left {guild}, we now have {memberCount} Members!`,
    },
    footer: {
      type: postgres.SchemaTypes.String,
      default: ``,
    },
    footerIcon: {
      type: postgres.SchemaTypes.String,
      default: ``,
    },
    color: {
      type: postgres.SchemaTypes.String,
      default: `#000000`,
    },
    timestamp: {
      type: postgres.SchemaTypes.String,
      default: false,
    },

    thumbnail: {
      type: postgres.SchemaTypes.String,
      default: ``,
    },

    author: {
      name: {
        type: postgres.SchemaTypes.String,
        default: ``,
      },

      url: {
        type: postgres.SchemaTypes.String,
        default: ``,
      },

      icon: {
        type: postgres.SchemaTypes.String,
        default: ``,
      },
    },
  },
});

module.exports = postgres.model("leave", guildConfigSchema);
