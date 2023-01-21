// Require the necessary discord.js classes
import {
  Client,
  CommandInteraction,
  Events,
  GatewayIntentBits,
} from 'discord.js';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from './types';
const filePath = fileURLToPath(import.meta.url);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands: Command[] = [];

const commandsPath = path.join(path.dirname(filePath), 'commands');
const commandFiles = await fs.readdir(commandsPath);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command: Command = await import(filePath);
  commands.push(command);
}

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction,
): Promise<void> => {
  const slashCommand = commands.find(
    c => c.command.name === interaction.commandName,
  );
  if (!slashCommand) {
    interaction.followUp({ content: 'An error has occurred' });
    return;
  }

  await interaction.deferReply();
  try {
    await slashCommand.run(client, interaction);
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error has occurred');
  }
};

client.once(Events.ClientReady, async c => {
  await c.application.commands.set(commands.map(c => c.command));
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!(interaction.isCommand() || interaction.isContextMenuCommand())) return;
  console.log(
    `Command ran: ${interaction.commandName} (${interaction.user.username}#${
      interaction.user.discriminator
    }, ${interaction.user.id})
    - args: {${interaction.options.data
      .map(o => `${o.name}: ${JSON.stringify(o.value)}`)
      .join(', ')}}`,
  );

  await handleSlashCommand(client, interaction);
});

client.login(process.env.TOKEN);
