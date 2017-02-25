"use strict";
const C_DATAOBJECTNAME = "ratings";
const C_DATAOBJECTENTITYNAME = "ZENDESK-TICKET-RATING";
var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
var utils = require("../../utils/utils");
class ticketRatings {
    constructor(QContent) {
        this.DataObjectName = C_DATAOBJECTNAME;
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    }
    ;
    transform(accountData, items) {
        return new Promise((resolve, reject) => {
            resolve(items);
        });
    }
    map(accountData, currentPage) {
        return new Promise((resolve, reject) => {
            let _this = this;
            cloudElements.GetElementObjectPage(accountData.CEelementInstanceToken, C_DATAOBJECTNAME, currentPage).then((elementsReturned) => {
                if (!elementsReturned || !elementsReturned.length) {
                    resolve(true);
                }
                else {
                    _this.transform(accountData, elementsReturned).then((finalItemsToWrite) => {
                        _this.QContent.mapNameEntities(accountData.identifier, C_DATAOBJECTENTITYNAME, finalItemsToWrite).then((result) => {
                            _this.map(accountData, currentPage + 1).then((finished) => { if (finished)
                                resolve(true); }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
            });
        });
    }
}
exports.ticketRatings = ticketRatings;
//# sourceMappingURL=ticketSatisfactionRatings.js.map