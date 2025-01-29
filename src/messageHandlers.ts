import { Client, Message, TextChannel } from 'discord.js';
import { ipCheck } from './ipChecker';
import { ChannelIds, appConfig, getChannelIdValue, ChannelIdKey } from './config';
import { logError, logMessage } from "./utils";
import { rconServer } from './rcon';
import { MINECRAFT_ADMIN_DISCORD_IDS_ARRAY } from './config';

const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
const silentFlag = [4096];

export async function handleMessage(message: Message) {
    if (message.author.bot) return;

    // rcon <command>
    await handleRconMessage(message);

    // if a message contains an emoji, try to react to that message with the same emoji
    await handleEmojiMessage(message);

    // messages that are specific to a channel
    await handleChannelSpecificMessage(message);
}

async function handleChannelSpecificMessage(message: Message<boolean>) {
    switch (message.channel.id) {
        case getChannelIdValue(ChannelIds.GENERAL):
            await handleGeneralMessage(message);
            break;
        case getChannelIdValue(ChannelIds.SERVER_ADDRESS):
            await handleServerAddressMessage(message);
            break;
    }
}

async function handleGeneralMessage(message: Message<boolean>) {
    if ('ip' === message.content.toLowerCase()) {
        try {
            const [ip, ipChanged] = await ipCheck();
            let responseMessage = '';
            if (ipChanged) {
                responseMessage = `IP ADDRESS CHANGED! New address:\n${ip}:${appConfig.MINECRAFT_PORT}`;
            }
            else {
                responseMessage = `The IP address has not changed. The address is still:\n${ip}:${appConfig.MINECRAFT_PORT}`;
            }
            await message.reply(responseMessage);
        }
        catch (error) {
            // Do nothing
        }
    }
}

async function handleServerAddressMessage(message: Message<boolean>) {
    if ('ip' === message.content.toLowerCase()) {
        try {
            const [ip, ipChanged] = await ipCheck();
            let responseMessage = '';
            if (ipChanged) {
                responseMessage = `IP ADDRESS CHANGED! New address:\n${ip}:${appConfig.MINECRAFT_PORT}`;
            }
            else {
                responseMessage = `The IP address has not changed. The address is still:\n${ip}:${appConfig.MINECRAFT_PORT}`;
            }
            await message.reply(responseMessage);
        }
        catch (error) {
            // Do nothing
        }
    }
}

async function handleEmojiMessage(message: Message<boolean>) {
    if (emojiRegex.test(message.content)) {
        try {
            const emoji = message.content.match(emojiRegex)?.[0];
            if (emoji) {
                await message.react(emoji);
            }
        } catch (error) {
            logError('Failed to react to message', error);
        }
    }
}

async function handleRconMessage(message: Message<boolean>) {
    if (!rconServer || !rconServer.isAuthenticated()) {
        return;
    }

    if (message.content.startsWith('rcon')) {
        if (MINECRAFT_ADMIN_DISCORD_IDS_ARRAY.includes(message.author.id)) {
            const rconCommand = message.content.substring(5);
            try {
                const response = await rconServer.execute(rconCommand);
                if (response) {
                    if (typeof response === 'string') {
                        await message.reply({ content: response, flags: silentFlag });
                    }
                    else {
                        await message.reply({ content: 'Command executed successfully', flags: silentFlag });
                    }
                }
                else {
                    await message.reply({ content: 'Command failed', flags: silentFlag });
                }
            } catch (error) {
                logError('Failed to execute rcon command', error);
                await message.reply({ content: 'Failed to execute rcon command', flags: silentFlag });
            }
        }
    }
}

export async function sendMessageToChannel(message: string, channelName: ChannelIdKey, client: Client) {
    try {
        const channel = client.channels.cache.get(getChannelIdValue(channelName)) as TextChannel;
        if (!channel) {
            logError(`Bad channel! Can't post message to ${channelName}!`);
            return;
        }

        await channel.send({ content: message });
    } catch (error) {
        logError(`Failed to send message to channel: ${channelName}!`, error);
    }
}
