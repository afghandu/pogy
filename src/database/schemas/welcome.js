const postgres = require("../pgModel.js");

const guildConfigSchema = postgres.Schema({
  guildId: {
    type: postgres.SchemaTypes.String,
    required: true,
    unique: true
  },
  welcomeToggle: {
    type: postgres.SchemaTypes.String,
    default: false,
  },
  welcomeDM: {
    type: postgres.SchemaTypes.String,
    default: false
  },
  welcomeChannel:{
    type: postgres.SchemaTypes.String,
    default: null,
  },
  welcomeMessage:{
    type: postgres.SchemaTypes.String,
    default: `Welcome {user} to {guild}! We now have {memberCount} Members!`,
  },
  welcomeEmbed:{
    type: postgres.SchemaTypes.String,
    default: false,
  },

  embed: {

  title: {
    type: postgres.SchemaTypes.String,
    default: `Welcome!`,
    },
     
  titleURL: {
    type: postgres.SchemaTypes.String,
    default: ``,
    },

    description: {
    type: postgres.SchemaTypes.String,
    default: `Welcome {user} to {guild}, we now have {memberCount} Members!`,
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
    timestamp :{
    type: postgres.SchemaTypes.String,
    default: false,
    },

    thumbnail: {
    type: postgres.SchemaTypes.String,
    default: ``,
    },

    image: {
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

module.exports = postgres.model('welcome-module', guildConfigSchema);