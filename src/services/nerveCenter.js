"use strict";
var EVENT_TYPES;
(function (EVENT_TYPES) {
    EVENT_TYPES[EVENT_TYPES["ENTITY_CREATED"] = 0] = "ENTITY_CREATED";
    EVENT_TYPES[EVENT_TYPES["ENTITY_UPDATED"] = 1] = "ENTITY_UPDATED";
    EVENT_TYPES[EVENT_TYPES["ENTITY_DELETED"] = 2] = "ENTITY_DELETED";
    EVENT_TYPES[EVENT_TYPES["ACCOUNT_CREATED"] = 3] = "ACCOUNT_CREATED";
    EVENT_TYPES[EVENT_TYPES["ACCOUNT_UPDATED"] = 4] = "ACCOUNT_UPDATED";
    EVENT_TYPES[EVENT_TYPES["ACCOUNT_DELETED"] = 5] = "ACCOUNT_DELETED";
})(EVENT_TYPES = exports.EVENT_TYPES || (exports.EVENT_TYPES = {}));
;
var config = require("config");
var hubXConfiguration = config.get("Core");
var hubx2 = require("@startx/hubx-core")(hubXConfiguration);
var request = require("request");
class nerveCenter {
    constructor() {
    }
    ;
    notifyOne(eventType, entityIdentifier, accountIdentifier, primaryKey, changedProperties) {
        return new Promise((resolve, reject) => {
            var newNerveTokenEvent = {
                eventType: eventType,
                entityIdentifier: entityIdentifier,
                primaryKey: primaryKey,
                accountIdentifier: accountIdentifier,
                accountType: hubXConfiguration.accountType,
                changedProperties: changedProperties
            };
            hubx2.memory.Context.nerveToken
                .create(newNerveTokenEvent)
                .then(function (newToken) {
                let request = require('request');
                let options = {
                    url: hubXConfiguration.nerveCenterUrl,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: { tokenId: newToken.id },
                    json: true
                };
                resolve();
            });
        });
    }
}
exports.nerveCenter = nerveCenter;
//# sourceMappingURL=nerveCenter.js.map