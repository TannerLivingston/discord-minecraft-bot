import { Client, Message, TextChannel } from 'discord.js';
import { ipCheck } from './ipChecker';
import { ChannelIds, appConfig, getChannelIdValue, ChannelIdKey } from './config';
import { logError } from "./utils";
import { rconServer } from './rcon';
import { MINECRAFT_ADMIN_DISCORD_IDS_ARRAY } from './config';

export async function handleMessage(message: Message) {
    if (message.author.bot) return;

    if (MINECRAFT_ADMIN_DISCORD_IDS_ARRAY.includes(message.author.id)) {
        // rcon commands allowed here
        if (message.content.startsWith('rcon')) { // rcon <command>
            const command = message.content.substring(5);
            try {
                const response = await rconServer.execute(command);
                if (response) {
                    if (typeof response === 'string') {
                        await message.reply(response);
                    }
                    else {
                        await message.reply('Command executed successfully');
                    }
                }
                else {
                    await message.reply('Command failed');
                }
            } catch (error) {
                logError('Failed to execute rcon command', error);
                await message.reply('Failed to execute rcon command');
            }
        }
    }

    const emojiRegex = /\p{Emoji}/u;
    // if a message contains an emoji, try to react to that message with the same emoji
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


    // server-address
    if (getChannelIdValue(ChannelIds.SERVER_ADDRESS) === message.channel.id) {
        
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

    // general
    if (getChannelIdValue(ChannelIds.GENERAL) === message.channel.id) {

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
