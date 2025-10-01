const { 
    SlashCommandBuilder, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!interaction.member.permissions.has('KickMembers')) {
            return interaction.reply({ content: 'You do not have permission to kick members.', flags: MessageFlags.Ephemeral });
        }

        if (!member) {
            return interaction.reply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });
        }

        if (!member.kickable || member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: 'I cannot kick this user.', flags: MessageFlags.Ephemeral });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: 'You cannot kick a member with equal or higher role.', flags: MessageFlags.Ephemeral });
        }

        try {
            const dmContainer = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `## 👢 You Have Been Kicked\n\n` +
                            `You have been kicked from **${interaction.guild.name}**\n\n` +
                            `**Reason:** ${reason}\n` +
                            `**Moderator:** ${interaction.user.tag}`
                        )
                );
            await target.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
        } catch (err) {
        }

        await member.kick(reason);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 👢 Member Kicked`)
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
                        `> **Kicked by:** ${interaction.user.tag}\n` +
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
                        `### Kick Details\n` +
                        `> **Reason:** ${reason}`
                    )
            );

        await interaction.reply({ 
            components: [container], 
            flags: MessageFlags.IsComponentsV2 
        });
    }
};