const Model = require("hmpo-model");
const { config } = require("hmpo-app");

class OneloginUserInfoModel extends Model {
    url() {
        return config.get("one-login.url") + "/userinfo";
    }

    requestConfig(reqConfig) {
        if (config.get("proxy")) {
            reqConfig.proxy = config.get("proxy");
        }
        return super.requestConfig(reqConfig);
    }
}

module.exports = OneloginUserInfoModel;
