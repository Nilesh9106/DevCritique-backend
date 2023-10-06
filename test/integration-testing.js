const app = require('./tests-index');
const authTests = require('./login-signup');
const passwordResetTests = require('./password-reset');
const { describe } = require('mocha');
const request = require('supertest');
const expect = require('chai').expect;
const { User } = require('../models/model');
const fileUpload = require('./upload-test');

const username1 = 'test';
const email1 = 'testing@test.com';
let password1 = 'testpassword';
let userId1, token1;
const username2 = 'test2';
const email2 = 'test2@test.com';
const password2 = 'testpassword2';
const emailDuplicate = {
	username: 'test3',
	email: 'test3@test.com',
	password: 'testpassword3'
}
const usernameDuplicate = {
	username: 'test4',
	email: 'test4@test.com',
	password: 'testpassword4'
}

let userId2, token2, projectId, reviewId, uniqueString;
let setToken1 = (token) => {
	token1 = token;
};
let setToken2 = (token) => {
	token2 = token;
};
let isOver = Array(30).fill(false);
function checkIsOver(step, done) {
	if (isOver[step]) {
		done();
	}
	else {
		setTimeout(() => {
			checkIsOver(step, done);
		}, 1000);
	}
};
function setUserId(id) {
	userId1 = id;
};
function setUserId2(id) {
	userId2 = id;
};

describe("1. create some dummy users", () => {
	after((done) => {
		isOver[1] = true;
		done();
	});
	it("1.1. create user(emailduplicate)", authTests.testCreateNewUser(emailDuplicate));
	it("1.2. create user(usernameduplicate)", authTests.testCreateNewUser(usernameDuplicate));
});

describe("2. create a user(user1)", () => {
	before((done) => {
		checkIsOver(1, done);
	});
	after((done) => {
		isOver[2] = true;
		done();
	});
	it("2.1. fail to create a user with same email", authTests.testEmailInUseError);
	it("2.2. fail to create a user with same username", authTests.testUsernameInUseError);
	it("2.3. success to create a user with unique email and username", authTests.testCreateNewUser({ username: username1, email: email1, password: password1 }));
});
describe("3. login with the user", () => {
	before((done) => {
		checkIsOver(2, done);
	});
	after((done) => {
		isOver[3] = true;
		done();
	});
	it("3.1. fail to login with unverified account", authTests.signInFailUsingUnverifiedAccount({ email: email1, password: password1 }));
});
describe("4. get unique string from database", () => {
	before((done) => {
		checkIsOver(3, done);
	});
	after((done) => {
		isOver[4] = true;
		done();
	});
	it("should get unique string from database", (done) => {
		passwordResetTests.getUniqueStringFromDB(email1).then((uniqueStringFromDB) => {
			uniqueString = uniqueStringFromDB;
			// console.log(uniqueString);
			done();
		});
	});
});

