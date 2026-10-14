const logger = require("../utils/logger");
const Event = require("../structures/Event");
const Discord = require("discord.js");
const config = require("../../config.json");
const Guild = require("../database/schemas/Guild");
const { WebhookClient } = require("discord.js");
const premiumrip = new WebhookClient({ url: config.webhooks.premium });
const Message = require("../utils/other/message");
const registerSlashCommands = require("../structures/SlashHandler");

async function expirePremiumSubscriptions(client) {
  const results = await Guild.find({ isPremium: "true" });

  for (const result of results) {
    if (
      Number(result.premium.redeemedAt) >=
      Number(result.premium.expiresAt)
    ) {
      const guild = client.guilds.cache.get(result.guildId);
      if (!guild) continue;

      const user = client.users.cache.get(result.premium.redeemedBy.id);
      if (user) {
        const embed = new Discord.MessageEmbed()
          .setColor(client.color.red)
          .setDescription(
            `Hey ${user.username}, Premium in ${guild.name} has Just expired :(\n\n__You can you re-new your server here!  you for purchasing premium Previously! We hope you enjoyed what you purchased.\n\n**- Pogy**`
          );
        user.send({ embeds: [embed] }).catch(() => {});
      }

      const rip = new Discord.MessageEmbed()
        .setDescription(
          `**Premium Subscription**\n\n**Guild:** ${guild.name} | **${guild.id}**\nRedeemed by: ${
            user ? user.tag : "Unknown"
          }\n**Plan:** ${result.premium.plan}`
        )
        .setColor("RED")
        .setTimestamp();

      await premiumrip
        .sendCustom({
          username: "Pogy Loose Premium",
          avatarURL: `${client.domain}/logo.png`,
          embeds: [rip],
        })
        .catch(() => {});

      result.isPremium = "false";
      result.premium.redeemedBy.id = null;
      result.premium.redeemedBy.tag = null;
      result.premium.redeemedAt = null;
      result.premium.expiresAt = null;
      result.premium.plan = null;
      await result.save();
    }
  }
}

module.exports = class extends Event {
  async run() {
    Message(this.client);

    await registerSlashCommands(this.client, "./src/slash");

    logger.info(
      `${this.client.user.tag} is ready to serve ${this.client.guilds.cache.size} guilds.`,
      { label: "Ready" }
    );

    const premiumExpiryInterval = setInterval(() => {
      expirePremiumSubscriptions(this.client).catch((error) => {
        logger.error(`Premium expiry sweep failed: ${error.message}`, {
          label: "Database",
        });
      });
    }, 86400000);
    premiumExpiryInterval.unref();

    if (config.dashboard === "true") {
      const Dashboard = require("../dashboard/dashboard");
      Dashboard(this.client);
    }
  }
};
