const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index');

let authToken;
let reviewId;
let userid = '651ac8be7a047c0fdbaf2322';
let projectId = '651ac35ca54bf83adb835c49'
describe('Reviews API', () => {
	it('should login a user', function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-in')
			.send({ email: 'email@test2.com', password: 'test1234' })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				authToken = res.body.token;
				done();
			});
	});
	it('should create a new review', function (done) {
		this.timeout(10000);
		const newReview = {
			project: projectId,
			author: userid,
			text: 'A test review',
		};
		request(app)
			.post('/api/reviews')
			.set('authorization', `${authToken}`)
			.send(newReview)
			.expect(201)
			.end((err, res) => {
				if (err) return done(err);
				reviewId = res.body._id;
				done();
			});
	});

	it('should get all reviews', function (done) {
		this.timeout(10000);
		request(app)
			.get('/api/reviews')
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});
	it('should get a specific review by ID', (done) => {
		request(app)
			.get(`/api/reviews/${reviewId}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('_id', reviewId);
				done();
			});
	});

	it('should update a review by ID', (done) => {
		const updatedReview = {
			text: 'Updated review text',
		};

		request(app)
			.put(`/api/reviews/${reviewId}`)
			.set('authorization', `${authToken}`)
			.send(updatedReview)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('_id', reviewId);
				expect(res.body).to.have.property('text', updatedReview.text);
				done();
			});
	});

	it('should upvote a review', (done) => {
		request(app)
			.post(`/api/reviews/upvote/${reviewId}`)
			.set('authorization', `${authToken}`)
			.send({ userId: userid })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.upVote).to.include(userid);
				done();
			});
	});

	it('should downvote a review', (done) => {
		request(app)
			.post(`/api/reviews/downvote/${reviewId}`)
			.set('authorization', `${authToken}`)
			.send({ userId: userid })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.upVote).to.not.include(userid);
				done();
			});
	});
	it('should create a new comment', (done) => {
		const newComment = 'A test comment';
		request(app)
			.post('/api/comments')
			.set('authorization', `${authToken}`)
			.send({ comment: newComment, review: reviewId })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				commentId = res.body._id;
				done();
			});
	});
	it('should delete a review by ID', (done) => {
		request(app)
			.delete(`/api/reviews/${reviewId}`)
			.set('authorization', `${authToken}`)
			.expect(200, done);
	});
});
