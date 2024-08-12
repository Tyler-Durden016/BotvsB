from flask import Flask, request, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Path to the CSV file
csv_file_path = 'bot_detections.csv'

# Fields to include in the CSV
fields_to_include = [
    "isBot", "botKind", "detectedRules", "browserDetails.userAgent",
    "browserDetails.platform", "browserDetails.language", "browserDetails.cookiesEnabled",
    "browserDetails.doNotTrack", "browserDetails.screenResolution", "browserDetails.colorDepth",
    "browserDetails.plugins", "browserDetails.timezone", "browserDetails.webdriver",
    "browserDetails.languages", "browserDetails.productSub", "browserDetails.maxTouchPoints",
    "browserDetails.process", "browserDetails.android", "browserDetails.browserKind",
    "browserDetails.browserEngineKind", "browserDetails.mimeTypesConsistent",
    "browserDetails.evalLength", "browserDetails.webGL.vendor", "browserDetails.webGL.renderer",
    "browserDetails.windowExternal.present", "browserDetails.windowExternal.properties",
    "detectionTime", "detectorsResults.appVersion.bot", "detectorsResults.name.bot",
    "detectorsResults.rules.bot", "detectorsResults.distinctiveProperties.bot",
    "detectorsResults.documentElementKeys.bot", "detectorsResults.errorTrace.bot",
    "detectorsResults.evalLength.bot", "detectorsResults.functionBind.bot",
    "detectorsResults.languageInconsistency.bot", "detectorsResults.mimeTypesConsistence.bot",
    "detectorsResults.notificationPermission.bot", "detectorsResults.pluginsArray.bot",
    "detectorsResults.pluginsInconsistency.bot", "detectorsResults.process.bot",
    "detectorsResults.productSub.bot", "detectorsResults.rtt.bot", "detectorsResults.userAgent.bot",
    "detectorsResults.webDriver.bot", "detectorsResults.webGL.bot", "detectorsResults.windowExternal.bot",
    "detectorsResults.windowSize.bot", "appVersion.value", "appVersion.state", "userAgent.value",
    "userAgent.state", "webDriver.value", "webDriver.state", "languages.value", "languages.state",
    "productSub.value", "productSub.state", "pluginsArray.value", "pluginsArray.state",
    "pluginsLength.value", "pluginsLength.state", "windowSize.value.outerWidth",
    "windowSize.value.outerHeight", "windowSize.value.innerWidth", "windowSize.value.innerHeight",
    "windowSize.state", "documentFocus.value", "documentFocus.state", "rtt.value", "rtt.state",
    "errorTrace.value", "errorTrace.state", "documentElementKeys.value", "documentElementKeys.state",
    "functionBind.value", "functionBind.state", "distinctiveProps.value.awesomium",
    "distinctiveProps.value.cef", "distinctiveProps.value.phantom", "distinctiveProps.value.selenium",
    "distinctiveProps.value.webdriver", "distinctiveProps.value.domAutomation", "distinctiveProps.state",
    "notificationPermissions.value", "notificationPermissions.state"
]

def log_bot_detection(data):
    # Flatten the data
    flattened_data = {field: data.get(field, '') for field in fields_to_include}

    # Convert to DataFrame
    df = pd.DataFrame([flattened_data])

    # Check if the file exists
    if not os.path.isfile(csv_file_path):
        df.to_csv(csv_file_path, index=False)
    else:
        df.to_csv(csv_file_path, mode='a', header=False, index=False)

@app.route('/botdetected/json', methods=['POST'])
def bot_detected():
    try:
        bot_info = request.json
        log_bot_detection(bot_info)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return "Bot Detection Server is running."

if __name__ == '__main__':
    app.run(port=3002, debug=True)

