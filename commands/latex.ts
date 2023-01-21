import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandRun } from '../types';
import mathjax from 'mathjax';
import sharp from 'sharp';

const jax = await mathjax.init({
  loader: {
    load: ['input/tex', 'output/svg'],
  },
});

export const command = new SlashCommandBuilder()
  .setName('latex')
  .setDescription('Render latex code to an image')
  .addStringOption(option => {
    return option
      .setName('code')
      .setDescription('The code to render')
      .setRequired(true);
  })
  .addNumberOption(option => {
    return option
      .setName('brightness')
      .setDescription(
        'The brightness of the image, where 1 is white and 0 is black',
      )
      .setMinValue(0)
      .setMaxValue(1);
  })
  .addNumberOption(option => {
    return option
      .setName('scale')
      .setDescription('Scale of the image, defaults to 2')
      .setMinValue(0.1)
      .setMaxValue(5);
  });

export const run: CommandRun = async (c, interaction) => {
  const { value: code } = interaction.options.get('code', true) as {
    value: string;
  };
  const { value: brightness = 0.8 } = (interaction.options.get('brightness') ||
    {}) as { value?: number };
  const { value: scale = 2 } = (interaction.options.get('scale') || {}) as {
    value?: number;
  };

  const svg = MathJax.startup.adaptor.innerHTML(
    await jax.tex2svgPromise(code, { display: true }),
  );
  const obj = sharp(Buffer.from(svg));

  const png = await obj
    .resize({
      height: Math.ceil(((await obj.metadata()).height || 16) * scale),
    })
    .negate({ alpha: false })
    .modulate({ brightness })
    .webp({ quality: 50, effort: 0 })
    .extend(2 * scale)
    .toBuffer();

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          iconURL: interaction.user.avatarURL() || undefined,
          name: interaction.user.username,
        })
        .setImage(`attachment://latex.webp`),
    ],
    files: [
      {
        name: 'latex.webp',
        attachment: png,
      },
    ],
  });
};
