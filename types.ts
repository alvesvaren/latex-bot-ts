import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

export type CommandRun = (client: Client, interaction: CommandInteraction) => Promise<void> | void;

export interface Command {
    command: SlashCommandBuilder,
    run: CommandRun,
}
