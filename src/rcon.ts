import Rcon from 'rcon-srcds';
import { logError, logMessage } from './utils';
import { RCON_CONFIG } from './config';

const pass = RCON_CONFIG.RCON_PASSWORD;
const host = RCON_CONFIG.RCON_HOST;
const port = RCON_CONFIG.RCON_PORT;

async function authenticateRconServer(): Promise<Rcon | undefined> {
    if (!host || !port || !pass) {
        logMessage('RCON server not configured');
        return undefined;
    }

    const rconServer = new Rcon({ host, port });

    try {
        await rconServer.authenticate(pass);
        logMessage('Authenticated RCON server');
        return rconServer;
    } catch (error) {
        logError('Failed to authenticate RCON server', error);
        return undefined;
    }
}

async function disconnectRconServer(rconServer: Rcon): Promise<void> {
    try {
        await rconServer.disconnect();
        logMessage('Disconnected from RCON server');
    } catch (error) {
        logError('Failed to disconnect from RCON server', error);
    }
}

// Authenticate the RCON server and send a command
export async function sendRconCommand(command: string): Promise<string | boolean> {
    const rconServer = await authenticateRconServer();
    if (rconServer) {
        try {
            const response = await rconServer.execute(command);
            disconnectRconServer(rconServer);
            return response;
        } catch (error) {
            logError('Failed to execute RCON command', error);
            return false;
        }
    }
    logMessage('Could not send RCON command, not authenticated');
    return false;
}
