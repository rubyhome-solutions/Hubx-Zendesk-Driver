"use strict";
const C_DATAOBJECTNAME = "tickets";
const C_DATAOBJECTENTITYNAME = "ZENDESK-TICKET";
var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
const ticketSatisfactionRatings_1 = require("./ticketSatisfactionRatings");
const ticketComments_1 = require("./ticketComments");
const ticketAudits_1 = require("./ticketAudits");
var utils = require("../../utils/utils");
class tickets {
    constructor(QContent) {
        this.DataObjectName = C_DATAOBJECTNAME;
        this.QContent = QContent;
        this.ratings = new ticketSatisfactionRatings_1.ticketRatings(QContent);
        this.comments = new ticketComments_1.ticketComments(QContent);
        this.audits = new ticketAudits_1.ticketAudits(QContent);
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    }
    ;
    transform(accountData, items) {
        return new Promise((resolve, reject) => {
            var newArray = [];
            var allSatisfactionRatingsToMap = [];
            var _this = this;
            if (!tickets || !tickets.length) {
                resolve({ finalTicketsToMap: [], ticketsIdsArray: [], ticketsSatisfactionRatingsToMap: [] });
            }
            items.forEach(function (item) {
                let ticketSatisfactionRatingsToMap = [];
                let newItem = { assignee_id: null, collaborator_ids: [], created_at: null, description: '', due_at: null, has_incidents: null, id: '', priority: '', comment: '', recipient: null, status: '', subject: null, submitter_id: null, tags: null, satisfaction_ratings: [], type: '', updated_at: null, vendorUrl: '' };
                if (item.assignee_id)
                    newItem.assignee_id = accountData.identifier + '.' + item.assignee_id;
                if (item.collaborator_ids)
                    if (item.collaborator_ids.length > 0) {
                        item.collaborator_ids.forEach(function (theitem) {
                            newItem.collaborator_ids.push(accountData.identifier + '.' + theitem);
                        });
                    }
                newItem.created_at = item.created_at;
                newItem.description = item.description;
                newItem.due_at = item.due_at;
                newItem.has_incidents = item.has_incidents;
                newItem.id = item.id;
                newItem.priority = item.priority;
                newItem.comment = item.comment;
                newItem.recipient = item.recipient;
                newItem.status = item.status;
                newItem.subject = item.subject;
                if (item.submitter_id)
                    newItem.submitter_id = accountData.identifier + '.' + item.submitter_id;
                if (item.tags) {
                    if (item.tags.length > 0) {
                        newItem.tags = item.tags.join("|");
                    }
                }
                if (item.satisfaction_ratings) {
                    if (item.satisfaction_ratings.length > 0) {
                        item.satisfaction_ratings.forEach(function (rating) {
                            ticketSatisfactionRatingsToMap.push(rating);
                        });
                        allSatisfactionRatingsToMap = allSatisfactionRatingsToMap.concat(ticketSatisfactionRatingsToMap);
                        newItem.satisfaction_ratings = utils.getPointersStringArray(ticketSatisfactionRatingsToMap, "id", accountData.identifier + '.');
                    }
                    else
                        newItem.satisfaction_ratings = null;
                }
                else
                    newItem.satisfaction_ratings = null;
                newItem.type = item.type;
                newItem.updated_at = item.updated_at;
                newItem.vendorUrl = 'https://' + accountData.siteAddress + '.zendesk.com/tickets/' + item.id;
                newArray.push(newItem);
            });
            resolve({ finalTicketsToMap: newArray, ticketsIdsArray: utils.getPointersStringArray(newArray, "id", ''), ticketsSatisfactionRatingsToMap: allSatisfactionRatingsToMap });
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
                    _this.transform(accountData, elementsReturned).then((args) => {
                        let finalTicketsToMap = args.finalTicketsToMap;
                        let ticketsIdsArray = args.ticketsIdsArray;
                        let ticketsSatisfactionRatingsToMap = args.ticketsSatisfactionRatingsToMap;
                        _this.ratings.transform(accountData, ticketsSatisfactionRatingsToMap).then((finalTicketsSatisfactionRatingsToMap) => {
                            _this.comments.getTicketsComments(accountData, ticketsIdsArray).then((commentsToWrite) => {
                                _this.comments.transform(accountData, commentsToWrite).then((finalTicketsCommentsToMap) => {
                                    utils.SetObjectPointersByArrayAndField(accountData.identifier, finalTicketsToMap, finalTicketsCommentsToMap, "comments", "id", "ticket_id", "id").then((finalTicketsToMap) => {
                                        let _finalTicketsToMap = finalTicketsToMap;
                                        _this.audits.getTicketsAudits(accountData, ticketsIdsArray).then((auditsToWrite) => {
                                            _this.audits.transform(accountData, auditsToWrite).then((audits) => {
                                                let finalTicketsAuditsToMap = audits.allTicketsAudits;
                                                let finalTicketsAuditsEventsToMap = audits.finalTicketsAuditsEventsToMap;
                                                utils.SetObjectPointersByArrayAndField(accountData.identifier, _finalTicketsToMap, finalTicketsAuditsToMap, "audits", "id", "ticket_id", "id").then((finalTicketsToMap) => {
                                                    _this.QContent.mapNameEntities(accountData.identifier, "ZENDESK-TICKET-COMMENT", finalTicketsCommentsToMap).then((result) => {
                                                        _this.QContent.mapNameEntities(accountData.identifier, "ZENDESK-TICKET-RATING", finalTicketsSatisfactionRatingsToMap).then((result) => {
                                                            _this.QContent.mapNameEntities(accountData.identifier, "ZENDESK-TICKET-AUDIT-EVENT", finalTicketsAuditsEventsToMap).then((result) => {
                                                                _this.QContent.mapNameEntities(accountData.identifier, "ZENDESK-TICKET-AUDIT", finalTicketsAuditsToMap).then((result) => {
                                                                    _this.QContent.mapNameEntities(accountData.identifier, C_DATAOBJECTENTITYNAME, finalTicketsToMap).then((result) => {
                                                                        _this.map(accountData, currentPage + 1).then((finished) => { if (finished)
                                                                            resolve(true); }).catch(reject);
                                                                    }).catch(reject);
                                                                }).catch(reject);
                                                            }).catch(reject);
                                                        }).catch(reject);
                                                    }).catch(reject);
                                                }).catch(reject);
                                            }).catch(reject);
                                        }).catch(reject);
                                    }).catch(reject);
                                }).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
    createTicket(subject, description, submitter_id, assignee_id, tags) {
        var newTicket = {
            "subject": subject,
            "description": description,
            "type": "problem",
            "via": {
                "channel": "hubx-zendesk",
            },
            "raw_subject": subject,
            "forum_topic_id": null,
            "allow_channelback": false,
            "submitter_id": submitter_id,
            "priority": "high",
            "assignee_id": assignee_id,
            "tags": tags,
            "recipient": "support@fastee.im",
            "requester_id": submitter_id
        };
    }
}
exports.tickets = tickets;
//# sourceMappingURL=tickets.js.map