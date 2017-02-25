export enum EVENT_TYPES {"ENTITY_CREATED","ENTITY_UPDATED","ENTITY_DELETED","ACCOUNT_CREATED","ACCOUNT_UPDATED","ACCOUNT_DELETED"};

var config = require("config");
var hubXConfiguration = config.get("Core");
var hubx2 = require("@startx/hubx-core")(hubXConfiguration);
var request = require("request");

export class nerveCenter {
    constructor() {
        //console.log("nerveCenter constructed");
    };
    public notifyOne(eventType: EVENT_TYPES, entityIdentifier, accountIdentifier, primaryKey, changedProperties) {
        return new Promise((resolve, reject) => {
            var newNerveTokenEvent= {
                    eventType:  eventType,
  	                entityIdentifier: entityIdentifier,
  	                primaryKey: primaryKey,
	                accountIdentifier: accountIdentifier,
                    accountType: hubXConfiguration.accountType,                    
                    changedProperties: changedProperties
            }
             hubx2.memory.Context.nerveToken
            .create(newNerveTokenEvent)
            .then(function(newToken) {
                //console.log(newToken);
                //console.log(newToken.get('event'));
                let request = require('request');
                let options = {
                    url: hubXConfiguration.nerveCenterUrl,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: {tokenId: newToken.id},
                    json: true            
                };
                resolve();
/* not working until daniel gets back               request.post(options, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                            resolve(body);
                    }
                    else
                    {
                        console.log("************nerveCenter-notify - something wrong error " + response.statusCode + " options:" + options + " error: " + error);
                        reject(error);
                    };
                });*/
            })
        });
    }
}