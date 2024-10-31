import { BotKind, ComponentDict, DetectorResponse, State } from '../types';

export function detectPuppeteer({
    userAgent,
    navigator,
    webglContext,
    permissions,
    mediaDevices
}: ComponentDict): DetectorResponse {
    // 1. User Agent Checks
    if (!userAgent || userAgent.state !== State.Success) return false;
    const uaValue = userAgent.value.toLowerCase();

    // Check for Puppeteer-specific identifiers but relax the checks
    if (/puppeteer|puppeteer-extra|headless|chrome-lighthouse/i.test(uaValue)) {
        return BotKind.Puppeteer;
    }

    // 2. Navigator Properties Checks
    if (navigator && navigator.state === State.Success) {
        const { webdriver, plugins, languages, hardwareConcurrency, platform, cookieEnabled, userAgent: navUserAgent, maxTouchPoints } = navigator.value;

        if (webdriver) return BotKind.HeadlessChrome;

        // Relax checks on plugins and languages
        if (!plugins.length && languages.length < 2) return BotKind.PuppeteerStealth;
        if (hardwareConcurrency <= 4) return BotKind.PuppeteerStealth; // Increased threshold
        if (typeof cookieEnabled === 'boolean' && !cookieEnabled) return BotKind.PuppeteerStealth;

        if (/HeadlessChrome/i.test(navUserAgent) && /Chrome/.test(uaValue)) return BotKind.PuppeteerStealth;
        if (platform === 'Win32' && !uaValue.includes('windows')) return BotKind.PuppeteerStealth;
        if (platform.includes('Win') && maxTouchPoints > 0) return BotKind.PuppeteerStealth;
    }

    // 3. WebGL Checks
    if (webglContext && webglContext.state === State.Success) {
        const debugInfo = webglContext.value.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

        if (/swiftshader|mesa|llvmpipe/i.test(renderer) || /google inc/i.test(vendor)) {
            return BotKind.HeadlessChrome;
        }

        if (window.devicePixelRatio < 2) { // Increased threshold for pixel ratio
            return BotKind.PuppeteerStealth;
        }
    }

    // 4. Permissions Check
    if (permissions && permissions.state === State.Success) {
        const mediaPermissions = ['camera', 'microphone'];
        const allPermissionsGranted = mediaPermissions.every(permission => {
            const result = permissions.value.query({ name: permission });
            return result.state === 'granted' || result.state === 'prompt'; // Allow 'prompt' state
        });

        if (!allPermissionsGranted) {
            return BotKind.PuppeteerStealth;
        }
    }

    // 5. Media Devices Check
    if (mediaDevices && mediaDevices.state === State.Success) {
        const { devices } = mediaDevices.value;
        if (!devices.length) return BotKind.PuppeteerStealth; // Allow for some devices to be unavailable
    }

    // 6. Additional Behavioral Checks
    const isHeadless = window.matchMedia('(display-mode: standalone)').matches;
    if (isHeadless) return BotKind.HeadlessChrome;

    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
        const firstEntry = performanceEntries[0];
        if (firstEntry.duration < 1000) return BotKind.PuppeteerStealth; // Increased duration threshold
    }

    const start = performance.now();
    setTimeout(() => {
        const duration = performance.now() - start;
        if (duration < 500) return BotKind.PuppeteerStealth; // Increased threshold for normal interaction
    }, 300); // Adjusted timeout duration

    // New: Detection based on forced access to restricted properties
    try {
        const screenMedia = (navigator as unknown as Navigator).mediaDevices?.getUserMedia({ video: true });
        if (screenMedia) {
            screenMedia.then(() => {
                // Do nothing, access granted
            }).catch(() => {
                return BotKind.PuppeteerStealth; // Access denied could indicate stealth mode
            });
        }
    } catch {
        return BotKind.PuppeteerStealth;
    }

    return false; // Fallback if no matches found
}
