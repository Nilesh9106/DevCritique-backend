const app = require('../index');
const request = require('supertest');
const expect = require('chai').expect;

var imageURL;
describe('File API', () => {
	it('should upload a file successfully', function (done) {
		this.timeout(10000);
		request(app)
			.post('/api/file/upload')
			.attach('file', './test/test-image.jpeg')
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('fileURL');
				imageURL = res.body.fileURL;
				done();
			});
	});
	it('should delete a file successfully', (done) => {
		request(app)
			.get('/api/file/delete')
			.query({ imageurl: imageURL })
			.expect(200)
			.end((err, res) => {
				if (err) return done(err);
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('deleted');
				done();
			});
	});
});



