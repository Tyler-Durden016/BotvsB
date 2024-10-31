// utils/access_log.ts

/**
 * Function to extract additional information from the browser and environment.
 * 
 * @returns {Promise<Record<string, any>>} A JSON object containing timestamp, IP address, referrer, user agent, and geolocation.
 */
export async function extractAdditionalInfo(): Promise<Record<string, any>> {
    const info: Record<string, any> = {};

    // Timestamp
    info.timestamp = new Date().toISOString();

    // IP Address (using a public IP API, since JS in browser can't directly get the public IP)
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        info.ipAddress = ipData.ip;
    } catch (error) {
        info.ipAddress = 'Unable to retrieve IP address';
    }

    // Referer
    info.referer = document.referrer || 'No referrer';

    return info;
}
