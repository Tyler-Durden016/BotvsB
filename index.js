function detectBot(combinedRules) {
  let botInfo = {
    isBot: false,
    botKind: null,
    detectedRules:[],
    browserDetails: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      webdriver: navigator.webdriver,
      automationControlled: navigator.automationControlled,
      languages: navigator.languages,
      productSub: navigator.productSub,
      maxTouchPoints: navigator.maxTouchPoints,
      process: getProcessInfo(),
      android: isAndroid(),
      browserKind: getBrowserKind(),
      browserEngineKind: getBrowserEngineKind(),
      mimeTypesConsistent: checkMimeTypesConsistency(),
      evalLength: getEvalLength(),
      webGL: getWebGLInfo(),
      windowExternal: getWindowExternal()
    },
    detectionTime: new Date().toUTCString().replace(" GMT", " +0000"),
    detectorsResults: {},
  };

  // Helper function to get component state
  function getComponentState(value) {
    return value !== null && value !== undefined ? 'Success' : 'Failure';
  }

  // Initialize component values
  botInfo.appVersion = { value: navigator.appVersion, state: getComponentState(navigator.appVersion) };
  botInfo.userAgent = { value: navigator.userAgent, state: getComponentState(navigator.userAgent) };
  botInfo.webDriver = { value: navigator.webdriver, state: getComponentState(navigator.webdriver) };
  botInfo.languages = { value: navigator.languages, state: getComponentState(navigator.languages) };
  botInfo.productSub = { value: navigator.productSub, state: getComponentState(navigator.productSub) };
  botInfo.pluginsArray = { value: Array.from(navigator.plugins).map(p => p.name), state: getComponentState(navigator.plugins) };
  botInfo.pluginsLength = { value: navigator.plugins.length, state: getComponentState(navigator.plugins.length) };
  botInfo.windowSize = {
    value: {
    	outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    },
    state: getComponentState(window.outerWidth)
  };

  
  function getProcessInfo() {
    // This might not be available in most browsers for security reasons
    return typeof process !== 'undefined' ? process : null;
  }


  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function getBrowserKind() {
    const ua = navigator.userAgent;
    console.log("ua is", ua);
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Safari/i.test(ua)) return 'Safari';
    if (/MSIE|Trident/i.test(ua)) return 'IE';
    if (/Edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  function getBrowserEngineKind() {
    const ua = navigator.userAgent;
    if (/Gecko/i.test(ua) && !/like Gecko/i.test(ua)) return 'Gecko';
    if (/WebKit/i.test(ua)) return 'WebKit';
    if (/Trident/i.test(ua)) return 'Trident';
    if (/EdgeHTML/i.test(ua)) return 'EdgeHTML';
    return 'Unknown';
  }
  function checkMimeTypesConsistency() {
    const mimeTypes = navigator.mimeTypes;
    const expectedTypes = ['application/pdf', 'text/plain', 'application/xml'];
    return expectedTypes.every(type => Array.from(mimeTypes).some(mt => mt.type === type));
  }

  function getEvalLength() {
    try {
      return eval.toString().length;
    } catch (e) {
      return null;
    }
  }

  function getWebGLInfo() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    
    return {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER)
    };
  }

  function getWindowExternal() {
    if (typeof window.external !== 'undefined') {
      return {
        present: true,
        properties: Object.getOwnPropertyNames(window.external)
      };
    }
    return { present: false };
  }
  botInfo.documentFocus = { value: document.hasFocus(), state: getComponentState(document.hasFocus) };
  botInfo.rtt = { value: navigator.connection ? navigator.connection.rtt : null, state: getComponentState(navigator.connection && navigator.connection.rtt) };
  botInfo.errorTrace = { value: getErrorTrace(), state: getComponentState(getErrorTrace()) };
  botInfo.documentElementKeys = { value: Object.keys(document.documentElement), state: getComponentState(document.documentElement) };
  botInfo.functionBind = { value: Function.prototype.bind.toString(), state: getComponentState(Function.prototype.bind) };
  botInfo.distinctiveProps = {
    value: {
      awesomium: 'awesomium' in window,
      cef: 'cef' in window,
      phantom: 'phantom' in window || '_phantom' in window,
      selenium: '_selenium' in window || 'callSelenium' in window || 'webdriver' in window,
      webdriver: 'webdriver' in window,
      domAutomation: 'domAutomation' in window || 'domAutomationController' in window,
      // Add more distinctive properties as needed
    },
    state: 'Success'
  };
  botInfo.notificationPermissions = { value: getNotificationPermissions(), state: getComponentState(Notification) };

  function getErrorTrace() {
    try {
      throw new Error();
    } catch (error) {
      return error.stack;
    }
  }

  function getNotificationPermissions() {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return null;
  }

  function evaluateCondition(condition, botInfo) {
    try {
      return new Function('botInfo', `with(botInfo) { return ${condition}; }`)(botInfo);
    } catch (error) {
      console.warn(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  // Ensure combinedRules is an array
  if (!Array.isArray(combinedRules)) {
    console.warn('Invalid rules structure. Expected an array of rules.');
    return botInfo;
  }

  combinedRules.forEach((rule, index) => {
    if (!rule || typeof rule !== 'object') {
      console.warn(`Invalid rule at index ${index}:`, rule);
      return;
    }

    let ruleResult = { ruleName: rule.name || `Rule ${index}`, detected: false, details: {} };

    if (Array.isArray(rule.parameters) && Array.isArray(rule.conditions)) {
      const parameterValues = {};
      rule.parameters.forEach(param => {
        if (param && param.name) {
          parameterValues[param.name] = botInfo[param.name];
        }
      });

      ruleResult.details.parameters = parameterValues;

      rule.conditions.forEach(condition => {
        if (condition && typeof condition.condition === 'string') {
          if (evaluateCondition(condition.condition, botInfo)) {
            ruleResult.detected = true;
            ruleResult.details.matchedCondition = condition.condition;
            ruleResult.details.result = condition.result;
          }
        }
      });
    } else if (rule.type) {
      // Handle simple rule format
      switch(rule.type) {
        case 'userAgent':
          ruleResult.detected = new RegExp(rule.pattern, 'i').test(navigator.userAgent);
          break;
        case 'navigatorProperty':
          ruleResult.detected = navigator[rule.property] === rule.value;
          break;
     }
    }

    if (ruleResult.detected) {
      botInfo.isBot = true;
      botInfo.botKind = botInfo.botKind || ruleResult.details.result || rule.type;
      botInfo.detectedRules.push(ruleResult);
    }

    botInfo.detectorsResults[ruleResult.ruleName] = { bot: ruleResult.detected };
  });

  return botInfo;
}

// Fetch rules from server and perform bot detection
fetch('https://botd.cs14research.in/api/rules')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch rules');
    }
    return response.json();
  })
  .then(combinedRules => {
    console.log('Combined rules:', combinedRules);
    const botInfo = detectBot(combinedRules);

    console.log('Bot Detection Result:', JSON.stringify(botInfo, null, 2));
    // Send the detection result to the server
    sendBotDetectedSignal(botInfo);
  })
  .catch(error => console.error('Error:', error));
  // Function to send a signal to the server
  function sendBotDetectedSignal(botInfo) {
    console.log('Attempting to send bot detection signal:', botInfo);
  
    fetch('https://botd.cs14research.in/botdetected/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botInfo),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        console.log('Bot detection signal sent successfully. Server response:', data);
           // Redirect based on bot detection result
       // if (!botInfo.isBot) {
         //   window.location.href = 'https://loganalysis24.cs14research.in';
       // } else {
         //   window.location.href = 'https://www.google.com';
       // }
      })
      .catch(error => {
        console.error('Error sending bot detection signal:', error);
      });
  }

