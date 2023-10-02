const app = require('../index');
const request = require('supertest');
const expect = require('chai').expect;

describe('Auth testing', () => {
	it('should fail to sign in with incorrect password', function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-in')
			.send({ email: 'test25@253.com', password: 'testpassword' })
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Invalid Credentials');
				done();
			});
	});

	it('should fail to sign in with incorrect email', (done) => {
		request(app)
			.post('/api/sign-in')
			.send({ email: 'wrong@example.com', password: 'testpassword' })
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Account not Found!!');
				done();
			});
	});

	it('should fail to sign in with unverified account', (done) => {
		request(app)
			.post('/api/sign-in')
			.send({ email: 'test@123.com', password: '123123' })
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Email not verified!!');
				done();
			});
	});
});
