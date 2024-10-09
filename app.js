const bodyParser = require("body-parser");

const { setup, config } = require("hmpo-app");

const { router} = setup();

router.get("/rolo", (req, res) => res.redirect(config.get("urls.rolo")));

router.use(bodyParser.urlencoded({ extended: true }));

router.use(
    config.get("urls.triage"),
    require("./middleware/cookie-handler"),
    require("./middleware/response-headers"),
    require("./middleware/authentication-checking"),
    require('./routes/triage'),
);

router.use(
    config.get("urls.help"),
    require("./middleware/cookie-handler"),
    require("./middleware/response-headers"),
    require("./middleware/authentication-checking"),
    require('./routes/cookies')
);

router.get('/', (req, res) => res.redirect(config.get("urls.triage")));
