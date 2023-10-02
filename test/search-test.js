const app = require('../index');
const request = require('supertest');
const expect = require('chai').expect;

describe('Search APIs ', () => {

	it('should search projects by technology', function (done) {
		this.timeout(10000);
		const technology = 'react';
		request(app)
			.get(`/api/search/technology/${technology}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});

	it('should search projects by description', (done) => {
		const description = 'application';
		request(app)
			.get(`/api/search/description/${description}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});
});
