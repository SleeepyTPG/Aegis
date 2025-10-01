require('dotenv').config();

const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.User,
        Partials.Message,
        Partials.GuildMember,
        Partials.ThreadMember
    ]
});

client.commands = new Collection();
const commands = [];
let baseCommand = null;
const missingCommandFiles = [];

console.log('Loading Commands');
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(folder => {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    console.log(`📁 Loading ${folder} commands...`);
    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
            let command;
            try {
                command = require(filePath);
            } catch (err) {
                console.warn(`⚠️ Failed to require ${filePath}:`, err.message);
                missingCommandFiles.push(filePath);
                continue;
            }

            if (command && 'data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                try {
                    commands.push(command.data.toJSON());
                } catch (err) {
                    console.warn(`⚠️ Failed to convert command data to JSON for ${filePath}:`, err.message);
                }
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Command at ${filePath} missing required properties or is empty.`)
                missingCommandFiles.push(filePath);
            }
    }
});

async function deployCommands() {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`)

        const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);
        const applicationId = process.env.CLIENT_ID || client.user?.id;
        let data;
        if (process.env.GUILD_ID) {
            console.log(`Registering commands to guild ${process.env.GUILD_ID} (fast)`);
            data = await rest.put(
                Routes.applicationGuildCommands(applicationId, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} guild (/) commands.`)
        } else {
            console.log('Registering global commands (may take up to 1 hour to appear)');
            data = await rest.put(
                Routes.applicationCommands(applicationId),
                { body: commands },
            );
            console.log(`Successfully reloaded ${data.length} global (/) commands.`)
        }
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error('Error executing Command see Console:', error);
        const errorMessage = {
            content: 'There was an error executing that Command.',
            Flags: 64
        };

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply(errorMessage);
        } else {
            await interaction.followUp(errorMessage);
        }
    }
});

client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} is online!`);
    console.log('Discord.js version:', require('discord.js').version),
    console.log(`Node.js version: ${process.version}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers.`);

client.user.setActivity("Developed from @sleeepy.dev", {
    type: Discord.ActivityType.Watching,
});

    await deployCommands();

});

if (commands.length === 1 && baseCommand && missingCommandFiles.length > 0) {
    console.log(`ℹ️ Only one real command loaded. Auto-generating ${missingCommandFiles.length} proxy command(s) from "${baseCommand.data.name}"`);
    for (const filePath of missingCommandFiles) {
        const name = path.basename(filePath, '.js').toLowerCase().replace(/\s+/g, '-');
        if (name === baseCommand.data.name) continue;
        let cloned = JSON.parse(JSON.stringify(baseCommand.data.toJSON()));
        cloned.name = name;
        cloned.description = cloned.description ? `${cloned.description} (auto)` : `Auto-generated from ${baseCommand.data.name}`;
        commands.push(cloned);
        client.commands.set(name, {
            data: { name },
            execute: async (interaction, clientParam) => {
                try {
                    await baseCommand.execute(interaction, clientParam);
                } catch (err) {
                    console.error(`Error in proxied command "${name}":`, err);
                    throw err;
                }
            }
        });
        console.log(`🔁 Generated proxy command: ${name} -> ${baseCommand.data.name}`);
    }
}

client.on('error', error => console.error ('Client error:', error));
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

client.login(process.env.BOT_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);

});