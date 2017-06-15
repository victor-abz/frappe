import { Selector } from 'testcafe';

const is_travis = process.env.TRAVIS;

let url = 'http://erpnext.dev:8000';

if(is_travis) {
	url = 'http://localhost:8000';
}

fixture(`Login Test`)
	// .page(url + '/login');
	.page('https://faris23.erpnext.com/login')

test('Login as Administrator', async t => {
	await t
		.typeText("#login_email", "netchamp.faris@gmail.com")
		.typeText("#login_password", "qwe")
		.click(".btn-login")
		.expect(Selector("#page-desktop").exists).ok()
});