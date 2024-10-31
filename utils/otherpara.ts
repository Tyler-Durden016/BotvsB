interface ParamState<T> {
    value: T | null;
    state: 'Success' | 'Error';
  }
  
  interface DistinctiveProps {
    awesomium: boolean | null;
    cef: boolean | null;
    phantom: boolean | null;
    selenium: boolean | null;
    webdriver: boolean | null;
    domAutomation: boolean | null;
  }
  
  interface WindowSize {
    outerWidth: number | null;
    outerHeight: number | null;
    innerWidth: number | null;
    innerHeight: number | null;
  }
  
  interface ExtractedParams {
    appVersion: ParamState<string>;
    userAgent: ParamState<string>;
    webDriver: ParamState<boolean>;
    languages: ParamState<string[]>;
    productSub: ParamState<string>;
    pluginsArray: ParamState<string[]>;
    pluginsLength: ParamState<number>;
    windowSize: ParamState<WindowSize>;
    documentFocus: ParamState<boolean>;
    rtt: ParamState<number>;
    errorTrace: ParamState<string | null>;
    documentElementKeys: ParamState<string[]>;
    functionBind: ParamState<boolean>;
    distinctiveProps: ParamState<DistinctiveProps>;
    notificationPermissions: ParamState<NotificationPermission | null>;
  }
  
  export function extractParams(): string {
    const getState = <T>(value: T | null): ParamState<T> => ({
      value,
      state: value !== null ? 'Success' : 'Error',
    });
  
    const distinctiveProps: DistinctiveProps = {
      awesomium: typeof window !== 'undefined' && !!(window as any)['awesomium'],
      cef: typeof window !== 'undefined' && !!(window as any)['cef'],
      phantom: typeof window !== 'undefined' && !!(window as any)['phantom'],
      selenium: typeof window !== 'undefined' && (!!(window as any)['__selenium_unwrapped'] || !!(window as any)['__webdriver_evaluate']),
      webdriver: !!navigator.webdriver,
      domAutomation: typeof window !== 'undefined' && !!(window as any)['domAutomation'],
    };
  
    const windowSize: WindowSize = {
      outerWidth: window.outerWidth || null,
      outerHeight: window.outerHeight || null,
      innerWidth: window.innerWidth || null,
      innerHeight: window.innerHeight || null,
    };
  
    const extractedParams: ExtractedParams = {
      appVersion: getState(navigator.appVersion || null),
      userAgent: getState(navigator.userAgent || null),
      webDriver: getState(!!navigator.webdriver),
      languages: getState(Array.isArray(navigator.languages) ? [...navigator.languages] : []),
      productSub: getState(navigator.productSub || null),
      pluginsArray: getState(
        Array.from(navigator.plugins || []).map((plugin) => plugin.name) || []
      ),
      pluginsLength: getState(navigator.plugins ? navigator.plugins.length : 0),
      windowSize: getState(windowSize),
      documentFocus: getState(document.hasFocus ? document.hasFocus() : false),
      rtt: getState((navigator as any).connection?.rtt || null), // Explicitly cast navigator to handle connection
      errorTrace: getState(null), // This can be customized if error tracing is needed
      documentElementKeys: getState(Object.keys(document.documentElement) || []),
      functionBind: getState(typeof Function.prototype.bind === 'function'),
      distinctiveProps: getState(distinctiveProps),
      notificationPermissions: getState(Notification?.permission || null),
    };
  
    // Return the result in JSON format
    return JSON.stringify(extractedParams, null, 2);
  }
  