module.exports = {
    "/": {
        entryPoint: true,
        resetJourney: true,
        next: "type-of-certificate",
    },
    "/type-of-certificate": {
        fields: ["type-of-certificate"],
        next: [
            {
                field: "type-of-certificate",
                value: "death",
                next: "when-death-registered",
            },
            "/rolo",
        ],
    },
    "/when-death-registered": {
        fields: ["death-registered-after-2009"],
        next: [
            {
                field: "death-registered-after-2009",
                value: "yes",
                next: "delivery-method",
            },
            "/rolo",
        ],
    },
    "/delivery-method": {
        fields: ["delivery-method"],
        next: [
            {
                field: "delivery-method",
                value: "standard",
                next: "searching-for-one-person",
            },
            "/rolo",
        ],
    },
    "/searching-for-one-person": {
        controller: require("../../controllers/one-login"),
        fields: ["searching-for-one-person"],
        next: [
            {
                field: "searching-for-one-person",
                value: "yes",
                next: "user-details",
            },
            "/rolo",
        ],
    },
    "/user-details": {
        checkJourney: false,
        template: "spinner",
        forwardQuery: true,
        controller: require("../../controllers/one-login-user-details"),
        next: "order-a-death-certificate",
    },
    "/order-a-death-certificate": {
        checkJourney: false,
    },
    "/sign-out": {
        controller: require("../../controllers/logout"),
        checkJourney: false,
    },
};
