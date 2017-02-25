/**
 * Dependencies
 */
var ClientOAuth2 = require('client-oauth2')
var config = require('../../singletons/config/config');
import { Protocol, ProtocolResponse } from '../index';

/**
 * oAuth Class
 */
export class oAuth implements Protocol {
	protocol;
	identifier: string = "oAuth"

	private clientId: string;
	private clientSecret: string;
	private accessTokenUri: string;
	private authorizationUri: string;
	private redirectUri: string;
	private scopes: string;
	private authorizationGrants: string;

	constructor() {
		this.clientId = config.oAuth.clientId;
		this.clientSecret = config.oAuth.clientSecret;
		this.accessTokenUri = config.oAuth.accessTokenUri;
		this.authorizationUri = config.oAuth.authorizationUri;
		this.redirectUri = config.oAuth.redirectUri;
		this.scopes = config.oAuth.scopes;
		this.authorizationGrants = config.oAuth.authorizationGrants;

		this.protocol = new ClientOAuth2({
		  clientId: this.clientId,
		  clientSecret: this.clientSecret,
		  accessTokenUri: this.accessTokenUri,
		  authorizationUri: this.authorizationUri,
		  authorizationGrants: this.authorizationGrants,
		  redirectUri: this.redirectUri,
		  scopes: this.scopes,
		})
	}

	getUrl(): string {
		// optionally add state here
		var uri = this.protocol.code.getUri()
		return uri;
	}

	createAccount(params: Object): Promise<ProtocolResponse> {
		return new Promise((resolve, reject) => {
			if (!params["originalUrl"]) {
				return reject("MISSING_PARAMETERS")
			}
			this.protocol.code.getToken(params["originalUrl"]).then((user) => {
				resolve({
					identifier: user.logon,
					data: {
						accessToken: user.accessToken,
						refreshToken: user.refreshToken,
					}
				})
 			}).catch((e) => {
				reject(e);
			})
		})
	}

	refreshToken(access: string, refresh: string) : Promise<string> {
		return new Promise((resolve) => {
			var token = this.protocol.createToken(access, refresh);
			token.refresh().then((tok) => {
				resolve(tok);
			});
		});
	}
}