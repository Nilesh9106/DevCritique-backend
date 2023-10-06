const app = require('./tests-index');
const request = require('supertest');
const expect = require('chai').expect;
const { User } = require('../models/model');


const forgotPasswordFailTest = function (email) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/forgot-password/${email}`)
			.expect(401)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Account not Found!!');

				done();
			});
	};
};

const forgotPasswordSuccessTest = function (email) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/forgot-password/${email}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Email sent successfully!!');

				done();
			});
	};
}

const validLinkTestOldLink = function (uniqueString) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/is-valid-link/${uniqueString}`)
			.expect(401)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Link Expired!!');

				done();
			});
	};
};

const validLinkTestInvalidLink = function (uniqueString) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/is-valid-link/${uniqueString}`)
			.expect(401)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Invalid Link!!');

				done();
			});
	};
};

const passwordResetOldLink = function (uniqueString) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/reset-password')
			.send({ uniqueString })
			.expect(401)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Link Expired!!');

				done();
			});
	};
}
const passwordResetInvalidLink = function (uniqueString) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/reset-password')
			.send({ uniqueString })
			.expect(401)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Invalid Link!!');

				done();
			});

	};
}

const verifyAccountInvalidLink = function (uniqueString) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/verify/${uniqueString}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);
				expect(res.text).to.include('Invalid Link');

				done();
			});
	};
};

const getUniqueStringFromDB = async function (email) {
	try {
		const user = await User.findOne({ email: email });
		return user.uniqueString;
	}
	catch (error) {
		return error;
	}
};

module.exports = {
	forgotPasswordFailTest,
	forgotPasswordSuccessTest,
	validLinkTestOldLink,
	validLinkTestInvalidLink,
	passwordResetOldLink,
	passwordResetInvalidLink,
	verifyAccountInvalidLink,
	getUniqueStringFromDB
};