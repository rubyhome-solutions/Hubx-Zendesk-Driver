const C_DATAOBJECTNAME = "audits";
const C_DATAOBJECTENTITYNAME = "ZENDESK-TICKET-AUDIT";

var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
import {contentQueue} from "../../singletons/contentQueue/contentQueue";
import {EVENT_TYPES} from "../../services/nerveCenter";
var utils = require("../../utils/utils");

export class ticketAudits {
    private QContent: contentQueue;
    public DataObjectName: String = C_DATAOBJECTNAME;
    constructor(QContent: contentQueue) {
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    };

    public transform(accountData, items) {
        return new Promise((resolve, reject) => {
            var allTicketsAudits = [];
            var finalTicketsAuditsEventsToMap = [];
            var _this=this;
            if (!items || !items.length) {
                resolve({allTicketsAudits: [], allTicketsAuditsEventsToMap: []});
            }
            else {
                items.forEach(function (item) {
                    let ticketAuditEventsToMap = [];
                    let newItem = {id: null, ticket_id: null, metadata: '', via: null, author_id: null, created_at: null, events: null, vendorUrl: ''};
                    newItem.id=item.id;
                    newItem.ticket_id=item.ticket_id;
                    newItem.metadata=item.metadata;
                    if (item.events) {
                        if (item.events.length>0) {
                            item.events.forEach(function (auditEvent) {
                                auditEvent.audit_id=accountData.identifier + '.' + item.id;
                                auditEvent.ticket_id=accountData.identifier + '.' + item.ticket_id;
                                auditEvent.type=item.type;
                                auditEvent.vendorUrl='https://' + accountData.siteAddress + '.zendesk.com/tickets/' + item.ticket_id + "/events";
                                if (auditEvent.author_id) {
                                    if (!(auditEvent.author_id==-1)) {
                                        auditEvent.author_id=accountData.identifier + '.' + auditEvent.author_id;
                                    }
                                }
                                if (auditEvent.recipients) 
                                    if (auditEvent.recipients.length) 
                                        auditEvent.recipients.forEach((recipient, index) => {
                                            auditEvent.recipients[index] = accountData.identifier + '.' + auditEvent.recipients[index];
                                        });                                
                                ticketAuditEventsToMap.push(auditEvent)
                            });
                            finalTicketsAuditsEventsToMap=finalTicketsAuditsEventsToMap.concat(ticketAuditEventsToMap);
                            newItem.events = utils.getPointersStringArray(ticketAuditEventsToMap, "id", accountData.identifier + '.');
                        } else newItem.events= null;
                    } else newItem.events= null;
                    //newItem.type=item.type;
            
                    if (!(item.author_id==-1)) {
                        newItem.author_id=accountData.identifier + '.' + item.author_id;
                    } else newItem.author_id=null;

                    newItem.created_at=item.created_at;
                    newItem.vendorUrl='https://' + accountData.siteAddress + '.zendesk.com/tickets/' + item.ticket_id;
                    allTicketsAudits.push(newItem);
                });
                resolve({allTicketsAudits: allTicketsAudits, finalTicketsAuditsEventsToMap: finalTicketsAuditsEventsToMap});
            }
        });
    }

    public getTicketsAudits(accountData, ticketsIdsArray) {
        return new Promise((resolve, reject) => {
            let allAuditsArray = [];
            let itemsProcessed = 0;

            ticketsIdsArray.forEach((item, index, array) => {
                cloudElements.GetElementObject(accountData.CEelementInstanceToken, "incidents/" + item + "/history").then((elementsReturned: any) => {
                    itemsProcessed++;
                    if (!elementsReturned || !elementsReturned.length) {
                        resolve();
                    }
                    else {
                        if (elementsReturned.length>0) {
                            elementsReturned.forEach(function (ChildItem) {                                
                                allAuditsArray.push(ChildItem);
                            });
                        }
                        if(itemsProcessed == ticketsIdsArray.length) {
                            resolve(allAuditsArray);
                        }
                    }
                }).catch(reject);
            });
        });
    }

    /*public map(accountData, currentPage: number, categoriesIDs: any[]) {
        let _this=this;
        return new Promise((resolve, reject) => {            
            cloudElements.GetElementObjectPage(accountData.CEelementInstanceToken, "resources/" + C_DATAOBJECTNAME, currentPage).then((elementsReturned: any) => {
                if (!elementsReturned || !elementsReturned.length) {
                    resolve(categoriesIDs);
                }
                else {
                    _this.transform(accountData, elementsReturned).then ((finalItemsToWrite: any[]) => {
                        finalItemsToWrite.forEach(function (catItem) {
                            categoriesIDs.push(catItem.id);
                        });
                        _this.QContent.mapNameEntities(accountData.identifier, C_DATAOBJECTENTITYNAME, finalItemsToWrite).then((result) => {
                            _this.map(accountData, currentPage+1, categoriesIDs).then((categoriesIDs)=>{if (categoriesIDs) resolve(categoriesIDs);}).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
            }).catch(reject);           
        });
    }*/

}