let debugLoggingEnabled = __DEV__;

export const logDebug = (...args: unknown[]) => {
  if (debugLoggingEnabled) {
    // eslint-disable-next-line no-console
    console.log('[Fitamall]', ...args);
  }
};

export const setDebugLogging = (enabled: boolean) => {
  debugLoggingEnabled = enabled;
};
