'use strict';

let fields = {
    "cookies-setting": {
        type: "radios",
        items: ["enable", "disable"],
        validate: ["required"]
    },
};

module.exports = fields;
