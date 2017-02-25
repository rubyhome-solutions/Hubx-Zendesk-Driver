const C_DATAOBJECTNAME = "sections";
const C_DATAOBJECTENTITYNAME = "ZENDESK-SECTION";

var config = require("config");
var cloudElements = require("../../cloudElements/cloudElements");
import {contentQueue} from "../../singletons/contentQueue/contentQueue";
import {EVENT_TYPES} from "../../services/nerveCenter";

export class sections {
    private QContent: contentQueue;
    public DataObjectName: String = C_DATAOBJECTNAME;
    constructor(QContent: contentQueue) {
        this.QContent = QContent;
        console.log("apiZendesk." + C_DATAOBJECTNAME + " constructed");
    };

    public transform(accountData, items) {
        return new Promise((resolve, reject) => {
            var newArray = [];
            if (!items || !items.length) {
                resolve();
            }
            else {
                items.forEach(function (item) {                    
                    let newItem = {outdated: null, created_at: null, name: '', description: '', id: '', updated_at: null, category_id: null, locale: null, source_locale: null, position: null, vendorUrl: ''};
                    newItem.created_at = item.created_at;
                    newItem.outdated = item.outdated;
                    newItem.description = item.description;
                    newItem.id = item.id;
                    newItem.updated_at = item.updated_at;
                    newItem.category_id = accountData.identifier + '.' + item.category_id;
                    newItem.locale = item.locale;
                    newItem.vendorUrl=item.html_url;
                    newItem.source_locale = item.source_locale;
                    newItem.name = item.name;
                    newItem.position = item.position;                    
                    newArray.push(newItem);
                });
                resolve(newArray);
            }
        });        
    }

    public map(accountData, currentPage) {        
        return new Promise((resolve, reject) => {
            let _this=this;
            cloudElements.GetElementObjectPage(accountData.CEelementInstanceToken, "resources/" + C_DATAOBJECTNAME, currentPage).then((elementsReturned: any) => {
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
            }).catch(reject);
        });
    }
}