const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index');


let authToken;
let projectId;
let userid = '651aa0bd80d5bc700562ed3d';
let update = {
	description: 'Hello',
};

describe('Projects API', () => {
	it('should login a user', function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/sign-in')
			.send({ email: 'email@test.com', password: 'test123' })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				authToken = res.body.token;
				done();
			});
	});

	it('should create a new project', function (done) {
		this.timeout(10000);
		const newProject = {
			link: 'https://example.com',
			description: 'Example project',
			technologies: ['Node.js', 'Express'],
			author: userid,
		};
		request(app)
			.post('/api/projects')
			.set('authorization', `${authToken}`)
			.send(newProject)
			.expect(201)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('link', newProject.link);
				expect(res.body).to.have.property('description', newProject.description);
				projectId = res._body._id;
				project = res._body;
				done();
			});
	});

	it('should update a project by ID', function (done) {
		request(app)
			.put(`/api/projects/${projectId}`)
			.set('authorization', `${authToken}`)
			.send(update)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res._body).to.have.property('_id', projectId);
				expect(res._body).to.have.property('description', update.description);
				done();
			});
	});


	it('should like a project', (done) => {
		request(app)
			.post(`/api/projects/like/${projectId}`)
			.set('authorization', `${authToken}`)
			.send({ userId: userid })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.like).to.include(userid);
				done();
			});
	});


	it('should dislike a project', (done) => {
		request(app)
			.post(`/api/projects/dislike/${projectId}`)
			.set('authorization', `${authToken}`)
			.send({ userId: userid })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.like).to.not.include(userid);
				done();
			});
	});


	it('should read all projects', (done) => {
		request(app)
			.get('/api/projects')
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});


	it('should read all projects by author', (done) => {
		request(app)
			.get(`/api/projects/author/${projectId}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.be.an('array');
				done();
			});
	});


	it('should read a specific project by ID', (done) => {
		request(app)
			.get(`/api/projects/${projectId}`)
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body.project).to.have.property('_id', projectId);
				done();
			});
	});


});
