var config = require("config");
var CloudElementsConfiguration = config.get("CloudElements");
var ZendeskConfiguration = config.get("Zendesk");
var hubXConfiguration = config.get("Core");
var hubx2 = require("@startx/hubx-core")(hubXConfiguration);
var request = require("request");
var utils = require("../utils/utils");
var cloudElements = require("../cloudElements/cloudElements");

import {EVENT_TYPES,nerveCenter} from "../services/nerveCenter";
import {users} from "./data model/users";
import {articles} from "./data model/articles";
import {categories} from "./data model/categories";
import {sections} from "./data model/sections";
import {groups} from "./data model/groups";
import {tickets} from "./data model/tickets";
import {contentQueue} from "../singletons/contentQueue/contentQueue";

var enumDO = { //Data Objects
    USERS: "users",    
    TICKETS: "incidents",
    CATEGORIES: "categories",
    GROUPS: "groups",
    SECTIONS: "sections",
    TICKETRATINGS: "ratings", //custom transformed for our use
    TICKETCOMMENT: "comments",
    TICKETAUDITS: "history",
    TICKETAUTIDSEVENTS: "historyEvents",
    ARTICLES: "articles"
};


export class apiZendesk {
    private QContent: contentQueue;
    private NerveCenter: nerveCenter;
    public users: users;
    public articles: articles;
    public categories: categories;
    public sections: sections;
    public groups: groups;
    public tickets: tickets;    
    //private apiClient: any;
    constructor(QContent: contentQueue) {
        this.QContent = QContent;
        this.NerveCenter = new nerveCenter;
        this.users = new users(this.QContent);
        this.articles = new articles(this.QContent);
        this.categories = new categories(this.QContent);
        this.sections = new sections(this.QContent);
        this.groups = new groups(this.QContent);
        this.tickets = new tickets(this.QContent);
        //this.apiClient = apiClient || m_ApiClient.getNewInstance();
        //console.log("apiZendesk constructed");
    };

    public getUrl(ZendeskDomainPrefix) {
        return cloudElements.getZendeskUrl(ZendeskDomainPrefix);
    }
    
