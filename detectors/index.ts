import { detectAppVersion } from './app_version';
import { detectDocumentAttributes } from './document_element_keys';
import { detectErrorTrace } from './error_trace';
import { detectEvalLengthInconsistency } from './eval_length';
import { detectFunctionBind } from './function_bind';
import { detectLanguagesLengthInconsistency } from './languages_inconsistency';
import { detectMimeTypesConsistent } from './mime_types_consistence';
import { detectNotificationPermissions } from './notification_permissions';
import { detectPluginsArray } from './plugins_array';
import { detectPluginsLengthInconsistency } from './plugins_inconsistency';
import { detectProcess } from './process';
import { detectProductSub } from './product_sub';
import { detectUserAgent } from './user_agent';
import { detectWebDriver } from './webdriver';
import { detectWebGL } from './webgl';
import { detectWindowExternal } from './window_external';
import { detectWindowSize } from './window_size';
import { detectDistinctiveProperties } from './distinctive_properties';
import { detectPuppeteer} from './puppeteer_detection'; // Import new detectors
import { detectPyppeteerStealth} from './pyppeteer_detector'; // Import new detectors
import {detectUndetectedChromeDriver} from './undetected_chrome';
import {detectBrowserless} from './browserless';

export const detectors = {
  detectAppVersion,
  detectDocumentAttributes,
  detectErrorTrace,
  detectEvalLengthInconsistency,
  detectFunctionBind,
  detectLanguagesLengthInconsistency,
  detectMimeTypesConsistent,
  detectNotificationPermissions,
  detectPluginsArray,
  detectPluginsLengthInconsistency,
  detectProcess,
  detectProductSub,
  detectUserAgent,
  detectWebDriver,
  detectWebGL,
  detectWindowExternal,
  detectWindowSize,
  detectDistinctiveProperties,
  detectPuppeteer, // Add new detector
  detectPyppeteerStealth,
  detectUndetectedChromeDriver,
  detectBrowserless,
};