import { discordConfig } from './config';
import { Client, Events, IntentsBitField } from 'discord.js';
import { scheduleIpLookup } from './ipChecker';
import { handleMessage } from './messageHandlers';
import { logMessage } from './utils';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.login(discordConfig.DISCORD_TOKEN);

client.on(Events.ClientReady, (c) => {
    logMessage(`✅ ${c.user.tag} is online`);
    scheduleIpLookup(client); // Start scheduled task loop when the bot is ready
});

client.on(Events.MessageCreate, handleMessage);
