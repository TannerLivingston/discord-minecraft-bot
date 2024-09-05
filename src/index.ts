import { discordConfig, appConfig, getChannelIdValue, ChannelIdKey, ChannelIds } from './config';
import { Client, IntentsBitField, TextChannel } from 'discord.js';
import axios from 'axios';
import * as fs from 'fs'; 

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.login(discordConfig.DISCORD_TOKEN);

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online`);
    ipLookupRoutine(); // Perform an initial check and set things straight in case the bot has been offline for a while
    scheduleNextIpLookupRoutine();  // Start the scheduled task loop when the bot is ready
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content === 'ip') {
        try {
            const [ip, ipChanged] = await ipCheck();
            if (ipChanged) {
                await sendMessageToChannel(`IP ADDRESS CHANGED! New address:\n${ip}:${appConfig.MINECRAFT_PORT}`, ChannelIds.SERVER_ADDRESS);
            }
            else {
                await sendMessageToChannel(`The IP address has not changed. The address is still:\n${ip}:${appConfig.MINECRAFT_PORT}`, ChannelIds.SERVER_ADDRESS);
            }
        }
        catch (error) {
            // Do nothing
        }
    }
});

async function getExternalIpAddress(): Promise<string> {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
}

async function checkIfIpAddressChanged(newIp: string): Promise<boolean> {
    try {
        let lastIp = '';
        if (fs.existsSync(appConfig.IP_FILE_PATH)) {
            lastIp = fs.readFileSync(appConfig.IP_FILE_PATH, 'utf8').trim();
        }

        if (lastIp !== newIp) {
            fs.writeFileSync(appConfig.IP_FILE_PATH, newIp, 'utf8');
            return true;
        }

        // Ip didn't change since last time
        return false;
    } catch (error) {
        console.error('Error reading or writing IP file:', error);
        throw error;
    }
}

// Runs the IP lookup on a schedule
async function scheduleNextIpLookupRoutine() {
    setTimeout(async () => {
        ipLookupRoutine();
        scheduleNextIpLookupRoutine(); // Schedule the next run
    }, appConfig.IP_POLL_MILLISECONDS);
}

// Lookup IP and send message only if it has changed
async function ipLookupRoutine() {
    try {
        const [ip, ipChanged] = await ipCheck();
        if (ipChanged) {
            await sendMessageToChannel(`IP ADDRESS CHANGED! New address:\n${ip}:${appConfig.MINECRAFT_PORT}`, ChannelIds.SERVER_ADDRESS);
        }
    }
    catch (error) {
        console.log(`Scheduled IP lookup failed.`);
    }
}

// Returns the most up-to-date IP address, and true if it has changed
async function ipCheck(): Promise<[ip: string, ipChanged: boolean]> {
    try {
        const ip = await getExternalIpAddress();
        if (await checkIfIpAddressChanged(ip)) {
            console.log('IP address has changed! IP updated!');
            return [ip, true];
        }
        else {
            console.log('IP address has not changed.');
            return [ip, false];
        }
    } catch (error) {
        console.log(`Couldn't complete IP lookup.`, error);
        throw error;
    }
}

async function sendMessageToChannel(message: string, channelName: ChannelIdKey) {
    try {
        const channel = client.channels.cache.get(getChannelIdValue(channelName)) as TextChannel;
        if (!channel) {
            console.error(`Bad channel! Can't post message to ${channelName}!`);
            return;
        }

        const sentMessage = await channel.send({
            content: message,
            //flags: [4096] // send message silently
        });

    } catch (error) {
        console.error(`Failed to send message to channel: ${channelName}!`, error);
    }
}
