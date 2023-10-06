const app = require('./tests-index');
const request = require('supertest');
const expect = require('chai').expect;

const testCreateNewUser = function (userData) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-up')
			.send(userData)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('status', true);
				expect(res.body).to.have.property('message', 'User created successfully! please verify your email address');
				done();
			});
	};
};

const testEmailInUseError = function (done) {
	this.timeout(10000);

	request(app)
		.post('/api/sign-up')
		.send({ username: 'test31', email: 'test3@test.com', password: 'testemail' })
		.expect(401)
		.end((err, res) => {
			if (err) return done(err);

			expect(res.body).to.have.property('status', false);
			expect(res.body).to.have.property('message', 'Email is already in use.');

			done();
		});
};
const testUsernameInUseError = function (done) {
	this.timeout(10000);

	request(app)
		.post('/api/sign-up')
		.send({ username: 'test4', email: 'testusername1@test.com', password: 'testpassword2' })
		.expect(401)
		.end((err, res) => {
			if (err) return done(err);

			expect(res.body).to.have.property('status', false);
			expect(res.body).to.have.property('message', 'Username is already in use.');

			done();
		});
};

const signInFailUsingIncorrectPassword = function (userData) {
	return function (done) {
		this.timeout(10000);

		request(app)
			.post('/api/sign-in')
			.send(userData)
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Invalid Credentials');

				done();
			});
	};
};

const signInFailUsingIncorrectEmail = function (userData) {
	return function (done) {
		this.timeout(10000);

		request(app)
			.post('/api/sign-in')
			.send(userData)
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Account not Found!!');
				done();
			});
	};
};

const signInFailUsingUnverifiedAccount = function (userData) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-in')
			.send(userData)
			.expect(401)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('status', false);
				expect(res.body).to.have.property('message', 'Email not verified!!');
				done();
			});
	};
};

const signInSuccess = function (userData, setToken, setUserId) {
	return function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-in')
			.send(userData)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.message).to.equal('User Logged in Successfully');
				expect(res.body).to.have.property('token');
				setToken(res.body.token);
				setUserId(res.body.user._id);
				// console.log("User ID: ", res.body.user._id);
				done();
			});
	};
};



module.exports = {
	testCreateNewUser,
	testEmailInUseError,
	testUsernameInUseError,
	signInFailUsingIncorrectPassword,
	signInFailUsingIncorrectEmail,
	signInFailUsingUnverifiedAccount,
	signInSuccess
};
