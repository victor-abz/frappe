const version = 'v3';

self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(version).then(function (cache) {
			return cache.addAll([
				"/assets/frappe/js/lib/jquery/jquery.min.js",
				"/assets/css/frappe-web.css",
				"/assets/js/frappe-web.min.js",
				"/assets/js/control.min.js",
				"/assets/js/dialog.min.js",
				"/assets/css/desk.min.css",
				"/assets/css/frappe-rtl.css",
				"/assets/js/libs.min.js",
				"/assets/js/desk.min.js",
				"/assets/css/module.min.css",
				"/assets/css/form.min.css",
				"/assets/js/form.min.js",
				"/assets/css/list.min.css",
				"/assets/js/list.min.js",
				"/assets/css/report.min.css",
				"/assets/js/report.min.js",
				"/assets/js/web_form.min.js",
				"/assets/css/web_form.css",
				"/assets/js/print_format_v3.min.js",
			]);

			console.log('added')
		})
	);
});

self.addEventListener('fetch', function (event) {
	console.log(event);
	event.respondWith(caches.match(event.request).then(function (response) {
		// caches.match() always resolves
		// but in case of success response will have value
		if (response !== undefined) {
			console.log('matched');
			return response;
		} else {
			console.log('not matched');
			return fetch(event.request).then(function (response) {
				// response may be used only once
				// we need to save clone to put one copy in cache
				// and serve second one
				let responseClone = response.clone();

				caches.open(version).then(function (cache) {
					cache.put(event.request, responseClone);
				});
				return response;
			}).catch(function () {
				return caches.match('/sw-test/gallery/myLittleVader.jpg');
			});
		}
	}));
});

self.addEventListener('activate', function (event) {
	var cacheWhitelist = [version];

	event.waitUntil(
		caches.keys().then(function (keyList) {
			return Promise.all(keyList.map(function (key) {
				if (cacheWhitelist.indexOf(key) === -1) {
					return caches.delete(key);
				}
			}));
		})
	);
});