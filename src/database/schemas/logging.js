const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true
  },

  moderation: {

  mute_role: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },

  delete_after_executed: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: false
  },
  delete_reply: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: false
  },
  include_reason: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: false
  },
  remove_roles: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: false
  },
  ban_action: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
  },
  kick_action: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
  },
  warn_action: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
  },
  mute_action: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
  },
  ban_message: {

    toggle: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false
    }, 
    message: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: null
    }

  },
  auto_punish: {
    toggle: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: false
    },
    amount: {
     type: postgres.SchemaTypes.Number,
     required: false,
     default: 1
    },
    punishment: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
    },
    dm: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "1"
    },
     
  },

  channel: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },
  caseN: {
     type: postgres.SchemaTypes.Number,
     required: false,
     default: 1
  },
  ignore_channel: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },

  ignore_role: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },

  color: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "#000000"
  },
  toggle: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false
  },
  
  ban: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  kick: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    role: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    purge: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    lock: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    warns: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    mute: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    slowmode: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    nicknames: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  
  },

    server_events: {

  channel: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },


  color: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "#000000"
  },
  toggle: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false
  },
  
  voice: {

  join: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  move: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  leave: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },

  },

  channel_created: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  channel_update: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    channel_delete: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    role_create: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    role_update: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    guild_update: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    emoji_update: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    member_join: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    member_leave: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  
  },
    member_events: {

  channel: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },
  color: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "#000000"
  },
  toggle: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false
  },
  
  role_update: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  name_change: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },

  
  },

    message_events: {

  channel: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: null
  },
  color: {
     type: postgres.SchemaTypes.String,
     required: false,
     default: "#000000"
  },
  toggle: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: false
  },
  
  deleted: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  edited: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    purged: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
    ignore: {
    type: postgres.SchemaTypes.String,
    required: false,
    default: true,
  },
  
  },
  

});

module.exports = postgres.model('logging', guildConfigSchema);