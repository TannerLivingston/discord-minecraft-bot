import * as fs from 'fs';

// Looks up value stored in filepath. If the new value is different, updates the contents of the file
// and returns true. Returns false otherwise.
export async function checkIfStoredValueHasChanged(newValue: string, filepath: string): Promise<boolean> {
    try {
        let storedText = '';
        if (fs.existsSync(filepath)) {
            storedText = fs.readFileSync(filepath, 'utf8').trim();
        }

        if (storedText !== newValue) {
            fs.writeFileSync(filepath, newValue, 'utf8');
            return true;
        }

        // Ip didn't change since last time
        return false;
    } catch (error) {
        logError(`Error reading or writing IP file`, error);
        throw error;
    }
}


export function logMessage(message: string) {
    console.log(new Date(), ':', message);
}

export function logError(message: string, error: unknown = undefined) {
    const errorMessage = `${new Date()}':' ${message}`;
    if (error) {
        console.error(errorMessage, error);
    }
    else {
        console.error(errorMessage);
    }
}
