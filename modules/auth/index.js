const request = require("request-promise-native");

const logger = require("../logger");

exports.authenticate = async (config) => {
  const backendUrl = process.env.BACKEND_URL;
  const body = {
    raspiId: config.raspiId,
    raspiPassword: config.raspiPassword,
  };
  try {
    const action = config.isFirstRun ? "signup" : "login";
    logger.info(`[AUTH] Authenticating by ${action}..`);
    const response = await request.post(`${backendUrl}/raspberry/${action}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    logger.info(`[AUTH] ${action} success`);
    const jRes = JSON.parse(response);
    let newConfig = config;
    newConfig.token = jRes.token;
    newConfig.isFirstRun = false;
    return Promise.resolve(newConfig);
  } catch (err) {
    throw err;
  }
};
