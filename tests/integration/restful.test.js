var restful = require("../../src/services/restful");
var request = require('supertest');
var spawn = require('child_process').spawn
var prompt = require('prompt');
import { oAuth } from "./protocols/oauth/oauth";

describe("[integration] Restful", function() {

	this.timeout(10000);

	before(function(done) {
		restful.boot();
		this.Authorization = "User S5XAP18QvLx6XY6NvBHS4hCksevaJitei9shnneWnoM=, Organization 11cb169e154b59a8971cd394e4e0ea6b"
		done();
	})

	it("[GET] /", function(done) {

		request(restful.app)
			.get('/')
			.expect(200, done);

	})

	it("[GET] /url", function(done) {

		this.timeout(60000);

		request(restful.app)
			.get('/url')
			.set('Authorization', this.Authorization)
			.expect(200)
			.end((err, res) => {
				try {
					authorizeUrl = res.body.url;
					spawn('open', [authorizeUrl]);
					prompt.start();
					prompt.get(['queryString'], (err, result) => {
						if (err) { return onErr(err); }
						this.queryString = result.queryString;
						done();
					});

					function onErr(err) {
						done(err);
						process.exit(1)
						return 1;
					}
					// done();
				} catch(e) {
					done(e);
				}
			});

	})

	it("[POST] /map", function(done) {

		request(restful.app)
			.post('/map')
			.send({
				queryString: this.queryString
			})
			.set('Authorization', this.Authorization)
			.expect(200, done);

	})

})
