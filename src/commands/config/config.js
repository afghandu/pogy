const Command = require("../../structures/Command");
const Guild = require("../../database/schemas/Guild");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "settings",
      aliases: ["cfg"],
      description: "Show's the current settings for this guild",
      category: "Config",
      guildOnly: true,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    const language = require(`../../data/language/${guildDB.language}.json`);
    await message.channel.sendCustom({
      embeds: [
        new MessageEmbed()
          .setColor(message.guild.me.displayHexColor)
          .setTitle(`${language.serversettings1}`)
          .addField(
            `Main Settings`,
            `\`Click here\``,
            true
          )
          .addField(
            `Welcome & Leave`,
            `\`Click here\``,
            true
          )
          .addField(
            `Logging`,
            `\`Click here\``,
            true
          )
          .addField(
            `Autorole`,
            `\`Click here\``,
            true
          )
          .addField(
            `Alt Detector`,
            `\`Click here\``,
            true
          )
          .addField(
            `Tickets`,
            `\`Click here\``,
            true
          )
          .addField(
            `Suggestions`,
            `\`Click here\``,
            true
          )
          .addField(
            `Server Reports`,
            `\`Click here\``,
            true
          )
          .addField(
            `Automod`,
            `\`Click here\``,
            true
          )

          .setFooter({ text: `${message.guild.name}` }),
      ],
    });
  }
};
