import { Selector, t } from 'testcafe';

const ci_mode = process.env.CI;
let testing_url = 'http://erpnext.dev:8000';
if (ci_mode) {
	testing_url = 'http://localhost:8000';
}
export const url = testing_url;


export const frappe = Object.assign(t, {
	login(user, pass) {
		return new Promise((res) => {
			res(t
				.typeText("#login_email", user)
				.typeText("#login_password", pass)
				.click(".btn-login"));
		});
	}
});