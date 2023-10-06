const app = require('./tests-index');
const request = require('supertest');
const expect = require('chai').expect;

var imageURL;
const uploadFile = function (done) {
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
};
const deleteFile = function (done) {
	this.timeout(10000);
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
};

module.exports = { uploadFile, deleteFile };


