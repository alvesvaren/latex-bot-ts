// Require the necessary discord.js classes
import { Client, CommandInteraction, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from './types';
const __filename = fileURLToPath(import.meta.url);


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands: Command[] = [];

const commandsPath = path.join(path.dirname(__filename), 'commands');
const commandFiles = await fs.readdir(commandsPath);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = await import(filePath);
    commands.push(command);
}

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = commands.find(c => c.command.name === interaction.commandName);
    if (!slashCommand) {
        interaction.followUp({ content: "An error has occurred" });
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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
    await c.application.commands.set(commands.map(c => c.command));
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!(interaction.isCommand() || interaction.isContextMenuCommand())) return;
    console.log(`Interaction received: ${interaction.commandName} (${interaction.id})`)

    await handleSlashCommand(client, interaction);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);