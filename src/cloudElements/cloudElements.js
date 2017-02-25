var config = require("config");
var CloudElementsConfiguration = config.get("CloudElements");
var request = require("request");
var ZendeskConfiguration = config.get("Zendesk");
var utils = require("../utils/utils");
module.exports.getZendeskUrl = function (ZendeskDomainPrefix) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        var options = {
            url: CloudElementsConfiguration.apiBaseURL + utils.strReplaceAll(CloudElementsConfiguration.GetOAuthURLpath, "%s", CloudElementsConfiguration.elementKey) + "?apiKey=" + ZendeskConfiguration.apiKey + "&apiSecret=" + ZendeskConfiguration.apiSecret + "&siteAddress=" + ZendeskDomainPrefix + "&callbackUrl=" + ZendeskConfiguration.callbackUrl + "&state=" + ZendeskDomainPrefix,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                resolve(info.oauthUrl);
            }
            else {
                console.log("apiZendesk-cloudElements-getUrl-error=" + error);
                console.log("apiZendesk-cloudElements-getUrl-response.statusCode=" + response.statusCode);
                console.dir(response);
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error(response.statusCode));
                }
            }
        });
    });
};
module.exports.SetInstanceName = function (elementToken, instanceId, newName) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let options = {
            url: CloudElementsConfiguration.apiBaseURL + '/instances/' + instanceId,
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: { name: newName },
            json: true
        };
        request.patch(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--GetElementObject-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.deleteCEInstance = function (elementToken, instanceId) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let options = {
            url: CloudElementsConfiguration.apiBaseURL + '/instances/' + instanceId,
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        request.delete(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve();
            }
            else {
                if (response.statusCode == 404) {
                    resolve();
                }
                else {
                    console.log("************apiZendesk-cloudElements--deleteCEInstance - something wrong error " + response.statusCode + " options:" + options);
                    reject(error);
                }
            }
            ;
        });
    });
};
module.exports.createInstance = function (ZendeskDomainPrefix, userCode) {
    return new Promise((resolve, reject) => {
        var request = require('request');
        var createInstanceData = { "element": {
                "key": CloudElementsConfiguration.elementKey
            },
            "providerData": {
                "code": userCode
            },
            "configuration": {
                "oauth.api.key": ZendeskConfiguration.apiKey,
                "oauth.api.secret": ZendeskConfiguration.apiSecret,
                "oauth.callback.url": ZendeskConfiguration.callbackUrl,
                "zendesk.subdomain": ZendeskDomainPrefix,
                "event.notification.enabled": "true",
                "event.vendor.type": "polling",
                "event.notification.type": "webhook",
                "event.notification.callback.url": CloudElementsConfiguration.webhooksUrl,
                "event.notification.signature.key": CloudElementsConfiguration.webhooksSignatureKey,
                "filter.response.nulls": "false",
                "event.poller.refresh_interval": 1,
                "event.poller.configuration": "{\"agents\":{\"url\":\"/hubs/helpdesk/agents\",\"idField\":\"id\",\"pageSize\":100,\"datesConfiguration\":{\"updatedDateField\":\"updated_at\",\"updatedDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\":\"created_at\",\"createdDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"articles\":{\"url\":\"/hubs/helpdesk/resources/articles?where=category%20IS%20NOT%20NULL\",\"idField\":\"id\",\"pageSize\":100,\"datesConfiguration\":{\"updatedDateField\":\"updated_at\",\"updatedDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\":\"created_at\",\"createdDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"categories\":{\"url\":\"/hubs/helpdesk/resources/categories\",\"idField\":\"id\",\"pageSize\":100,\"datesConfiguration\":{\"updatedDateField\":\"updated_at\",\"updatedDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\":\"created_at\",\"createdDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"sections\":{\"url\":\"/hubs/helpdesk/resources/sections\",\"idField\":\"id\",\"pageSize\":100,\"datesConfiguration\":{\"updatedDateField\":\"updated_at\",\"updatedDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\":\"created_at\",\"createdDateFormat\":\"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"contacts\": {\"url\": \"/hubs/helpdesk/contacts\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"userFields\": {\"url\": \"/hubs/helpdesk/fields/user-field\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"incident-types\": {\"url\": \"/hubs/helpdesk/incident-types\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"incidents\": {\"url\": \"/hubs/helpdesk/incidents\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"priorities\": {\"url\": \"/hubs/helpdesk/priorities\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"statuses\": {\"url\": \"/hubs/helpdesk/statuses\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}},\"users\": {\"url\": \"/hubs/helpdesk/users\",\"idField\": \"id\",\"pageSize\": 100,\"datesConfiguration\": {\"updatedDateField\": \"updated_at\",\"updatedDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\",\"createdDateField\": \"created_at\",\"createdDateFormat\": \"yyyy-MM-dd'T'HH:mm:ss'Z'\"}}}"
            },
            "tags": [
                "test"
            ],
            "name": "new-instance-temp-name"
        };
        var options = {
            url: CloudElementsConfiguration.apiBaseURL + '/instances',
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret,
                'Content-Type': 'application/json'
            },
            json: true,
            body: createInstanceData
        };
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--createInstance-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.getUserOfElementByToken = function (elementToken) {
    return new Promise((resolve, reject) => {
        var request = require('request');
        var options = {
            url: CloudElementsConfiguration.apiBaseURL + '/hubs/helpdesk/users/me',
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json'
            },
            json: true
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--getUserIdWithElementToken-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.GetElementObjectPageWhere = function (elementToken, elementObjectName, page, where) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let options = {
            url: CloudElementsConfiguration.apiBaseURL + '/hubs/helpdesk/' + elementObjectName + '?where=' + where + '&pageSize=' + CloudElementsConfiguration.defaultPageSize + '&page=' + page,
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--GetElementObjectPage-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.GetElementObjectPage = function (elementToken, elementObjectName, page) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let options = {
            url: CloudElementsConfiguration.apiBaseURL + '/hubs/helpdesk/' + elementObjectName + '?pageSize=' + CloudElementsConfiguration.defaultPageSize + '&page=' + page,
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--GetElementObjectPage-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.GetElementObject = function (elementToken, elementObjectName) {
    return new Promise((resolve, reject) => {
        let request = require('request');
        let options = {
            url: CloudElementsConfiguration.apiBaseURL + '/hubs/helpdesk/' + elementObjectName,
            headers: {
                'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            json: true
        };
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                if (error) {
                    reject(error);
                }
                else {
                    reject(new Error("apiZendesk-cloudElements--GetElementObject-Error statusCode=" + response.statusCode));
                }
            }
            ;
        });
    });
};
module.exports.getElementObjectsList = function (element) {
    let resArray = [];
    for (let iIndex = 0; iIndex < element.defaultTransformations.length; iIndex++) {
        resArray.push(element.defaultTransformations[iIndex].name);
    }
    return resArray;
};
module.exports.PostElementObject = function (elementToken, elementObjectName, elementToPost, returnCallback) {
    let request = require('request');
    let options = {
        url: CloudElementsConfiguration.apiBaseURL + '/hubs/helpdesk/' + elementObjectName,
        headers: {
            'Authorization': 'User ' + CloudElementsConfiguration.userSecret + ', Organization ' + CloudElementsConfiguration.organizationSecret + ', Element ' + elementToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: elementToPost,
        json: true
    };
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            returnCallback(null, body);
        }
        else {
            console.log("************apiZendesk-cloudElements-GetElementObject - something wrong error " + response.statusCode + " options:" + options);
            returnCallback(error, null);
        }
        ;
    });
};
//# sourceMappingURL=cloudElements.js.map