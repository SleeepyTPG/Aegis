const { 
    SlashCommandBuilder, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder, 
    MessageFlags 
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a specified number of messages from the current channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (2-100)')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (!interaction.member.permissions.has('ManageMessages')) {
            return interaction.reply({ 
                content: 'You do not have permission to manage messages.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        if (amount < 2 || amount > 100) {
            return interaction.reply({ 
                content: 'Please specify a number between 2 and 100.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            await interaction.channel.bulkDelete(amount, true);

            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🧹 Messages Deleted`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing("Small")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `> **Amount:** ${amount}\n` +
                            `> **Channel:** <#${interaction.channel.id}>\n` +
                            `> **Moderator:** ${interaction.user.tag}\n` +
                            `> **Date:** <t:${Math.floor(Date.now()/1000)}:F>`
                        )
                );

            await interaction.reply({ 
                components: [container], 
                flags: MessageFlags.IsComponentsV2 
            });
        } catch (error) {
            await interaction.reply({ 
                content: 'Failed to delete messages. I can only delete messages younger than 14 days.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};