describe("5. verify account using email(get directly from db)", () => {
	before((done) => {
		checkIsOver(4, done);
	});
	after((done) => {
		isOver[5] = true;
		done();
	});
	it("5.1. fail to verify account with wrong unique string", passwordResetTests.verifyAccountInvalidLink('i-am-wrong-uniquestring-i-am-wrong'));
	it("5.2. success to verify account with correct unique string", function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/verify/${uniqueString}`)
			.expect(200)
			.end(async (err, res) => {
				// console.log(uniqueString);
				if (err) return done(err);

				expect(res.text).to.include('Email Verified');
				expect(res.text).to.include('Login');

				done();
			});
	});
	it("5.3. fail to verify account with already verified account", function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/verify/${uniqueString}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.text).to.include('Email Already Verified');
				expect(res.text).to.include('Login');

				done();
			});
	});
});
describe("6. login with the user(user1)", () => {
	before((done) => {
		checkIsOver(5, done);
	});
	after((done) => {
		isOver[6] = true;
		done();
	});
	it("6.1. fail to login with wrong password", authTests.signInFailUsingIncorrectPassword({ email: email1, password: 'iamwrongpassword' }));
	it("6.2. fail to login with wrong email", authTests.signInFailUsingIncorrectEmail({ email: 'iamwrongemail', password: 'password' }));
	it("6.3. success to login with correct credentials and verified account", authTests.signInSuccess({ email: email1, password: password1 }, setToken1, setUserId));
});
describe("7. forgot password call", () => {
	before((done) => {
		checkIsOver(6, done);
	});
	after((done) => {
		isOver[7] = true;
		done();
	});

	it("7.1. fail to send email with wrong email", passwordResetTests.forgotPasswordFailTest('i-am-wrong-email'));
	it("7.2. success to send email with correct email", passwordResetTests.forgotPasswordSuccessTest(email1));
});
describe("8. get unique string from database", () => {
	before((done) => {
		checkIsOver(7, done);
	});
	after((done) => {
		isOver[8] = true;
		done();
	});

	it("8.1. should get unique string from database", (done) => {
		passwordResetTests.getUniqueStringFromDB(email1).then((uniqueStringFromDB) => {
			uniqueString = uniqueStringFromDB;
			// console.log(uniqueString);
			done();
		});
	});
});
describe("9. check for valid string or not", () => {
	before((done) => {
		checkIsOver(8, done);
	});
	after((done) => {
		isOver[9] = true;
		done();
	});
	it("9.1. fail in valid string with wrong unique string", passwordResetTests.validLinkTestInvalidLink('i-am-invalid-uniquestring'));
	it("9.2. fail in valid string with old unique string", passwordResetTests.validLinkTestOldLink('iamolduniquestringiamoldstring1696141094558'));
	it("9.3. success in valid string with correct unique string", function (done) {
		this.timeout(10000);

		request(app)
			.get(`/api/is-valid-link/${uniqueString}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('message', 'Valid Link!!');
				done();
			});
	});
});
describe("10. reset password", () => {
	before((done) => {
		checkIsOver(9, done);
	});
	after((done) => {
		isOver[10] = true;
		done();
	});
	it("10.1. fail to reset password with wrong unique string", passwordResetTests.passwordResetInvalidLink('i-am-wrong-uniquestring'));
	it("10.2. fail to reset password with old unique string", passwordResetTests.passwordResetOldLink('iamolduniquestringiamoldstring1696141094559'));
	it("10.3. success to reset password with correct unique string", function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/reset-password')
			.send({ uniqueString, password: 'newpassword' })
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Password reset successfully!!');

				done();
			});
	});
	password1 = 'newpassword';
});
describe("11. login with new password", () => {
	before((done) => {
		checkIsOver(10, done);
	});
	after((done) => {
		isOver[11] = true;
		done();
	});
	it("11.1. fail to login with old password", authTests.signInFailUsingIncorrectPassword({ email: email1, password: 'testpassword' }));
	it("11.2. success to login with new password", authTests.signInSuccess({ email: email1, password: password1 }, setToken1, setUserId));
});
describe("12. create a project", () => {
	before((done) => {
		checkIsOver(11, done);
	});
	after((done) => {
		isOver[12] = true;
		done();
	});
	it("12.1. success to create a project with valid data", function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/projects')
			.set('authorization', `${token1}`)
			.send({
				description: "test description",
				technologies: ["test technology"],
				link: "https://www.github.com",
				author: userId1
			})
			.expect(201)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('link');
				expect(res.body).to.have.property('description');
				projectId = res.body._id;
				done();
			});
	});
	it("12.2. fail to review own project", function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/reviews')
			.set('authorization', `${token1}`)
			.send({
				project: projectId,
				author: userId1,
				text: "test review",
			})
			.expect(500)
			.end(async (err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('message', 'You cannot review your own project');

				done();
			});
	});
	it("12.3. get project by id", function (done) {
		this.timeout(10000);
		request(app)
			.get(`/api/projects/${projectId}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('project');
				expect(res.body).to.have.property('reviews');

				done();
			});
	});
});
describe("13. logout", () => {
	before((done) => {
		checkIsOver(12, done);
	});
	after((done) => {
		isOver[13] = true;
		done();
	});

	it("not required to be done in testing", done => done());
});
describe("14. sign up with another user(user2)", () => {
	before((done) => {
		checkIsOver(13, done);
	});
	after((done) => {
		isOver[14] = true;
		done();
	});
	it("14.1. success to create a user with unique email and username", authTests.testCreateNewUser({ username: username2, email: email2, password: password2 }));
	it("14.2. verify account using email(get directly from db)", function (done) {
		this.timeout(10000);
		passwordResetTests.getUniqueStringFromDB(email2).then((uniqueStringFromDB) => {
			uniqueString = uniqueStringFromDB;
			request(app)
				.get(`/api/verify/${uniqueString}`)
				.expect(200)
				.end(async (err, res) => {
					if (err) return done(err);

					expect(res.text).to.include('Email Verified');
					expect(res.text).to.include('Login');

					done();
				});
		});
	});
});
describe("15. login with user2", () => {
	before((done) => {
		checkIsOver(13, done);
	});
	after((done) => {
		isOver[15] = true;
		done();
	});
	it("15.1. success to login with correct credentials and verified account", authTests.signInSuccess({ email: email2, password: password2 }, setToken2, setUserId2));
});
describe("16. create a review on project1", () => {
	before((done) => {
		checkIsOver(15, done);
	});
	after((done) => {
		isOver[16] = true;
		done();
	});
	it("16.1. success to create a review with valid data", function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/reviews')
			.set('authorization', `${token2}`)
			.send({
				project: projectId,
				author: userId2,
				text: "test review",
			})
			.expect(201)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.be.an('object');
				expect(res.body).to.have.property('text');
				reviewId = res.body._id;
				done();
			});
	});
});
describe("17. Engage with project1", () => {
	before((done) => {
		checkIsOver(16, done);
	});
	after((done) => {
		isOver[17] = true;
		done();
	});
	it("17.1. success to like project", function (done) {
		this.timeout(10000);
		request(app)
			.post(`/api/projects/like/${projectId}`)
			.set('authorization', `${token2}`)
			.send({ userId: userId2 })
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.be.an('object');
				expect(res.body.likeCount).to.equal(1);

				done();
			});
	});
	it("17.2. success to dislike project", function (done) {
		this.timeout(10000);
		request(app)
			.post(`/api/projects/dislike/${projectId}`)
			.set('authorization', `${token2}`)
			.send({ userId: userId2 })
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.be.an('object');
				expect(res.body.likeCount).to.equal(0);

				done();
			});
	});
});
describe("18. Engage with review1", () => {
	before((done) => {
		checkIsOver(17, done);
	});
	after((done) => {
		isOver[18] = true;
		done();
	});
	it("18.1. success to upvote review", function (done) {
		request(app)
			.post(`/api/reviews/upvote/${reviewId}`)
			.set('authorization', `${token2}`)
			.send({ userId: userId2 })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.upVote).to.include(userId2);
				done();
			});
	});
	it("18.2. success to downvote review", function (done) {
		request(app)
			.post(`/api/reviews/downvote/${reviewId}`)
			.set('authorization', `${token2}`)
			.send({ userId: userId2 })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.upVote).to.not.include(userId2);
				done();
			});
	});
	it("18.3. success to comment on review", function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/comments')
			.set('authorization', `${token2}`)
			.send({ comment: 'Test Comment', review: reviewId })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
describe("19. logout", () => {
	before((done) => {
		checkIsOver(18, done);
	});
	after((done) => {
		isOver[19] = true;
		done();
	});
	it("not required to be done in testing", done => done());
});

describe("20. login with user1", () => {
	before((done) => {
		checkIsOver(19, done);
	});
	after((done) => {
		isOver[20] = true;
		done();
	});
	it("20.1. success to login with correct credentials and verified account", authTests.signInSuccess({ email: email1, password: password1 }, setToken1, setUserId));
});
describe("21. Rate review1", () => {
	before((done) => {
		checkIsOver(20, done);
	});
	after((done) => {
		isOver[21] = true;
		done();
	});
	it("21.1. success to rate review", (done) => {
		request(app)
			.put(`/api/reviews/${reviewId}`)
			.set('authorization', `${token1}`)
			.send({ rating: 5, status: 'solved' })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('_id', reviewId);
				done();
			});
	});
});
describe("22. Update User Profile", () => {
	before((done) => {
		checkIsOver(21, done);
	});
	after((done) => {
		isOver[22] = true;
		done();
	});
	it("22.1. Update User Profile Picture", function (done) {
		this.timeout(10000);
		request(app)
			.put(`/api/users/${username1}`)
			.set('authorization', `${token1}`)
			.send({ profilePicture: 'https://www.somelink.com' })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
	it("22.2. Update User Profile Bio", function (done) {
		this.timeout(10000);
		request(app)
			.put(`/api/users/${username1}`)
			.set('authorization', `${token1}`)
			.send({ bio: 'Test Bio' })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				done();
			});
	});
});
describe("23. Get Users", () => {
	before((done) => {
		checkIsOver(22, done);
	});
	after((done) => {
		isOver[23] = true;
		done();
	});
	it("23.1. Get Top Users", (done) => {
		request(app)
			.get('/api/topUsers')
			.expect(200)
			.end((err, res) => {

				expect(res.status).to.equal(200);
				expect(res.body).to.be.an('array');
				done();
			});
	});
	it("23.2. Get User by Username", (done) => {
		request(app)
			.get(`/api/users/${username2}`)
			.expect(200)
			.end((err, res) => {
				expect(res.status).to.equal(200);
				expect(res.body).to.have.property('user');
				expect(res.body).to.have.property('projects');
				expect(res.body).to.have.property('reviews');
				done();
			});
	});
});
describe("24. Clean Up", () => {
	before((done) => {
		checkIsOver(23, done);
	});
	after((done) => {
		isOver[24] = true;
		done();
	});
	it("24.1. Delete review1", function (done) {
		this.timeout(10000);
		request(app)
			.delete(`/api/reviews/${reviewId}`)
			.set('authorization', `${token2}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Review deleted successfully');

				done();
			});
	});

	it("24.2. Delete project1", function (done) {
		this.timeout(10000);
		request(app)
			.delete(`/api/projects/${projectId}`)
			.set('authorization', `${token1}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('message', 'Project deleted successfully');

				done();
			});
	});
	it("24.3. delete user1", function (done) {
		this.timeout(10000);
		request(app)
			.delete(`/api/users/${username1}`)
			.set('authorization', `${token1}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('status', true);
				expect(res.body).to.have.property('message', 'User deleted successfully');

				done();
			});
	});
	it("24.4. delete user2", function (done) {
		this.timeout(10000);
		request(app)
			.delete(`/api/users/${username2}`)
			.set('authorization', `${token2}`)
			.expect(200)
			.end(async (err, res) => {
				if (err) return done(err);

				expect(res.body).to.have.property('status', true);
				expect(res.body).to.have.property('message', 'User deleted successfully');

				done();
			});
	});
	it("24.5. delete user(emailduplicate)", function (done) {
		User.findOneAndDelete({ email: emailDuplicate.email }).then((user) => {
			done();
		});
	});
	it("24.6. delete user(usernameduplicate)", function (done) {
		User.findOneAndDelete({ username: usernameDuplicate.username }).then((user) => {
			done();
		});
	});
});
describe("25. miscellanous tests", () => {
	before((done) => {
		checkIsOver(24, done);
	});
	after((done) => {
		isOver[25] = true;
		done();
	});
	it("25.1. get all projects", (done) => {
		request(app)
			.get('/api/projects')
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});
	it("25.2. upload a test file", fileUpload.uploadFile);
	it("25.3. delete a test file", fileUpload.deleteFile);
	it("25.4. search projects by technology", function (done) {
		request(app)
			.get(`/api/search/technology/web`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});
});