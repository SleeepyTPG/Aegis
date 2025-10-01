const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Display information about a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get information about')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });
        }

        const createdAt = Math.floor(target.createdTimestamp / 1000);
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .join(', ') || 'None';

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                {
                    setContent: `# 👤 User Information\n*Details about **${target.tag}***`
                }
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                {
                    setContent: 
                    `## 📋 Overview\n` +
                    `> **Username:** ${target.tag}\n` +
                    `> **User ID:** ${target.id}\n` +
                    `> **Account Created:** <t:${createdAt}:F> (<t:${createdAt}:R>)\n` +
                    `> **Joined Server:** <t:${joinedAt}:F> (<t:${joinedAt}:R>)\n` +
                    `> **Roles:** ${roles}`
                }
            );

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] }
        });
    }
};