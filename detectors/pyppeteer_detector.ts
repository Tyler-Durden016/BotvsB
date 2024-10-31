import { BotKind, ComponentDict, DetectorResponse, State } from '../types';

/**
 * Detects if the app is using pyppeteer with the pyppeteer_stealth plugin.
 * @param components - The components to check.
 * @returns {DetectorResponse} - Returns the bot kind if detected, otherwise false.
 */
export function detectPyppeteerStealth({
    userAgent,
    navigator,
    webglContext,
    permissions,
    mediaDevices,
    rtcPeerConnection
}: ComponentDict): DetectorResponse {
    // 1. User Agent Checks
    if (!userAgent || userAgent.state !== State.Success) return false;
    const uaValue = userAgent.value.toLowerCase();

    // Check for common stealth indicators
    if (/headless|pyppeteer/i.test(uaValue)) return BotKind.PyppeteerStealth;

    // 2. Navigator Properties Checks for Stealth Modifications
    if (navigator && navigator.state === State.Success) {
        const {
            webdriver,
            plugins,
            languages,
            deviceMemory,
            hardwareConcurrency,
            userAgent: navUserAgent,
            maxTouchPoints
        } = navigator.value;

        // Indicators of stealth modifications in navigator properties
        if (webdriver) return BotKind.PyppeteerStealth;
        if (plugins && plugins.length === 0) return BotKind.PyppeteerStealth;
        if (languages && languages.length === 0) return BotKind.PyppeteerStealth;
        if (deviceMemory && deviceMemory < 4) return BotKind.PyppeteerStealth;
        if (hardwareConcurrency && hardwareConcurrency < 4) return BotKind.PyppeteerStealth;
        if (maxTouchPoints === 0) return BotKind.PyppeteerStealth;
        if (/HeadlessChrome/i.test(navUserAgent) && /Chrome/.test(uaValue)) return BotKind.PyppeteerStealth;
    }

    // 3. WebGL Renderer and Vendor Checks
    if (webglContext && webglContext.state === State.Success) {
        const debugInfo = webglContext.value.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = debugInfo && webglContext.value.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        if (/swiftshader|llvmpipe|mesa/i.test(renderer) || /google inc/i.test(vendor)) return BotKind.PyppeteerStealth;
    }

    // 4. Permissions Checks for Stealth Mode Inconsistencies
    if (permissions && permissions.state === State.Success) {
        const mediaPermissions: Array<'camera' | 'microphone'> = ['camera', 'microphone'];

        for (let permission of mediaPermissions) {
            (permissions.value as any).query({ name: permission })
                .then((result: PermissionStatus) => {
                    if (result.state !== 'granted') return BotKind.PyppeteerStealth; // Lack of real permissions indicates stealth
                });
        }
    }

    // 5. Media Devices Check for Missing Devices
    if (mediaDevices && mediaDevices.state === State.Success) {
        const { devices } = mediaDevices.value;
        if (devices && devices.length === 0) return BotKind.PyppeteerStealth;
    }

    // 6. WebRTC Checks for Missing IP Candidates
    if (rtcPeerConnection && rtcPeerConnection.state === State.Success) {
        try {
            const rtcConnection = rtcPeerConnection.value;
            rtcConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
                // Check if offer.sdp is defined and then test it
                if (offer.sdp && !/candidate/i.test(offer.sdp)) return BotKind.PyppeteerStealth;
            });
        } catch {
            return BotKind.PyppeteerStealth;
        }
    }

    return false; // Fallback if no matches found
}
