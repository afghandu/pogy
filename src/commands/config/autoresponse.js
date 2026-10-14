const Command = require("../../structures/Command");
const { MessageEmbed } = require("discord.js");
const autoResponse = require("../../database/schemas/autoResponse.js");
const Guild = require("../../database/schemas/Guild");
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "autoresponse",
      description:
        "Create a auto Response which gets triggered without prefix!",
      category: "Config",
      aliases: ["ar", "aresponse"],
      usage: ["<command> <reply>"],
      examples: ["autoresponse pog Poggers!"],
      cooldown: 3,
      userPermission: ["MANAGE_GUILD"],
    });
  }

  async run(message, args) {
    const guildDB = await Guild.findOne({
      guildId: message.guild.id,
    });

    let prefix = guildDB.prefix;

    const language = require(`../../data/language/${guildDB.language}.json`);
    const namee = args[0];

    if (!namee)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setDescription(
              `${language.properusage} \`${prefix}autoResponse <command-name> <text-reply>\`\n\n${language.example} \`${prefix}autoResponse ping pong\``
            )
            .setTimestamp()
            .setFooter({ text: "" })
            .setColor(message.guild.me.displayHexColor),
        ],
      });

    let name = namee.toLowerCase();
    const content = args.slice(1).join(" ");
    if (!content)
      return message.channel.sendCustom({
        embeds: [
          new MessageEmbed()
            .setAuthor(
              `${message.author.tag}`,
              message.author.displayAvatarURL({ dynamic: true })
            )
            .setDescription(
              `${language.properusage} \`${prefix}autoResponse <command-name> <text-reply>\`\n\n${language.example} \`${prefix}autoResponse ping pong\``
            )
            .setTimestamp()
            .setFooter({ text: "" })
            .setColor(message.guild.me.displayHexColor),
        ],
      });

    if (namee.length > 30)
      return message.channel.sendCustom(
        `${message.client.emoji.fail} ${language.cc1}`
      );
    if (content.length > 2000)
      return message.channel.sendCustom(
        `${message.client.emoji.fail} ${language.cc2}`
      );

    if (guildDB.isPremium === "false") {
      const conditional = {
        guildId: message.guild.id,
      };
      const results = await autoResponse.find(conditional);

      if (results.length >= 10) {
        message.channel.sendCustom({
          embeds: [
            new MessageEmbed()
              .setColor(message.guild.me.displayHexColor)
              .setDescription(
                `${message.client.emoji.fail} Auto Response Limit Reached **(10)**\n\nUpgrade to premium for unlimited commands.`
              ),
          ],
        });

        return;
      }
    }

    const existing = await autoResponse.findOne({
      guildId: message.guild.id,
      name,
    });
    if (existing) {
      return message.channel.sendCustom(
        `${message.client.emoji.fail} ${language.cc4}`
      );
    }

    await autoResponse.create({ guildId: message.guild.id, name, content });
    message.channel.sendCustom({
      embeds: [
        new MessageEmbed()
          .setAuthor(
            `${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            `**${language.cc3}** ${name}\n\nDelete the following auto response using \`${prefix}deleteresponse <command-name>\``
          )
          .setTimestamp()
          .setFooter({ text: "" })
          .setColor(message.guild.me.displayHexColor),
      ],
    });
  }
};
