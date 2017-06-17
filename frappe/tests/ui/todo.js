module.exports = {
	beforeEach: browser => {
		browser
			.url(browser.launch_url + '/login')
			.waitForElementVisible('body');
	},
	'Smoke test': browser => {
		browser
			.assert.title('Login')
			.saveScreenshot('test.jpg')
			.assert.visible('#login_email', 'Check if login box is visible')
	},
	after: browser => {
		console.log(__filename, __dirname);
		browser.end()
	},
};