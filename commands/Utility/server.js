const { SlashCommandBuilder, ContainerBuilder, MessageFlags  } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display information about the server.'),

    async execute(interaction) {
        const { guild } = interaction;

        const memberCount = guild.memberCount;
        const owner = await guild.fetchOwner();
        const createdAt = Math.floor(guild.createdTimestamp / 1000);
        const roles = guild.roles.cache.size;
        const channels = guild.channels.cache.size;
        const boosts = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None';

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                {
                    setContent: `# 🏰 Server Information\n*Details about **${guild.name}***`
                }
            )
            .addSeparatorComponents(separator => separator)
            .addTextDisplayComponents(
                {
                    setContent: 
                    `## 📋 Overview\n` +
                    `> **Server Name:** ${guild.name}\n` +
                    `> **Server ID:** ${guild.id}\n` +
                    `> **Owner:** ${owner.user.tag} (${owner.id})\n` +
                    `> **Created On:** <t:${createdAt}:F> (<t:${createdAt}:R>)\n` +
                    `> **Member Count:** ${memberCount}\n` +
                    `> **Roles:** ${roles}\n` +
                    `> **Channels:** ${channels}\n` +
                    `> **Boosts:** ${boosts} (${boostLevel})`
                }
            );

        await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }
};