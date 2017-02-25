"use strict";
var config = require("config");
var hubXConfiguration = config.get("Core");
var hubx2 = require("@startx/hubx-core")(hubXConfiguration);
const nerveCenter_1 = require("../../services/nerveCenter");
const contentionDelayms = 5000;
function Enum(obj) {
    const keysByValue = new Map();
    const EnumLookup = value => keysByValue.get(value);
    for (const key of Object.keys(obj)) {
        EnumLookup[key] = obj[key];
        keysByValue.set(EnumLookup[key], key);
    }
    return Object.freeze(EnumLookup);
}
const enumBMDOMapTo = Enum({ 0: "ZENDESK-USER", 1: "ZENDESK-CATEGORY", 2: "ZENDESK-GROUP", 3: "ZENDESK-SECTION", 4: "ZENDESK-TICKET-RATING", 5: "ZENDESK-TICKET-COMMENT", 6: "ZENDESK-TICKET-AUDIT", 7: "ZENDESK-TICKET-AUDIT-EVENT", 8: "ZENDESK-TICKET", 9: "ZENDESK-ARTICLE" });
const enumBMDOMapFrom = Enum({ "ZENDESK-USER": 0, "ZENDESK-CATEGORY": 1, "ZENDESK-GROUP": 2, "ZENDESK-SECTION": 3, "ZENDESK-TICKET-RATING": 4, "ZENDESK-TICKET-COMMENT": 5, "ZENDESK-TICKET-AUDIT": 6, "ZENDESK-TICKET-AUDIT-EVENT": 7, "ZENDESK-TICKET": 8, "ZENDESK-ARTICLE": 9 });
class contentQueue {
    constructor() {
        console.log("contentQueue constructed");
        contentQueue.Q = contentQueue.GetNewQueueArray();
        contentQueue.NerveCenter = new nerveCenter_1.nerveCenter;
    }
    static GetNewQueueArray() {
        var result = [];
        for (var iIndex = 0; iIndex < 10; iIndex++) {
            var newArray = [];
            newArray['QentityName'] = enumBMDOMapFrom(iIndex);
            result.push(newArray);
        }
        return result;
    }
    mapNameEntities(accountId, entityName, nameEntities) {
        console.log("queuing " + nameEntities.length + " entities...");
        var wantedDelay;
        return new Promise((resolve, reject) => {
            var _this = this;
            if (nameEntities.length == 0) {
                resolve();
            }
            if (!contentQueue.Q['createTimestamp']) {
                contentQueue.Q['createTimestamp'] = contentQueue.GetNowTimestampLong();
                wantedDelay = contentionDelayms;
            }
            else {
                wantedDelay = 500;
            }
            nameEntities.forEach(function (nameEntity) {
                var newQEntity = nameEntity;
                var foundUserAccountIndex = -1;
                foundUserAccountIndex = contentQueue.Q[enumBMDOMapTo(entityName)].findIndex(function (userAccounts) {
                    if (userAccounts.QaccountId == accountId) {
                        return true;
                    }
                });
                if (foundUserAccountIndex > -1) {
                    var foundEntityIndex = -1;
                    foundEntityIndex = contentQueue.Q[enumBMDOMapTo(entityName)][foundUserAccountIndex].findIndex(function (userEntityToMap) {
                        if (userEntityToMap.id == nameEntity.id) {
                            return true;
                        }
                    });
                    if (foundEntityIndex > -1) {
                        contentQueue.Q[enumBMDOMapTo(entityName)][foundUserAccountIndex][foundEntityIndex] = newQEntity;
                    }
                    else {
                        contentQueue.Q[enumBMDOMapTo(entityName)][foundUserAccountIndex].push(newQEntity);
                    }
                }
                else {
                    var newUserAccountArray = [];
                    newUserAccountArray['QaccountId'] = accountId;
                    newUserAccountArray.push(newQEntity);
                    contentQueue.Q[enumBMDOMapTo(entityName)].push(newUserAccountArray);
                }
            });
            setTimeout(contentQueue.shouldProcessQueue, wantedDelay);
            resolve();
        });
    }
    static shouldProcessQueue() {
        var timeToWaitms = (contentQueue.GetNowTimestampLong() - (contentQueue.Q['createTimestamp'] + contentionDelayms));
        if (timeToWaitms < 0) {
            setTimeout(contentQueue.shouldProcessQueue, Math.abs(timeToWaitms) + 10);
        }
        else {
            var queueToProcess = contentQueue.Q;
            contentQueue.Q = contentQueue.GetNewQueueArray();
            contentQueue.processQueue(queueToProcess);
        }
    }
    static processQueue(queueToProcess) {
        queueToProcess.forEach(function (EntitiesGroup) {
            EntitiesGroup.forEach(function (accountEntities) {
                console.log("creating difference Ids list...");
                var differenceItemsMap = {};
                var TempLimitCounter = 0;
                var BreakException = {};
                try {
                    accountEntities.forEach(function (itemToDiffer) {
                        TempLimitCounter++;
                        differenceItemsMap[itemToDiffer.id] = itemToDiffer;
                        if (TempLimitCounter == 20) {
                            throw BreakException;
                        }
                    });
                }
                catch (e) {
                    if (e !== BreakException)
                        throw e;
                }
                console.log("checking difference...");
                hubx2.memory.findNameEntitiesDifference(EntitiesGroup.QentityName, accountEntities.QaccountId, differenceItemsMap).then((resultDifference) => {
                    console.log("mapping to memory...");
                    hubx2.memory.mapNameEntities(hubXConfiguration.accountType, accountEntities.QaccountId, EntitiesGroup.QentityName, accountEntities).then((result) => {
                        console.log("mapped to memory, notifying Nerve Center..." + result);
                        let resultDifferenceItem;
                        for (resultDifferenceItem in resultDifference) {
                            if (Object.keys(resultDifference[resultDifferenceItem]).length > 0) {
                                contentQueue.NerveCenter.notifyOne(nerveCenter_1.EVENT_TYPES.ENTITY_UPDATED, EntitiesGroup.QentityName, accountEntities.QaccountId, accountEntities.QaccountId + "." + resultDifferenceItem, resultDifference[resultDifferenceItem]);
                            }
                        }
                    }).catch(exception => {
                        console.log("error");
                        console.dir(exception);
                    });
                }).catch(exception => {
                    console.log("findNameEntitiesDifference-error");
                    console.dir(exception);
                });
            });
        });
    }
    static GetNowTimestampLong() {
        return Math.floor(new Date().valueOf());
    }
    ;
}
exports.contentQueue = contentQueue;
//# sourceMappingURL=contentQueue.js.map