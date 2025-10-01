const {
  SlashCommandBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ContainerBuilder,
  MessageFlags,
  version: djsVersion,
} = require('discord.js');

const { version } = require('../../package.json');

const SUPPORT_SERVER = 'Soon...';
const GITHUB_REPO = 'https://github.com/SleeepyTPG/TeamLink';
const BOT_INVITE = 'https://discord.com/oauth2/authorize?client_id=1419070828934332578';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Display information about Aegis'),

  async execute(interaction) {
    try {
      const client = interaction.client;
      const guilds = client.guilds.cache.size;
      const users = client.users.cache.size;
      const commands = client.commands.size;
      const uptime = Math.floor(client.uptime / 1000);
      const activity = client.user.presence.activities[0]?.name || 'No activity';

      const sep = () => new SeparatorBuilder().setSpacing("Small");

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder()
            .setContent(`# 🤖 Aegis\n*Your powerful Discord companion*`)
        )
        .addSeparatorComponents(sep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              '## 📊 Statistics',
              `> **Servers:** ${guilds}`,
              `> **Users:** ${users}`,
              `> **Commands:** ${commands}`,
              `> **Uptime:** <t:${Math.floor(Date.now() / 1000) - uptime}:R>`,
              `> **Status:** ${activity}`,
            ].join('\n')
          )
        )
        .addSeparatorComponents(sep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              '## 💻 Technical Info',
              `> **Version:** ${version || '0.8.4'}`,
              `> **Discord.js:** ${djsVersion}`,
              `> **Node.js:** ${process.version}`,
            ].join('\n')
          )
        )
        .addSeparatorComponents(sep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              '## 🔗 Links',
              `> **Support Server:** [Join Here](${SUPPORT_SERVER})`,
              `> **Invite Bot:** [Add to Server](${BOT_INVITE})`,
              `> **GitHub:** [Repository](${GITHUB_REPO})`,
            ].join('\n')
          )
        )
        .addSeparatorComponents(sep())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            [
              '## 👥 Credits',
              '> **Developer:** Sleeepy',
              '> **Special Thanks:** The Discord.js Community',
            ].join('\n')
          )
        );

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error('Error in about command:', error);
      await interaction.reply({
        content: 'An error occurred while fetching bot information.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};