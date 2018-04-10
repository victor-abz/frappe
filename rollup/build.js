const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const rollup = require('rollup');
const log = console.log; // eslint-disable-line

const current_cpu = parseInt(process.argv[2] || -1);
const total_cpus = parseInt(process.argv[3] || -1);
const parallel_execution = current_cpu != -1;

// console.log(current_cpu, total_cpus);

const {
	get_build_json,
	get_app_path,
	apps_list,
	run_serially,
	assets_path,
	sites_path
} = require('./rollup.utils');

const {
	get_options_for
} = require('./config');

if (!parallel_execution || current_cpu === 0) {
	show_production_message();
	ensure_js_css_dirs();
	build_libs();
}

if (parallel_execution) {
	run_in_parallel();
} else {
	build_assets_for_all_apps();
}

function run_in_parallel() {
	const options = get_all_options();
	const part_length = Math.ceil(options.length / total_cpus);
	const start = part_length * current_cpu;
	const end = part_length * (current_cpu + 1);

	const part_options = options.slice(start, end);

	const promises = part_options.map(({ inputOptions, outputOptions, output_file }) => {
		return build(inputOptions, outputOptions)
			.then(() => {
				log(`${chalk.green('✔')} Built ${output_file}`);
			});
	});

	return Promise.all(promises);
}

function get_all_options() {
	return apps_list
		.map(app => get_options_for(app))
		.reduce((options, curr) => options.concat(curr), [])
}

function build_assets_for_all_apps() {
	run_serially(
		apps_list.map(app => () => build_assets(app))
	);
}

function build_assets(app) {
	const options = get_options_for(app);
	if (!options.length) return Promise.resolve();
	log(chalk.yellow(`\nBuilding ${app} assets...\n`));

	const promises = options.map(({ inputOptions, outputOptions, output_file}) => {
		return build(inputOptions, outputOptions)
			.then(() => {
				log(`${chalk.green('✔')} Built ${output_file}`);
			});
	});

	const start = Date.now();
	return Promise.all(promises)
		.then(() => {
			const time = Date.now() - start;
			log(chalk.green(`✨  Done in ${time / 1000}s`));
		});
}

function build(inputOptions, outputOptions) {
	return rollup.rollup(inputOptions)
		.then(bundle => bundle.write(outputOptions))
		.catch(err => log(chalk.red(err)));
}

function build_libs() {
	// only concatenates lib files, not processed through rollup

	const touch = require('touch');
	const libs_path = 'js/libs.min.js';
	const input_files = get_build_json('frappe')[libs_path];

	const libs_content = input_files.map(file_name => {
		const full_path = path.resolve(get_app_path('frappe'), file_name);
		return `/* ${file_name} */\n` + fs.readFileSync(full_path);
	}).join('\n\n');

	const target_path = path.resolve(assets_path, libs_path);
	fs.writeFileSync(target_path, libs_content);
	log(`${chalk.green('✔')} Built ${libs_path}`);
	touch(path.join(sites_path, '.build'), { force: true });
}

function ensure_js_css_dirs() {
	const paths = [
		path.resolve(assets_path, 'js'),
		path.resolve(assets_path, 'css')
	];
	paths.forEach(path => {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});
}

function show_production_message() {
	const production = process.env.FRAPPE_ENV === 'production';
	log(chalk.yellow(`${production ? 'Production' : 'Development'} mode`));
}
