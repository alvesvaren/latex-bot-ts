import { SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { CommandRun } from '../types';

export const command = new SlashCommandBuilder()
  .setName('wolframalpha')
  .setDescription('Solve an equation using Wolfram Alpha')
  .addStringOption(option => {
    return option
      .setName('equation')
      .setDescription('The equation to solve')
      .setRequired(true);
  });

export const run: CommandRun = async (client, interaction) => {
  const equation = interaction.options.getString('equation', true);
  const appId = process.env.WOLFRAM_ALPHA_APP_ID;

  if (!appId) {
    await interaction.editReply('Wolfram Alpha App ID is not set.');
    return;
  }

  const url = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(
    equation,
  )}&format=plaintext&output=JSON&appid=${appId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.queryresult.success) {
      const result = data.queryresult.pods
        .map((pod: any) => pod.subpods.map((subpod: any) => subpod.plaintext).join('\n'))
        .join('\n\n');

      await interaction.editReply(`Result:\n${result}`);
    } else {
      await interaction.editReply('Could not solve the equation.');
    }
  } catch (error) {
    console.error(error);
    await interaction.editReply('An error occurred while solving the equation.');
  }
};
