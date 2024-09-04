import { CHANNEL_IDS, config } from './config';
import { Client, IntentsBitField, TextChannel } from 'discord.js';
import axios from 'axios';
import * as fs from 'fs'; 

const minecraftPort = '25589';
const intervalMilliseconds = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const ipFilePath = './last_saved_ip.txt';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.login(config.DISCORD_TOKEN);


client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online`);
    handleIPCheck();
    scheduleNextIPLookup();  // Start the scheduled task loop when the bot is ready
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) {
        return;
    }

    if (message.content === 'ip') {
        const ip = await getExternalIpAddress();
        message.reply(`The server IP Address: ${ip}:${minecraftPort}`);
    }
});

async function getExternalIpAddress(): Promise<string> {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.log('Error fetching the external IP address:', error);
        throw error;
    }
}

async function checkAndUpdateIpFile(newIp: string): Promise<boolean> {
    try {
        let lastIp = '';
        if (fs.existsSync(ipFilePath)) {
            lastIp = fs.readFileSync(ipFilePath, 'utf8').trim();
        }

        if (lastIp !== newIp) {
            fs.writeFileSync(ipFilePath, newIp, 'utf8');
            return true;
        }

        // Ip didn't change since last time
        return false;
    } catch (error) {
        console.error('Error reading or writing IP file:', error);
        throw error;
    }
}

async function ipLookupSchedule(): Promise<string> {
    try {
        console.log('Executing IP lookup...');
        const ip = await getExternalIpAddress();
        console.log('External IP scheduled task completed. IP: ', ip);
        return ip;
    } catch (error) {
        console.error('Error in scheduled IP lookup:', error);
        throw error;
    }
}

async function scheduleNextIPLookup() {
    setTimeout(async () => {
        await handleIPCheck();
        scheduleNextIPLookup(); // Schedule the next run
    }, intervalMilliseconds);
}

async function handleIPCheck() {
    try {
        const ip = await ipLookupSchedule(); // Perform the task
        if (await checkAndUpdateIpFile(ip)) {
            console.log('IP address has changed! IP updated!');
            await pinMessage(`The current IP Address: ${ip}:${minecraftPort}`);
        }
        else {
            console.log('IP address has not changed.');
        }
    } catch (error) {
        console.log(`Couldn't complete Scheduled IP lookup.`);
    }
}

async function pinMessage(message: string) {
    try {
        const channel = client.channels.cache.get(CHANNEL_IDS.GENERAL) as TextChannel;
        if (!channel) {
            console.error('Bad channel!');
            return;
        }

        const sentMessage = await channel.send({
            content: message,
            flags: [4096] // send message silently
        });

        await sentMessage.pin();
        console.log('IP pinned');
    } catch (error) {
        console.error('Failed to send and pin message.', error);
    }
}
