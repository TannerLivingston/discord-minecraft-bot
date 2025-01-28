import Rcon from 'rcon-srcds';
import { logError, logMessage } from './utils';

const pass = "pass";
const rconServer = new Rcon({ host: 'ip', port: 25575 })

export async function authenticateRconServer() {
    try {
        await rconServer.authenticate(pass);
        logMessage('Authenticated RCON server');
    } catch (error) {
        logError('Failed to authenticate RCON server', error);
        throw error;
    }
}

export { rconServer };
