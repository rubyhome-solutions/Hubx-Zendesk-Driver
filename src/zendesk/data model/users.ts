const C_DATAOBJECTNAME = "users";
const C_DATAOBJECTENTITYNAME = "ZENDESK-USER";

var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
import {contentQueue} from "../../singletons/contentQueue/contentQueue";
import {EVENT_TYPES} from "../../services/nerveCenter";
var hubXConfiguration = config.get("Core");
var hubx2 = require("@startx/hubx-core")(hubXConfiguration);

export class users {
    private QContent: contentQueue;
    public DataObjectName: String = C_DATAOBJECTNAME;
    constructor(QContent: contentQueue) {
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    };

    public transform(accountData, items) {
        return new Promise((resolve, reject) => {
            var newArray = [];
            if (!items.length) {
                resolve();
            }
            else {
                items.forEach(function (item) {
                    let newItem = {active: null, created_at: null, email: null, id: '', last_login_at: null, locale: '', moderator: null, name: '', notes: '', phone: '', photo: '', restricted_agent: null, role: '', suspended: null, tags: null, ticket_restriction: null, time_zone: '', updated_at: null, verified: null, vendorUrl: ''};
                    newItem.active=item.active;
                    newItem.created_at=item.created_at;
                    newItem.email=item.email;
                    newItem.id=item.id;
                    newItem.last_login_at=item.last_login_at;
                    newItem.locale=item.locale;
                    newItem.moderator=item.moderator;
                    newItem.name=item.name;
                    newItem.notes=item.notes;
                    newItem.phone=item.phone;
                    if (item.photo) 
                        if (item.photo.content_url)
                            newItem.photo=item.photo.content_url;                    
                    newItem.restricted_agent=item.restricted_agent;
                    newItem.role=item.role;
                    newItem.suspended=item.suspended;
                    if (item.tags) {
                        if (item.tags.length>0) {
                            newItem.tags=item.tags.join("|");
                        }
                    }                    
                    newItem.ticket_restriction=item.ticket_restriction;
                    newItem.time_zone=item.time_zone;
                    newItem.updated_at=item.updated_at;
                    newItem.verified=item.verified;
                    newItem.vendorUrl='https://' + accountData.siteAddress + '.zendesk.com/users/' + item.id;
                    newArray.push(newItem);
                });
                resolve(newArray);
            }
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
                    _this.transform(accountData, elementsReturned).then((finalItemsToWrite: any) => {
                        _this.QContent.mapNameEntities(accountData.identifier, C_DATAOBJECTENTITYNAME, finalItemsToWrite).then((result) => {
                            _this.map(accountData, currentPage+1).then((finished)=>{if (finished) resolve(true);}).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
}