    public processMapEntitiesFromAccountIdentifier(accountIdentifier) {
        return new Promise((resolve, reject) => {
            let userIdentifier = accountIdentifier;
            let accountData;
            hubx2.memory.createAccount(hubXConfiguration.accountType, userIdentifier, "oAuth2", accountData).then((accountResult) => {
                accountData = accountResult.account.data;
                accountData.identifier = accountResult.account.identifier;
                this.processMapEntitiesFromAccountData(accountData).then(() => {
                    console.log("Re-Mapping Completed Successfully");
                }).catch(reject);
            }).catch(reject);
        });
    }
//add user-field
aefasefijasoiefjasoiefj
    public processMapEntitiesFromAccountData(accountData) {
        return new Promise((resolve, reject) => {
            var _this = this;
            this.MapElementsToEntities(accountData, enumDO.CATEGORIES).then(() => {
                _this.MapElementsToEntities(accountData, enumDO.SECTIONS).then(() => {
                    _this.MapElementsToEntities(accountData, enumDO.GROUPS).then(() => {
                        _this.MapElementsToEntities(accountData, enumDO.USERS).then(() => {
                            _this.MapElementsToEntities(accountData, enumDO.ARTICLES).then(() => {
                                _this.MapElementsToEntities(accountData, enumDO.TICKETS).then(() => {
                                    resolve();
                                }).catch(reject);
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });        
    }

    private getBusinessMapIdentifier(ZendeskObjectName): String {
        switch (ZendeskObjectName) {
            case enumDO.USERS: return "ZENDESK-USER";
            case enumDO.TICKETS: return "ZENDESK-TICKET";
            case enumDO.CATEGORIES: return "ZENDESK-CATEGORY";
            case enumDO.ARTICLES: return "ZENDESK-ARTICLE";
            case enumDO.GROUPS: return "ZENDESK-GROUP";
            case enumDO.SECTIONS: return "ZENDESK-SECTION";
            case enumDO.TICKETRATINGS: return "ZENDESK-TICKET-RATING";
            case enumDO.TICKETCOMMENT: return "ZENDESK-TICKET-COMMENT";
            case enumDO.TICKETAUDITS: return "ZENDESK-TICKET-AUDIT";
            case enumDO.TICKETAUTIDSEVENTS: return "ZENDESK-TICKET-AUDIT-EVENT";            
            default: return null;
        }
    }   
    
    private transformEntities(changedDataObjectType, accountData, whChangedItems) {
        return new Promise((resolve, reject) => {
            switch (changedDataObjectType) {
                case enumDO.USERS: {
                    this.users.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }            
                case enumDO.TICKETS: {
                    this.tickets.transform(accountData,whChangedItems).then((args) => {
                        resolve(args);
                    }).catch(reject);
                    break;
                }
                case enumDO.CATEGORIES: {
                    this.categories.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }
                case enumDO.GROUPS: {
                    this.groups.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }
                case enumDO.SECTIONS: {
                    this.sections.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }
                case enumDO.TICKETRATINGS: {
                    this.tickets.ratings.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }
                case enumDO.ARTICLES: {
                    this.articles.transform(accountData,whChangedItems).then((finalItemsToWrite) => {
                        resolve(finalItemsToWrite);
                    }).catch(reject);
                    break;
                }
                default: reject(new Error("unknown object to transform"));
            }
        });
    }
    
    public processWebhooks(req,res) {
        var _this=this;
        res.writeHead(200, "OK", {'content-type' : 'text/plain'});
        res.end();

        let whMessage = req.body.message;
        if (!(whMessage.elementKey==CloudElementsConfiguration.elementKey)) {
            return false;
        }

        console.log(whMessage);
        console.dir(whMessage);


        let whEvents = whMessage.events;
        console.log(whEvents);
        console.dir(whEvents);


/* Event    {elementKey:"zendesk",
            eventType:"UPDATED",
            objectId:"7952451365",
            objectType:"users"}*/
        if (whEvents && whEvents.length>0) {
            hubx2.memory.createAccount(hubXConfiguration.accountType, whMessage.instanceName, "oAuth2",null, null).then((accountResult) => {
                let accountData = JSON.parse(accountResult.account.data);
                accountData.identifier = accountResult.account.identifier;
                whEvents.forEach((event) => {
                    let changedDataObjectType: String = event.objectType;                
                    let whChangedDataRawItems = whMessage.raw;

                    console.log("changedDataObjectType=" + changedDataObjectType);

                    let whChangedItems = utils.byString(whChangedDataRawItems,"." + changedDataObjectType);

                    _this.transformEntities(changedDataObjectType,accountData,whChangedItems).then((finalItemsToWrite) => {
                        _this.QContent.mapNameEntities(accountData.identifier, _this.getBusinessMapIdentifier(changedDataObjectType), finalItemsToWrite).then((result) => {
                            //console.log(finalItemsToWrite);
                            console.dir(finalItemsToWrite);
                            console.log("processWebhooks-Updated " + changedDataObjectType )
                        }).catch(exception => {
                            console.log(exception);
                        });
                    }).catch(exception => {
                        console.log(exception);
                    });
                });
            }).catch(function(ex){
                console.log(ex);    
            });
        }
    }

    private MapElementsToEntities(accountData, elementObjectName) {
        return new Promise((resolve, reject) => {
            switch (elementObjectName) {
                case enumDO.USERS: {
                    let currentPage = 1;
                    this.users.map(accountData, currentPage).then((finished) => {
                        if (finished)
                            resolve();
                    }).catch(reject);
                    break;
                }            
                case enumDO.TICKETS: {
                    let currentPage = 1;
                    this.tickets.map(accountData, currentPage).then((finished) => {
                        if (finished)
                            resolve();
                    }).catch(reject);
                    break;
                }
                case enumDO.CATEGORIES: {
                    let currentPage = 1;
                    this.categories.map(accountData, currentPage).then((finished) => {
                        if (finished) 
                            resolve();
                    }).catch(reject);
                    break;
                }
                case enumDO.GROUPS: {
                    let currentPage = 1;
                    this.groups.map(accountData, currentPage).then((finished) => {
                        if (finished)
                            resolve();
                    }).catch(reject);
                    break;
                }
                case enumDO.SECTIONS: {
                    let currentPage = 1;
                    this.sections.map(accountData, currentPage).then((finished) => {
                        if (finished)
                            resolve();
                    }).catch(reject);
                    break;
                }
                case enumDO.ARTICLES: {
                    let currentPage = 1;
                    this.articles.map(accountData, currentPage).then((finished) => {
                        if (finished) 
                            resolve();
                    }).catch(reject);
                    break;
                }
                case enumDO.TICKETRATINGS: {
                    //let currentPage = 1;
                    //this.MapCE SectionsToEntities(accountData, currentPage).then((finished) => {
                        //if (finished)
                        resolve();
                    //}).catch(reject);
                    //break;
                    console.log("not implemented for zendesk yet, do for other drivers");
                    break;
                }
                default: reject(new Error('apiZendesk-MapElementsToEntities-unknown object to map-' + elementObjectName));
            }
        });        
    }  

    public handleOAuthRedirect(ZendeskDomainPrefix, req, res) {
        return new Promise((resolve, reject) => {
            if (req.error) {
                reject(req.error);
            }
            let _this=this;
            cloudElements.createInstance(ZendeskDomainPrefix, req.query.code).then((result: any) => { 
                let elementToken = result.token;
                let instanceElement = result.element;
                let accountData = {CEelementInstanceId: result.id, CEelementInstanceToken: result.token, identifier: '', siteAddress: '', organizationId: '', email: '', userId: '', apiKey: result.configuration['oauth.api.key'], apiSecret: result.configuration['oauth.api.secret'], authorizationUrl: result.configuration['oauth.authorization.url'], callbackUrl: result.configuration['oauth.callback.url'], scope: result.configuration['oauth.scope'], userToken: result.configuration['oauth.user.token'], tokenUrl: result.configuration['oauth.token.url'], userRefreshInterval: result.configuration['oauth.user.refresh_interval'], userRefreshTime: result.configuration['oauth.user.refresh_time'], userRefreshToken: result.configuration['oauth.user.refresh_token']};
                cloudElements.getUserOfElementByToken(result.token).then((user: any) => { 
                    accountData.userId=user.id;
                    accountData.organizationId=user.organization_id;
                    accountData.siteAddress=ZendeskDomainPrefix;
                    accountData.email=user.email;
                    let userIdentifier: String = user.email; //accountData.userId;                            
                    hubx2.memory.createAccount(hubXConfiguration.accountType, userIdentifier, "oAuth2", accountData, accountData.organizationId).then((accountResult) => {
                        accountData.identifier = accountResult.account.identifier;
                        if (!accountResult.created) {
                            let previousData = JSON.parse(accountResult.account.data);
                            if(!(accountData.CEelementInstanceId==previousData.CEelementInstanceId)) {
                                hubx2.memory.updateAccount(userIdentifier, hubXConfiguration.accountType, {data: accountData}).then(() => {
                                    console.log("account updated with new instance");
                                    cloudElements.deleteCEInstance(previousData.CEelementInstanceToken  , previousData.CEelementInstanceId).then(() => { //delete old instance, keep new and update hubx account data
                                        console.log("old instance deleted");
                                    }).catch(reject);
                                }).catch(reject);
                            }
                        }                            
                        cloudElements.SetInstanceName(accountData.CEelementInstanceToken, accountData.CEelementInstanceId, accountData.identifier).then(() => {
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end('{userIdentifier: ' + JSON.stringify(userIdentifier) + '}');
                            _this.processMapEntitiesFromAccountData(accountData).then(() => {
                                console.log("Mapping Completed Successfully");
                                //Notify nerve center
                            }).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });        
    }    
}