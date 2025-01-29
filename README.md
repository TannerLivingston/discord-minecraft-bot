# discord-minecraft-bot

## Setup
1. Ensure you have both [node.js](https://nodejs.org) and npm installed on your system.
2. Copy the `.env-template` file, and rename the new file to `.env`. Update the contents of `.env` with the necessary information from [the portal for your discord application](https://discord.com/developers/applications/), as well discord channel info.
3. Run `npm install`.
4. Build the application with `npm run build`.
5. Start with `npm run start`.

## Usage
The bot will check periodically throughout the day to ensure that the IP address that users connect to the server with has not changed. If the address has changed, the bot will notify users of the new address in the SERVER_ADDRESS discord channel.

#### Commands
The following commands are available on a channel-basis:

##### Global (any channel)
1. N/A

##### General
1. N/A

##### Server Address
1. `ip` - Forces an IP address lookup for the game server. If the address has changed, the bot will send a message to the channel with the new IP address.

#### Bot Admin Commands
If RCON is configured, and is available for the server, any discord users whose discord IDs have been added to the `MINECRAFT_ADMIN_DISCORD_IDS` list can send server commands to the game server with RCON by sending a message in any Discord channel. Messages prefixed with `rcon` will be interpreted as server commands and will be sent to the game server.

For example:
```
rcon give <player> cooked_chicken 64
```
