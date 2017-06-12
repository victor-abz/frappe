import { Selector } from 'testcafe';

fixture(`ERPNext Example page`)
    .page(`http://localhost:8000/login`);

test('Test login', async t => {
    await t
        .typeText("#login_email", "faris@erpnext.com")
        .typeText("#login_password", 'qwe')
		.click(".btn-login")
        .expect(Selector("#page-desktop").exists).ok()
});