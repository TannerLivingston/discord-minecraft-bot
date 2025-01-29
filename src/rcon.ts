import Rcon from 'rcon-srcds';
import { logError, logMessage } from './utils';
import { RCON_CONFIG } from './config';

const pass = RCON_CONFIG.RCON_PASSWORD;
const host = RCON_CONFIG.RCON_HOST;
const port = RCON_CONFIG.RCON_PORT;

let rconServer: Rcon;

export async function authenticateRconServer(): Promise<boolean> {
    if (!host || !port || !pass) {
        logMessage('RCON server not configured');
        return false;
    }
    
    rconServer = new Rcon({ host, port });

    try {
        await rconServer.authenticate(pass);
        logMessage('Authenticated RCON server');
        return true;
    } catch (error) {
        logError('Failed to authenticate RCON server', error);
        return false;
    }
}

export { rconServer };
