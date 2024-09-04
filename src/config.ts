import 'dotenv/config';

require('dotenv').config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing environment variables");
}

export const config = {
    DISCORD_TOKEN,
    DISCORD_CLIENT_ID
}

export const CHANNEL_IDS = {
    GENERAL: '1280393016380751937',
}
