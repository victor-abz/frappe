const path = require('path');
const utils = require('./rollup/rollup.utils');
const { PurgeCSS } = require('purgecss');

let css_file_paths = [
    path.resolve(utils.assets_path, 'css/frappe-web-b4.css'),
	path.resolve(utils.assets_path, 'css/tailwind.css'),
];
let html_content = process.argv[2];
html_content = html_content.replace(/\\n/g, '\n');

new PurgeCSS()
	.purge({
		content: [
			{
				raw: html_content,
				extension: 'html'
			}
		],
		css: css_file_paths
	})
	.then(result => {
		console.log(result[0].css);
	});
