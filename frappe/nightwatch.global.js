var chromedriver = require('chromedriver');
module.exports = {
	before: function (done) {
		console.log('Starting chromedriver...')
		chromedriver.start();

		done();
	},

	after: function (done) {
		console.log('Stopping chromedriver...')
		chromedriver.stop();

		done();
	}
};