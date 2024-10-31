/**
 * File: environmentParameters.ts
 * 
 * This utility gathers additional browser and environment details that are not 
 * part of the existing parameter list you have. These parameters provide insight 
 * into the user's device, network, battery, and more. The collected 
 * parameters are converted to a JSON format for easy transmission or logging. 
 * 
 * Parameters:
 * - battery: Information about the battery status (charging, charging time, discharging time, level).
 * - network: Network information (type, effective type, downlink speed, round trip time, save data preference).
 * - deviceMemory: Amount of device memory (in GB).
 * - hardwareConcurrency: Number of logical processors available.
 * - touchScreen: Boolean indicating touch screen support.
 * - navigatorInfo: Additional navigator properties (app code name, app name, OS CPU, vendor information).
 * - window: Properties related to the window (page offsets, pixel ratio, screen orientation).
 * - document: Document properties (referrer, visibility state, hidden status).
 * - storageEstimate: Storage estimate (quota and usage).
 * - performance: Navigation type and performance timing data.
 * - incognito: Boolean indicating whether the user is in incognito mode.
 */

export async function getEnvironmentParameters(): Promise<Record<string, any>> {
    const environmentParams: Record<string, any> = {};

    // Incognito Mode Detection
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        environmentParams.incognito = false;
    } catch (e) {
        environmentParams.incognito = true;
    }

    // Battery Status API
    if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        environmentParams.battery = {
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
            level: battery.level
        };
    }

    // Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
        environmentParams.network = {
            type: connection.type,
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }

    // Device Memory API
    if ('deviceMemory' in navigator) {
        environmentParams.deviceMemory = navigator.deviceMemory || 'unknown';
    }

    // Hardware Concurrency
    environmentParams.hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';

    // Touch Screen Support
    environmentParams.touchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Additional Navigator Properties
    environmentParams.navigatorInfo = {
        appCodeName: navigator.appCodeName,
        appName: navigator.appName,
        oscpu: (navigator as any).oscpu || 'unknown',
        vendor: navigator.vendor,
        vendorSub: navigator.vendorSub
    };

    // Window Properties
    environmentParams.window = {
        pageXOffset: window.pageXOffset,
        pageYOffset: window.pageYOffset,
        devicePixelRatio: window.devicePixelRatio,
        orientation: window.screen.orientation.type
    };

    // Document Properties
    environmentParams.document = {
        referrer: document.referrer,
        visibilityState: document.visibilityState,
        hidden: document.hidden
    };

    // Storage Estimation API
    if (navigator.storage && navigator.storage.estimate) {
        const storageEstimate = await navigator.storage.estimate();
        environmentParams.storageEstimate = {
            quota: storageEstimate.quota,
            usage: storageEstimate.usage
        };
    }

    // Performance API
    if (performance && performance.timing) {
        environmentParams.performance = {
            navigationType: performance.navigation.type,
            timing: performance.timing
        };
    }

    return environmentParams;
}

// Convert parameters to JSON string
export async function getEnvironmentParametersAsJson(): Promise<string> {
    const environmentParams = await getEnvironmentParameters(); // Get the parameters as an object
    const jsonResult = JSON.stringify(environmentParams, null, 2); // Convert object to pretty JSON string
    return jsonResult;
}
