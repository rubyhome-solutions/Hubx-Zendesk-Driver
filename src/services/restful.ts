var connect = require("connect");
var express = require("express");
//var cookieParser = require("cookie-parser");
var url = require("url");
var qs = require("querystring");
var bodyParser = require("body-parser");
var config = require("config");
//var OAuth = require("../protocols/oauth/oAuth");

import {apiZendesk} from "../zendesk/apiZendesk";
import {contentQueue} from "../../src/singletons/contentQueue/contentQueue";

var QContent: contentQueue;

//var http = require("http");

//HTTPS - LOCAL DEVELOPMENT ONLY
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
//END OF HTTPS

/**
 * Variables
 */
export var app = express();
var server = https.Server(app);
var PORT = process.env.PORT||443;
//CloudElementsConfiguration.organizationSecret
//var accountType = config.get("Core.accountType")

export function boot() {
	var _this = this;
	this.QContent = new contentQueue;
	app.use(allowCrossDomain);
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	/*app.use((req, res, next) => {
		if (req.path == '/') {
			return next();
		}
		// Grab the "Authorization" header.
	  var auth = req.get("authorization");

	  // On the first request, the "Authorization" header won't exist, so we'll set a Response
	  // header that prompts the browser to ask for a username and password.
	  if (!auth) {
	    res.set("WWW-Authenticate", "Basic realm=\"Authorization Required\"");
	    // If the user cancels the dialog, or enters the password wrong too many times,
	    // show the Access Restricted error message.
	    return res.status(401).send("Authorization Required");
	  } else {
	    // If the user enters a username and password, the browser re-requests the route
	    // and includes a Base64 string of those credentials.
	    var credentials = new Buffer(auth.split(" ").pop(), "base64").toString("ascii").split(":");
	    if (credentials[1] === hubxConfiguration.privateKey) {
	      // The username and password are correct, so the user is authorized.
				req.accountLogon = credentials[0];
	      return next();
	    } else {
	      // The user typed in the username or password wrong.
	      return res.status(403).send("Access Denied (incorrect credentials)");
	    }
	  }
	})*/
	
	app.get('/', function(req, res){
		res.send("HubX 2.0 Zendesk is up");
		res.end();
	});

	app.get('/url', function(req, res){ // parameter 'siteAddress' is the Zendesk domain prefix.
		let m_apiZendesk = new apiZendesk(_this.QContent);
		m_apiZendesk.getUrl(req.query.siteAddress).then((url) => {
					res.writeHead(200, {"Content-Type": "application/json"});
					res.end('{url: ' + JSON.stringify(url) + '}');
		}).catch(exception => {
				res.status(500).send(exception);
		});
	});

	app.get('/oauth', function(req, res){		 
		let m_apiZendesk = new apiZendesk(_this.QContent);
		m_apiZendesk.handleOAuthRedirect(req.query.state, req, res).catch((ex) => {
			console.log(ex);
		});	
	});

	app.post('/webhooks', function(req, res){		
		let m_apiZendesk = new apiZendesk(_this.QContent);
		m_apiZendesk.processWebhooks(req,res);
	});

	app.get('/remap', function(req, res){
 		let m_apiZendesk = new apiZendesk(_this.QContent);
		m_apiZendesk.processMapEntitiesFromAccountIdentifier(req.query.userIdentifier).then(() => {			
				res.writeHead(200, {"Content-Type": "application/json"});
				res.end('{userIdentifier: ' + JSON.stringify(req.query.userIdentifier) + '}');
		}).catch((ex) => {
				console.log(ex);
				res.writeHead(500, {"Content-Type": "application/json"});
				res.end(ex);
		});
	});

https.createServer(HTTPSoptions, app).listen(PORT, "10.0.0.7",function(){
		console.log('[Restful] listening with HTTPS on *:{port}'.replace("{port}", PORT));
	});
}

///////////////////////////////////////////////////
// SET HEADERS ON NODE TO ACCEPT FROM ANY ORIGIN //
///////////////////////////////////////////////////

var allowCrossDomain = function(req, res, next) {
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
	app: app,
};