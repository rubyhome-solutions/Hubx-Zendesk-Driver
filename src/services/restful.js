"use strict";
var connect = require("connect");
var express = require("express");
var url = require("url");
var qs = require("querystring");
var bodyParser = require("body-parser");
var config = require("config");
const apiZendesk_1 = require("../zendesk/apiZendesk");
const contentQueue_1 = require("../../src/singletons/contentQueue/contentQueue");
var QContent;
var https = require("https");
var fs = require('fs');
var HTTPSoptions = {
    key: fs.readFileSync('ssl/secure_taosdc_com.key', 'utf8'),
    cert: fs.readFileSync('ssl/secure_taosdc_com.crt', 'utf8'),
    ca: [
        fs.readFileSync('ssl/AddTrustExternalCARoot.crt', 'utf8'),
        fs.readFileSync('ssl/COMODORSAAddTrustCA.crt', 'utf8'),
        fs.readFileSync('ssl/COMODORSADomainValidationSecureServerCA.crt', 'utf8')
    ]
};
exports.app = express();
var server = https.Server(exports.app);
var PORT = process.env.PORT || 443;
function boot() {
    var _this = this;
    this.QContent = new contentQueue_1.contentQueue;
    exports.app.use(allowCrossDomain);
    exports.app.use(bodyParser.urlencoded({ extended: false }));
    exports.app.use(bodyParser.json());
    exports.app.get('/', function (req, res) {
        res.send("HubX 2.0 Zendesk is up");
        res.end();
    });
    exports.app.get('/url', function (req, res) {
        let m_apiZendesk = new apiZendesk_1.apiZendesk(_this.QContent);
        m_apiZendesk.getUrl(req.query.siteAddress).then((url) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end('{url: ' + JSON.stringify(url) + '}');
        }).catch(exception => {
            res.status(500).send(exception);
        });
    });
    exports.app.get('/oauth', function (req, res) {
        let m_apiZendesk = new apiZendesk_1.apiZendesk(_this.QContent);
        m_apiZendesk.handleOAuthRedirect(req.query.state, req, res).catch((ex) => {
            console.log(ex);
        });
    });
    exports.app.post('/webhooks', function (req, res) {
        let m_apiZendesk = new apiZendesk_1.apiZendesk(_this.QContent);
        m_apiZendesk.processWebhooks(req, res);
    });
    exports.app.get('/remap', function (req, res) {
        let m_apiZendesk = new apiZendesk_1.apiZendesk(_this.QContent);
        m_apiZendesk.processMapEntitiesFromAccountIdentifier(req.query.userIdentifier).then(() => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end('{userIdentifier: ' + JSON.stringify(req.query.userIdentifier) + '}');
        }).catch((ex) => {
            console.log(ex);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(ex);
        });
    });
    https.createServer(HTTPSoptions, exports.app).listen(PORT, "10.0.0.7", function () {
        console.log('[Restful] listening with HTTPS on *:{port}'.replace("{port}", PORT));
    });
}
exports.boot = boot;
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};
module.exports = {
    boot: boot,
    app: exports.app,
};
//# sourceMappingURL=restful.js.map