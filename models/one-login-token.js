const Model = require("hmpo-model");
const { config } = require("hmpo-app");

class OneLoginTokenModel extends Model {
    url() {
        return config.get("one-login.url") + "/token";
    }
    requestConfig(reqConfig) {
        if (config.get("proxy")) {
            reqConfig.proxy = config.get("proxy");
        }
        return super.requestConfig(reqConfig);
    }
    save(args, callback) {
        super.prepare((err, data) => {
            const config = this.requestConfig({
                method: "POST",
                body: new URLSearchParams(data).toString(),
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded;charset=UTF-8",
                },
            });
            this.request(config, callback);
        });
    }
}

module.exports = OneLoginTokenModel;
