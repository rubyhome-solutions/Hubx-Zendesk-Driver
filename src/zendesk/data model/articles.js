"use strict";
const C_DATAOBJECTNAME = "articles";
const C_DATAOBJECTENTITYNAME = "ZENDESK-ARTICLE";
var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
var utils = require("../../utils/utils");
class articles {
    constructor(QContent) {
        this.DataObjectName = C_DATAOBJECTNAME;
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    }
    ;
    transform(accountData, items) {
        return new Promise((resolve, reject) => {
            var newArray = [];
            if (!items || !items.length) {
                resolve();
            }
            else {
                items.forEach(function (item) {
                    let newItem = { outdated: null, created_at: null, title: '', id: '', updated_at: null, section_id: null, locale: null, source_locale: null, author_id: null, position: null, promoted: null, body: null, draft: null, comments_disabled: null, vote_count: null, vote_sum: null, vendorUrl: '' };
                    newItem.created_at = item.created_at;
                    newItem.outdated = item.outdated;
                    newItem.title = item.title;
                    newItem.id = item.id;
                    newItem.updated_at = item.updated_at;
                    newItem.section_id = accountData.identifier + '.' + item.section_id;
                    newItem.locale = item.locale;
                    newItem.vendorUrl = item.html_url;
                    newItem.author_id = accountData.identifier + '.' + item.author_id;
                    newItem.source_locale = item.source_locale;
                    newItem.position = item.position;
                    newItem.promoted = item.promoted;
                    newItem.body = item.body;
                    newItem.draft = item.draft;
                    newItem.comments_disabled = item.comments_disabled;
                    newItem.vote_count = item.vote_count;
                    if (item.vote_sum)
                        newItem.vote_sum = item.vote_sum;
                    newArray.push(newItem);
                });
                resolve(newArray);
            }
        });
    }
    map(accountData, currentPage) {
        return new Promise((resolve, reject) => {
            let _this = this;
            cloudElements.GetElementObjectPageWhere(accountData.CEelementInstanceToken, "resources/" + C_DATAOBJECTNAME, currentPage, "category IS NOT NULL").then((elementsReturned) => {
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
            }).catch(reject);
        });
    }
}
exports.articles = articles;
//# sourceMappingURL=articles.js.map