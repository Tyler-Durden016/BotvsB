import { BotKind, ComponentDict, DetectorResponse, State } from '../types';

/**
 * Detects if the app is using undetected-chromedriver or similar Selenium drivers.
 * @param components - The components to check.
 * @returns {DetectorResponse} - Returns the bot kind if detected, otherwise false.
 */
export function detectUndetectedChromeDriver({
    userAgent,
    navigator,
    webglContext,
    permissions,
    mediaDevices
}: ComponentDict): DetectorResponse {
    // 1. User Agent Checks
    if (!userAgent || userAgent.state !== State.Success) return false;
    const uaValue = userAgent.value.toLowerCase();

    // Check for undetected-chromedriver-specific identifiers
    if (/undetected-chromedriver/i.test(uaValue)) return BotKind.UndetectedChromedriver;

    // 2. Navigator Properties Checks
    if (navigator && navigator.state === State.Success) {
        const { webdriver, plugins, languages, hardwareConcurrency, platform, cookieEnabled } = navigator.value;

        // Check for webdriver property (common in Selenium)
        if (webdriver) return BotKind.Selenium;

        // Check for common plugins
        if (plugins && plugins.length === 0) return BotKind.UndetectedChromedriver;

        // Check hardware concurrency for unusual values
        if (hardwareConcurrency && hardwareConcurrency <= 2) return BotKind.UndetectedChromedriver;
        
        // Check if cookies are disabled
        if (typeof cookieEnabled === 'boolean' && !cookieEnabled) return BotKind.UndetectedChromedriver;

        // Platform checks
        if (platform.includes('Win')) {
            if (/chrome/i.test(uaValue) && !/windows/i.test(uaValue)) return BotKind.UndetectedChromedriver;
        }
    }

    // 3. WebGL Checks
    if (webglContext && webglContext.state === State.Success) {
        const debugInfo = webglContext.value.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

        // Look for common WebGL indicators
        if (/swiftshader|mesa|llvmpipe/i.test(renderer) || /google inc/i.test(vendor)) return BotKind.UndetectedChromedriver;
    }

    // 4. Permissions Check
    if (permissions && permissions.state === State.Success) {
        const mediaPermissions: Array<'camera' | 'microphone'> = ['camera', 'microphone'];

        // Check for permissions inconsistencies
        for (let permission of mediaPermissions) {
            permissions.value.query({ name: permission })
                .then((result: PermissionStatus) => {
                    if (result.state !== 'granted') return BotKind.UndetectedChromedriver; // Indicates lack of real permissions
                });
        }
    }

    // 5. Media Devices Check
    if (mediaDevices && mediaDevices.state === State.Success) {
        const { devices } = mediaDevices.value;
        if (devices && devices.length === 0) return BotKind.UndetectedChromedriver;
    }

    // 6. Additional Behavioral Checks
    const isHeadless = window.matchMedia('(display-mode: standalone)').matches;
    if (isHeadless) return BotKind.UndetectedChromedriver;

    // Check if there's unusual interaction timing
    const start = performance.now();
    setTimeout(() => {
        const duration = performance.now() - start;
        if (duration < 100) return BotKind.UndetectedChromedriver; // Abnormal timing
    }, 50);

    return false; // Fallback if no matches found
}
