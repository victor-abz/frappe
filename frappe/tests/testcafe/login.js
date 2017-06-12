import { Selector } from 'testcafe';

const is_travis = process.env.TRAVIS;

let url = 'http://erpnext.dev:8000';

if(is_travis) {
	url = 'http://localhost:8000';
}

fixture(`Login Test`)
	.page(url + '/login');

test('Login as Administrator', async t => {
	await t
		.typeText("#login_email", "Administrator")
		.typeText("#login_password", "admin")
		.click(".btn-login")
		.expect(Selector("#page-desktop").exists).ok()
});