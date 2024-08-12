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

  // Rest of your detectBot code here...

  // After collecting all the data, save it to a CSV
  saveDataToCSV(botInfo);

  return botInfo;
}

// Function to save data to a CSV file
function saveDataToCSV(data) {
  const csvContent = [];
  
  // Add headers
  const headers = Object.keys(data.browserDetails);
  csvContent.push(headers.join(","));

  // Add values
  const values = Object.values(data.browserDetails).map(value => {
    if (Array.isArray(value)) {
      return `"${value.join(";")}"`; // Handle arrays by joining values with a semicolon
    }
    return `"${value}"`; // Wrap each value in quotes in case it contains commas
  });
  csvContent.push(values.join(","));

  // Create CSV file
  const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Create a link to download the CSV
  const a = document.createElement("a");
  a.href = url;
  a.download = "all_data.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
