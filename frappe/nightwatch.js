// require('env2')('.env'); // optionally store your environment variables in .env
// const PKG = require('./package.json'); // so we can get the version of the project
const BINPATH = './node_modules/nightwatch/bin/'; // change if required.
// const SCREENSHOT_PATH = "./node_modules/nightwatch/screenshots/" + PKG.version + "/";
const {
	SAUCE_USERNAME = 'netchampfaris',
	SAUCE_ACCESS_KEY = '90fad2ae-008e-43d9-a0fc-d592cb5fe141',
	TRAVIS_JOB_NUMBER = 'travis-job-number'
} = process.env;
const app_name = get_cli_arg('app');

let local_launch_url = 'http://localhost:8000';
if (get_cli_arg('site')) {
	local_launch_url = 'http://' + get_cli_arg('site') + ':' + get_cli_arg('port');
}


const config = {
	"src_folders": [
		`apps/${app_name}/${app_name}/tests/ui`
	],
	"output_folder": "./node_modules/nightwatch/reports", // reports (test outcome) output by Nightwatch
	"globals_path" : 'apps/frappe/frappe/nightwatch.global.js',
	"selenium": {
		"start_process": false,
		"server_path": BINPATH + "selenium.jar", // downloaded by selenium-download module (see below)
		"log_path": "",
		"host": "127.0.0.1",
		"port": 4444,
		"cli_args": {
			"webdriver.chrome.driver": BINPATH + "chromedriver" // also downloaded by selenium-download
		}
	},
	// "test_workers": { "enabled": true, "workers": "auto" }, // perform tests in parallel where possible
	"test_settings": {
		"sauce": {
			"launch_url": "http://localhost:8000", // we're testing a Public or "staging" site on Saucelabs
			"selenium_port": 80,
			"selenium_host": "ondemand.saucelabs.com",
			"silent": true,
			// "screenshots": {
			// 	"enabled": true, // save screenshots to this directory (excluded by .gitignore)
			// 	"path": SCREENSHOT_PATH
			// },
			"username": `${SAUCE_USERNAME}`,
			"access_key": `${SAUCE_ACCESS_KEY}`,
			"globals": {
				"waitForConditionTimeout": 10000    // wait for content on the page before continuing
			},
			"desiredCapabilities": {
				build: `build-${TRAVIS_JOB_NUMBER}`,
				'tunnel-identifier': TRAVIS_JOB_NUMBER,
			}
		},
		"local": {
			"launch_url": local_launch_url,
			"selenium_port": 9515,
			"selenium_host": "127.0.0.1",
			"default_path_prefix": "",
			// "silent": true,
			// "screenshots": {
			// 	"enabled": true, // save screenshots taken here
			// 	"path": SCREENSHOT_PATH
			// }, // this allows us to control the
			"globals": {
				"waitForConditionTimeout": 15000 // on localhost sometimes internet is slow so wait...
			},
			"desiredCapabilities": {
				"browserName": "chrome",
				"chromeOptions": {
					"args": ["--no-sandbox", "--start-maximized"],
					"prefs": {
						"credentials_enable_service": false
					},
					"excludeSwitches": ["enable-automation"]
				},
				"javascriptEnabled": true,
				"acceptSslCerts": true
			}
		}
	}
}
module.exports = config;

/**
 * selenium-download does exactly what it's name suggests;
 * downloads (or updates) the version of Selenium (& chromedriver)
 * on your localhost where it will be used by Nightwatch.
 */
// require('fs').stat(BINPATH + 'selenium.jar', function (err, stat) {
// 	if (err || !stat || stat.size < 1) {
// 		require('selenium-download').ensure(BINPATH, function (error) {
// 			if (error) throw new Error(error); // no point continuing so exit!
// 			console.log('✔ Selenium & Chromedriver downloaded to:', BINPATH);
// 		});
// 	}
// });

function get_cli_arg(key) {
	var args = process.argv;
	var i = args.indexOf('--' + key);
	return args[i + 1];
}

// function padLeft(count) { // theregister.co.uk/2016/03/23/npm_left_pad_chaos/
// 	return count < 10 ? '0' + count : count.toString();
// }

// var FILECOUNT = 0; // "global" screenshot file count
// /**
//  * The default is to save screenshots to the root of your project even though
//  * there is a screenshots path in the config object above! ... so we need a
//  * function that returns the correct path for storing our screenshots.
//  * While we're at it, we are adding some meta-data to the filename, specifically
//  * the Platform/Browser where the test was run and the test (file) name.
//  */
// function imgpath(browser) {
// 	var a = browser.options.desiredCapabilities;
// 	var meta = [a.platform];
// 	meta.push(a.browserName ? a.browserName : 'any');
// 	meta.push(a.version ? a.version : 'any');
// 	meta.push(a.name); // this is the test filename so always exists.
// 	var metadata = meta.join('~').toLowerCase().replace(/ /g, '');
// 	return SCREENSHOT_PATH + metadata + '_' + padLeft(FILECOUNT++) + '_';
// }

// module.exports.imgpath = imgpath;
// module.exports.SCREENSHOT_PATH = SCREENSHOT_PATH;