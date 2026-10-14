const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

module.exports = async function registerSlashCommands(client, commandFolder) {
  const directory = path.resolve(commandFolder);
  const commandFiles = fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".js"))
    .sort();
  const commands = commandFiles
    .map((file) => require(path.join(directory, file)))
    .filter((command) => command.slash === "true");

  client.commands = new Collection(commands.map((command) => [command.name, command]));
  client.commandAliases = new Collection();
  await client.application.commands.set(
    commands.map((command) => ({
      name: command.name,
      description: command.description,
      type: 1,
      ...(command.options ? { options: command.options } : {}),
    }))
  );

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await interaction.deferReply();
      await command.run({ interaction });
    } catch (error) {
      console.error(`Slash command ${command.name} failed:`, error);
      if (typeof command.error === "function") {
        await command.error(error, command, interaction);
        return;
      }
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "Unable to run this command due to an error.",
        });
      } else {
        await interaction.reply({
          content: "Unable to run this command due to an error.",
          ephemeral: true,
        });
      }
    }
  });
};
