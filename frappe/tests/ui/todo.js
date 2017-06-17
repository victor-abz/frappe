const TeleBot = require('telebot');
const bot = new TeleBot('380088113:AAGfxSn-IqGhV9YVP86fG8Dzv96ifBaaY-Y');
const fs = require('fs');


module.exports = {
	'Smoke test': browser => {
		browser
			.url('http://localhost:8000/login')
			.waitForElementVisible('body', 5000)
			.saveScreenshot('test.jpg')
			.assert.title('Login')
			.assert.visible('#login_email', 'Check if login box is visible')
	},
	after: browser => {
		console.log(fs.readdirSync('/home/travis/frappe-bench'));
		if(fs.existsSync('/home/travis/frappe-bench/test.jpg')) {
			bot.sendMessage(154703493, 'sending screenshot...');
			bot.sendPhoto(154703493, '/home/travis/frappe-bench/test.jpg')
				.catch(console.log);
		} else {
			console.log('file does not exists');
		}
		browser.end();
	},
};