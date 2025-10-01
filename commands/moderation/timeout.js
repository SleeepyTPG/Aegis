const { 
    SlashCommandBuilder, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member for a custom duration.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration (e.g. 10m, 1h, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const durationInput = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({ content: 'You do not have permission to timeout members.', flags: MessageFlags.Ephemeral });
        }

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });
        }

        if (!member.moderatable || member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: 'I cannot timeout this user.', flags: MessageFlags.Ephemeral });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: 'You cannot timeout a member with equal or higher role.', flags: MessageFlags.Ephemeral });
        }

        const durationMs = ms(durationInput);
        if (!durationMs || durationMs < 10000 || durationMs > 14 * 24 * 60 * 60 * 1000) {
            return interaction.reply({ 
                content: 'Invalid duration. Please use formats like `10m`, `1h`, `2d` (min: 10s, max: 14d).', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            const dmContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `## ⏳ You Have Been Timed Out\n\n` +
                            `You have been timed out in **${interaction.guild.name}**\n\n` +
                            `**Duration:** ${durationInput}\n` +
                            `**Reason:** ${reason}\n` +
                            `**Moderator:** ${interaction.user.tag}\n` +
                            `**Expires:** <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`
                        )
                );
            await target.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
        }

        await member.timeout(durationMs, reason);
        
        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## ⏳ Member Timed Out`)
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing("Small")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `### User Information\n` +
                        `> **User:** ${target.tag} (${target.id})\n` +
                        `> **Timed out by:** ${interaction.user.tag}\n` +
                        `> **Date:** <t:${Math.floor(Date.now()/1000)}:F>`
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing("Small")
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `### Timeout Details\n` +
                        `> **Duration:** ${durationInput}\n` +
                        `> **Expires:** <t:${Math.floor((Date.now() + durationMs) / 1000)}:R>\n` +
                        `> **Reason:** ${reason}`
                    )
            );

        await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2 
        });
    }
};