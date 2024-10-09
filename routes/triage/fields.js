module.exports = {
    "type-of-certificate": {
        type: "radios",
        items: ["birth", "death", "marriageOrCP", "adoption", "other"],
        validate: ["required"],
    },
    "death-registered-after-2009": {
        type: "radios",
        items: ["yes", "no", "i don't know"],
        validate: ["required"],
    },
    "delivery-method": {
        type: "radios",
        items: ["standard", "priority", "overseas"],
        validate: ["required"],
    },
    "searching-for-one-person": {
        type: "radios",
        items: ["yes", "no", "i don't know"],
        validate: ["required"],
    },
};
