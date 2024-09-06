import { Client, Message, MessageFlagsBitField, TextChannel } from "discord.js";
import { ipCheck } from './ipChecker';
import { ChannelIds, appConfig, getChannelIdValue, ChannelIdKey } from './config';
import { logError } from "./utils";

export async function handleMessage(message: Message) {
    if (message.author.bot) return;

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
