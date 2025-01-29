import 'dotenv/config';

require('dotenv').config();

const { DISCORD_TOKEN,
        DISCORD_CLIENT_ID,
        MINECRAFT_PORT,
        IP_POLL_MILLISECONDS,
        IP_FILE_PATH,
        DISCORD_CHANNEL_GENERAL,
        DISCORD_CHANNEL_SERVER_ADDRESS,
        MINECRAFT_ADMIN_DISCORD_IDS,
        RCON_HOST,
        RCON_PORT,
        RCON_PASSWORD
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing required environment variables: DISCORD_TOKEN or DISCORD_CLIENT_ID");
}

export const MINECRAFT_ADMIN_DISCORD_IDS_ARRAY = MINECRAFT_ADMIN_DISCORD_IDS?.split(',') || [];

// Settings to connect to Discord
export const discordConfig = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID,
};

const ChannelId = {
    GENERAL: DISCORD_CHANNEL_GENERAL,
    SERVER_ADDRESS: DISCORD_CHANNEL_SERVER_ADDRESS
} as const;

export enum ChannelIds {
    GENERAL = 'GENERAL',
    SERVER_ADDRESS = 'SERVER_ADDRESS',
};

export type ChannelIdKey = 'GENERAL' | 'SERVER_ADDRESS';

export function getChannelIdValue(key: ChannelIdKey) {
    return ChannelId[key] as string;
};

// Non-Discord settings for the application
export const appConfig = {
    MINECRAFT_PORT: MINECRAFT_PORT || '25565', // 25565 is default port for minecraft
    IP_POLL_MILLISECONDS: Number(IP_POLL_MILLISECONDS) || 6 * 60 * 60 * 1000, // default to 6 hours
    IP_FILE_PATH: IP_FILE_PATH || './last_saved_ip.txt'
};

export const RCON_CONFIG = {
    RCON_HOST: RCON_HOST,
    RCON_PORT: RCON_PORT ? parseInt(RCON_PORT) : 25575,
    RCON_PASSWORD
};