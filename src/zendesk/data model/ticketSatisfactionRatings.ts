const C_DATAOBJECTNAME = "ratings";
const C_DATAOBJECTENTITYNAME = "ZENDESK-TICKET-RATING";

var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
import {contentQueue} from "../../singletons/contentQueue/contentQueue";
import {EVENT_TYPES} from "../../services/nerveCenter";
var utils = require("../../utils/utils");

export class ticketRatings {
     private QContent: contentQueue;
    public DataObjectName: String = C_DATAOBJECTNAME;
    constructor(QContent: contentQueue) {
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    };

    //NOT IMPLEMENTED - TODO 

    public transform(accountData, items) {
        return new Promise((resolve, reject) => {
            resolve(items);
        });     
    }

    public map(accountData, currentPage) {        
        return new Promise((resolve, reject) => {
            let _this=this;
            cloudElements.GetElementObjectPage(accountData.CEelementInstanceToken, C_DATAOBJECTNAME, currentPage).then((elementsReturned: any) => {
                if (!elementsReturned || !elementsReturned.length) {
                    resolve(true);
                }
                else {
                    _this.transform(accountData, elementsReturned).then((finalItemsToWrite) => {
                        _this.QContent.mapNameEntities(accountData.identifier, C_DATAOBJECTENTITYNAME, finalItemsToWrite).then((result) => {
                            _this.map(accountData, currentPage+1).then((finished)=>{if (finished) resolve(true);}).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
            });
        });
    }
}

