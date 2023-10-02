const chai = require('chai');
const expect = chai.expect;
const supertest = require('supertest');
const app = require('../index');

describe('User Routes', () => {
	it('should get the top users', async () => {
		const res = await supertest(app)
			.get('/api/topUsers');
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('array');
	});
	it('should get a specific user by username', async () => {
		const res = await supertest(app)
			.get('/api/users/test1');
		expect(res.status).to.equal(200);
		expect(res.body).to.have.property('user');
		expect(res.body).to.have.property('projects');
		expect(res.body).to.have.property('reviews');
	});
});