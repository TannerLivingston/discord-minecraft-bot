import axios from 'axios';
import { appConfig, ChannelIds } from './config';
import { Client } from 'discord.js';
import { sendMessageToChannel } from './messageHandlers';
import { checkIfStoredValueHasChanged, logError, logMessage } from './utils';

export async function scheduleIpLookup(client: Client) {
    await ipLookupJob(client); // run the job once right away to set things straight in case the bot was offline for a long time
    setInterval(async () => ipLookupJob(client), appConfig.IP_POLL_MILLISECONDS);
}

// Look up external IP Address and send a message if it has changed.
async function ipLookupJob(client: Client) {
    try {
        const [ip, ipChanged] = await ipCheck();
        if (ipChanged) {
          const message = `IP ADDRESS CHANGED! New address:\n${ip}:${appConfig.MINECRAFT_PORT}`;
          await sendMessageToChannel(message, ChannelIds.SERVER_ADDRESS, client);
        }
    } catch (error) {
        logError(`Scheduled IP lookup failed.`);
    }
}

// Returns the most up-to-date IP address, and true if it has changed
export async function ipCheck(): Promise<[ip: string, ipChanged: boolean]> {
    try {
        const ip = await getExternalIpAddress();
        if (await checkIfStoredValueHasChanged(ip, appConfig.IP_FILE_PATH)) {
            logMessage('IP address has changed! IP updated!');
            return [ip, true];
        }
        else {
            logMessage('IP address has not changed.');
            return [ip, false];
        }
    } catch (error) {
        logError(`Couldn't complete IP lookup.`, error);
        throw error;
    }
}

async function getExternalIpAddress(): Promise<string> {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
}
